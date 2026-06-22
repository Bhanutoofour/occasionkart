import { randomUUID } from "node:crypto";
import type { QueryResultRow } from "pg";

import type {
  CreateOrderInput,
  Order,
  OrderCustomer,
  OrderDelivery,
  OrderItem,
  OrderStatus,
  OrderUpdateInput,
  PaymentStatus,
} from "@/lib/store-schema";
import { db } from "@/lib/db";
import { buildCartItemKey, resolveVariantPricing } from "@/lib/product-variants";
import { getShippingQuote, normalizeIndianPincode } from "@/lib/shipping-rules";

import { getProductBySlug } from "./catalog";
import { redeemCoupon } from "./coupons";
const VALID_ORDER_STATUSES = new Set<OrderStatus>([
  "pending",
  "confirmed",
  "preparing",
  "out_for_delivery",
  "delivered",
  "cancelled",
]);
const VALID_PAYMENT_STATUSES = new Set<PaymentStatus>([
  "pending",
  "paid",
  "failed",
  "refunded",
]);

type OrderListFilters = {
  status?: string | null;
  paymentStatus?: string | null;
  unpaidOnly?: boolean;
  userId?: string | null;
  limit?: number | null;
};

type ValidationResult<T> =
  | { ok: true; value: T }
  | { ok: false; message: string };

let ensureOrderSchemaPromise: Promise<void> | null = null;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function normalizePhone(value: string) {
  return value.replace(/\D+/g, "");
}

async function ensureOrderSchema() {
  if (!ensureOrderSchemaPromise) {
    ensureOrderSchemaPromise = (async () => {
      await db.query("alter table order_items add column if not exists variant_key text");
      await db.query(
        "alter table order_items add column if not exists selected_weight_id text",
      );
      await db.query(
        "alter table order_items add column if not exists selected_weight_label text",
      );
      await db.query(
        "alter table order_items add column if not exists selected_weight_kilograms numeric(10,2)",
      );
      await db.query(
        "alter table order_items add column if not exists selected_flavor_id text",
      );
      await db.query(
        "alter table order_items add column if not exists selected_flavor_label text",
      );
      await db.query(
        "alter table order_items add column if not exists flavor_price_per_kg integer",
      );
      await db.query("alter table orders add column if not exists delivery_pincode text");
    })();
  }

  await ensureOrderSchemaPromise;
}

function normalizeCustomer(customer: unknown): ValidationResult<OrderCustomer> {
  if (!customer || typeof customer !== "object") {
    return { ok: false, message: "customer details are required" };
  }

  const source = customer as Record<string, unknown>;
  if (!isNonEmptyString(source.fullName)) {
    return { ok: false, message: "customer.fullName is required" };
  }
  if (!isNonEmptyString(source.phone)) {
    return { ok: false, message: "customer.phone is required" };
  }

  return {
    ok: true,
    value: {
      fullName: source.fullName.trim(),
      phone: source.phone.trim(),
      email: isNonEmptyString(source.email) ? source.email.trim() : undefined,
    },
  };
}

function normalizeDelivery(delivery: unknown): ValidationResult<OrderDelivery> {
  if (!delivery || typeof delivery !== "object") {
    return { ok: false, message: "delivery details are required" };
  }

  const source = delivery as Record<string, unknown>;
  if (!isNonEmptyString(source.date)) {
    return { ok: false, message: "delivery.date is required" };
  }
  if (!isNonEmptyString(source.slot)) {
    return { ok: false, message: "delivery.slot is required" };
  }
  if (!isNonEmptyString(source.address)) {
    return { ok: false, message: "delivery.address is required" };
  }
  if (!isNonEmptyString(source.pincode)) {
    return { ok: false, message: "delivery.pincode is required" };
  }

  const normalizedPincode = normalizeIndianPincode(source.pincode);
  if (!normalizedPincode) {
    return { ok: false, message: "delivery.pincode must be a valid 6-digit pincode" };
  }

  const shippingQuote = getShippingQuote({
    pincode: normalizedPincode,
    slot: source.slot.trim(),
  });
  if (!shippingQuote.deliverable) {
    return { ok: false, message: shippingQuote.message };
  }

  return {
    ok: true,
    value: {
      date: source.date.trim(),
      slot: source.slot.trim(),
      pincode: normalizedPincode,
      address: source.address.trim(),
      cakeMessage: isNonEmptyString(source.cakeMessage)
        ? source.cakeMessage.trim()
        : undefined,
      city: isNonEmptyString(source.city) ? source.city.trim() : "Hyderabad",
    },
  };
}

