import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { toJsonLd } from "@/lib/json-ld";
import { buildSeoKeywords } from "@/lib/seo-content";
import { createMetadata } from "@/lib/seo";

const faqSections = [
  {
    title: "Ordering and Delivery",
    items: [
      {
        question: "How can I order cake online in Hyderabad from OccasionKart?",
        answer:
          "You can order cake online in Hyderabad from OccasionKart through our website, WhatsApp, or direct store support. Simply choose your cake, add delivery details, select your preferred time slot, and complete the payment to confirm the order.",
      },
      {
        question: "Do you offer same-day cake delivery in Hyderabad?",
        answer:
          "Yes, OccasionKart offers same-day cake delivery in Hyderabad for eligible products and serviceable locations. Availability depends on the cake design, preparation time, and the delivery area selected during checkout.",
      },
      {
        question: "Do you provide midnight cake delivery in Hyderabad?",
        answer:
          "Yes, we also provide midnight cake delivery in Hyderabad for selected orders and locations. We recommend placing midnight delivery orders early so the preferred slot can be reserved in advance.",
      },
      {
        question: "Which areas do you serve for online cake delivery in Hyderabad?",
        answer:
          "OccasionKart delivers cakes within Hyderabad and nearby serviceable areas shown during checkout. Orders outside Hyderabad are not accepted because our bakery services are designed for local delivery only.",
      },
      {
        question: "What happens if the recipient is unavailable at the time of delivery?",
        answer:
          "If the recipient is unavailable, we try to contact the customer or recipient for clarification. Depending on the situation, the order may be handed to security, reception, or a nearby contact, or the recipient may be asked to collect it, as explained in our delivery and terms policies.",
      },
    ],
  },
  {
    title: "Cakes and Customization",
    items: [
      {
        question: "Do you make customized birthday cakes and theme cakes in Hyderabad?",
        answer:
          "Yes, OccasionKart specializes in customized birthday cakes, anniversary cakes, wedding cakes, and theme cakes in Hyderabad. Customers can share design references and requirements so our team can create a cake that matches the occasion as closely as possible.",
      },
      {
        question: "Will my customized cake look exactly like the reference image?",
        answer:
          "Because every cake is handcrafted, the final design may vary slightly from the reference image. We always aim for a close match, but exact replication is not guaranteed, especially for highly detailed or premium reference designs.",
      },
      {
        question: "Are OccasionKart cakes freshly baked?",
        answer:
          "Yes, our cakes are freshly baked and prepared to order with a focus on freshness, hygiene, and presentation. This helps us deliver cakes that look celebration-ready and taste fresh on delivery.",
      },
      {
        question: "Can I request a flavor change if my selected flavor is unavailable?",
        answer:
          "Yes. If a selected flavor is unavailable, our team will contact you and request approval before making any flavor change. We do not replace flavors without customer communication wherever possible.",
      },
    ],
  },
  {
    title: "Payments, Refunds, and Policy Questions",
    items: [
      {
        question: "When is my cake order confirmed?",
        answer:
          "Website orders are confirmed after successful payment at checkout. For certain offline or WhatsApp orders, an advance payment may be required before the order is processed by our team.",
      },
      {
        question: "Can I cancel my cake order after placing it?",
        answer:
          "Yes, but only in limited cases. Orders can be cancelled within 1 hour of placing the order if preparation or baking has not started. Once the cake has entered production, decoration, customization, or dispatch, cancellation is usually not accepted.",
      },
      {
        question: "Do you accept returns for cakes and desserts?",
        answer:
          "No. Since cakes and desserts are perishable and made to order, returns are not accepted after delivery. If there is a verified issue such as damage, spoilage, or incorrect delivery, please contact us within 2 hours with photo or video proof.",
      },
      {
        question: "When do I get a refund for a cake order?",
        answer:
          "Refunds may be approved for eligible cancellations, verified product issues, or service failures such as confirmed non-delivery. Approved refunds are generally processed within 5 to 7 business days to the original payment method.",
      },
      {
        question: "How can I contact OccasionKart for delivery or support questions?",
        answer:
          "For help with cake delivery in Hyderabad, order updates, customization questions, or refund support, you can contact OccasionKart at support@occasionkart.com or call +91-9059058058 during support hours.",
      },
    ],
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqSections.flatMap((section) =>
    section.items.map((item) => ({
      "@type": "Question",
      name: item.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.answer,
      },
    })),
  ),
};

