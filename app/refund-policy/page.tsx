import Link from "next/link";

import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Refund and Returns Policy | OccasionKart",
  description:
    "Review OccasionKart's refund and returns policy for cancellations, damaged cakes, delivery issues, custom cake orders, and Hyderabad service terms.",
  keywords: ["refund policy OccasionKart", "cake returns policy Hyderabad"],
});

const sections = [
  {
    title: "Cancellation Policy",
    points: [
      "Orders can be cancelled within 1 hour of placing the order only if the cake has not entered the baking or preparation stage.",
      "To request a cancellation, customers must email support@occasionkart.com or contact customer support with the order number.",
      "Once the cake has been baked, decorated, or dispatched for delivery, cancellations are not accepted.",
    ],
  },
  {
    title: "Returns Policy",
    points: [
      "Since cakes and desserts are made-to-order perishable goods, returns are not accepted after delivery.",
      "If you receive a damaged, incorrect, or spoiled product, contact us within 2 hours of delivery with clear photos or videos showing the issue.",
      "After review, we may offer either a replacement cake of the same value, subject to availability and delivery area, or a full or partial refund to the original payment method.",
    ],
  },
  {
    title: "Refund Policy",
    points: [
      "Refunds are processed for orders cancelled within 1 hour and before preparation begins.",
      "Refunds may also be issued in cases of non-delivery caused by service failure, including situations where we are unable to complete delivery due to unforeseen internal issues.",
      "Verified product quality issues, such as damaged or incorrect items, may qualify for a refund after review by our team.",
      "Approved refunds are processed within 5 to 7 business days after confirmation, though the actual credit timeline may depend on the payment provider.",
    ],
  },
  {
    title: "Incorrect Address or Recipient Unavailability",
    points: [
      "If the recipient is unavailable, or the delivery address is incorrect or incomplete, we will attempt to contact you for clarification.",
      "If delivery cannot be completed because of incorrect information provided by the customer, refunds will not be issued because cakes and desserts are perishable and cannot be reused.",
    ],
  },
  {
    title: "Delivery Delays",
    points: [
      "We make every effort to deliver on the chosen date and time, but delays may occur due to weather, traffic, or third-party courier issues.",
      "Delays beyond our control do not qualify for a refund unless the order remains undelivered for more than 24 hours after the scheduled time.",
    ],
  },
  {
    title: "Custom or Themed Cakes",
    points: [
      "For customized cakes, including photo cakes and theme-based designs, no changes or cancellations can be made once the design and details are confirmed.",
      "Refunds are not applicable for dissatisfaction related to design preferences or taste once the order has been approved and delivered according to the confirmed specifications.",
    ],
  },
  {
    title: "Contact Us",
    points: [
      "For refund or return-related concerns, please reach out within 2 hours of delivery.",
      "Email: support@occasionkart.com",
      "Customer Care: +91-9059058058",
      "Support Hours: 12:00 AM to 6:00 PM IST",
    ],
  },
  {
    title: "Policy Updates",
    points: [
      "OccasionKart reserves the right to modify or update this policy at any time without prior notice.",
      "The latest revised version of the policy will always be available on our website.",
    ],
  },
];

const highlights = [
  "Cancellations are allowed only within 1 hour and before preparation begins.",
  "Returns are not accepted for delivered perishable cakes and desserts.",
  "Damage or quality issues must be reported within 2 hours with proof.",
  "Approved refunds are processed within 5 to 7 business days.",
];

export default function RefundPolicyPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <section className="page-pad py-8 sm:py-12">
          <div className="mx-auto max-w-[1180px]">
            <div className="overflow-hidden rounded-[28px] border border-[rgba(0,0,0,0.1)] bg-[linear-gradient(135deg,#fff8f2_0%,#ffffff_48%,#fff1e8_100%)] shadow-[0_18px_40px_rgba(0,0,0,0.08)]">
              <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:p-14">
                <div>
                  <p className="section-kicker">Policy Information</p>
                  <h1 className="mt-4 max-w-[13ch] font-[Georgia] text-[2.5rem] leading-[1.05] font-semibold text-[var(--brand-brown)] sm:text-[3.2rem]">
                    Refund and Returns Policy
                  </h1>
                  <p className="mt-6 max-w-[66ch] text-[1rem] leading-8 text-[#6c7396] sm:text-[1.05rem]">
                    At OccasionKart, we take pride in delivering freshly baked
                    cakes and personalized gifts that make your occasions
                    memorable. Every product is crafted with care and delivered
                    with close attention to freshness, presentation, and
                    quality.
                  </p>
                  <p className="mt-4 max-w-[66ch] text-[1rem] leading-8 text-[#6c7396] sm:text-[1.05rem]">
                    Because cakes and desserts are perishable items, our refund
                    and return terms differ from non-perishable products. Please
                    read the following policy carefully before placing an order.
                  </p>
                </div>

                <div className="rounded-[24px] border border-[rgba(77,37,28,0.1)] bg-white/90 p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-7">
                  <p className="text-[0.78rem] font-bold uppercase tracking-[0.24em] text-[#ef7f41]">
                    Quick Highlights
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
                For more details about order handling, service area, and legal
                terms, review our{" "}
                <Link
                  href="/terms-and-conditions"
                  className="font-semibold text-[#ef7f41]"
                >
                  Terms and Conditions
                </Link>{" "}
                and{" "}
                <Link href="/privacy-policy" className="font-semibold text-[#ef7f41]">
                  Privacy Policy
                </Link>
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
