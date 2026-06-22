import type { Metadata } from "next";
import Link from "next/link";

import { InquiryForm } from "@/components/store/inquiry-form";
import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { createMetadata } from "@/lib/seo";

const orderTypes = [
  "Custom birthday cakes in Hyderabad",
  "Photo cakes and theme cakes",
  "Wedding cakes and engagement cakes",
  "Anniversary cakes and surprise cakes",
  "Corporate cake orders and bulk celebration cakes",
  "Baby shower and special occasion cakes",
];

const processSteps = [
  {
    title: "Share Your Requirement",
    description:
      "Send us your cake theme, flavor, size, delivery date, and any inspiration images for your custom cake order.",
  },
  {
    title: "Get Design Guidance",
    description:
      "Our team reviews your request and helps shape the best custom cake option based on design complexity, budget, and timeline.",
  },
  {
    title: "Confirm and Schedule",
    description:
      "Once the design and order details are confirmed, we schedule baking and delivery for your selected Hyderabad time slot.",
  },
];

export const metadata: Metadata = createMetadata({
  title: "Custom Cake Orders Hyderabad | Theme Cakes and Photo Cakes | OccasionKart",
  description:
    "Place custom cake orders in Hyderabad with OccasionKart for birthday cakes, photo cakes, wedding cakes, anniversary cakes, and bulk celebration cakes.",
  keywords: [
    "custom cake orders Hyderabad",
    "theme cakes Hyderabad",
    "photo cakes Hyderabad",
    "wedding cakes Hyderabad",
  ],
});

