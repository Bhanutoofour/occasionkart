import Link from "next/link";

import { InquiryForm } from "@/components/store/inquiry-form";
import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "Corporate Cake Orders Hyderabad | OccasionKart",
  description:
    "Place corporate cake orders in Hyderabad with OccasionKart for office celebrations, employee events, milestone parties, and bulk custom cake requirements.",
  keywords: ["corporate cake orders Hyderabad", "office cake delivery Hyderabad", "bulk cake orders Hyderabad"],
});

export default function CorporateOrdersPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <section className="page-pad py-8 sm:py-12">
          <div className="mx-auto max-w-[1180px] rounded-[28px] border border-[rgba(0,0,0,0.1)] bg-[linear-gradient(135deg,#fff7ef_0%,#ffffff_50%,#fff2e7_100%)] p-8 shadow-[0_18px_40px_rgba(0,0,0,0.08)] sm:p-12">
            <p className="section-kicker">Corporate Orders</p>
            <h1 className="mt-4 max-w-[12ch] font-[Georgia] text-[2.6rem] leading-[1.05] font-semibold text-[var(--brand-brown)] sm:text-[3.2rem]">
              Corporate Cake Orders in Hyderabad
            </h1>
            <p className="mt-6 max-w-[66ch] text-[1rem] leading-8 text-[#6c7396]">
              OccasionKart supports office celebrations, employee birthdays,
              milestone parties, launch events, and branded corporate cake
              requirements across Hyderabad. If you need premium presentation,
              timely delivery, and bulk order coordination, our team can help.
            </p>
          </div>
        </section>

        <section className="page-pad pb-12">
          <div className="mx-auto grid max-w-[1180px] gap-6 lg:grid-cols-[1fr_0.92fr]">
            <article className="rounded-[24px] border border-[rgba(0,0,0,0.1)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-10">
              <h2 className="text-[1.7rem] font-semibold text-[var(--brand-brown)]">
                Request a Corporate Cake Quote
              </h2>
              <p className="mt-4 text-[1rem] leading-8 text-[#6c7396]">
                Share event size, date, delivery location, quantity, and design
                requirements so we can help with the right corporate cake plan.
              </p>
              <div className="mt-6">
                <InquiryForm
                  emailTo="support@occasionkart.com"
                  emailSubject="Corporate Cake Order Enquiry"
                  whatsappNumber="+91 9059058058"
                  whatsappIntro="Hello OccasionKart, I need help with a corporate cake order."
                  fields={[
                    {
                      name: "companyName",
                      label: "Company Name",
                      placeholder: "Enter company name",
                    },
                    {
                      name: "contactName",
                      label: "Contact Person",
                      placeholder: "Enter contact person name",
                    },
                    {
                      name: "phone",
                      label: "Phone Number",
                      placeholder: "Enter contact number",
                      type: "tel",
                    },
                    {
                      name: "eventDate",
                      label: "Event Date",
                      placeholder: "Choose the event date",
                      type: "date",
                    },
                    {
                      name: "requirements",
                      label: "Order Requirements",
                      placeholder:
                        "Tell us the quantity, theme, branding needs, flavors, budget range, and delivery location",
                      rows: 5,
                    },
                  ]}
                />
              </div>
            </article>

            <article className="rounded-[24px] border border-[rgba(239,127,65,0.18)] bg-[#fff7f1] p-8 shadow-[0_10px_24px_rgba(0,0,0,0.05)] sm:p-10">
              <h2 className="text-[1.7rem] font-semibold text-[var(--brand-brown)]">
                Suitable for
              </h2>
              <div className="mt-6 space-y-3 text-[0.98rem] leading-7 text-[#6c7396]">
                <p>Employee birthdays and monthly celebrations</p>
                <p>Office milestone events and team recognition</p>
                <p>Product launches and corporate gifting moments</p>
                <p>Bulk dessert or cake support for internal events</p>
              </div>
              <p className="mt-6 text-[1rem] leading-8 text-[#6c7396]">
                Need design inspiration first? Explore the{" "}
                <Link href="/gallery" className="font-semibold text-[#ef7f41]">
                  Gallery
                </Link>{" "}
                or visit{" "}
                <Link href="/custom-orders" className="font-semibold text-[#ef7f41]">
                  Custom Orders
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
