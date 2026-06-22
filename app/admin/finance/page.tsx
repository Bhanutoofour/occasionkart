import { createMetadata } from "@/lib/seo";
import { listOrders } from "@/lib/server/orders";

export const metadata = createMetadata({
  title: "Admin Finance | OccasionKart",
  description: "Finance view for paid, pending, failed, and refunded orders.",
  noIndex: true,
});

export default async function AdminFinancePage() {
  const orders = await listOrders({ paymentStatus: "paid", limit: 500 });

  const paid = orders.filter((order) => order.paymentStatus === "paid");
  const pending = orders.filter((order) => order.paymentStatus === "pending");
  const failed = orders.filter((order) => order.paymentStatus === "failed");
  const refunded = orders.filter((order) => order.paymentStatus === "refunded");

  const grossRevenue = paid.reduce((sum, order) => sum + order.pricing.total, 0);
  const refundExposure = refunded.reduce((sum, order) => sum + order.pricing.total, 0);
  const netCollected = Math.max(0, grossRevenue - refundExposure);

  return (
    <div className="space-y-8">
      <div>
        <p className="section-kicker">Finance</p>
        <h2 className="mt-2 text-[2rem] font-semibold text-black">Payments & Revenue</h2>
        <p className="mt-2 max-w-[72ch] text-[1rem] leading-8 text-[#6c7396]">
          Track payment health and collections from your latest order pipeline.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Gross Collected" value={`Rs. ${grossRevenue}`} />
        <MetricCard label="Net Collected" value={`Rs. ${netCollected}`} />
        <MetricCard label="Refund Exposure" value={`Rs. ${refundExposure}`} />
        <MetricCard label="Paid Orders" value={String(paid.length)} />
      </div>

      <section className="rounded-[20px] border border-[rgba(0,0,0,0.12)] bg-white p-6">
        <h3 className="text-[1.3rem] font-semibold text-black">Payment Status Mix</h3>
        <div className="mt-5 grid gap-3 sm:grid-cols-4">
          <StatusPill label="Paid" value={paid.length} tone="green" />
          <StatusPill label="Pending" value={pending.length} tone="amber" />
          <StatusPill label="Failed" value={failed.length} tone="red" />
          <StatusPill label="Refunded" value={refunded.length} tone="slate" />
        </div>
      </section>
    </div>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[20px] border border-[rgba(0,0,0,0.12)] bg-white p-6">
      <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-[#ef7f41]">
        {label}
      </p>
      <p className="mt-3 text-[2rem] font-semibold text-stone-900">{value}</p>
    </div>
  );
}

function StatusPill({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "green" | "amber" | "red" | "slate";
}) {
  const toneClass =
    tone === "green"
      ? "bg-[#eefaf0] text-[#2f8f2f]"
      : tone === "amber"
        ? "bg-[#fff8ec] text-[#a36a12]"
        : tone === "red"
          ? "bg-[#fff0f0] text-[#b53131]"
          : "bg-[#f3f4f6] text-[#4b5563]";

  return (
    <div className={`rounded-[14px] px-4 py-3 ${toneClass}`}>
      <p className="text-[0.8rem] font-semibold uppercase tracking-[0.14em]">{label}</p>
      <p className="mt-2 text-[1.25rem] font-semibold">{value}</p>
    </div>
  );
}