async function normalizeItems(items: unknown): Promise<ValidationResult<OrderItem[]>> {
  if (!Array.isArray(items) || items.length === 0) {
    return { ok: false, message: "items must contain at least one product" };
  }

  const normalizedItems: OrderItem[] = [];

  for (const item of items) {
    if (!item || typeof item !== "object") {
      return { ok: false, message: "each item must be an object" };
    }

    const source = item as Record<string, unknown>;
    if (!isNonEmptyString(source.slug)) {
      return { ok: false, message: "each item.slug is required" };
    }

    const product = await getProductBySlug(source.slug.trim());
    if (!product) {
      return { ok: false, message: `unknown product slug: ${source.slug}` };
    }

    const quantity =
      typeof source.quantity === "number" ? Math.trunc(source.quantity) : Number.NaN;
    if (!Number.isInteger(quantity) || quantity <= 0) {
      return {
        ok: false,
        message: `quantity must be a positive integer for ${product.slug}`,
      };
    }

    normalizedItems.push({
      productId: String(product.id),
      slug: product.slug,
      name: product.name,
      image: product.image,
      quantity,
      variantKey: buildCartItemKey(
        product.slug,
        isNonEmptyString(source.weightId) ? source.weightId.trim() : undefined,
        isNonEmptyString(source.flavorId) ? source.flavorId.trim() : undefined,
      ),
      ...(() => {
        const pricing = resolveVariantPricing(
          product,
          isNonEmptyString(source.weightId) ? source.weightId.trim() : undefined,
          isNonEmptyString(source.flavorId) ? source.flavorId.trim() : undefined,
        );

        return {
          selectedWeightId: pricing.selectedWeight?.id,
          selectedWeightLabel: pricing.selectedWeight?.label,
          selectedWeightKilograms: pricing.selectedWeight?.kilograms,
          selectedFlavorId: pricing.selectedFlavor?.id,
          selectedFlavorLabel: pricing.selectedFlavor?.label,
          flavorPricePerKg: pricing.selectedFlavor?.pricePerKg,
          unitPrice: pricing.unitPrice,
          lineTotal: pricing.unitPrice * quantity,
        };
      })(),
    });
  }

  return { ok: true, value: normalizedItems };
}

function buildOrderNumber(createdAt: Date) {
  const y = createdAt.getUTCFullYear();
  const m = `${createdAt.getUTCMonth() + 1}`.padStart(2, "0");
  const d = `${createdAt.getUTCDate()}`.padStart(2, "0");
  const stamp = `${createdAt.getUTCHours()}${createdAt.getUTCMinutes()}${createdAt.getUTCSeconds()}`.padStart(
    6,
    "0",
  );
  return `OCK-${y}${m}${d}-${stamp}`;
}

type OrderRow = QueryResultRow & {
  id: string;
  order_number: string;
  user_id: string | null;
  status: OrderStatus;
  payment_status: PaymentStatus;
  source: string;
  customer_full_name: string;
  customer_phone: string;
  customer_email: string | null;
  delivery_date: string;
  delivery_slot: string | null;
  delivery_pincode: string | null;
  delivery_address: string;
  delivery_city: string;
  cake_message: string | null;
  notes: string | null;
  subtotal: number;
  delivery_fee: number;
  total: number;
  currency: "INR";
  created_at: string;
  updated_at: string;
};

