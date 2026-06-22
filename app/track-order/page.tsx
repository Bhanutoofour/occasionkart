import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { createMetadata } from "@/lib/seo";
import { TrackOrderClient } from "./track-order-client";

export const metadata = createMetadata({
  title: "Track Order | OccasionKart Hyderabad",
  description:
    "Track your OccasionKart cake delivery in Hyderabad by sharing your order details with the support team.",
  keywords: ["track cake order", "cake delivery status Hyderabad", "OccasionKart track order"],
  noIndex: true,
});

export default function TrackOrderPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white page-pad py-12">
        <div className="mx-auto max-w-[600px] rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
          <h1 className="text-[2rem] font-semibold text-black">Track Order</h1>
          <p className="mt-2 text-[1rem] text-[#6c7396]">
            Enter your order ID and phone number to track delivery status.
          </p>

          <div className="mt-6">
            <TrackOrderClient />
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
