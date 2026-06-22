import { createMetadata } from "@/lib/seo";
import { listOrders } from "@/lib/server/orders";

import { AdminOrdersClient } from "./admin-orders-client";

export const metadata = createMetadata({
  title: "Admin Orders | OccasionKart",
  description: "Manage customer orders, statuses, and payment state from the admin area.",
  noIndex: true,
});

export default async function AdminOrdersPage() {
  const orders = await listOrders({ paymentStatus: "paid", limit: 200 });

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h2 className="text-[2rem] font-semibold text-black">Orders Management</h2>
        <p className="mt-2 text-[1rem] leading-8 text-[#6c7396]">
          Search, sort, assign, and update fulfillment status for paid orders only.
        </p>
      </div>

      <AdminOrdersClient initialOrders={orders} />
    </div>
  );
}
