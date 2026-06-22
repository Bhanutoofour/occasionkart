import { buildProductSeoDescription } from "@/lib/seo-content";
import { getProductImageUrl } from "@/lib/product-images";

export type RawProductRecord = {
  id: string;
  name: string;
  slug: string;
  price: number;
  categories: string[] | string | null;
  image: string | null;
  description: string | null;
};

export type ProductWeightOption = {
  id: string;
  label: string;
  kilograms: number;
  price: number;
  serves?: string;
};

export type ProductFlavorOption = {
  id: string;
  label: string;
  pricePerKg: number;
};

export type ProductVariantRange = {
  baseWeightKg?: number;
  maxWeightKg?: number;
};

export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  flavor: string;
  description: string;
  price: number;
  serves: string;
  leadTime: string;
  image: string;
  accent: string;
  highlights: string[];
  categories: string[];
  weightOptions: ProductWeightOption[];
  flavorOptions: ProductFlavorOption[];
};

export type ProductMutationInput = {
  name: string;
  slug: string;
  category: string;
  flavor: string;
  description: string;
  price: number;
  serves: string;
  leadTime: string;
  image: string;
  accent: string;
  highlights: string[];
  categories: string[];
  weightOptions: ProductWeightOption[];
  flavorOptions: ProductFlavorOption[];
};

export type OrderStatus =
  | "pending"
  | "confirmed"
  | "preparing"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

export type PaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type OrderSource = "web" | "whatsapp" | "phone" | "walk_in";

export type OrderItem = {
  productId: string;
  slug: string;
  name: string;
  image: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
  variantKey?: string;
  selectedWeightId?: string;
  selectedWeightLabel?: string;
  selectedWeightKilograms?: number;
  selectedFlavorId?: string;
  selectedFlavorLabel?: string;
  flavorPricePerKg?: number;
};

export type OrderCustomer = {
  fullName: string;
  phone: string;
  email?: string;
};

export type OrderDelivery = {
  date: string;
  slot?: string;
  pincode?: string;
  address: string;
  cakeMessage?: string;
  city: string;
};

export type OrderPricing = {
  subtotal: number;
  deliveryFee: number;
  total: number;
  currency: "INR";
};

export type Order = {
  id: string;
  orderNumber: string;
  userId?: string;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  source: OrderSource;
  customer: OrderCustomer;
  delivery: OrderDelivery;
  items: OrderItem[];
  pricing: OrderPricing;
  notes?: string;
  createdAt: string;
  updatedAt: string;
};

export type CreateOrderInput = {
  customer: OrderCustomer;
  delivery: Omit<OrderDelivery, "city"> & { city?: string };
  items: Array<{
    slug: string;
    quantity: number;
    weightId?: string;
    flavorId?: string;
  }>;
  couponCode?: string;
  userId?: string;
  notes?: string;
  source?: OrderSource;
  paymentStatus?: PaymentStatus;
};

export type OrderUpdateInput = {
  status?: OrderStatus;
  paymentStatus?: PaymentStatus;
  notes?: string;
};

const fallbackAccent = "from-rose-100 via-orange-50 to-amber-100";
const fallbackHighlights = ["Freshly baked", "Hyderabad delivery"];

export const DEFAULT_FLAVOR_OPTIONS: ProductFlavorOption[] = [
  { id: "pineapple", label: "Pineapple", pricePerKg: 0 },
  { id: "butterscotch", label: "Butterscotch", pricePerKg: 0 },
  { id: "choco-butterscotch", label: "Choco Butterscotch", pricePerKg: 0 },
  { id: "choco-vanilla", label: "Choco Vanilla", pricePerKg: 0 },
  { id: "vanilla", label: "Vanilla", pricePerKg: 0 },
  { id: "strawberry", label: "Strawberry", pricePerKg: 0 },
  { id: "chocolate", label: "Chocolate", pricePerKg: 300 },
  { id: "chocolate-truffle", label: "Chocolate Truffle", pricePerKg: 200 },
  { id: "fresh-fruit", label: "Fresh Fruit", pricePerKg: 300 },
  { id: "pista", label: "Pista", pricePerKg: 300 },
  { id: "almond", label: "Almond", pricePerKg: 300 },
  { id: "red-velvet", label: "Red Velvet", pricePerKg: 400 },
  { id: "fruits-mix", label: "Fruits Mix", pricePerKg: 400 },
  { id: "hazelnut", label: "Hazelnut", pricePerKg: 500 },
  { id: "ferrero-rocher", label: "Ferrero Rocher", pricePerKg: 500 },
  { id: "honey-almond", label: "Honey Almond", pricePerKg: 500 },
  { id: "lotus-biscoff", label: "Lotus Biscoff", pricePerKg: 500 },
  { id: "chocolate-full", label: "Chocolate Full", pricePerKg: 500 },
];

