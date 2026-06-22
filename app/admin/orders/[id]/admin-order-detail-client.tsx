"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

import type { Order, OrderStatus, PaymentStatus } from "@/lib/store-schema";

export function AdminOrderDetailClient({ order }: { order: Order }) {
  const router = useRouter();
  const [status, setStatus] = useState<OrderStatus>(order.status);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>(order.paymentStatus);
  const [notes, setNotes] = useState(order.notes ?? "");
  const [isPending, setIsPending] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const handleSave = async () => {
    setIsPending(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(`/api/orders/${order.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          status,
          paymentStatus,
          notes,
        }),
      });

      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(payload.error ?? "Unable to update this order.");
      }

      setMessage("Order updated.");
      router.refresh();
    } catch (submitError) {
      setError(
        submitError instanceof Error ? submitError.message : "Unable to update this order.",
      );
    } finally {
      setIsPending(false);
    }
  };

  return (
    <div className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
      <div className="grid gap-5 md:grid-cols-2">
        <label className="space-y-2">
          <span className="text-[0.9rem] font-semibold text-stone-900">Order Status</span>
          <select
            value={status}
            className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3 capitalize"
            onChange={(event) => setStatus(event.target.value as OrderStatus)}
          >
            <option value="pending">Pending</option>
            <option value="confirmed">Confirmed</option>
            <option value="preparing">Preparing</option>
            <option value="out_for_delivery">Out for delivery</option>
            <option value="delivered">Delivered</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </label>

        <label className="space-y-2">
          <span className="text-[0.9rem] font-semibold text-stone-900">Payment Status</span>
          <select
            value={paymentStatus}
            className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3 capitalize"
            onChange={(event) => setPaymentStatus(event.target.value as PaymentStatus)}
          >
            <option value="pending">Pending</option>
            <option value="paid">Paid</option>
            <option value="failed">Failed</option>
            <option value="refunded">Refunded</option>
          </select>
        </label>
      </div>

      <label className="mt-5 block space-y-2">
        <span className="text-[0.9rem] font-semibold text-stone-900">Internal Notes</span>
        <textarea
          rows={5}
          value={notes}
          className="w-full rounded-[14px] border border-[rgba(0,0,0,0.12)] px-4 py-3"
          onChange={(event) => setNotes(event.target.value)}
        />
      </label>

      {message ? (
        <p className="mt-4 rounded-[14px] bg-[#f1fff1] px-4 py-3 text-[0.95rem] text-[#2f8f2f]">
          {message}
        </p>
      ) : null}

      {error ? (
        <p className="mt-4 rounded-[14px] bg-[#fff3f0] px-4 py-3 text-[0.95rem] text-[#b93815]">
          {error}
        </p>
      ) : null}

      <button
        type="button"
        disabled={isPending}
        className="mt-5 rounded-full bg-[#ef7f41] px-6 py-3 text-[1rem] font-semibold text-white disabled:opacity-70"
        onClick={handleSave}
      >
        {isPending ? "Saving..." : "Save Order Changes"}
      </button>
    </div>
  );
}
