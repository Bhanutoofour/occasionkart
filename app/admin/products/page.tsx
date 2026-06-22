import { redirect } from "next/navigation";

import { getAdminSession } from "@/lib/admin-auth";
import { createMetadata } from "@/lib/seo";
import { listProducts } from "@/lib/server/catalog";

import { AdminProductsClient } from "./admin-products-client";

export const metadata = createMetadata({
  title: "Admin Products | OccasionKart",
  description:
    "Manage the live OccasionKart product catalog stored in Neon from a simple admin page.",
  keywords: ["OccasionKart admin", "manage products", "catalog admin"],
  noIndex: true,
});

export default async function AdminProductsPage() {
  const { session, isAdmin } = await getAdminSession();

  if (!session?.user) {
    redirect("/login");
  }

  if (!isAdmin) {
    redirect("/account");
  }

  const products = await listProducts();

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-[2rem] font-semibold text-black">Product Manager</h2>
        <p className="mt-2 max-w-[68ch] text-[1rem] leading-8 text-[#6c7396]">
          Update the live product catalog stored in Neon. New products appear in the
          storefront without touching local JSON files.
        </p>
      </div>

      <AdminProductsClient initialProducts={products} />
    </div>
  );
}
