import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { buildSeoKeywords } from "@/lib/seo-content";
import { createMetadata } from "@/lib/seo";

const googleReviewsUrl =
  "https://www.google.com/search?sca_esv=4074d84388868a32&rlz=1C1RXQR_enIN1174IN1174&sxsrf=ANbL-n7kZojUqIcSIiAyChujLTtNQioaxQ:1776336419087&si=AL3DRZEsmMGCryMMFSHJ3StBhOdZ2-6yYkXd_doETEE1OR-qOdt2PPoPVCUCMTdAv84VBM23gZfSOwPjNHjEhPgSyNMJFousSL511gLzCBZawv-7GFDGizb25362s_K-9wsqd4wfdwvthYidjw-MlMaug8PbkHVySn6IMb9JS-WsdSXY8vCy3uymO0CwoRdG8QxwuzLN4lOXFl7_3MvEZRt6f7NC71s49k0HdPVUOCvtsAteWXR6xPI%3D&q=Occasionkart+Cakes+-+best+cakes+in+Hyderabad+%7C+Customized+Cakes+%7C+Engagement+cakes+Reviews&sa=X&ved=2ahUKEwiNn4vqmPKTAxXURmwGHW-QMS4Q0bkNegQIPRAH&biw=1536&bih=730&dpr=1.25";

const testimonials = [
  {
    name: "Bhanu",
    source: "Zomato review",
    summary:
      "A customer highlighted OccasionKart for customised cakes, dependable delivery, strong taste, and good team service.",
    quote: "perfect delivery and amazing taste",
    sourceUrl:
      "https://www.zomato.com/hyderabad/occasionkart-cakes-adikmet/reviews",
  },
  {
    name: "Bhanu",
    source: "Justdial review",
    summary:
      "This review praised the shop for theme cakes and long-distance delivery that helped make the occasion more memorable.",
    quote: "made our moments more memorable",
    sourceUrl:
      "https://www.justdial.com/Hyderabad/Occasionkart-Cakes-Opposite-G-Pullareddy-Sweets-Chaitanyapuri/040PXX40-XX40-200916202450-C2A8_BZDET/reviews",
  },
  {
    name: "Review summary",
    source: "Justdial insights",
    summary:
      "Justdial's review summary says customers often appreciate customized designs, tasty flavors, budget-friendly pricing, and timely delivery.",
    quote: "beautifully designed and customized",
    sourceUrl:
      "https://www.justdial.com/Hyderabad/Occasionkart-Cakes-Opposite-G-Pullareddy-Sweets-Chaitanyapuri/040PXX40-XX40-200916202450-C2A8_BZDET/reviews",
  },
  {
    name: "Expressluv Online Cakes and Gifts",
    source: "Justdial review",
    summary:
      "A public reviewer described the red velvet quality as fresh and enjoyable, reinforcing the freshness angle of the bakery.",
    quote: "very fresh, and yummy",
    sourceUrl:
      "https://www.justdial.com/Hyderabad/Occasionkart-Cakes-Opposite-G-Pullareddy-Sweets-Chaitanyapuri/040PXX40-XX40-200916202450-C2A8_BZDET/reviews",
  },
];

const stats = [
  {
    label: "Justdial rating snapshot",
    value: "4.7 / 5",
    detail: "Based on 363 ratings shown on the public Justdial listing.",
  },
  {
    label: "Key review themes",
    value: "Taste, design, delivery",
    detail: "Common praise centers on customization, flavor, and timely cake delivery.",
  },
  {
    label: "Occasion focus",
    value: "Birthdays to weddings",
    detail: "Review language repeatedly mentions customised and theme cakes for events.",
  },
];

export const metadata: Metadata = createMetadata({
  title: "Customer Testimonials | OccasionKart Cakes Hyderabad",
  description:
    "Read public customer testimonials and review highlights for OccasionKart cake delivery in Hyderabad, including custom cakes, theme cakes, and celebration orders.",
  keywords: buildSeoKeywords([
    "best cakes in Hyderabad reviews",
    "OccasionKart testimonials",
    "cake delivery Hyderabad customer reviews",
  ]),
  path: "/testimonials",
});

