import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { createMetadata } from "@/lib/seo";

import { CartPageClient } from "./cart-page-client";

export const metadata = createMetadata({
  title: "Cart | OccasionKart Hyderabad",
  description:
    "Review cakes added to your cart and continue your Hyderabad cake order with OccasionKart.",
  keywords: ["cake cart", "OccasionKart cart", "cake order Hyderabad"],
  noIndex: true,
});

export default function CartPage() {
  return (
    <>
      <SiteHeader />
      <CartPageClient />
      <SiteFooter />
    </>
  );
}
