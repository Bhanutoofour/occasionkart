"use client";

import { useMemo, useState } from "react";

import { getUrgency, isCustomizationOrder, isPhotoCakeOrder } from "@/lib/admin-ops";
import type { Order } from "@/lib/store-schema";

type FilterId = "pending" | "approved" | "changes" | "completed";

function getCustomizationState(order: Order): FilterId {
  const notes = (order.notes ?? "").toLowerCase();
  if (order.status === "delivered") return "completed";
  if (notes.includes("[changes-requested]")) return "changes";
  if (notes.includes("[custom-approved]")) return "approved";
  return "pending";
}

function appendNote(base: string | undefined, token: string) {
  const current = (base ?? "").trim();
  if (current.includes(token)) {
    return current;
  }
  return `${current} ${token}`.trim();
}

export function AdminCustomizationClient({ initialOrders }: { initialOrders: Order[] }) {
  const [orders, setOrders] = useState(initialOrders);
  const [filter, setFilter] = useState<FilterId>("pending");
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const customizationOrders = useMemo(
    () => orders.filter((order) => isCustomizationOrder(order)),
    [orders],
  );

  const counts = useMemo(() => {
    const stateCounts: Record<FilterId, number> = {
      pending: 0,
      approved: 0,
      changes: 0,
      completed: 0,
    };
    for (const order of customizationOrders) {
      stateCounts[getCustomizationState(order)] += 1;
    }
    return stateCounts;
  }, [customizationOrders]);

  const filtered = useMemo(
    () =>
      customizationOrders.filter((order) => {
        return getCustomizationState(order) === filter;
      }),
    [customizationOrders, filter],
  );

  const patchOrder = async (orderId: string, body: Record<string, unknown>, successMsg: string) => {
    setPendingId(orderId);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const payload = (await response.json()) as { error?: string; data?: Order };
      if (!response.ok || !payload.data) {
        throw new Error(payload.error ?? "Unable to update customization.");
      }
      setOrders((prev) => prev.map((item) => (item.id === orderId ? payload.data! : item)));
      setMessage(successMsg);
    } catch (patchError) {
      setError(patchError instanceof Error ? patchError.message : "Unable to update customization.");
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[2rem] font-semibold text-black">Customization Orders</h2>
        <p className="mt-2 text-[1rem] leading-8 text-[#6c7396]">
          Approve photo cakes, personalization text, and design requirements before kitchen execution.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        <FilterTab id="pending" label={`Pending (${counts.pending})`} active={filter === "pending"} onClick={setFilter} />
        <FilterTab id="approved" label={`Approved (${counts.approved})`} active={filter === "approved"} onClick={setFilter} />
        <FilterTab id="changes" label={`Approved with Changes (${counts.changes})`} active={filter === "changes"} onClick={setFilter} />
        <FilterTab id="completed" label={`Completed (${counts.completed})`} active={filter === "completed"} onClick={setFilter} />
      </div>

      {message ? (
        <p className="rounded-[12px] bg-[#effcf2] px-4 py-3 text-sm font-semibold text-[#2f8f2f]">{message}</p>
      ) : null}
      {error ? (
        <p className="rounded-[12px] bg-[#fff2f2] px-4 py-3 text-sm font-semibold text-[#b53131]">{error}</p>
      ) : null}

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((order) => {
          const urgency = getUrgency(order);
          const urgencyClass =
            urgency === "urgent" || urgency === "past_due"
              ? "bg-[#fee2e2] text-[#b91c1c]"
              : urgency === "soon"
                ? "bg-[#fef3c7] text-[#9a6700]"
                : "bg-[#dcfce7] text-[#2f8f2f]";

          const hasPhoto = isPhotoCakeOrder(order);
          const notes = order.notes ?? "";
          const photoApproved = notes.includes("[photo-approved]");
          const designApproved = notes.includes("[design-approved]");

          return (
            <article
              key={order.id}
              className="rounded-[20px] border border-[rgba(0,0,0,0.12)] bg-white p-5 shadow-[0_10px_24px_rgba(0,0,0,0.06)]"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.15em] text-[#ef7f41]">
                    {order.orderNumber}
                  </p>
                  <h3 className="mt-2 text-[1rem] font-semibold text-stone-900">{order.customer.fullName}</h3>
                </div>
                <span className={`rounded-full px-3 py-1 text-xs font-semibold ${urgencyClass}`}>
                  {urgency === "past_due" ? "Deadline Missed" : urgency === "urgent" ? "Urgent" : urgency === "soon" ? "Soon" : "Upcoming"}
                </span>
              </div>

              <p className="mt-3 text-[0.9rem] text-[#5d6788]">
                {order.items.map((item) => `${item.quantity}x ${item.name}`).join(", ")}
              </p>
              <p className="mt-2 text-[0.9rem] text-[#5d6788]">
                Message: {order.delivery.cakeMessage || "No message added"}
              </p>
              <p className="mt-1 text-[0.9rem] text-[#5d6788]">Theme: Default / Custom</p>

              {hasPhoto ? (
                <div className="mt-4 rounded-[14px] border border-[rgba(0,0,0,0.1)] bg-[#f8fafc] p-3">
                  <p className="text-[0.85rem] font-semibold text-stone-900">Photo cake request detected</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      disabled={pendingId === order.id}
                      onClick={() =>
                        patchOrder(
                          order.id,
                          {
                            notes: appendNote(order.notes, "[photo-approved]"),
                          },
                          "Photo approved.",
                        )
                      }
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        photoApproved ? "bg-[#dcfce7] text-[#2f8f2f]" : "bg-[#ecfeff] text-[#155e75]"
                      }`}
                    >
                      Photo Approved
                    </button>
                    <button
                      type="button"
                      disabled={pendingId === order.id}
                      onClick={() =>
                        patchOrder(
                          order.id,
                          {
                            notes: appendNote(order.notes, "[changes-requested] Photo replacement required."),
                          },
                          "Change request saved.",
                        )
                      }
                      className="rounded-full bg-[#fff1f2] px-3 py-1.5 text-xs font-semibold text-[#be123c]"
                    >
                      Reject & Request New
                    </button>
                  </div>
                </div>
              ) : null}

              <div className="mt-4 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={pendingId === order.id}
                  onClick={() =>
                    patchOrder(
                      order.id,
                      {
                        notes: appendNote(appendNote(order.notes, "[design-approved]"), "[custom-approved]"),
                        status: "confirmed",
                      },
                      "Design approved.",
                    )
                  }
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                    designApproved ? "bg-[#dcfce7] text-[#2f8f2f]" : "bg-[#e8f0ff] text-[#1d4ed8]"
                  }`}
                >
                  Design Approved
                </button>
                <button
                  type="button"
                  disabled={pendingId === order.id}
                  onClick={() =>
                    patchOrder(
                      order.id,
                      {
                        notes: appendNote(order.notes, "[changes-requested] Design adjustments required."),
                      },
                      "Design change request noted.",
                    )
                  }
                  className="rounded-full bg-[#fff7e8] px-3 py-1.5 text-xs font-semibold text-[#9a6700]"
                >
                  Request Changes
                </button>
              </div>
            </article>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <div className="rounded-[20px] border border-[rgba(0,0,0,0.12)] bg-white p-8 text-[#6c7396]">
          No customization orders in this state.
        </div>
      ) : null}
    </div>
  );
}

function FilterTab({
  id,
  label,
  active,
  onClick,
}: {
  id: FilterId;
  label: string;
  active: boolean;
  onClick: (id: FilterId) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onClick(id)}
      className={`rounded-full px-4 py-2 text-sm font-semibold ${
        active ? "bg-[#ef7f41] text-white" : "border border-[rgba(0,0,0,0.12)] text-stone-700"
      }`}
    >
      {label}
    </button>
  );
}
