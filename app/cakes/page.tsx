import Link from "next/link";

import { ProductCard } from "@/components/store/product-card";
import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { toJsonLd } from "@/lib/json-ld";
import {
  buildCollectionKeywords,
  buildCollectionSeoDescription,
  buildGeoCoverageLine,
} from "@/lib/seo-content";
import { createMetadata, siteSeo } from "@/lib/seo";
import { listProducts, listTopCategories } from "@/lib/server/catalog";

export const metadata = createMetadata({
  title: "Cake Collection Hyderabad | OccasionKart",
  description: buildCollectionSeoDescription("cake", 0),
  keywords: buildCollectionKeywords("cake"),
  path: "/cakes",
});

type CakesPageProps = {
  searchParams?: Promise<{ category?: string; sort?: string; q?: string }>;
};

export default async function CakesPage({ searchParams }: CakesPageProps) {
  const params = (await searchParams) ?? {};
  const selectedCategory = params.category?.trim();
  const searchQuery = params.q?.trim() ?? "";
  const sort = params.sort ?? "";

  const [filteredProducts, topCategories] = await Promise.all([
    listProducts({
      category: selectedCategory,
      query: searchQuery,
      sort,
    }),
    listTopCategories(12),
  ]);
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Cake Collection Hyderabad",
    url: `${siteSeo.siteUrl}/cakes`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: filteredProducts.slice(0, 20).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteSeo.siteUrl}/cakes/${product.slug}`,
        name: product.name,
      })),
    },
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(collectionSchema) }}
        />
        <section className="page-pad mx-auto w-full max-w-7xl py-14">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="section-kicker">Collections</p>
              <h1 className="section-title">
                {selectedCategory ? selectedCategory : "All cakes"}
              </h1>
              <p className="mt-4 max-w-2xl text-base leading-8 text-stone-600">
                Browse {filteredProducts.length} products from our Occasionkart
                catalog. Use filters to narrow down by category, price, or search.
              </p>
            </div>
            <Link
              href="/cart"
              className="rounded-full bg-[var(--brand-red)] px-5 py-3 text-sm font-semibold text-white"
            >
              Review cart
            </Link>
          </div>

          <form method="get" className="mt-6 flex flex-wrap gap-3">
            <input
              type="text"
              name="q"
              defaultValue={searchQuery}
              placeholder="Search cakes..."
              className="w-full max-w-[280px] rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm text-stone-700"
            />
            <select
              name="sort"
              defaultValue={sort}
              className="rounded-full border border-[var(--line)] bg-white px-4 py-2 text-sm text-stone-700"
            >
              <option value="">Sort</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
            {selectedCategory ? (
              <input type="hidden" name="category" value={selectedCategory} />
            ) : null}
            <button
              type="submit"
              className="rounded-full bg-[#ef7f41] px-5 py-2 text-sm font-semibold text-white"
            >
              Apply
            </button>
          </form>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              href="/cakes"
              className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                !selectedCategory
                  ? "bg-[var(--brand-brown)] text-white"
                  : "border border-[var(--line)] bg-white text-stone-700"
              }`}
            >
              All
            </Link>
            {topCategories.map((item) => {
              const href = `/category/${encodeURIComponent(
                item.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, ""),
              )}`;
              const active = item.toLowerCase() === selectedCategory?.toLowerCase();
              return (
                <Link
                  key={item}
                  href={href}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                    active
                      ? "bg-[var(--brand-brown)] text-white"
                      : "border border-[var(--line)] bg-white text-stone-700 hover:border-[var(--brand-red)] hover:text-[var(--brand-red)]"
                  }`}
                >
                  {item}
                </Link>
              );
            })}
          </div>

          <div className="mt-10 grid gap-4 md:grid-cols-2 md:gap-6 xl:grid-cols-5">
            {filteredProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <section className="mt-12 rounded-[26px] border border-[rgba(0,0,0,0.08)] bg-[#fffaf6] p-6 sm:p-8">
            <h2 className="text-[1.55rem] font-semibold text-[var(--brand-brown)]">
              Order Cakes Online in Hyderabad with Same Day Delivery
            </h2>
            <p className="mt-4 text-[1rem] leading-8 text-[#6c7396]">
              {buildCollectionSeoDescription(selectedCategory ?? "cake", filteredProducts.length)}
            </p>
            <p className="mt-3 text-[1rem] leading-8 text-[#6c7396]">{buildGeoCoverageLine()}</p>
            <div className="mt-5 flex flex-wrap gap-2">
              {buildCollectionKeywords(selectedCategory ?? "cake")
                .slice(0, 10)
                .map((keyword) => (
                  <span
                    key={keyword}
                    className="rounded-full border border-[rgba(0,0,0,0.1)] bg-white px-3 py-1.5 text-[0.8rem] font-semibold text-stone-700"
                  >
                    {keyword}
                  </span>
                ))}
            </div>
          </section>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
