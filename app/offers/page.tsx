import Link from "next/link";

import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Cake Offers in Hyderabad | OccasionKart",
  description:
    "Explore OccasionKart cake offers in Hyderabad for first orders, combo deals, celebration bundles, and custom cake savings.",
  keywords: ["cake offers Hyderabad", "birthday cake deals Hyderabad", "OccasionKart offers"],
});

const offers = [
  {
    title: "First Order Savings",
    description:
      "New customers can explore welcome savings on selected cake orders and celebration bundles.",
  },
  {
    title: "Birthday Combo Deals",
    description:
      "Bundle cake, candles, and celebration add-ons for smoother party planning in Hyderabad.",
  },
  {
    title: "Bulk Celebration Pricing",
    description:
      "Ask for custom pricing support on larger events, office parties, and multiple cake requirements.",
  },
];

export default function OffersPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <section className="page-pad py-8 sm:py-12">
          <div className="mx-auto max-w-[1180px] rounded-[28px] border border-[rgba(0,0,0,0.1)] bg-[linear-gradient(135deg,#fff7ef_0%,#ffffff_50%,#fff1e6_100%)] p-8 shadow-[0_18px_40px_rgba(0,0,0,0.08)] sm:p-12">
            <p className="section-kicker">Offers and Savings</p>
            <h1 className="mt-4 max-w-[12ch] font-[Georgia] text-[2.6rem] leading-[1.05] font-semibold text-[var(--brand-brown)] sm:text-[3.2rem]">
              Cake Offers for Hyderabad Celebrations
            </h1>
            <p className="mt-6 max-w-[66ch] text-[1rem] leading-8 text-[#6c7396]">
              OccasionKart helps customers save on cake delivery in Hyderabad
              with first-order offers, birthday combo ideas, and value-focused
              celebration bundles. For custom pricing on larger orders, our team
              can guide you directly.
            </p>
          </div>
        </section>

        <section className="page-pad pb-12">
          <div className="mx-auto max-w-[1180px] grid gap-5 md:grid-cols-3">
            {offers.map((offer) => (
              <article
                key={offer.title}
                className="rounded-[22px] border border-[rgba(0,0,0,0.1)] bg-white p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)]"
              >
                <h2 className="text-[1.15rem] font-semibold text-stone-900">{offer.title}</h2>
                <p className="mt-3 text-[0.98rem] leading-7 text-[#6c7396]">
                  {offer.description}
                </p>
              </article>
            ))}
          </div>

          <div className="mx-auto mt-8 max-w-[1180px] rounded-[24px] border border-[rgba(239,127,65,0.18)] bg-[#fff7f1] p-8">
            <h2 className="text-[1.7rem] font-semibold text-[var(--brand-brown)]">
              Need the Best Offer for Your Event?
            </h2>
            <p className="mt-4 text-[1rem] leading-8 text-[#6c7396]">
              Visit{" "}
              <Link href="/custom-orders" className="font-semibold text-[#ef7f41]">
                Custom Orders
              </Link>{" "}
              or{" "}
              <Link href="/corporate-orders" className="font-semibold text-[#ef7f41]">
                Corporate Orders
              </Link>{" "}
              if you need event-specific pricing, bulk cake support, or a
              personalized celebration package.
            </p>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
