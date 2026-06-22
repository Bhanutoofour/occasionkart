import { createMetadata } from "@/lib/seo";
import { listOrders } from "@/lib/server/orders";

import { AdminCustomizationClient } from "./admin-customization-client";

export const metadata = createMetadata({
  title: "Admin Customization | OccasionKart",
  description:
    "Review photo cakes, custom messages, and theme approvals before production starts.",
  noIndex: true,
});

export default async function AdminCustomizationPage() {
  const orders = await listOrders({ paymentStatus: "paid", limit: 600 });
  return <AdminCustomizationClient initialOrders={orders} />;
}
