"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import { getUrgency, isCustomizationOrder, isPhotoCakeOrder } from "@/lib/admin-ops";
import type { Order, OrderStatus } from "@/lib/store-schema";

type SortBy = "recent" | "urgent" | "value";

const statusOptions: Array<{ id: "" | OrderStatus; label: string }> = [
  { id: "", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "preparing", label: "Processing" },
  { id: "out_for_delivery", label: "Out for Delivery" },
  { id: "delivered", label: "Delivered" },
  { id: "cancelled", label: "Cancelled" },
];

const sortOptions: Array<{ id: SortBy; label: string }> = [
  { id: "recent", label: "Most Recent" },
  { id: "urgent", label: "Most Urgent" },
  { id: "value", label: "Highest Value" },
];

function formatStatus(value: string) {
  return value.replaceAll("_", " ");
}

function statusPillClass(status: OrderStatus) {
  switch (status) {
    case "pending":
      return "bg-[#fff8e8] text-[#a06800]";
    case "confirmed":
    case "preparing":
      return "bg-[#edf5ff] text-[#1e5eb7]";
    case "out_for_delivery":
      return "bg-[#fff1e8] text-[#b45309]";
    case "delivered":
      return "bg-[#edf9ef] text-[#257d2d]";
    case "cancelled":
      return "bg-[#f3f4f6] text-[#4b5563]";
    default:
      return "bg-[#f3f4f6] text-[#4b5563]";
  }
}

function urgencyBadge(order: Order) {
  const urgency = getUrgency(order);
  if (urgency === "past_due" || urgency === "urgent") {
    return { label: "URGENT", className: "bg-[#fee2e2] text-[#b91c1c]" };
  }
  if (urgency === "soon") {
    return { label: "SOON", className: "bg-[#fef3c7] text-[#9a6700]" };
  }
  return { label: "UPCOMING", className: "bg-[#dcfce7] text-[#2f8f2f]" };
}