export default function TestimonialsPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <section className="page-pad py-8 sm:py-12">
          <div className="mx-auto max-w-[1180px]">
            <div className="overflow-hidden rounded-[28px] border border-[rgba(0,0,0,0.1)] bg-[linear-gradient(135deg,#fff7ef_0%,#ffffff_50%,#fff2e7_100%)] shadow-[0_18px_40px_rgba(0,0,0,0.08)]">
              <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:p-14">
                <div>
                  <p className="section-kicker">Customer Testimonials</p>
                  <h1 className="mt-4 max-w-[12ch] font-[Georgia] text-[2.5rem] leading-[1.05] font-semibold text-[var(--brand-brown)] sm:text-[3.2rem]">
                    What Customers Say About OccasionKart in Hyderabad
                  </h1>
                  <p className="mt-6 max-w-[66ch] text-[1rem] leading-8 text-[#6c7396] sm:text-[1.05rem]">
                    This page highlights public customer feedback around custom
                    cakes, theme cakes, freshness, and cake delivery in
                    Hyderabad. We focused on review themes that help new
                    customers understand what people most often appreciate about
                    OccasionKart.
                  </p>
                  <p className="mt-4 max-w-[66ch] text-[1rem] leading-8 text-[#6c7396] sm:text-[1.05rem]">
                    The testimonial snippets below are based on publicly visible
                    review platforms that were accessible at the time of
                    checking. If you want this page updated with direct Google
                    review text, send the exact review links or screenshots and
                    we can swap them in.
                  </p>
                  <a
                    href={googleReviewsUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex rounded-full bg-[#ef7f41] px-6 py-3 text-[0.98rem] font-semibold text-white"
                  >
                    View Google Reviews
                  </a>
                </div>

                <div className="rounded-[24px] border border-[rgba(77,37,28,0.1)] bg-white/90 p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-7">
                  <p className="text-[0.78rem] font-bold uppercase tracking-[0.24em] text-[#ef7f41]">
                    Review Snapshot
                  </p>
                  <div className="mt-6 space-y-4">
                    {stats.map((item) => (
                      <div
                        key={item.label}
                        className="rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-[#fffaf6] px-4 py-4"
                      >
                        <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-[#ef7f41]">
                          {item.label}
                        </p>
                        <p className="mt-2 text-[1rem] font-semibold text-stone-900">
                          {item.value}
                        </p>
                        <p className="mt-2 text-[0.95rem] leading-7 text-[#6c7396]">
                          {item.detail}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-pad pb-12">
          <div className="mx-auto max-w-[1180px] space-y-6">
            <section className="rounded-[24px] border border-[rgba(0,0,0,0.1)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-10">
              <h2 className="text-[1.7rem] font-semibold text-[var(--brand-brown)]">
                Public Review Highlights
              </h2>
              <div className="mt-6 grid gap-5 lg:grid-cols-2">
                {testimonials.map((item) => (
                  <article
                    key={`${item.name}-${item.quote}`}
                    className="rounded-[20px] border border-[rgba(0,0,0,0.08)] bg-[#fffdfa] p-5"
                  >
                    <p className="text-[1.06rem] font-semibold leading-7 text-stone-900">
                      &quot;{item.quote}&quot;
                    </p>
                    <p className="mt-3 text-[0.98rem] leading-7 text-[#6c7396]">
                      {item.summary}
                    </p>
                    <div className="mt-4 flex items-center justify-between gap-3">
                      <div>
                        <p className="text-[0.95rem] font-semibold text-stone-900">
                          {item.name}
                        </p>
                        <p className="text-[0.9rem] text-[#6c7396]">{item.source}</p>
                      </div>
                      <a
                        href={item.sourceUrl}
                        target="_blank"
                        rel="noreferrer"
                        className="text-[0.92rem] font-semibold text-[#ef7f41]"
                      >
                        View Source
                      </a>
                    </div>
                  </article>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-[rgba(239,127,65,0.18)] bg-[#fff7f1] p-8 shadow-[0_10px_24px_rgba(0,0,0,0.05)] sm:p-10">
              <h2 className="text-[1.7rem] font-semibold text-[var(--brand-brown)]">
                Explore More Before Ordering
              </h2>
              <p className="mt-5 max-w-[70ch] text-[1rem] leading-8 text-[#6c7396]">
                If you are comparing cake shops in Hyderabad, you can also
                browse our{" "}
                <Link href="/gallery" className="font-semibold text-[#ef7f41]">
                  Gallery
                </Link>{" "}
                for cake design inspiration, visit the{" "}
                <Link href="/faq" className="font-semibold text-[#ef7f41]">
                  FAQ page
                </Link>{" "}
                for same-day delivery and refund questions, or go to{" "}
                <Link href="/custom-orders" className="font-semibold text-[#ef7f41]">
                  Custom Orders
                </Link>{" "}
                to plan a personalized cake.
              </p>
            </section>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
