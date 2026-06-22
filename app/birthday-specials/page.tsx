import Link from "next/link";

import { ProductCard } from "@/components/store/product-card";
import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { createMetadata } from "@/lib/seo";
import { listProducts } from "@/lib/server/catalog";

export const metadata = createMetadata({
  title: "Birthday Cakes Hyderabad | Birthday Specials | OccasionKart",
  description:
    "Explore birthday cake specials in Hyderabad from OccasionKart for kids birthdays, surprise parties, theme cakes, photo cakes, and same-day delivery.",
  keywords: ["birthday cakes Hyderabad", "birthday specials Hyderabad", "theme cakes Hyderabad"],
});

export default async function BirthdaySpecialsPage() {
  const products = await listProducts();
  const birthdayPicks = products.filter((product) =>
    product.categories.some((category) => category.toLowerCase().includes("birthday")),
  );

  return (
    <>
      <SiteHeader />
      <main className="bg-white">
        <section className="page-pad py-8 sm:py-12">
          <div className="mx-auto max-w-[1180px] rounded-[28px] border border-[rgba(0,0,0,0.1)] bg-[linear-gradient(135deg,#fff7ef_0%,#ffffff_50%,#fff2e7_100%)] p-8 shadow-[0_18px_40px_rgba(0,0,0,0.08)] sm:p-12">
            <p className="section-kicker">Birthday Specials</p>
            <h1 className="mt-4 max-w-[12ch] font-[Georgia] text-[2.6rem] leading-[1.05] font-semibold text-[var(--brand-brown)] sm:text-[3.2rem]">
              Birthday Cakes in Hyderabad for Every Age and Theme
            </h1>
            <p className="mt-6 max-w-[66ch] text-[1rem] leading-8 text-[#6c7396]">
              OccasionKart birthday specials help customers quickly find
              celebration-ready cakes in Hyderabad for kids, adults, surprise
              parties, and customized birthday themes. You can browse designs,
              choose flavors, and move to custom planning when needed.
            </p>
          </div>
        </section>

        <section className="page-pad-tight pb-12">
          <div className="page-pad flex items-center justify-between">
            <h2 className="text-[2rem] font-semibold text-black">Birthday Cake Collection</h2>
            <Link href="/custom-orders" className="text-[1rem] font-semibold text-[#ef7f41]">
              Need a Custom Birthday Cake?
            </Link>
          </div>
          <div className="mt-7 grid grid-cols-2 gap-4 md:gap-5 xl:grid-cols-5">
            {(birthdayPicks.length > 0 ? birthdayPicks : products.slice(0, 8)).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
