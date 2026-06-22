import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { createMetadata } from "@/lib/seo";

import { CheckoutPageClient } from "./checkout-page-client";

export const metadata = createMetadata({
  title: "Checkout | OccasionKart Hyderabad",
  description:
    "Confirm your cake order, delivery details, and celebration request for Hyderabad orders at OccasionKart checkout.",
  keywords: ["checkout", "cake order Hyderabad", "OccasionKart checkout"],
  noIndex: true,
});

export default function CheckoutPage() {
  return (
    <>
      <SiteHeader />
      <CheckoutPageClient />
      <SiteFooter />
    </>
  );
}
