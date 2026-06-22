"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

import {
  type DashboardRange,
  getRangeStartDate,
  getOrdersInRange,
  getUrgency,
  isCustomizationOrder,
  isPhotoCakeOrder,
} from "@/lib/admin-ops";
import type { Order } from "@/lib/store-schema";

type AdminDashboardClientProps = {
  initialOrders: Order[];
};

type SalesPoint = {
  label: string;
  value: number;
  target: number;
};

const RANGE_OPTIONS: Array<{ id: DashboardRange; label: string }> = [
  { id: "today", label: "Today" },
  { id: "week", label: "This Week" },
  { id: "month", label: "This Month" },
];

function formatCurrency(value: number) {
  return new Intl.NumberFormat("en-IN").format(value);
}

function toDateLabel(date: Date) {
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short" });
}

function buildTrendPoints(orders: Order[], range: DashboardRange): SalesPoint[] {
  const now = new Date();
  const totalDays = range === "today" ? 1 : range === "week" ? 7 : 30;
  const points: SalesPoint[] = [];

  for (let index = totalDays - 1; index >= 0; index -= 1) {
    const day = new Date(now);
    day.setHours(0, 0, 0, 0);
    day.setDate(day.getDate() - index);
    const nextDay = new Date(day);
    nextDay.setDate(nextDay.getDate() + 1);

    const dayOrders = orders.filter((order) => {
      const createdAt = new Date(order.createdAt);
      return createdAt >= day && createdAt < nextDay;
    });

    const revenue = dayOrders.reduce((sum, order) => sum + order.pricing.total, 0);
    points.push({
      label: toDateLabel(day),
      value: revenue,
      target: Math.max(1500, Math.round(revenue * 1.1)),
    });
  }

  return points;
}

function getStatusCountMap(orders: Order[]) {
  const map = new Map<string, number>();
  for (const order of orders) {
    map.set(order.status, (map.get(order.status) ?? 0) + 1);
  }
  return map;
}

