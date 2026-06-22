import Link from "next/link";

import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { createMetadata } from "@/lib/seo";

type ThankYouPageProps = {
  searchParams?: Promise<{ orderNumber?: string }>;
};

export const metadata = createMetadata({
  title: "Thank You | OccasionKart",
  description: "Your cake order is confirmed and our team has started processing it.",
  path: "/thank-you",
  noIndex: true,
});

export default async function ThankYouPage({ searchParams }: ThankYouPageProps) {
  const params = (await searchParams) ?? {};
  const orderNumber = params.orderNumber?.trim();

  return (
    <>
      <SiteHeader />
      <main className="bg-white page-pad py-12">
        <div className="mx-auto max-w-[760px] rounded-[22px] border border-[rgba(0,0,0,0.12)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.08)]">
          <p className="text-[0.82rem] font-bold uppercase tracking-[0.18em] text-[#2f8f2f]">
            Payment Successful
          </p>
          <h1 className="mt-3 text-[2rem] font-semibold text-black">Thank You For Your Order</h1>
          <p className="mt-3 text-[1rem] leading-8 text-[#6c7396]">
            Your order has been confirmed. Our team will begin preparation and deliver according to
            your selected slot.
          </p>
          {orderNumber ? (
            <p className="mt-4 rounded-[14px] bg-[#f6faf6] px-4 py-3 text-[1rem] font-semibold text-[#2f8f2f]">
              Order Number: {orderNumber}
            </p>
          ) : null}
          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/track-order"
              className="rounded-full border border-[rgba(0,0,0,0.12)] px-6 py-3 text-[1rem] font-semibold text-stone-900"
            >
              Track Order
            </Link>
            <Link
              href="/cakes"
              className="rounded-full bg-[#ef7f41] px-6 py-3 text-[1rem] font-semibold text-white"
            >
              Continue Shopping
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}