export function AdminOrdersClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [query, setQuery] = useState("");
  const [activeStatus, setActiveStatus] = useState<"" | OrderStatus>("");
  const [sortBy, setSortBy] = useState<SortBy>("recent");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const counts = useMemo(() => {
    return {
      all: orders.length,
      pending: orders.filter((order) => order.status === "pending").length,
      preparing: orders.filter((order) => order.status === "preparing").length,
      confirmed: orders.filter((order) => order.status === "confirmed").length,
      out_for_delivery: orders.filter((order) => order.status === "out_for_delivery").length,
      delivered: orders.filter((order) => order.status === "delivered").length,
      cancelled: orders.filter((order) => order.status === "cancelled").length,
    };
  }, [orders]);

  const filteredOrders = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();
    const next = orders.filter((order) => {
      const matchesStatus = activeStatus ? order.status === activeStatus : true;
      const matchesQuery = lowerQuery
        ? [
            order.orderNumber,
            order.customer.fullName,
            order.customer.phone,
            order.delivery.address,
          ]
            .join(" ")
            .toLowerCase()
            .includes(lowerQuery)
        : true;
      return matchesStatus && matchesQuery;
    });

    if (sortBy === "value") {
      return next.sort((left, right) => right.pricing.total - left.pricing.total);
    }

    if (sortBy === "urgent") {
      const score = (order: Order) => {
        const urgency = getUrgency(order);
        if (urgency === "past_due") return 0;
        if (urgency === "urgent") return 1;
        if (urgency === "soon") return 2;
        return 3;
      };
      return next.sort((left, right) => {
        const byUrgency = score(left) - score(right);
        if (byUrgency !== 0) return byUrgency;
        return (
          new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime()
        );
      });
    }

    return next.sort(
      (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
    );
  }, [orders, query, activeStatus, sortBy]);

  const changeStatus = async (orderId: string, status: OrderStatus) => {
    setPendingId(orderId);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status }),
      });
      const payload = (await response.json()) as { error?: string; data?: Order };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "Unable to update status.");
      }

      setOrders((prev) => prev.map((order) => (order.id === orderId ? payload.data! : order)));
      setMessage("Order status updated.");
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unable to update status.");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="min-w-0 space-y-6">
      <div className="min-w-0 rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
        <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_220px]">
          <input
            value={query}
            placeholder="Search order #, customer name, or phone..."
            className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            value={sortBy}
            onChange={(event) => setSortBy(event.target.value as SortBy)}
            className="rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
          >
            {sortOptions.map((option) => (
              <option key={option.id} value={option.id}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {statusOptions.map((status) => {
            const count =
              status.id === ""
                ? counts.all
                : status.id === "pending"
                  ? counts.pending
                  : status.id === "preparing"
                    ? counts.preparing
                    : status.id === "confirmed"
                      ? counts.confirmed
                      : status.id === "out_for_delivery"
                        ? counts.out_for_delivery
                        : status.id === "delivered"
                          ? counts.delivered
                          : counts.cancelled;

            const active = activeStatus === status.id;
            return (
              <button
                key={status.label}
                type="button"
                onClick={() => setActiveStatus(status.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  active
                    ? "bg-[#ef7f41] text-white"
                    : "border border-[rgba(0,0,0,0.12)] text-stone-700"
                }`}
              >
                {status.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {message ? (
        <p className="rounded-[12px] bg-[#effcf2] px-4 py-3 text-sm font-semibold text-[#2f8f2f]">{message}</p>
      ) : null}
      {error ? (
        <p className="rounded-[12px] bg-[#fff2f2] px-4 py-3 text-sm font-semibold text-[#b53131]">{error}</p>
      ) : null}

      <div className="max-w-full overflow-x-auto rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
        <table className="w-full min-w-[1100px] text-left">
          <thead>
            <tr className="border-b border-[rgba(0,0,0,0.08)] text-[0.72rem] uppercase tracking-[0.14em] text-stone-500">
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Delivery Slot</th>
              <th className="px-4 py-3">Area</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Urgency</th>
              <th className="px-4 py-3">Custom</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => {
              const urgency = urgencyBadge(order);
              const urgencyFlag = getUrgency(order);
              const rowClass =
                urgencyFlag === "past_due"
                  ? "bg-[#fff1f1]"
                  : urgencyFlag === "urgent"
                    ? "bg-[#fff8ef]"
                    : "";

              return (
                <tr key={order.id} className={`border-b border-[rgba(0,0,0,0.06)] ${rowClass}`}>
                  <td className="px-4 py-3">
                    <Link href={`/admin/orders/${order.id}`} className="font-semibold text-[#ef7f41]">
                      {order.orderNumber}
                    </Link>
                  </td>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-stone-900">{order.customer.fullName}</p>
                    <p className="text-[0.84rem] text-[#6c7396]">{order.customer.phone}</p>
                  </td>
                  <td className="px-4 py-3 text-[0.9rem] text-[#5c6889]">
                    {order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}
                  </td>
                  <td className="px-4 py-3 font-semibold text-[#2e7d32]">Rs. {order.pricing.total}</td>
                  <td className="px-4 py-3">{order.delivery.slot ?? "Not set"}</td>
                  <td className="px-4 py-3">{order.delivery.pincode ?? "Hyderabad"}</td>
                  <td className="px-4 py-3">
                    <select
                      value={order.status}
                      onChange={(event) => changeStatus(order.id, event.target.value as OrderStatus)}
                      disabled={pendingId === order.id}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize ${statusPillClass(order.status)}`}
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="preparing">Processing</option>
                      <option value="out_for_delivery">Out for delivery</option>
                      <option value="delivered">Delivered</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`rounded-full px-3 py-1 text-xs font-semibold ${urgency.className}`}>
                      {urgency.label}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1">
                      {isCustomizationOrder(order) ? (
                        <span className="rounded-full bg-[#eef2ff] px-2 py-0.5 text-xs font-semibold text-[#3730a3]">
                          Custom
                        </span>
                      ) : null}
                      {isPhotoCakeOrder(order) ? (
                        <span className="rounded-full bg-[#fff1f2] px-2 py-0.5 text-xs font-semibold text-[#be123c]">
                          Photo
                        </span>
                      ) : null}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-2">
                      <Link
                        href={`/admin/orders/${order.id}`}
                        className="rounded-full border border-[rgba(0,0,0,0.14)] px-3 py-1 text-xs font-semibold text-stone-700"
                      >
                        View Details
                      </Link>
                      <button
                        type="button"
                        className="rounded-full bg-[#e0f2fe] px-3 py-1 text-xs font-semibold text-[#075985]"
                      >
                        Assign Agent
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-[20px] border border-[rgba(0,0,0,0.12)] bg-white p-8 text-[#6c7396]">
          No orders match the current filters.
        </div>
      ) : null}
    </div>
  );
}