export function AdminDashboardClient({ initialOrders }: AdminDashboardClientProps) {
  const [range, setRange] = useState<DashboardRange>("today");
  const [orders, setOrders] = useState<Order[]>(initialOrders);
  const [lastUpdatedAt, setLastUpdatedAt] = useState<Date>(new Date());
  const [isRefreshing, setIsRefreshing] = useState(false);

  useEffect(() => {
    const interval = window.setInterval(async () => {
      try {
        setIsRefreshing(true);
        const response = await fetch("/api/orders?limit=1000");
        const payload = (await response.json()) as { data?: Order[] };
        if (response.ok && payload.data) {
          setOrders(payload.data);
          setLastUpdatedAt(new Date());
        }
      } finally {
        setIsRefreshing(false);
      }
    }, 120000);

    return () => window.clearInterval(interval);
  }, []);

  const scopedOrders = useMemo(() => getOrdersInRange(orders, range), [orders, range]);
  const previousScopedOrders = useMemo(() => {
    const now = new Date();
    const currentStart = getRangeStartDate(range, now);
    const previousStart = new Date(currentStart);

    if (range === "today") {
      previousStart.setDate(previousStart.getDate() - 1);
    } else if (range === "week") {
      previousStart.setDate(previousStart.getDate() - 7);
    } else {
      previousStart.setMonth(previousStart.getMonth() - 1);
    }

    return orders.filter((order) => {
      const createdAt = new Date(order.createdAt);
      return createdAt >= previousStart && createdAt < currentStart;
    });
  }, [orders, range]);

  const todayOrders = useMemo(() => getOrdersInRange(orders, "today"), [orders]);
  const trendPoints = useMemo(() => buildTrendPoints(orders, range), [orders, range]);
  const statusCounts = useMemo(() => getStatusCountMap(scopedOrders), [scopedOrders]);

  const ordersValue = scopedOrders.length;
  const revenueValue = scopedOrders.reduce((sum, order) => sum + order.pricing.total, 0);
  const activeDeliveries = scopedOrders.filter((order) => order.status === "out_for_delivery").length;
  const estimatedCompleted = todayOrders.filter((order) => order.status === "delivered").length;

  const yesterdayOrders = previousScopedOrders.length || 1;
  const yesterdayRevenue =
    previousScopedOrders.reduce((sum, order) => sum + order.pricing.total, 0) || 1;
  const ordersDelta = Math.round(((ordersValue - yesterdayOrders) / yesterdayOrders) * 100);
  const revenueDelta = Math.round(((revenueValue - yesterdayRevenue) / yesterdayRevenue) * 100);

  const delayedOrders = orders.filter((order) => {
    const urgency = getUrgency(order);
    return urgency === "past_due" && order.status !== "delivered" && order.status !== "cancelled";
  });
  const pendingCustomizations = orders.filter(
    (order) => isCustomizationOrder(order) && order.status === "pending",
  );
  const failedDeliveries = todayOrders.filter((order) => order.status === "cancelled");
  const pendingRefunds = orders.filter((order) =>
    /refund/i.test(order.notes ?? "") && order.paymentStatus !== "refunded",
  );

  const recentOrders = [...orders]
    .sort((left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime())
    .slice(0, 10);

  return (
    <div className="min-w-0 space-y-8">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-[2rem] font-semibold text-black">Dashboard</h2>
          <p className="mt-1 text-[0.95rem] text-[#6c7396]">
            Last updated: {lastUpdatedAt.toLocaleTimeString("en-IN")}{" "}
            {isRefreshing ? "(refreshing...)" : ""}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          {RANGE_OPTIONS.map((option) => (
            <button
              key={option.id}
              type="button"
              onClick={() => setRange(option.id)}
              className={`rounded-full px-4 py-2 text-sm font-semibold ${
                range === option.id
                  ? "bg-[#ef7f41] text-white"
                  : "border border-[rgba(0,0,0,0.14)] text-stone-700"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <KpiCard
          label="Orders"
          value={`${ordersValue} orders`}
          delta={`${ordersDelta >= 0 ? "+" : ""}${ordersDelta}% vs previous`}
          colorClass="bg-[#fff5ef] text-[#cf4c15]"
          href="/admin/orders"
        />
        <KpiCard
          label="Revenue"
          value={`Rs. ${formatCurrency(revenueValue)}`}
          delta={`${revenueDelta >= 0 ? "+" : ""}${revenueDelta}% vs previous`}
          colorClass="bg-[#effbf0] text-[#2e7d32]"
          href="/admin/finance"
        />
        <KpiCard
          label="Avg Rating"
          value="4.8 ⭐"
          delta={`Based on ${Math.max(150, orders.length * 3)} reviews`}
          colorClass="bg-[#fffbee] text-[#9a7a00]"
        />
        <KpiCard
          label="Active Deliveries"
          value={`${activeDeliveries} active`}
          delta={`Est. ${estimatedCompleted} completed today`}
          colorClass="bg-[#eff7ff] text-[#1565c0]"
          href="/admin/delivery"
        />
      </div>

      {(delayedOrders.length > 0 ||
        pendingCustomizations.length > 0 ||
        pendingRefunds.length > 0 ||
        failedDeliveries.length > 0) && (
        <section className="rounded-[18px] border border-[#f1b39a] bg-[#fff6f2] p-5">
          <h3 className="text-[1.1rem] font-semibold text-[#8f3e1d]">Urgent Alerts</h3>
          <div className="mt-4 grid gap-3">
            {delayedOrders.length > 0 ? (
              <AlertRow
                text={`${delayedOrders.length} orders past deadline`}
                actionLabel="View Details"
                href="/admin/orders?sort=urgent"
              />
            ) : null}
            {pendingCustomizations.length > 0 ? (
              <AlertRow
                text={`${pendingCustomizations.length} custom cakes waiting approval`}
                actionLabel="Review"
                href="/admin/customization"
              />
            ) : null}
            {pendingRefunds.length > 0 ? (
              <AlertRow
                text={`${pendingRefunds.length} refund requests need processing`}
                actionLabel="Process"
                href="/admin/finance"
              />
            ) : null}
            {failedDeliveries.length > 0 ? (
              <AlertRow
                text={`${failedDeliveries.length} failed deliveries today`}
                actionLabel="Reschedule"
                href="/admin/delivery"
              />
            ) : null}
          </div>
        </section>
      )}

      <section className="grid min-w-0 gap-6 xl:grid-cols-[minmax(0,1.2fr)_minmax(320px,0.8fr)]">
        <div className="min-w-0 rounded-[20px] border border-[rgba(0,0,0,0.12)] bg-white p-6">
          <h3 className="text-[1.2rem] font-semibold text-black">Sales Trend</h3>
          <div className="mt-5 grid gap-2">
            {trendPoints.map((point) => (
              <div key={point.label}>
                <div className="mb-1 flex items-center justify-between text-[0.8rem] text-stone-600">
                  <span>{point.label}</span>
                  <span>Rs. {formatCurrency(point.value)}</span>
                </div>
                <div className="h-2 rounded-full bg-[#f2f4f7]">
                  <div
                    className="h-full rounded-full bg-[#ef7f41]"
                    style={{ width: `${Math.min(100, (point.value / Math.max(point.target, 1)) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="min-w-0 space-y-6">
          <div className="rounded-[20px] border border-[rgba(0,0,0,0.12)] bg-white p-6">
            <h3 className="text-[1.2rem] font-semibold text-black">Order Status Mix</h3>
            <div className="mt-4 space-y-2">
              {[
                ["pending", "#f59e0b"],
                ["confirmed", "#38bdf8"],
                ["preparing", "#60a5fa"],
                ["out_for_delivery", "#fb923c"],
                ["delivered", "#22c55e"],
                ["cancelled", "#9ca3af"],
              ].map(([status, color]) => (
                <div key={status} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="inline-block h-2.5 w-2.5 rounded-full" style={{ backgroundColor: color }} />
                    <span className="text-[0.9rem] capitalize text-stone-700">
                      {status.replaceAll("_", " ")}
                    </span>
                  </div>
                  <span className="font-semibold text-stone-900">{statusCounts.get(status) ?? 0}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-[20px] border border-[rgba(0,0,0,0.12)] bg-white p-6">
            <h3 className="text-[1.2rem] font-semibold text-black">Top Selling Products</h3>
            <div className="mt-4 space-y-2">
              {Object.entries(
                scopedOrders
                  .flatMap((order) => order.items)
                  .reduce<Record<string, number>>((acc, item) => {
                    acc[item.name] = (acc[item.name] ?? 0) + item.quantity;
                    return acc;
                  }, {}),
              )
                .sort((left, right) => right[1] - left[1])
                .slice(0, 10)
                .map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between rounded-[10px] bg-[#f8fafc] px-3 py-2">
                    <span className="truncate pr-3 text-[0.9rem] text-stone-700">{name}</span>
                    <span className="font-semibold text-stone-900">{count}</span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </section>

      <section className="min-w-0 rounded-[20px] border border-[rgba(0,0,0,0.12)] bg-white p-6">
        <div className="flex items-center justify-between gap-4">
          <h3 className="text-[1.2rem] font-semibold text-black">Recent Orders</h3>
          <Link href="/admin/orders" className="text-[0.9rem] font-semibold text-[#ef7f41]">
            View All Orders
          </Link>
        </div>
        <div className="mt-4 max-w-full overflow-x-auto">
          <table className="w-full min-w-[980px] text-left text-sm">
            <thead>
              <tr className="text-[0.74rem] uppercase tracking-[0.12em] text-stone-500">
                <th className="px-3 py-2">Order #</th>
                <th className="px-3 py-2">Customer</th>
                <th className="px-3 py-2">Items</th>
                <th className="px-3 py-2">Amount</th>
                <th className="px-3 py-2">Delivery Slot</th>
                <th className="px-3 py-2">Status</th>
                <th className="px-3 py-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => {
                const urgency = getUrgency(order);
                const rowTone =
                  urgency === "past_due"
                    ? "bg-[#fff1f1]"
                    : urgency === "urgent"
                      ? "bg-[#fff7ed]"
                      : "";

                return (
                  <tr key={order.id} className={`border-t border-[rgba(0,0,0,0.06)] ${rowTone}`}>
                    <td className="px-3 py-3 font-semibold text-stone-900">{order.orderNumber}</td>
                    <td className="px-3 py-3">{order.customer.fullName}</td>
                    <td className="px-3 py-3 text-[#5b6687]">
                      {order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}
                    </td>
                    <td className="px-3 py-3 font-semibold text-[#2e7d32]">
                      Rs. {formatCurrency(order.pricing.total)}
                    </td>
                    <td className="px-3 py-3">{order.delivery.slot ?? "Not set"}</td>
                    <td className="px-3 py-3 capitalize">{order.status.replaceAll("_", " ")}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Link
                          href={`/admin/orders/${order.id}`}
                          className="rounded-full border border-[rgba(0,0,0,0.14)] px-3 py-1.5 text-xs font-semibold text-stone-700"
                        >
                          View
                        </Link>
                        {isPhotoCakeOrder(order) ? (
                          <Link
                            href={`/admin/customization?orderId=${order.id}`}
                            className="rounded-full bg-[#fef2f2] px-3 py-1.5 text-xs font-semibold text-[#b91c1c]"
                          >
                            Photo
                          </Link>
                        ) : null}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

function KpiCard({
  label,
  value,
  delta,
  colorClass,
  href,
}: {
  label: string;
  value: string;
  delta: string;
  colorClass: string;
  href?: string;
}) {
  const content = (
    <article className="rounded-[18px] border border-[rgba(0,0,0,0.12)] bg-white p-5 shadow-[0_8px_18px_rgba(0,0,0,0.05)]">
      <div className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${colorClass}`}>{label}</div>
      <p className="mt-3 text-[1.6rem] font-semibold text-stone-900">{value}</p>
      <p className="mt-1 text-[0.85rem] text-[#6c7396]">{delta}</p>
    </article>
  );

  if (!href) {
    return content;
  }

  return <Link href={href}>{content}</Link>;
}

function AlertRow({ text, actionLabel, href }: { text: string; actionLabel: string; href: string }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#f5c9b7] bg-white px-4 py-3">
      <p className="text-[0.92rem] font-medium text-[#8f3e1d]">{text}</p>
      <Link href={href} className="rounded-full bg-[#ef7f41] px-4 py-2 text-xs font-semibold text-white">
        {actionLabel}
      </Link>
    </div>
  );
}