export default function CustomOrdersPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <section className="page-pad py-8 sm:py-12">
          <div className="mx-auto max-w-[1180px]">
            <div className="overflow-hidden rounded-[28px] border border-[rgba(0,0,0,0.1)] bg-[linear-gradient(135deg,#fff6ef_0%,#ffffff_50%,#fff1e6_100%)] shadow-[0_18px_40px_rgba(0,0,0,0.08)]">
              <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:p-14">
                <div>
                  <p className="section-kicker">Custom Orders</p>
                  <h1 className="mt-4 max-w-[12ch] font-[Georgia] text-[2.5rem] leading-[1.05] font-semibold text-[var(--brand-brown)] sm:text-[3.2rem]">
                    Custom Cake Orders in Hyderabad for Every Celebration
                  </h1>
                  <p className="mt-6 max-w-[66ch] text-[1rem] leading-8 text-[#6c7396] sm:text-[1.05rem]">
                    OccasionKart creates custom cakes in Hyderabad for
                    birthdays, anniversaries, weddings, baby showers, corporate
                    events, and special surprises. If you want a photo cake,
                    theme cake, elegant wedding cake, or a personalized
                    celebration cake, our team can help turn your idea into a
                    freshly baked design.
                  </p>
                  <p className="mt-4 max-w-[66ch] text-[1rem] leading-8 text-[#6c7396] sm:text-[1.05rem]">
                    We focus on premium ingredients, design clarity, timely
                    delivery, and practical customization support so customers
                    can confidently order custom cakes online in Hyderabad.
                  </p>
                </div>

                <div className="rounded-[24px] border border-[rgba(77,37,28,0.1)] bg-white/90 p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-7">
                  <p className="text-[0.78rem] font-bold uppercase tracking-[0.24em] text-[#ef7f41]">
                    Quick Contact
                  </p>
                  <div className="mt-6 space-y-4">
                    <a
                      href="mailto:support@occasionkart.com"
                      className="block rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-[#fffaf6] px-4 py-4"
                    >
                      <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-[#ef7f41]">
                        Email
                      </p>
                      <p className="mt-2 text-[0.98rem] font-semibold text-stone-900">
                        support@OCCASIONKART.COM
                      </p>
                    </a>
                    <a
                      href="tel:+919059058058"
                      className="block rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-[#fffaf6] px-4 py-4"
                    >
                      <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-[#ef7f41]">
                        Phone
                      </p>
                      <p className="mt-2 text-[0.98rem] font-semibold text-stone-900">
                        +91 9059058058
                      </p>
                    </a>
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <a
                      href="mailto:support@occasionkart.com"
                      className="inline-flex rounded-full bg-[#ef7f41] px-6 py-3 text-[0.98rem] font-semibold text-white"
                    >
                      Email Custom Order
                    </a>
                    <a
                      href="tel:+919059058058"
                      className="inline-flex rounded-full border border-[rgba(0,0,0,0.1)] px-6 py-3 text-[0.98rem] font-semibold text-stone-900"
                    >
                      Call Now
                    </a>
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
                What Custom Cakes Can You Order?
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-2">
                {orderTypes.map((item) => (
                  <div
                    key={item}
                    className="rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-[#fffdfa] px-5 py-4 text-[0.98rem] font-semibold text-stone-900"
                  >
                    {item}
                  </div>
                ))}
              </div>
            </section>

            <section className="rounded-[24px] border border-[rgba(0,0,0,0.1)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-10">
              <h2 className="text-[1.7rem] font-semibold text-[var(--brand-brown)]">
                How Our Custom Order Process Works
              </h2>
              <div className="mt-6 grid gap-4 md:grid-cols-3">
                {processSteps.map((step, index) => (
                  <article
                    key={step.title}
                    className="rounded-[20px] border border-[rgba(0,0,0,0.08)] bg-[#fffaf6] p-5"
                  >
                    <p className="text-[0.82rem] font-semibold uppercase tracking-[0.18em] text-[#ef7f41]">
                      Step 0{index + 1}
                    </p>
                    <h3 className="mt-3 text-[1.08rem] font-semibold text-stone-900">
                      {step.title}
                    </h3>
                    <p className="mt-3 text-[0.98rem] leading-7 text-[#6c7396]">
                      {step.description}
                    </p>
                  </article>
                ))}
              </div>
            </section>

            <section className="grid gap-6 lg:grid-cols-[1fr_0.9fr]">
              <article className="rounded-[24px] border border-[rgba(0,0,0,0.1)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-10">
                <h2 className="text-[1.7rem] font-semibold text-[var(--brand-brown)]">
                  Send Your Custom Cake Request
                </h2>
                <p className="mt-4 max-w-[60ch] text-[1rem] leading-8 text-[#6c7396]">
                  Share your custom cake request with as much detail as
                  possible, including occasion, flavor, weight, colors, design
                  reference, message on cake, and preferred delivery slot in
                  Hyderabad.
                </p>
                <div className="mt-6">
                  <InquiryForm
                    emailTo="support@occasionkart.com"
                    emailSubject="Custom Cake Order Request"
                    whatsappNumber="+91 9059058058"
                    whatsappIntro="Hello OccasionKart, I would like to place a custom cake order."
                    primaryLabel="Send Request by Email"
                    secondaryLabel="Send Request on WhatsApp"
                    fields={[
                      {
                        name: "fullName",
                        label: "Full Name",
                        placeholder: "Enter your full name",
                      },
                      {
                        name: "phone",
                        label: "Phone Number",
                        placeholder: "Enter your phone number",
                        type: "tel",
                      },
                      {
                        name: "email",
                        label: "Email Address",
                        placeholder: "Enter your email address",
                        type: "email",
                      },
                      {
                        name: "occasionDate",
                        label: "Occasion and Delivery Date",
                        placeholder: "Birthday on 24 April, evening delivery",
                      },
                      {
                        name: "cakeDetails",
                        label: "Custom Cake Details",
                        placeholder:
                          "Tell us the cake flavor, size, theme, message, quantity, and any design reference details",
                        rows: 5,
                      },
                    ]}
                  />
                </div>
              </article>

              <article className="rounded-[24px] border border-[rgba(239,127,65,0.18)] bg-[#fff7f1] p-8 shadow-[0_10px_24px_rgba(0,0,0,0.05)] sm:p-10">
                <h2 className="text-[1.7rem] font-semibold text-[var(--brand-brown)]">
                  Need Inspiration Before Ordering?
                </h2>
                <p className="mt-5 text-[1rem] leading-8 text-[#6c7396]">
                  Browse our{" "}
                  <Link href="/gallery" className="font-semibold text-[#ef7f41]">
                    cake gallery
                  </Link>{" "}
                  for birthday cakes, anniversary cakes, and custom cake design
                  ideas in Hyderabad. You can also check our{" "}
                  <Link href="/faq" className="font-semibold text-[#ef7f41]">
                    FAQ page
                  </Link>{" "}
                  for same-day delivery, custom order timings, and policy
                  details.
                </p>
                <p className="mt-4 text-[1rem] leading-8 text-[#6c7396]">
                  For direct assistance, email{" "}
                  <a
                    href="mailto:support@occasionkart.com"
                    className="font-semibold text-[#ef7f41]"
                  >
                    support@OCCASIONKART.COM
                  </a>{" "}
                  or call{" "}
                  <a
                    href="tel:+919059058058"
                    className="font-semibold text-[#ef7f41]"
                  >
                    +91 9059058058
                  </a>
                  .
                </p>
                <Link
                  href="/cakes"
                  className="mt-6 inline-flex rounded-full bg-[#ef7f41] px-6 py-3 text-[0.98rem] font-semibold text-white"
                >
                  Explore Cake Collection
                </Link>
              </article>
            </section>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
