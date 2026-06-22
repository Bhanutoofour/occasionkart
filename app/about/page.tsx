import Link from "next/link";

import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { createMetadata } from "@/lib/seo";

export const metadata = createMetadata({
  title: "About OccasionKart | Cake Shop in Hyderabad",
  description:
    "Learn about OccasionKart, a trusted cake shop in Hyderabad offering freshly baked cakes, custom cake designs, and reliable delivery across the city.",
  keywords: ["about OccasionKart", "cake shop Hyderabad", "custom cakes Hyderabad"],
});

const highlights = [
  "Freshly baked cakes made to order",
  "Reliable same-day and midnight delivery in Hyderabad",
  "Customized cakes for birthdays, weddings, and events",
];

const pillars = [
  {
    title: "Our Story",
    body: [
      "OccasionKart began with a simple belief: every celebration deserves a cake that feels as special as the moment itself. As a growing and trusted cake shop in Hyderabad, we saw the need for reliable cake delivery in Hyderabad that combines beautiful designs, rich flavors, and timely service.",
      "What started as a passion for baking soon became a commitment to offering premium-quality cakes made with carefully selected ingredients and crafted with attention to detail. We focus on freshness, hygiene, and consistency so customers can confidently order cake online in Hyderabad without worry.",
      "From birthdays and anniversaries to weddings and corporate events, each cake is prepared fresh upon order. Our goal is to provide smooth and dependable online cake delivery in Hyderabad, including same-day and midnight delivery options across major areas of the city.",
    ],
  },
  {
    title: "Expertise",
    body: [
      "At OccasionKart, our expertise lies in crafting premium, freshly baked cakes with exceptional taste and artistic presentation. As a trusted cake shop in Hyderabad, we specialize in customized cakes designed to match every celebration, from elegant wedding cakes to creative birthday theme cakes.",
      "We are known for reliable cake delivery in Hyderabad, offering same-day and scheduled delivery options across the city. Our team focuses on precision baking, modern cake design, hygienic preparation, and careful packaging to ensure every cake reaches you in perfect condition.",
      "Whether you want to order cake online in Hyderabad for a birthday, anniversary, corporate event, or a special surprise, we combine flavor innovation with design excellence to deliver cakes that look stunning and taste unforgettable.",
    ],
  },
  {
    title: "Our Mission",
    body: [
      "At OccasionKart, our mission is to deliver freshly baked, high-quality cakes with exceptional taste and beautiful designs across Hyderabad. We aim to provide reliable cake delivery in Hyderabad that customers can trust for every celebration, from birthdays and anniversaries to weddings and corporate events.",
      "We are committed to using premium ingredients, maintaining strict hygiene standards, and ensuring every cake is prepared fresh upon order. Our focus is on consistency, creativity, and timely service so customers can confidently order cake online in Hyderabad without worry.",
      "Through dependable online cake delivery in Hyderabad, innovative designs, and customer-first service, our mission is to make every occasion sweeter, more memorable, and truly special.",
    ],
  },
];

export default function AboutPage() {
  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <section className="page-pad py-8 sm:py-12">
          <div className="mx-auto max-w-[1180px]">
            <div className="overflow-hidden rounded-[28px] border border-[rgba(0,0,0,0.1)] bg-[linear-gradient(135deg,#fff6ef_0%,#fffdf9_48%,#fff1e4_100%)] shadow-[0_18px_40px_rgba(0,0,0,0.08)]">
              <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:p-14">
                <div>
                  <p className="section-kicker">About OccasionKart</p>
                  <h1 className="mt-4 max-w-[12ch] font-[Georgia] text-[2.5rem] leading-[1.05] font-semibold text-[var(--brand-brown)] sm:text-[3.3rem]">
                    Freshly Baked Happiness in Hyderabad
                  </h1>
                  <p className="mt-6 max-w-[62ch] text-[1rem] leading-8 text-[#6c7396] sm:text-[1.05rem]">
                    Welcome to OccasionKart, your trusted cake shop in Hyderabad,
                    where every celebration begins with something sweet. We
                    specialize in freshly baked cakes crafted with premium
                    ingredients, creative designs, and a passion for making
                    moments memorable.
                  </p>
                  <p className="mt-4 max-w-[62ch] text-[1rem] leading-8 text-[#6c7396] sm:text-[1.05rem]">
                    We are more than just an online gifting platform. We are a
                    bridge between hearts, connecting families, friends, and
                    loved ones across cities and countries through meaningful,
                    dependable cake delivery.
                  </p>
                </div>

                <div className="rounded-[24px] border border-[rgba(77,37,28,0.1)] bg-white/90 p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-7">
                  <p className="text-[0.78rem] font-bold uppercase tracking-[0.24em] text-[#ef7f41]">
                    Why Customers Choose Us
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
                  <Link
                    href="/cakes"
                    className="mt-6 inline-flex rounded-full bg-[#ef7f41] px-6 py-3 text-[0.98rem] font-semibold text-white"
                  >
                    Explore Cakes
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-pad pb-12">
          <div className="mx-auto max-w-[1180px] space-y-6">
            {pillars.map((section) => (
              <article
                key={section.title}
                className="rounded-[24px] border border-[rgba(0,0,0,0.1)] bg-white p-8 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-10"
              >
                <h2 className="text-[1.8rem] font-semibold text-[var(--brand-brown)]">
                  {section.title}
                </h2>
                <div className="mt-5 space-y-4">
                  {section.body.map((paragraph) => (
                    <p
                      key={paragraph}
                      className="text-[1rem] leading-8 text-[#6c7396]"
                    >
                      {paragraph}
                    </p>
                  ))}
                </div>
              </article>
            ))}

            <div className="grid gap-4 md:grid-cols-3">
              {[
                "Freshly baked daily",
                "Same-day delivery available",
                "Custom cake design support",
              ].map((item) => (
                <div
                  key={item}
                  className="rounded-[16px] border border-[rgba(0,0,0,0.1)] bg-[#fff7f2] px-4 py-4 text-center text-[0.98rem] font-semibold text-stone-900"
                >
                  {item}
                </div>
              ))}
            </div>

            <div className="rounded-[22px] border border-[rgba(0,0,0,0.08)] bg-[#fffaf4] px-6 py-6 text-[0.95rem] leading-7 text-[#6c7396]">
              Need help before placing an order? Visit our{" "}
              <Link href="/contact" className="font-semibold text-[#ef7f41]">
                Contact page
              </Link>{" "}
              or review our{" "}
              <Link href="/refund-policy" className="font-semibold text-[#ef7f41]">
                Refund Policy
              </Link>{" "}
              and{" "}
              <Link href="/privacy-policy" className="font-semibold text-[#ef7f41]">
                Privacy Policy
              </Link>
              .
            </div>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
