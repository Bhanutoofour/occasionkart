import { createMetadata } from "@/lib/seo";
import { listOrders } from "@/lib/server/orders";

export const metadata = createMetadata({
  title: "Admin Analytics | OccasionKart",
  description: "Operational analytics for order lifecycle and fulfillment performance.",
  noIndex: true,
});

function toPercent(value: number, total: number) {
  if (total === 0) {
    return "0%";
  }

  return `${Math.round((value / total) * 100)}%`;
}

export default async function AdminAnalyticsPage() {
  const orders = await listOrders({ paymentStatus: "paid", limit: 500 });
  const total = orders.length;

  const statusMap = new Map<string, number>();
  const paymentMap = new Map<string, number>();
  const slotMap = new Map<string, number>();

  for (const order of orders) {
    statusMap.set(order.status, (statusMap.get(order.status) ?? 0) + 1);
    paymentMap.set(order.paymentStatus, (paymentMap.get(order.paymentStatus) ?? 0) + 1);
    const slot = order.delivery.slot ?? "Unspecified";
    slotMap.set(slot, (slotMap.get(slot) ?? 0) + 1);
  }

  const topSlots = Array.from(slotMap.entries()).sort((a, b) => b[1] - a[1]).slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <p className="section-kicker">Analytics</p>
        <h2 className="mt-2 text-[2rem] font-semibold text-black">Operations Snapshot</h2>
        <p className="mt-2 max-w-[72ch] text-[1rem] leading-8 text-[#6c7396]">
          Understand how orders move through payment and delivery stages, and which delivery slots
          are most in demand.
        </p>
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <section className="rounded-[20px] border border-[rgba(0,0,0,0.12)] bg-white p-6">
          <h3 className="text-[1.2rem] font-semibold text-black">Order Status Distribution</h3>
          <div className="mt-4 space-y-3">
            {Array.from(statusMap.entries()).map(([status, count]) => (
              <Row
                key={status}
                label={status.replaceAll("_", " ")}
                value={count}
                percent={toPercent(count, total)}
              />
            ))}
          </div>
        </section>

        <section className="rounded-[20px] border border-[rgba(0,0,0,0.12)] bg-white p-6">
          <h3 className="text-[1.2rem] font-semibold text-black">Payment Status Distribution</h3>
          <div className="mt-4 space-y-3">
            {Array.from(paymentMap.entries()).map(([status, count]) => (
              <Row key={status} label={status} value={count} percent={toPercent(count, total)} />
            ))}
          </div>
        </section>
      </div>

      <section className="rounded-[20px] border border-[rgba(0,0,0,0.12)] bg-white p-6">
        <h3 className="text-[1.2rem] font-semibold text-black">Top Delivery Slots</h3>
        <div className="mt-4 grid gap-3">
          {topSlots.map(([slot, count]) => (
            <div
              key={slot}
              className="flex items-center justify-between rounded-[14px] border border-[rgba(0,0,0,0.08)] bg-[#fffdfb] px-4 py-3"
            >
              <p className="font-medium text-stone-900">{slot}</p>
              <p className="font-semibold text-stone-900">
                {count} ({toPercent(count, total)})
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

function Row({ label, value, percent }: { label: string; value: number; percent: string }) {
  return (
    <div className="flex items-center justify-between rounded-[12px] bg-[#f7f8fa] px-4 py-2.5">
      <p className="capitalize text-stone-800">{label}</p>
      <p className="font-semibold text-stone-900">
        {value} <span className="text-[0.84rem] font-medium text-stone-600">({percent})</span>
      </p>
    </div>
  );
}
