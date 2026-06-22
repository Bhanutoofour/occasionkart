/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";

import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { buildSeoKeywords } from "@/lib/seo-content";
import { createMetadata } from "@/lib/seo";
import { listProducts } from "@/lib/server/catalog";

const highlights = [
  "Cake gallery in Hyderabad",
  "Custom birthday cakes and theme cakes",
  "Same-day cake delivery available",
  "Latest designs on Instagram @occasionkart",
];

export const metadata: Metadata = createMetadata({
  title: "Cake Gallery Hyderabad | Birthday and Custom Cakes | OccasionKart",
  description:
    "Explore the OccasionKart cake gallery for birthday cakes, anniversary cakes, wedding cakes, custom cakes, and fresh cake delivery in Hyderabad.",
  keywords: buildSeoKeywords([
    "cake gallery Hyderabad",
    "birthday cake design Hyderabad",
    "custom cake photos Hyderabad",
  ]),
  path: "/gallery",
});

export default async function GalleryPage() {
  const products = await listProducts({ limit: 12 });
  const galleryItems = products.map((product, index) => ({
    id: product.id,
    title: product.name,
    image: product.image,
    tag:
      index % 4 === 0
        ? "Birthday Cake Gallery"
        : index % 4 === 1
          ? "Custom Cake Design"
          : index % 4 === 2
            ? "Fresh Cake Delivery"
            : "Celebration Cake Hyderabad",
  }));

  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <section className="page-pad py-8 sm:py-12">
          <div className="mx-auto max-w-[1180px]">
            <div className="overflow-hidden rounded-[28px] border border-[rgba(0,0,0,0.1)] bg-[linear-gradient(135deg,#fff6ef_0%,#ffffff_50%,#fff2e8_100%)] shadow-[0_18px_40px_rgba(0,0,0,0.08)]">
              <div className="grid gap-8 p-8 sm:p-10 lg:grid-cols-[1.15fr_0.85fr] lg:p-14">
                <div>
                  <p className="section-kicker">Cake Gallery</p>
                  <h1 className="mt-4 max-w-[12ch] font-[Georgia] text-[2.5rem] leading-[1.05] font-semibold text-[var(--brand-brown)] sm:text-[3.2rem]">
                    Cake Designs for Every Celebration in Hyderabad
                  </h1>
                  <p className="mt-6 max-w-[66ch] text-[1rem] leading-8 text-[#6c7396] sm:text-[1.05rem]">
                    Explore the OccasionKart gallery for birthday cakes,
                    anniversary cakes, wedding cakes, theme cakes, and custom
                    cake designs in Hyderabad. This page showcases the visual
                    style, finishing, and celebration-ready presentation that
                    our customers look for when they order cake online in
                    Hyderabad.
                  </p>
                  <p className="mt-4 max-w-[66ch] text-[1rem] leading-8 text-[#6c7396] sm:text-[1.05rem]">
                    For our latest social updates and real-time cake photos,
                    visit our Instagram page at{" "}
                    <a
                      href="https://www.instagram.com/occasionkart/"
                      target="_blank"
                      rel="noreferrer"
                      className="font-semibold text-[#ef7f41]"
                    >
                      @occasionkart
                    </a>
                    .
                  </p>
                </div>

                <div className="rounded-[24px] border border-[rgba(77,37,28,0.1)] bg-white/90 p-6 shadow-[0_10px_24px_rgba(0,0,0,0.06)] sm:p-7">
                  <p className="text-[0.78rem] font-bold uppercase tracking-[0.24em] text-[#ef7f41]">
                    Popular Gallery Searches
                  </p>
                  <div className="mt-6 flex flex-wrap gap-3">
                    {highlights.map((item) => (
                      <span
                        key={item}
                        className="rounded-full border border-[rgba(0,0,0,0.08)] bg-[#fffaf6] px-4 py-2 text-[0.92rem] font-semibold text-stone-900"
                      >
                        {item}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex flex-wrap gap-3">
                    <Link
                      href="/cakes"
                      className="inline-flex rounded-full bg-[#ef7f41] px-6 py-3 text-[0.98rem] font-semibold text-white"
                    >
                      Shop Cakes
                    </Link>
                    <a
                      href="https://www.instagram.com/occasionkart/"
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex rounded-full border border-[rgba(0,0,0,0.1)] px-6 py-3 text-[0.98rem] font-semibold text-stone-900"
                    >
                      Visit Instagram
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="page-pad pb-12">
          <div className="mx-auto max-w-[1180px]">
            <div className="mb-6 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-[1.9rem] font-semibold text-[var(--brand-brown)]">
                  OccasionKart Cake Photo Gallery
                </h2>
                <p className="mt-2 max-w-[60ch] text-[1rem] leading-7 text-[#6c7396]">
                  Discover cake ideas for birthdays, anniversaries, weddings,
                  baby showers, and corporate events in Hyderabad.
                </p>
              </div>
            </div>

            <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
              {galleryItems.map((item, index) => (
                <article
                  key={item.id}
                  className={`overflow-hidden rounded-[24px] border border-[rgba(0,0,0,0.1)] bg-white shadow-[0_14px_32px_rgba(0,0,0,0.06)] ${
                    index % 5 === 0 ? "xl:col-span-2" : ""
                  }`}
                >
                  <div className="relative">
                    <img
                      src={item.image}
                      alt={`${item.title} cake design in Hyderabad`}
                      className={`w-full object-cover object-center ${
                        index % 5 === 0 ? "h-[340px]" : "h-[280px]"
                      }`}
                    />
                    <div className="absolute left-4 top-4 rounded-full bg-white/92 px-4 py-2 text-[0.82rem] font-semibold text-stone-900 shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
                      {item.tag}
                    </div>
                  </div>
                  <div className="p-5">
                    <h3 className="text-[1.08rem] font-semibold text-stone-900">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-[0.96rem] leading-7 text-[#6c7396]">
                      Freshly baked cake design by OccasionKart for customers
                      looking to order premium celebration cakes in Hyderabad.
                    </p>
                  </div>
                </article>
              ))}
            </div>

            <section className="mt-8 rounded-[24px] border border-[rgba(239,127,65,0.18)] bg-[#fff7f1] p-8 shadow-[0_10px_24px_rgba(0,0,0,0.05)] sm:p-10">
              <h2 className="text-[1.7rem] font-semibold text-[var(--brand-brown)]">
                Looking for More Cake Photos?
              </h2>
              <p className="mt-5 max-w-[70ch] text-[1rem] leading-8 text-[#6c7396]">
                Browse our latest cake photos, celebration reels, and custom
                cake updates on Instagram. You can also explore our{" "}
                <Link href="/faq" className="font-semibold text-[#ef7f41]">
                  FAQ page
                </Link>{" "}
                for same-day delivery, customization, and ordering details, or
                visit the{" "}
                <Link href="/contact" className="font-semibold text-[#ef7f41]">
                  Contact page
                </Link>{" "}
                to discuss a custom cake order.
              </p>
              <a
                href="https://www.instagram.com/occasionkart/"
                target="_blank"
                rel="noreferrer"
                className="mt-6 inline-flex rounded-full bg-[#ef7f41] px-6 py-3 text-[0.98rem] font-semibold text-white"
              >
                Follow OccasionKart on Instagram
              </a>
            </section>
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