export const metadata: Metadata = createMetadata({
  title: "FAQ | Order Cake Online in Hyderabad | OccasionKart",
  description:
    "Find answers about cake delivery in Hyderabad, same-day cake delivery, midnight cake delivery, custom cakes, refunds, cancellations, and ordering from OccasionKart.",
  keywords: buildSeoKeywords([
    "cake delivery faq Hyderabad",
    "same day cake delivery questions Hyderabad",
    "order cake online faq",
  ]),
  path: "/faq",
});

export default function FAQPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(faqSchema) }}
        />

        <section className="page-pad py-8 sm:py-12">
          <div className="mx-auto max-w-[1180px]">
            <div className="overflow-hidden rounded-[28px] border border-[rgba(0,0,0,0.1)] bg-[linear-gradient(135deg,#fff7ef_0%,#ffffff_50%,#fff2e7_100%)] shadow-[0_18px_40px_rgba(0,0,0,0.08)]">
              <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:p-14">
                <div>
                  <p className="section-kicker">Frequently Asked Questions</p>
                  <h1 className="mt-4 max-w-[12ch] font-[Georgia] text-[2.5rem] leading-[1.05] font-semibold text-[var(--brand-brown)] sm:text-[3.2rem]">
                    Cake Delivery FAQ for Hyderabad Customers
                  </h1>
                  <p className="mt-6 max-w-[66ch] text-[1rem] leading-8 text-[#6c7396] sm:text-[1.05rem]">
                    This FAQ page answers common questions about ordering cake
                    online in Hyderabad, same-day cake delivery, midnight cake
                    delivery, customized cakes, refunds, and delivery support at
                    OccasionKart.
                  </p>
                  <p className="mt-4 max-w-[66ch] text-[1rem] leading-8 text-[#6c7396] sm:text-[1.05rem]">
                    If you are planning a birthday, anniversary, wedding, baby
                    shower, or corporate celebration, these quick answers will
                    help you choose the right cake and understand how our
                    delivery process works.
                  </p>
                </div>

                <div className="rounded-[24px] border border-[rgba(77,37,28,0.1)] bg-white/90 p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-7">
                  <p className="text-[0.78rem] font-bold uppercase tracking-[0.24em] text-[#ef7f41]">
                    Popular Searches
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {[
                      "Cake delivery in Hyderabad",
                      "Same-day cake delivery Hyderabad",
                      "Midnight cake delivery Hyderabad",
                      "Custom birthday cakes Hyderabad",
                      "Order cake online in Hyderabad",
                    ].map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[rgba(0,0,0,0.08)] bg-[#fffaf6] px-4 py-2 text-[0.92rem] font-semibold text-stone-900"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <Link
                    href="/cakes"
                    className="mt-6 inline-flex rounded-full bg-[#ef7f41] px-6 py-3 text-[0.98rem] font-semibold text-white"
                  >
                    Browse Cakes
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-pad pb-12">
          <div className="mx-auto max-w-[1180px] space-y-6">
            {faqSections.map((section) => (
              <section
                key={section.title}
                className="rounded-[24px] border border-[rgba(0,0,0,0.1)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-10"
              >
                <h2 className="text-[1.7rem] font-semibold text-[var(--brand-brown)]">
                  {section.title}
                </h2>
                <div className="mt-6 space-y-5">
                  {section.items.map((item) => (
                    <article
                      key={item.question}
                      className="rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-[#fffdfa] p-5"
                    >
                      <h3 className="text-[1.08rem] font-semibold leading-7 text-stone-900">
                        {item.question}
                      </h3>
                      <p className="mt-3 text-[1rem] leading-8 text-[#6c7396]">
                        {item.answer}
                      </p>
                    </article>
                  ))}
                </div>
              </section>
            ))}

            <section className="rounded-[24px] border border-[rgba(239,127,65,0.18)] bg-[#fff7f1] p-8 shadow-[0_10px_24px_rgba(0,0,0,0.05)] sm:p-10">
              <h2 className="text-[1.7rem] font-semibold text-[var(--brand-brown)]">
                Need More Help?
              </h2>
              <p className="mt-5 text-[1rem] leading-8 text-[#6c7396]">
                For order support, custom cake discussions, or delivery queries,
                visit our{" "}
                <Link href="/contact" className="font-semibold text-[#ef7f41]">
                  Contact page
                </Link>{" "}
                or review our{" "}
                <Link
                  href="/refund-policy"
                  className="font-semibold text-[#ef7f41]"
                >
                  Refund and Returns Policy
                </Link>{" "}
                and{" "}
                <Link
                  href="/terms-and-conditions"
                  className="font-semibold text-[#ef7f41]"
                >
                  Terms and Conditions
                </Link>
                .
              </p>
            </section>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
