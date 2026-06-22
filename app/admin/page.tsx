import { createMetadata } from "@/lib/seo";
import { listOrders } from "@/lib/server/orders";

import { AdminDashboardClient } from "./admin-dashboard-client";

export const metadata = createMetadata({
  title: "Admin Dashboard | OccasionKart",
  description:
    "Command center for orders, deliveries, customizations, alerts, and Hyderabad cake operations.",
  noIndex: true,
});

export default async function AdminDashboardPage() {
  const orders = await listOrders({ paymentStatus: "paid", limit: 1000 });
  return <AdminDashboardClient initialOrders={orders} />;
}
