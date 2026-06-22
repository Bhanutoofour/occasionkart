import type { Metadata } from "next";
import Link from "next/link";

import { InquiryForm } from "@/components/store/inquiry-form";
import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { createMetadata } from "@/lib/seo";

const contactCards = [
  {
    label: "Email Support",
    value: "support@occasionkart.com",
    href: "mailto:support@occasionkart.com",
    note: "For custom cake orders, support questions, and order assistance.",
  },
  {
    label: "Call OccasionKart",
    value: "+91 9059058058",
    href: "tel:+919059058058",
    note: "For quick help with same-day cake delivery and custom orders in Hyderabad.",
  },
  {
    label: "Service Area",
    value: "Hyderabad, Telangana",
    href: "/faq",
    note: "We deliver cakes across Hyderabad and nearby serviceable areas.",
  },
];

export const metadata: Metadata = createMetadata({
  title: "Contact OccasionKart | Cake Delivery in Hyderabad",
  description:
    "Contact OccasionKart for cake delivery in Hyderabad, custom cake orders, same-day cake delivery, midnight cake delivery, and customer support.",
  keywords: [
    "contact OccasionKart",
    "cake delivery Hyderabad contact",
    "custom cake order Hyderabad",
  ],
});

export default function ContactPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <section className="page-pad py-8 sm:py-12">
          <div className="mx-auto max-w-[1180px]">
            <div className="overflow-hidden rounded-[28px] border border-[rgba(0,0,0,0.1)] bg-[linear-gradient(135deg,#fff7ef_0%,#ffffff_50%,#fff2e7_100%)] shadow-[0_18px_40px_rgba(0,0,0,0.08)]">
              <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:p-14">
                <div>
                  <p className="section-kicker">Contact OccasionKart</p>
                  <h1 className="mt-4 max-w-[12ch] font-[Georgia] text-[2.5rem] leading-[1.05] font-semibold text-[var(--brand-brown)] sm:text-[3.2rem]">
                    Contact Our Cake Shop in Hyderabad
                  </h1>
                  <p className="mt-6 max-w-[66ch] text-[1rem] leading-8 text-[#6c7396] sm:text-[1.05rem]">
                    Reach OccasionKart for custom cake orders, same-day cake
                    delivery in Hyderabad, midnight cake delivery, celebration
                    planning, and customer support. Whether you want a birthday
                    cake, anniversary cake, wedding cake, or photo cake, our
                    team is here to help.
                  </p>
                  <p className="mt-4 max-w-[66ch] text-[1rem] leading-8 text-[#6c7396] sm:text-[1.05rem]">
                    If you are ready to order cake online in Hyderabad or want
                    guidance on customization, delivery timing, flavors, and
                    pricing, you can contact us directly by email or phone.
                  </p>
                </div>

                <div className="rounded-[24px] border border-[rgba(77,37,28,0.1)] bg-white/90 p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-7">
                  <p className="text-[0.78rem] font-bold uppercase tracking-[0.24em] text-[#ef7f41]">
                    Quick Contact
                  </p>
                  <div className="mt-6 space-y-4">
                    {contactCards.map((item) => (
                      <a
                        key={item.label}
                        href={item.href}
                        className="block rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-[#fffaf6] px-4 py-4"
                      >
                        <p className="text-[0.82rem] font-semibold uppercase tracking-[0.16em] text-[#ef7f41]">
                          {item.label}
                        </p>
                        <p className="mt-2 text-[1rem] font-semibold text-stone-900">
                          {item.value}
                        </p>
                        <p className="mt-2 text-[0.95rem] leading-7 text-[#6c7396]">
                          {item.note}
                        </p>
                      </a>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-pad pb-12">
          <div className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[1fr_0.92fr]">
            <article className="rounded-[24px] border border-[rgba(0,0,0,0.1)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-10">
              <h2 className="text-[1.7rem] font-semibold text-[var(--brand-brown)]">
                Send Us Your Requirement
              </h2>
              <p className="mt-4 max-w-[60ch] text-[1rem] leading-8 text-[#6c7396]">
                Use this contact section for cake delivery questions in
                Hyderabad, custom cake inquiries, bulk celebration orders, and
                support related to timing, flavors, and order updates.
              </p>
              <div className="mt-6">
                <InquiryForm
                  emailTo="support@occasionkart.com"
                  emailSubject="OccasionKart Customer Enquiry"
                  whatsappNumber="+91 9059058058"
                  whatsappIntro="Hello OccasionKart, I need help with my cake order or support request."
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
                      name: "message",
                      label: "Requirement",
                      placeholder:
                        "Tell us about your cake order, delivery date, flavor, design idea, or support request",
                      rows: 5,
                    },
                  ]}
                />
              </div>
            </article>

            <article className="rounded-[24px] border border-[rgba(239,127,65,0.18)] bg-[#fff7f1] p-8 shadow-[0_10px_24px_rgba(0,0,0,0.05)] sm:p-10">
              <h2 className="text-[1.7rem] font-semibold text-[var(--brand-brown)]">
                Helpful Pages Before You Order
              </h2>
              <div className="mt-6 space-y-4">
                {[
                  {
                    href: "/custom-orders",
                    title: "Custom Orders",
                    description:
                      "Plan photo cakes, theme cakes, wedding cakes, and premium custom orders.",
                  },
                  {
                    href: "/faq",
                    title: "FAQ",
                    description:
                      "Read answers about same-day delivery, midnight delivery, refunds, and ordering.",
                  },
                  {
                    href: "/gallery",
                    title: "Gallery",
                    description:
                      "Browse cake designs in Hyderabad for birthdays, anniversaries, and celebrations.",
                  },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="block rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-white px-5 py-4"
                  >
                    <p className="text-[1rem] font-semibold text-stone-900">{item.title}</p>
                    <p className="mt-2 text-[0.95rem] leading-7 text-[#6c7396]">
                      {item.description}
                    </p>
                  </Link>
                ))}
              </div>
            </article>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