export function slugifyOptionId(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function extractBaseWeightFromDescription(description: string | null | undefined) {
  const normalized = (description ?? "").toLowerCase();

  const quantityMatch = normalized.match(/quantity\s*:?\s*(\d+)\s*kgs?\b/);
  if (quantityMatch) {
    return Number(quantityMatch[1]);
  }

  const looseMatch = normalized.match(/\b(\d+)\s*kgs?\b/);
  if (looseMatch && !/\b\d+\.\d+\s*kgs?\b/.test(normalized)) {
    return Number(looseMatch[1]);
  }

  return undefined;
}

export function hasCakeVariantEligibility(description: string | null | undefined) {
  const baseWeightKg = extractBaseWeightFromDescription(description);
  return Number.isFinite(baseWeightKg) && (baseWeightKg ?? 0) > 0;
}

export function getGeneratedWeightOptions(
  basePrice: number,
  baseWeightKg = 1,
  maxWeightKg = Math.max(4, baseWeightKg),
  serves?: string,
): ProductWeightOption[] {
  const normalizedBaseWeight = Math.max(1, Math.round(baseWeightKg));
  const normalizedMaxWeight = Math.max(normalizedBaseWeight, Math.round(maxWeightKg));
  const pricePerKg = normalizedBaseWeight > 0 ? basePrice / normalizedBaseWeight : basePrice;

  return Array.from(
    { length: normalizedMaxWeight - normalizedBaseWeight + 1 },
    (_, index) => normalizedBaseWeight + index,
  ).map((kilograms) => ({
    id: `${kilograms}kg`,
    label: `${kilograms} Kg`,
    kilograms,
    price: Math.round(pricePerKg * kilograms),
    serves,
  }));
}

export function getDefaultWeightOptions(basePrice: number, serves?: string): ProductWeightOption[] {
  return getGeneratedWeightOptions(basePrice, 1, 4, serves);
}

export function normalizeWeightOptions(
  options: ProductWeightOption[] | null | undefined,
  basePrice: number,
  serves?: string,
  defaultWeightKg = 1,
  maxWeightKg = Math.max(4, defaultWeightKg),
) {
  if (!Array.isArray(options) || options.length === 0) {
    return getGeneratedWeightOptions(basePrice, defaultWeightKg, maxWeightKg, serves);
  }

  const cleaned = options
    .map((option) => ({
      id: slugifyOptionId(option.id || option.label || `${option.kilograms}kg`),
      label: option.label?.trim() || `${option.kilograms} Kg`,
      kilograms: Number(option.kilograms),
      price: Math.round(Number(option.price)),
      serves: option.serves?.trim() || serves,
    }))
    .filter(
      (option) =>
        option.id &&
        option.label &&
        Number.isFinite(option.kilograms) &&
        option.kilograms > 0 &&
        Number.isFinite(option.price) &&
        option.price >= 0,
    );

  return cleaned.length > 0
    ? cleaned
    : getGeneratedWeightOptions(basePrice, defaultWeightKg, maxWeightKg, serves);
}

export function normalizeFlavorOptions(options: ProductFlavorOption[] | null | undefined) {
  if (!Array.isArray(options) || options.length === 0) {
    return [...DEFAULT_FLAVOR_OPTIONS];
  }

  const cleaned = options
    .map((option) => ({
      id: slugifyOptionId(option.id || option.label),
      label: option.label?.trim() || "",
      pricePerKg: Math.round(Number(option.pricePerKg)),
    }))
    .filter(
      (option) =>
        option.id &&
        option.label &&
        Number.isFinite(option.pricePerKg) &&
        option.pricePerKg >= 0,
    );

  return cleaned.length > 0 ? cleaned : [...DEFAULT_FLAVOR_OPTIONS];
}

export function normalizeProductRecord(item: RawProductRecord): Product {
  const normalizedCategories = Array.isArray(item.categories)
    ? item.categories
    : item.categories
      ? [item.categories]
      : [];
  const primaryCategory = normalizedCategories[0] ?? "Cakes";
  const price = item.price ?? 0;
  const serves = "Serves 6-8";
  const baseWeightKg = extractBaseWeightFromDescription(item.description);
  const isEligibleForVariants = Number.isFinite(baseWeightKg) && (baseWeightKg ?? 0) > 0;
  const maxWeightKg = Math.max(4, baseWeightKg ?? 1);

  return {
    id: item.id,
    slug: item.slug,
    name: item.name,
    category: primaryCategory,
    flavor: primaryCategory,
    description: buildProductSeoDescription({
      name: item.name,
      category: primaryCategory,
      description: item.description ?? "",
      leadTime: "Same day",
    }),
    price,
    serves,
    leadTime: "Same day",
    image: getProductImageUrl(item.image),
    accent: fallbackAccent,
    highlights: fallbackHighlights,
    categories: normalizedCategories,
    weightOptions: isEligibleForVariants
      ? getGeneratedWeightOptions(price, baseWeightKg, maxWeightKg, serves)
      : [],
    flavorOptions: isEligibleForVariants ? [...DEFAULT_FLAVOR_OPTIONS] : [],
  };
}
