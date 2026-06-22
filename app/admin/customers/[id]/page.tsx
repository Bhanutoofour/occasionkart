import Link from "next/link";
import { notFound } from "next/navigation";

import { createMetadata } from "@/lib/seo";
import { listOrdersForCustomer } from "@/lib/server/orders";

type Props = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata({ params }: Props) {
  const { id } = await params;
  return createMetadata({
    title: `Admin Customer ${id} | OccasionKart`,
    description: "View customer order history and spending from the admin area.",
    noIndex: true,
  });
}

export default async function AdminCustomerDetailPage({ params }: Props) {
  const { id } = await params;
  const orders = await listOrdersForCustomer(id);

  if (orders.length === 0) {
    notFound();
  }

  const customer = orders[0].customer;
  const totalSpent = orders.reduce((sum, order) => sum + order.pricing.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="section-kicker">Customer</p>
          <h2 className="mt-3 text-[2rem] font-semibold text-black">{customer.fullName}</h2>
          <p className="mt-2 text-[1rem] leading-8 text-[#6c7396]">
            {customer.email ?? customer.phone}
          </p>
        </div>
        <Link
          href="/admin/customers"
          className="rounded-full border border-[rgba(0,0,0,0.12)] px-5 py-3 text-[0.95rem] font-semibold text-stone-900"
        >
          Back to Customers
        </Link>
      </div>

      <div className="grid gap-5 sm:grid-cols-3">
        <div className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          <p className="text-[0.82rem] font-bold uppercase tracking-[0.18em] text-[#ef7f41]">
            Orders
          </p>
          <p className="mt-3 text-[2rem] font-semibold text-stone-900">{orders.length}</p>
        </div>
        <div className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          <p className="text-[0.82rem] font-bold uppercase tracking-[0.18em] text-[#ef7f41]">
            Total Spent
          </p>
          <p className="mt-3 text-[2rem] font-semibold text-stone-900">Rs. {totalSpent}</p>
        </div>
        <div className="rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]">
          <p className="text-[0.82rem] font-bold uppercase tracking-[0.18em] text-[#ef7f41]">
            Latest Order
          </p>
          <p className="mt-3 text-[1.2rem] font-semibold text-stone-900">
            {orders[0].orderNumber}
          </p>
        </div>
      </div>

      <div className="space-y-4">
        {orders.map((order) => (
          <Link
            key={order.id}
            href={`/admin/orders/${order.id}`}
            className="block rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]"
          >
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <p className="text-[0.82rem] font-bold uppercase tracking-[0.18em] text-[#ef7f41]">
                  {order.orderNumber}
                </p>
                <p className="mt-2 text-[0.96rem] text-[#6c7396]">
                  {order.items.map((item) => `${item.name} x ${item.quantity}`).join(", ")}
                </p>
              </div>
              <div className="text-right">
                <p className="capitalize text-stone-700">{order.status.replaceAll("_", " ")}</p>
                <p className="mt-1 font-semibold text-stone-900">Rs. {order.pricing.total}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
