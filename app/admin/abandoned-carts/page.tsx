import { createMetadata } from "@/lib/seo";
import { listAbandonedOrders } from "@/lib/server/orders";

import { AdminAbandonedCartsClient } from "./admin-abandoned-carts-client";

export const metadata = createMetadata({
  title: "Abandoned Carts | OccasionKart Admin",
  description: "Review checkout attempts where Razorpay payment was not completed.",
  noIndex: true,
});

export default async function AdminAbandonedCartsPage() {
  const orders = await listAbandonedOrders(200);

  return (
    <div className="min-w-0 space-y-6">
      <div>
        <h2 className="text-[2rem] font-semibold text-black">Abandoned Carts</h2>
        <p className="mt-2 text-[1rem] leading-8 text-[#6c7396]">
          Customers who started checkout but did not complete Razorpay payment. Follow up to
          recover these orders.
        </p>
      </div>

      <AdminAbandonedCartsClient initialOrders={orders} />
    </div>
  );
}
