import Link from "next/link";

import { createMetadata } from "@/lib/seo";
import { listCustomerSummaries, listOrders } from "@/lib/server/orders";

export const metadata = createMetadata({
  title: "Admin Marketing | OccasionKart",
  description: "Track marketing-ready customer signals and campaign action points.",
  noIndex: true,
});

export default async function AdminMarketingPage() {
  const [orders, customers] = await Promise.all([
    listOrders({ paymentStatus: "paid", limit: 300 }),
    listCustomerSummaries(300),
  ]);

  const paidOrders = orders;
  const repeatCustomers = customers.filter((customer) => customer.ordersCount > 1).length;
  const repeatRate = customers.length > 0 ? Math.round((repeatCustomers / customers.length) * 100) : 0;
  const averageOrderValue =
    paidOrders.length > 0
      ? Math.round(
          paidOrders.reduce((sum, order) => sum + order.pricing.total, 0) / paidOrders.length,
        )
      : 0;

  const topCustomers = customers.slice(0, 6);

  return (
    <div className="space-y-8">
      <div>
        <p className="section-kicker">Marketing</p>
        <h2 className="mt-2 text-[2rem] font-semibold text-black">Customer Growth & Retention</h2>
        <p className="mt-2 max-w-[72ch] text-[1rem] leading-8 text-[#6c7396]">
          Focus this week on repeat customers, average order value, and reactivation campaigns for
          Hyderabad celebration buyers.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-[20px] border border-[rgba(0,0,0,0.12)] bg-white p-6">
          <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-[#ef7f41]">
            Paid Orders
          </p>
          <p className="mt-3 text-[2rem] font-semibold text-stone-900">{paidOrders.length}</p>
        </div>
        <div className="rounded-[20px] border border-[rgba(0,0,0,0.12)] bg-white p-6">
          <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-[#ef7f41]">
            Repeat Rate
          </p>
          <p className="mt-3 text-[2rem] font-semibold text-stone-900">{repeatRate}%</p>
        </div>
        <div className="rounded-[20px] border border-[rgba(0,0,0,0.12)] bg-white p-6">
          <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-[#ef7f41]">
            Avg Order Value
          </p>
          <p className="mt-3 text-[2rem] font-semibold text-stone-900">Rs. {averageOrderValue}</p>
        </div>
      </div>

      <section className="rounded-[20px] border border-[rgba(0,0,0,0.12)] bg-white p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h3 className="text-[1.3rem] font-semibold text-black">Top Customer Segments</h3>
          <Link
            href="/admin/customers"
            className="rounded-full border border-[rgba(0,0,0,0.12)] px-4 py-2 text-[0.9rem] font-semibold text-stone-900"
          >
            Open Customers
          </Link>
        </div>
        <div className="mt-5 grid gap-3">
          {topCustomers.map((customer) => (
            <div
              key={customer.key}
              className="rounded-[14px] border border-[rgba(0,0,0,0.08)] bg-[#fffdfb] px-4 py-3"
            >
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-stone-900">{customer.name}</p>
                  <p className="text-[0.9rem] text-[#6c7396]">{customer.email ?? customer.phone}</p>
                </div>
                <div className="text-right">
                  <p className="text-[0.9rem] text-stone-700">{customer.ordersCount} orders</p>
                  <p className="font-semibold text-stone-900">Rs. {customer.totalSpent}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
