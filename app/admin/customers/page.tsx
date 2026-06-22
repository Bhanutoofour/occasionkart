import Link from "next/link";

import { createMetadata } from "@/lib/seo";
import { listCustomerSummaries } from "@/lib/server/orders";

export const metadata = createMetadata({
  title: "Admin Customers | OccasionKart",
  description: "Browse customers built from live order data and open their order history.",
  noIndex: true,
});

export default async function AdminCustomersPage() {
  const customers = await listCustomerSummaries(200);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[2rem] font-semibold text-black">Customers</h2>
        <p className="mt-2 text-[1rem] leading-8 text-[#6c7396]">
          Customer records are built from real orders so you can quickly review repeat
          buyers and recent activity.
        </p>
      </div>

      <div className="space-y-4">
        {customers.map((customer) => (
          <Link
            key={customer.key}
            href={`/admin/customers/${encodeURIComponent(customer.key)}`}
            className="block rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]"
          >
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h3 className="text-[1.15rem] font-semibold text-stone-900">{customer.name}</h3>
                <p className="mt-2 text-[0.96rem] text-[#6c7396]">
                  {customer.email ?? customer.phone}
                </p>
              </div>
              <div className="text-right">
                <p className="text-[0.95rem] text-stone-700">{customer.ordersCount} orders</p>
                <p className="mt-1 font-semibold text-stone-900">Rs. {customer.totalSpent}</p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
