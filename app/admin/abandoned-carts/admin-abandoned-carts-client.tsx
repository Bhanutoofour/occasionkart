"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

import type { Order, PaymentStatus } from "@/lib/store-schema";

type PaymentFilter = "" | PaymentStatus;

const paymentOptions: Array<{ id: PaymentFilter; label: string }> = [
  { id: "", label: "All Unpaid" },
  { id: "pending", label: "Payment Pending" },
  { id: "failed", label: "Payment Abandoned" },
];

function formatPaymentStatus(value: PaymentStatus) {
  if (value === "failed") {
    return "Abandoned";
  }
  return value.replaceAll("_", " ");
}

function paymentPillClass(status: PaymentStatus) {
  switch (status) {
    case "pending":
      return "bg-[#fff8e8] text-[#a06800]";
    case "failed":
      return "bg-[#fee2e2] text-[#b91c1c]";
    default:
      return "bg-[#f3f4f6] text-[#4b5563]";
  }
}

function buildWhatsAppLink(order: Order) {
  const phone = order.customer.phone.replace(/\D+/g, "");
  const message = `Hello ${order.customer.fullName}, this is OccasionKart. We noticed your order ${order.orderNumber} (Rs. ${order.pricing.total}) was not completed. Would you like help finishing payment?`;
  return `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
}

export function AdminAbandonedCartsClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders] = useState(initialOrders);
  const [query, setQuery] = useState("");
  const [paymentFilter, setPaymentFilter] = useState<PaymentFilter>("");

  const counts = useMemo(
    () => ({
      all: orders.length,
      pending: orders.filter((order) => order.paymentStatus === "pending").length,
      failed: orders.filter((order) => order.paymentStatus === "failed").length,
    }),
    [orders],
  );

  const filteredOrders = useMemo(() => {
    const lowerQuery = query.trim().toLowerCase();

    return orders
      .filter((order) => {
        const matchesPayment = paymentFilter ? order.paymentStatus === paymentFilter : true;
        const matchesQuery = lowerQuery
          ? [
              order.orderNumber,
              order.customer.fullName,
              order.customer.phone,
              order.customer.email ?? "",
            ]
              .join(" ")
              .toLowerCase()
              .includes(lowerQuery)
          : true;
        return matchesPayment && matchesQuery;
      })
      .sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      );
  }, [orders, query, paymentFilter]);

  return (
    <div className="min-w-0 space-y-6">
      <div className="min-w-0 rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
        <input
          value={query}
          placeholder="Search order #, customer name, phone, or email..."
          className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
          onChange={(event) => setQuery(event.target.value)}
        />

        <div className="mt-4 flex flex-wrap gap-2">
          {paymentOptions.map((option) => {
            const count =
              option.id === ""
                ? counts.all
                : option.id === "pending"
                  ? counts.pending
                  : counts.failed;
            const active = paymentFilter === option.id;

            return (
              <button
                key={option.label}
                type="button"
                onClick={() => setPaymentFilter(option.id)}
                className={`rounded-full px-4 py-2 text-sm font-semibold ${
                  active
                    ? "bg-[#ef7f41] text-white"
                    : "border border-[rgba(0,0,0,0.12)] text-stone-700"
                }`}
              >
                {option.label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      <div className="max-w-full overflow-x-auto rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
        <table className="w-full min-w-[980px] text-left">
          <thead>
            <tr className="border-b border-[rgba(0,0,0,0.08)] text-[0.72rem] uppercase tracking-[0.14em] text-stone-500">
              <th className="px-4 py-3">Order #</th>
              <th className="px-4 py-3">Customer</th>
              <th className="px-4 py-3">Items</th>
              <th className="px-4 py-3">Amount</th>
              <th className="px-4 py-3">Attempted At</th>
              <th className="px-4 py-3">Payment</th>
              <th className="px-4 py-3">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.map((order) => (
              <tr key={order.id} className="border-b border-[rgba(0,0,0,0.06)]">
                <td className="px-4 py-3">
                  <Link href={`/admin/orders/${order.id}`} className="font-semibold text-[#ef7f41]">
                    {order.orderNumber}
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <p className="font-semibold text-stone-900">{order.customer.fullName}</p>
                  <p className="text-[0.84rem] text-[#6c7396]">{order.customer.phone}</p>
                  {order.customer.email ? (
                    <p className="text-[0.84rem] text-[#6c7396]">{order.customer.email}</p>
                  ) : null}
                </td>
                <td className="px-4 py-3 text-[0.9rem] text-[#5c6889]">
                  {order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}
                </td>
                <td className="px-4 py-3 font-semibold text-[#2e7d32]">Rs. {order.pricing.total}</td>
                <td className="px-4 py-3 text-[0.9rem] text-stone-700">
                  {new Date(order.createdAt).toLocaleString("en-IN", {
                    dateStyle: "medium",
                    timeStyle: "short",
                  })}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${paymentPillClass(
                      order.paymentStatus,
                    )}`}
                  >
                    {formatPaymentStatus(order.paymentStatus)}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-2">
                    <Link
                      href={`/admin/orders/${order.id}`}
                      className="rounded-full border border-[rgba(0,0,0,0.14)] px-3 py-1 text-xs font-semibold text-stone-700"
                    >
                      View Details
                    </Link>
                    <a
                      href={buildWhatsAppLink(order)}
                      target="_blank"
                      rel="noreferrer"
                      className="rounded-full bg-[#25d366] px-3 py-1 text-xs font-semibold text-white"
                    >
                      WhatsApp
                    </a>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {filteredOrders.length === 0 ? (
        <div className="rounded-[20px] border border-[rgba(0,0,0,0.12)] bg-white p-8 text-[#6c7396]">
          No abandoned checkout attempts match the current filters.
        </div>
      ) : null}
    </div>
  );
}
