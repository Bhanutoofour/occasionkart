import { createMetadata } from "@/lib/seo";
import { listOrders } from "@/lib/server/orders";

export const metadata = createMetadata({
  title: "Admin Delivery | OccasionKart",
  description: "Track active delivery routes, completion progress, and Hyderabad delivery ops.",
  noIndex: true,
});

export default async function AdminDeliveryPage() {
  const orders = await listOrders({ paymentStatus: "paid", limit: 600 });
  const activeDeliveries = orders.filter((order) => order.status === "out_for_delivery");
  const deliveredToday = orders.filter((order) => {
    const created = new Date(order.createdAt);
    const now = new Date();
    return (
      order.status === "delivered" &&
      created.getDate() === now.getDate() &&
      created.getMonth() === now.getMonth() &&
      created.getFullYear() === now.getFullYear()
    );
  });

  return (
    <div className="space-y-6">
      <div>
        <p className="section-kicker">Delivery</p>
        <h2 className="mt-2 text-[2rem] font-semibold text-black">Route Tracking</h2>
        <p className="mt-2 max-w-[72ch] text-[1rem] leading-8 text-[#6c7396]">
          Live view of active Hyderabad deliveries with quick progress visibility.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-4">
        <MetricCard label="Active Deliveries" value={String(activeDeliveries.length)} />
        <MetricCard label="Delivered Today" value={String(deliveredToday.length)} />
        <MetricCard label="Avg Delivery Time" value="62 min" />
        <MetricCard label="On-time Rate" value="95%" />
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {activeDeliveries.slice(0, 12).map((order, index) => (
          <article
            key={order.id}
            className="rounded-[20px] border border-[rgba(0,0,0,0.12)] bg-white p-5 shadow-[0_10px_24px_rgba(0,0,0,0.06)]"
          >
            <div className="flex items-center justify-between gap-3">
              <p className="text-[0.82rem] font-bold uppercase tracking-[0.16em] text-[#ef7f41]">
                Route {index + 1}
              </p>
              <span className="rounded-full bg-[#fff1e8] px-3 py-1 text-xs font-semibold text-[#b45309]">
                On Route
              </span>
            </div>
            <p className="mt-2 text-[1rem] font-semibold text-stone-900">{order.orderNumber}</p>
            <p className="mt-1 text-[0.92rem] text-[#6c7396]">{order.customer.fullName}</p>
            <p className="mt-1 text-[0.9rem] text-[#6c7396]">{order.delivery.address}</p>
            <p className="mt-2 text-[0.88rem] text-[#334155]">
              Slot: {order.delivery.slot ?? "Not set"}
            </p>
            <div className="mt-4 h-2 rounded-full bg-[#f1f5f9]">
              <div className="h-full w-[62%] rounded-full bg-[#38bdf8]" />
            </div>
            <p className="mt-2 text-[0.82rem] text-[#6c7396]">Progress: 5 of 8 deliveries</p>
            <div className="mt-4 flex gap-2">
              <button
                type="button"
                className="rounded-full border border-[rgba(0,0,0,0.14)] px-3 py-1.5 text-xs font-semibold text-stone-700"
              >
                Call Agent
              </button>
              <button
                type="button"
                className="rounded-full bg-[#e0f2fe] px-3 py-1.5 text-xs font-semibold text-[#075985]"
              >
                Reassign
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[rgba(0,0,0,0.12)] bg-white p-5">
      <p className="text-[0.8rem] font-semibold uppercase tracking-[0.15em] text-[#ef7f41]">{label}</p>
      <p className="mt-2 text-[1.8rem] font-semibold text-stone-900">{value}</p>
    </div>
  );
}