type OrderItemRow = QueryResultRow & {
  order_id: string;
  product_id: string;
  slug: string;
  name: string;
  image: string;
  quantity: number;
  variant_key: string | null;
  selected_weight_id: string | null;
  selected_weight_label: string | null;
  selected_weight_kilograms: number | null;
  selected_flavor_id: string | null;
  selected_flavor_label: string | null;
  flavor_price_per_kg: number | null;
  unit_price: number;
  line_total: number;
};

function mapOrderRows(rows: OrderRow[], itemRows: OrderItemRow[]) {
  const itemsByOrder = new Map<string, OrderItem[]>();

  for (const item of itemRows) {
    const current = itemsByOrder.get(item.order_id) ?? [];
    current.push({
      productId: item.product_id,
      slug: item.slug,
      name: item.name,
      image: item.image,
      quantity: item.quantity,
      variantKey: item.variant_key ?? undefined,
      selectedWeightId: item.selected_weight_id ?? undefined,
      selectedWeightLabel: item.selected_weight_label ?? undefined,
      selectedWeightKilograms: item.selected_weight_kilograms ?? undefined,
      selectedFlavorId: item.selected_flavor_id ?? undefined,
      selectedFlavorLabel: item.selected_flavor_label ?? undefined,
      flavorPricePerKg: item.flavor_price_per_kg ?? undefined,
      unitPrice: item.unit_price,
      lineTotal: item.line_total,
    });
    itemsByOrder.set(item.order_id, current);
  }

  return rows.map((row) => ({
    id: row.id,
    orderNumber: row.order_number,
    userId: row.user_id ?? undefined,
    status: row.status,
    paymentStatus: row.payment_status,
    source: row.source as Order["source"],
    customer: {
      fullName: row.customer_full_name,
      phone: row.customer_phone,
      email: row.customer_email ?? undefined,
    },
    delivery: {
      date: row.delivery_date,
      slot: row.delivery_slot ?? undefined,
      pincode: row.delivery_pincode ?? undefined,
      address: row.delivery_address,
      city: row.delivery_city,
      cakeMessage: row.cake_message ?? undefined,
    },
    items: itemsByOrder.get(row.id) ?? [],
    pricing: {
      subtotal: row.subtotal,
      deliveryFee: row.delivery_fee,
      total: row.total,
      currency: row.currency,
    },
    notes: row.notes ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

async function getItemsForOrders(orderIds: string[]) {
  if (orderIds.length === 0) {
    return [];
  }

  const result = await db.query<OrderItemRow>(
    `
      select
        order_id,
        product_id,
        slug,
        name,
        image,
        quantity,
        variant_key,
        selected_weight_id,
        selected_weight_label,
        selected_weight_kilograms,
        selected_flavor_id,
        selected_flavor_label,
        flavor_price_per_kg,
        unit_price,
        line_total
      from order_items
      where order_id = any($1::text[])
      order by id asc
    `,
    [orderIds],
  );

  return result.rows;
}

export async function listOrders(filters: OrderListFilters = {}) {
  await ensureOrderSchema();

  const values: unknown[] = [];
  const conditions: string[] = [];

  if (filters.status && VALID_ORDER_STATUSES.has(filters.status as OrderStatus)) {
    values.push(filters.status);
    conditions.push(`status = $${values.length}`);
  }

  if (filters.unpaidOnly) {
    conditions.push(`payment_status in ('pending', 'failed')`);
  } else if (
    filters.paymentStatus &&
    VALID_PAYMENT_STATUSES.has(filters.paymentStatus as PaymentStatus)
  ) {
    values.push(filters.paymentStatus);
    conditions.push(`payment_status = $${values.length}`);
  }

  if (filters.userId && isNonEmptyString(filters.userId)) {
    values.push(filters.userId.trim());
    conditions.push(`user_id = $${values.length}`);
  }

  let query = `
    select
      id,
      order_number,
      user_id,
      status,
      payment_status,
      source,
      customer_full_name,
      customer_phone,
      customer_email,
      delivery_date,
      delivery_slot,
      delivery_pincode,
      delivery_address,
      delivery_city,
      cake_message,
      notes,
      subtotal,
      delivery_fee,
      total,
      currency,
      created_at,
      updated_at
    from orders
  `;

  if (filters.limit && filters.limit > 0) {
    values.push(filters.limit);
  }

  if (conditions.length > 0) {
    query += ` where ${conditions.join(" and ")}`;
  }

  query += " order by created_at desc";

  if (filters.limit && filters.limit > 0) {
    query += ` limit $${values.length}`;
  }

  const result = await db.query<OrderRow>(query, values);
  const items = await getItemsForOrders(result.rows.map((row) => row.id));

  return mapOrderRows(result.rows, items);
}

export async function getOrderById(id: string) {
  await ensureOrderSchema();

  const result = await db.query<OrderRow>(
    `
      select
        id,
        order_number,
        user_id,
        status,
        payment_status,
        source,
        customer_full_name,
        customer_phone,
        customer_email,
        delivery_date,
        delivery_slot,
      delivery_pincode,
      delivery_address,
        delivery_city,
        cake_message,
        notes,
        subtotal,
        delivery_fee,
        total,
        currency,
        created_at,
        updated_at
      from orders
      where id = $1 or order_number = $1
      limit 1
    `,
    [id],
  );

  if (result.rows.length === 0) {
    return undefined;
  }

  const items = await getItemsForOrders([result.rows[0].id]);
  return mapOrderRows(result.rows, items)[0];
}

export async function listOrdersForUser(userId: string, limit?: number | null) {
  return listOrders({
    userId,
    paymentStatus: "paid",
    limit,
  });
}

export type CustomerSummary = {
  key: string;
  name: string;
  email?: string;
  phone: string;
  ordersCount: number;
  totalSpent: number;
  lastOrderAt?: string;
};

export type OrderDashboardStats = {
  totalOrders: number;
  totalRevenue: number;
  pendingOrders: number;
  activeOrders: number;
};

export async function listCustomerSummaries(limit = 100) {
  const result = await db.query<
    QueryResultRow & {
      customer_email: string | null;
      customer_phone: string;
      customer_full_name: string;
      orders_count: number;
      total_spent: number;
      last_order_at: string | null;
    }
  >(
    `
      select
        customer_email,
        customer_phone,
        customer_full_name,
        count(*)::int as orders_count,
        coalesce(sum(total), 0)::int as total_spent,
        max(created_at)::text as last_order_at
      from orders
      where payment_status = 'paid'
      group by customer_email, customer_phone, customer_full_name
      order by max(created_at) desc
      limit $1
    `,
    [limit],
  );

  return result.rows.map((row) => ({
    key: row.customer_email?.trim().toLowerCase() || normalizePhone(row.customer_phone),
    name: row.customer_full_name,
    email: row.customer_email ?? undefined,
    phone: row.customer_phone,
    ordersCount: row.orders_count,
    totalSpent: row.total_spent,
    lastOrderAt: row.last_order_at ?? undefined,
  }));
}

export async function listOrdersForCustomer(customerKey: string) {
  await ensureOrderSchema();

  const trimmedKey = customerKey.trim().toLowerCase();
  const phoneKey = normalizePhone(customerKey);

  const result = await db.query<OrderRow>(
    `
      select
        id,
        order_number,
        user_id,
        status,
        payment_status,
        source,
        customer_full_name,
        customer_phone,
        customer_email,
        delivery_date,
        delivery_slot,
      delivery_pincode,
      delivery_address,
        delivery_city,
        cake_message,
        notes,
        subtotal,
        delivery_fee,
        total,
        currency,
        created_at,
        updated_at
      from orders
      where lower(coalesce(customer_email, '')) = $1
         or regexp_replace(customer_phone, '[^0-9]', '', 'g') = $2
      order by created_at desc
    `,
    [trimmedKey, phoneKey],
  );

  const items = await getItemsForOrders(result.rows.map((row) => row.id));
  return mapOrderRows(result.rows, items);
}

export async function getOrderDashboardStats(): Promise<OrderDashboardStats> {
  await ensureOrderSchema();

  const result = await db.query<
    QueryResultRow & {
      total_orders: number;
      total_revenue: number;
      pending_orders: number;
      active_orders: number;
    }
  >(
    `
      select
        count(*)::int as total_orders,
        coalesce(sum(total), 0)::int as total_revenue,
        count(*) filter (where status = 'pending')::int as pending_orders,
        count(*) filter (
          where status in ('confirmed', 'preparing', 'out_for_delivery')
        )::int as active_orders
      from orders
      where payment_status = 'paid'
    `,
  );

  const row = result.rows[0];
  return {
    totalOrders: row?.total_orders ?? 0,
    totalRevenue: row?.total_revenue ?? 0,
    pendingOrders: row?.pending_orders ?? 0,
    activeOrders: row?.active_orders ?? 0,
  };
}

export async function getAbandonedCartCount(): Promise<number> {
  await ensureOrderSchema();

  const result = await db.query<QueryResultRow & { count: number }>(
    `
      select count(*)::int as count
      from orders
      where payment_status in ('pending', 'failed')
    `,
  );

  return result.rows[0]?.count ?? 0;
}

export async function listAbandonedOrders(limit?: number | null) {
  return listOrders({
    unpaidOnly: true,
    limit,
  });
}

export async function markOrderPaymentAbandoned(orderId: string): Promise<boolean> {
  await ensureOrderSchema();

  const result = await db.query(
    `
      update orders
      set payment_status = 'failed', updated_at = $2
      where id = $1 and payment_status = 'pending'
    `,
    [orderId, new Date().toISOString()],
  );

  return result.rowCount === 1;
}

export async function getTrackableOrder(id: string, phone: string) {
  const order = await getOrderById(id);
  if (!order) {
    return undefined;
  }

  if (normalizePhone(order.customer.phone) !== normalizePhone(phone)) {
    return undefined;
  }

  return order;
}

export async function createOrder(payload: unknown): Promise<ValidationResult<Order>> {
  await ensureOrderSchema();

  if (!payload || typeof payload !== "object") {
    return { ok: false, message: "request body must be a JSON object" };
  }

  const input = payload as CreateOrderInput;
  const customer = normalizeCustomer(input.customer);
  if (!customer.ok) {
    return customer;
  }

  const delivery = normalizeDelivery(input.delivery);
  if (!delivery.ok) {
    return delivery;
  }

  const items = await normalizeItems(input.items);
  if (!items.ok) {
    return items;
  }

  const createdAt = new Date();
  const subtotal = items.value.reduce((sum, item) => sum + item.lineTotal, 0);
  const shippingQuote = getShippingQuote({
    pincode: delivery.value.pincode,
    slot: delivery.value.slot,
  });
  if (!shippingQuote.deliverable) {
    return { ok: false, message: shippingQuote.message };
  }

  const deliveryFee = subtotal > 0 ? shippingQuote.deliveryFee : 0;
  const couponResolution = await redeemCoupon({
    couponCode: input.couponCode,
    subtotal,
  });
  const totalBeforeDiscount = subtotal + deliveryFee;
  const totalAfterDiscount = Math.max(
    1,
    totalBeforeDiscount - couponResolution.discountAmount,
  );
  const couponNote = couponResolution.valid
    ? `Coupon Applied: ${couponResolution.code} (${couponResolution.percentageOff}% off, Discount Rs. ${couponResolution.discountAmount})`
    : undefined;
  const mergedNotes = [couponNote, isNonEmptyString(input.notes) ? input.notes.trim() : undefined]
    .filter(Boolean)
    .join("\n")
    .trim();

  const order: Order = {
    id: randomUUID(),
    orderNumber: buildOrderNumber(createdAt),
    userId: isNonEmptyString(input.userId) ? input.userId.trim() : undefined,
    status: "pending",
    paymentStatus:
      input.paymentStatus && VALID_PAYMENT_STATUSES.has(input.paymentStatus)
        ? input.paymentStatus
        : "pending",
    source: input.source ?? "web",
    customer: customer.value,
    delivery: delivery.value,
    items: items.value,
    pricing: {
      subtotal,
      deliveryFee,
      total: totalAfterDiscount,
      currency: "INR",
    },
    notes: mergedNotes || undefined,
    createdAt: createdAt.toISOString(),
    updatedAt: createdAt.toISOString(),
  };

  await db.query("begin");

  try {
    await db.query(
      `
        insert into orders (
          id,
          order_number,
          user_id,
          status,
          payment_status,
          source,
          customer_full_name,
          customer_phone,
          customer_email,
          delivery_date,
          delivery_slot,
          delivery_pincode,
          delivery_address,
          delivery_city,
          cake_message,
          notes,
          subtotal,
          delivery_fee,
          total,
          currency,
          created_at,
          updated_at
        ) values (
          $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
          $11, $12, $13, $14, $15, $16, $17, $18, $19, $20, $21, $22
        )
      `,
      [
        order.id,
        order.orderNumber,
        order.userId ?? null,
        order.status,
        order.paymentStatus,
        order.source,
        order.customer.fullName,
        order.customer.phone,
        order.customer.email ?? null,
        order.delivery.date,
        order.delivery.slot ?? null,
        order.delivery.pincode ?? null,
        order.delivery.address,
        order.delivery.city,
        order.delivery.cakeMessage ?? null,
        order.notes ?? null,
        order.pricing.subtotal,
        order.pricing.deliveryFee,
        order.pricing.total,
        order.pricing.currency,
        order.createdAt,
        order.updatedAt,
      ],
    );

    for (const item of order.items) {
      await db.query(
        `
          insert into order_items (
            order_id,
            product_id,
            slug,
            name,
            image,
            quantity,
            variant_key,
            selected_weight_id,
            selected_weight_label,
            selected_weight_kilograms,
            selected_flavor_id,
            selected_flavor_label,
            flavor_price_per_kg,
            unit_price,
            line_total
          ) values ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15)
        `,
        [
          order.id,
          item.productId,
          item.slug,
          item.name,
          item.image,
          item.quantity,
          item.variantKey ?? null,
          item.selectedWeightId ?? null,
          item.selectedWeightLabel ?? null,
          item.selectedWeightKilograms ?? null,
          item.selectedFlavorId ?? null,
          item.selectedFlavorLabel ?? null,
          item.flavorPricePerKg ?? null,
          item.unitPrice,
          item.lineTotal,
        ],
      );
    }

    await db.query("commit");
  } catch (error) {
    await db.query("rollback");
    throw error;
  }

  return { ok: true, value: order };
}

export async function updateOrder(
  id: string,
  payload: unknown,
): Promise<ValidationResult<Order>> {
  await ensureOrderSchema();

  if (!payload || typeof payload !== "object") {
    return { ok: false, message: "request body must be a JSON object" };
  }

  const input = payload as OrderUpdateInput;

  if (input.status && !VALID_ORDER_STATUSES.has(input.status)) {
    return { ok: false, message: "invalid order status" };
  }
  if (input.paymentStatus && !VALID_PAYMENT_STATUSES.has(input.paymentStatus)) {
    return { ok: false, message: "invalid payment status" };
  }

  const result = await db.query<OrderRow>(
    `
      update orders
      set
        status = coalesce($2, status),
        payment_status = coalesce($3, payment_status),
        notes = case
          when $4::boolean then $5
          else notes
        end,
        updated_at = $6
      where id = $1 or order_number = $1
      returning
        id,
        order_number,
        user_id,
        status,
        payment_status,
        source,
        customer_full_name,
        customer_phone,
        customer_email,
        delivery_date,
        delivery_slot,
      delivery_pincode,
      delivery_address,
        delivery_city,
        cake_message,
        notes,
        subtotal,
        delivery_fee,
        total,
        currency,
        created_at,
        updated_at
    `,
    [
      id,
      input.status ?? null,
      input.paymentStatus ?? null,
      typeof input.notes === "string",
      typeof input.notes === "string" ? input.notes.trim() || null : null,
      new Date().toISOString(),
    ],
  );

  if (result.rows.length === 0) {
    return { ok: false, message: "order not found" };
  }

  const items = await getItemsForOrders([result.rows[0].id]);
  return { ok: true, value: mapOrderRows(result.rows, items)[0] };
}

