import Link from "next/link";

import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Terms and Conditions | OccasionKart",
  description:
    "Read OccasionKart's terms and conditions for products, custom orders, payments, delivery, refunds, and Hyderabad jurisdiction policies.",
  keywords: ["terms and conditions OccasionKart", "cake order terms Hyderabad"],
});

const sections = [
  {
    title: "Acceptance of Terms",
    points: [
      "By placing an order with OccasionKart through our website, WhatsApp, or store, you confirm that you have read, understood, and accepted these Terms and Conditions along with our Refund and Returns Policy.",
      "All orders placed through OccasionKart are treated as local Hyderabad transactions and are fulfilled only within Hyderabad and nearby serviceable areas shown at checkout.",
    ],
  },
  {
    title: "Products and Custom Orders",
    points: [
      "All products displayed on the website are subject to availability.",
      "Since cakes are handcrafted, the final product may vary slightly in design, finish, or decoration from the reference image shared or displayed online.",
      "For customized or themed cakes, customers should share clear instructions and reference images before confirmation.",
      "Once a customized cake design has been finalized and approved, changes may not be possible.",
      "Dark cake colors may stain hands or affect taste, and customers are responsible for their final color selection.",
    ],
  },
  {
    title: "Pricing, Orders, and Payment",
    points: [
      "Orders may be placed online, through WhatsApp, or directly at the store.",
      "For website orders, full payment is required at checkout before the order is confirmed.",
      "For store or WhatsApp orders, an advance amount may be required before the order is processed.",
      "OccasionKart reserves the right to decline or cancel an order in cases of non-availability, operational limitations, pricing errors, or emergencies.",
    ],
  },
  {
    title: "Delivery Terms",
    points: [
      "Delivery is attempted once within the selected or agreed time slot because cakes and desserts are perishable.",
      "Delivery times are approximate and may vary due to traffic, weather, or other unforeseen circumstances.",
      "If the recipient is unavailable, refuses the order, or provides incorrect or incomplete address/contact information, the order may be treated as attempted or completed delivery depending on the situation.",
      "If delivery cannot be completed because of incorrect information provided by the customer, OccasionKart is not responsible for non-delivery and refunds may not apply.",
      "If a product is damaged during delivery due to our handling, we may provide a replacement or applicable refund after verification.",
    ],
  },
  {
    title: "Cancellations, Refunds, and Returns",
    points: [
      "Orders may be cancelled within 1 hour of placing the order only if preparation or baking has not started.",
      "Once a cake has been baked, decorated, customized, or dispatched, cancellation requests are not accepted.",
      "Because cakes and desserts are perishable and made to order, returns are not accepted after delivery.",
      "Refunds or replacements may be considered only for verified cases such as damaged products, incorrect products, or service failure.",
      "Customers must report damage, spoilage, or incorrect delivery within 2 hours of delivery and provide clear photo or video proof for review.",
      "Approved refunds are processed to the original payment method within 5 to 7 business days, subject to banking or payment provider timelines.",
    ],
  },
  {
    title: "Limitation of Liability",
    points: [
      "OccasionKart makes every effort to provide accurate product descriptions, pricing, and images, but reserves the right to correct any errors without prior notice.",
      "We are not liable for delays or failures caused by traffic, weather, third-party delivery issues, or other circumstances beyond our reasonable control.",
      "Our liability, where applicable, is limited to the value of the product purchased, except in cases of proven negligence.",
    ],
  },
  {
    title: "Jurisdiction",
    points: [
      "All disputes, claims, or legal proceedings relating to orders placed with OccasionKart are subject to the exclusive jurisdiction of the courts in Hyderabad, Telangana.",
      "Customers agree not to initiate claims outside Hyderabad, and OccasionKart reserves the right to contest any such proceedings.",
    ],
  },
];

const highlights = [
  "All orders are local Hyderabad transactions.",
  "Cancellations are limited to the first 1 hour before preparation starts.",
  "Delivered cakes and desserts cannot be returned.",
  "Refunds require timely proof and verification.",
];

export default function TermsAndConditionsPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <section className="page-pad py-8 sm:py-12">
          <div className="mx-auto max-w-[1180px]">
            <div className="overflow-hidden rounded-[28px] border border-[rgba(0,0,0,0.1)] bg-[linear-gradient(135deg,#fff8f1_0%,#ffffff_50%,#fff0e6_100%)] shadow-[0_18px_40px_rgba(0,0,0,0.08)]">
              <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:p-14">
                <div>
                  <p className="section-kicker">Legal Information</p>
                  <h1 className="mt-4 max-w-[12ch] font-[Georgia] text-[2.5rem] leading-[1.05] font-semibold text-[var(--brand-brown)] sm:text-[3.2rem]">
                    Terms and Conditions
                  </h1>
                  <p className="mt-6 max-w-[66ch] text-[1rem] leading-8 text-[#6c7396] sm:text-[1.05rem]">
                    These Terms and Conditions govern the use of OccasionKart&apos;s
                    services and the purchase of cakes, desserts, and related
                    products through our website, WhatsApp, and store channels.
                  </p>
                  <p className="mt-4 max-w-[66ch] text-[1rem] leading-8 text-[#6c7396] sm:text-[1.05rem]">
                    They are based on our current order, delivery, and refund
                    policies and should be read together with our Refund and
                    Returns Policy.
                  </p>
                </div>

                <div className="rounded-[24px] border border-[rgba(77,37,28,0.1)] bg-white/90 p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-7">
                  <p className="text-[0.78rem] font-bold uppercase tracking-[0.24em] text-[#ef7f41]">
                    Key Terms
                  </p>
                  <div className="mt-6 space-y-4">
                    {highlights.map((item, index) => (
                      <div
                        key={item}
                        className="rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-[#fffaf6] px-4 py-4"
                      >
                        <p className="text-[0.8rem] font-semibold uppercase tracking-[0.18em] text-[#ef7f41]">
                          0{index + 1}
                        </p>
                        <p className="mt-2 text-[0.98rem] font-semibold leading-7 text-stone-900">
                          {item}
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
            {sections.map((section) => (
              <article
                key={section.title}
                className="rounded-[24px] border border-[rgba(0,0,0,0.1)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-10"
              >
                <h2 className="text-[1.7rem] font-semibold text-[var(--brand-brown)]">
                  {section.title}
                </h2>
                <div className="mt-5 space-y-4">
                  {section.points.map((point) => (
                    <p
                      key={point}
                      className="text-[1rem] leading-8 text-[#6c7396]"
                    >
                      {point}
                    </p>
                  ))}
                </div>
              </article>
            ))}

            <article className="rounded-[24px] border border-[rgba(239,127,65,0.18)] bg-[#fff7f1] p-8 shadow-[0_10px_24px_rgba(0,0,0,0.05)] sm:p-10">
              <h2 className="text-[1.7rem] font-semibold text-[var(--brand-brown)]">
                Related Policies
              </h2>
              <p className="mt-5 text-[1rem] leading-8 text-[#6c7396]">
                For cancellation, refund, and return-specific rules, review our{" "}
                <Link
                  href="/refund-policy"
                  className="font-semibold text-[#ef7f41]"
                >
                  Refund and Returns Policy
                </Link>
                . For questions, contact us at{" "}
                <a
                  href="mailto:support@occasionkart.com"
                  className="font-semibold text-[#ef7f41]"
                >
                  support@occasionkart.com
                </a>
                .
              </p>
            </article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
