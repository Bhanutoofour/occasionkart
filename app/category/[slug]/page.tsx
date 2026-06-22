import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

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
import { listProducts } from "@/lib/server/catalog";
const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

const toTitleCase = (value: string) =>
  value.replace(/\b\w/g, (char) => char.toUpperCase());

const categoryAliases: Record<string, { label: string; keywords: string[] }> = {
  "gift-hampers": {
    label: "Gift Hampers",
    keywords: ["gift", "hamper", "bouquet", "rose", "flowers"],
  },
  flowers: {
    label: "Flowers",
    keywords: ["flower", "floral", "rose", "bouquet"],
  },
  "chocolate-combinations": {
    label: "Chocolate Combos",
    keywords: ["chocolate", "combo", "combination", "kitkat", "ferrero"],
  },
  surprises: {
    label: "Surprises",
    keywords: ["surprise", "theme", "special", "custom"],
  },
  blackforest: {
    label: "Black Forest",
    keywords: ["black forest"],
  },
  tresleches: {
    label: "Tres Leches",
    keywords: ["tresleche", "tres leches"],
  },
  tiramissu: {
    label: "Tiramisu",
    keywords: ["tiramisu", "tiramissu"],
  },
  "desi-sweet-flavor": {
    label: "Desi Sweet Flavor",
    keywords: ["desi", "sweet"],
  },
  huzzlenut: {
    label: "Hazelnut",
    keywords: ["hazelnut", "hazzelnut", "huzzlenut"],
  },
  "honey-almond": {
    label: "Honey Almond",
    keywords: ["honey almond"],
  },
  "bride-to-be": {
    label: "Bride to Be",
    keywords: ["bride", "engagement", "wedding"],
  },
  graduation: {
    label: "Graduation",
    keywords: ["graduation", "convocation"],
  },
  celebrations: {
    label: "Celebrations",
    keywords: ["celebration", "birthday", "anniversary"],
  },
  "corporate-success": {
    label: "Corporate Success",
    keywords: ["corporate"],
  },
  wife: {
    label: "Cake for Wife",
    keywords: ["wife"],
  },
  husband: {
    label: "Cake for Husband",
    keywords: ["husband"],
  },
  love: {
    label: "Cake for Love",
    keywords: ["love"],
  },
  sister: {
    label: "Cake for Sister",
    keywords: ["sister"],
  },
  mom: {
    label: "Cake for Mom",
    keywords: ["mom", "mother"],
  },
  dad: {
    label: "Cake for Dad",
    keywords: ["dad", "father"],
  },
  brother: {
    label: "Cake for Brother",
    keywords: ["brother"],
  },
  friend: {
    label: "Cake for Friend",
    keywords: ["friend"],
  },
  "grand-parents": {
    label: "Cake for Grand Parents",
    keywords: ["grand", "grandparents"],
  },
  "jar-cakes": {
    label: "Jar Cakes",
    keywords: ["jar cake", "dessert"],
  },
  "cup-cakes": {
    label: "Cup Cakes",
    keywords: ["cup cake", "cupcakes"],
  },
  brownies: {
    label: "Brownies",
    keywords: ["brownie"],
  },
  cookies: {
    label: "Cookies",
    keywords: ["cookie"],
  },
  "cheese-cakes": {
    label: "Cheese Cakes",
    keywords: ["cheese cake", "cheesecake"],
  },
  "customized-cakes": {
    label: "Customized Cakes",
    keywords: ["custom", "theme", "photo"],
  },
  roses: {
    label: "Roses",
    keywords: ["rose"],
  },
  orchids: {
    label: "Orchids",
    keywords: ["orchid"],
  },
  "basket-arrangements": {
    label: "Basket Arrangements",
    keywords: ["basket", "arrangement", "bouquet"],
  },
  "cakes-and-flowers": {
    label: "Cakes and Flowers",
    keywords: ["cake", "flower", "combo"],
  },
  "cake-and-chocolates": {
    label: "Cake and Chocolates",
    keywords: ["cake", "chocolate", "combo"],
  },
  "cakes-setup": {
    label: "Cakes Setup",
    keywords: ["cake setup", "celebration"],
  },
  "cake-and-mascot": {
    label: "Cake and Mascot",
    keywords: ["mascot", "theme"],
  },
  "cake-and-guitarist": {
    label: "Cake and Guitarist",
    keywords: ["guitar", "surprise"],
  },
  "cakes-mascot-and-guitarist": {
    label: "Cakes Mascot and Guitarist",
    keywords: ["mascot", "guitar", "surprise"],
  },
};

const genericIgnoredTokens = new Set([
  "cake",
  "cakes",
  "and",
  "the",
  "for",
  "with",
  "by",
  "of",
]);

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const categoryName = slug.replace(/-/g, " ");

  return createMetadata({
    title: `${categoryName} Cakes Hyderabad | OccasionKart`,
    description: buildCollectionSeoDescription(categoryName),
    keywords: buildCollectionKeywords(categoryName),
    path: `/category/${slug}`,
  });
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug: categorySlug } = await params;
  const products = await listProducts();
  let filtered = products.filter((product) =>
    (product.categories ?? []).some((cat) => slugify(cat) === categorySlug),
  );

  const alias = categoryAliases[categorySlug];
  if (filtered.length === 0 && alias) {
    filtered = products.filter((product) => {
      const haystack = [
        product.name,
        product.description,
        ...(product.categories ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return alias.keywords.some((keyword) => haystack.includes(keyword));
    });
  }

  if (filtered.length === 0) {
    const tokens = categorySlug
      .split("-")
      .map((token) => token.trim().toLowerCase())
      .filter(
        (token) =>
          token.length >= 4 &&
          !genericIgnoredTokens.has(token),
      );

    if (tokens.length > 0) {
      filtered = products.filter((product) => {
        const haystack = [
          product.name,
          product.description,
          ...(product.categories ?? []),
        ]
          .join(" ")
          .toLowerCase();
        return tokens.some((token) => haystack.includes(token));
      });
    }
  }

  if (filtered.length === 0) {
    notFound();
  }

  const categoryName =
    filtered[0]?.categories?.find((cat) => slugify(cat) === categorySlug) ??
    alias?.label ??
    toTitleCase(categorySlug.replace(/-/g, " "));
  const collectionSchema = {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: `${categoryName} Cakes Hyderabad`,
    url: `${siteSeo.siteUrl}/category/${categorySlug}`,
    mainEntity: {
      "@type": "ItemList",
      itemListElement: filtered.slice(0, 25).map((product, index) => ({
        "@type": "ListItem",
        position: index + 1,
        url: `${siteSeo.siteUrl}/cakes/${product.slug}`,
        name: product.name,
      })),
    },
  };
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: siteSeo.siteUrl,
      },
      {
        "@type": "ListItem",
        position: 2,
        name: "Cakes",
        item: `${siteSeo.siteUrl}/cakes`,
      },
      {
        "@type": "ListItem",
        position: 3,
        name: categoryName,
        item: `${siteSeo.siteUrl}/category/${categorySlug}`,
      },
    ],
  };

  return (
    <>
      <SiteHeader />
      <main className="bg-white page-pad py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(collectionSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbSchema) }}
        />
        <div className="mx-auto max-w-[1200px]">
          <div className="flex items-start justify-between">
            <h1 className="text-left text-[2rem] font-semibold text-black">
              {categoryName}
            </h1>
            <Link href="/cakes" className="text-[1rem] text-[#ef7f41]">
              View all cakes →
            </Link>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-4 md:grid-cols-3 md:gap-5 xl:grid-cols-5">
            {filtered.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>

          <section className="mt-10 rounded-[24px] border border-[rgba(0,0,0,0.08)] bg-[#fffaf6] p-6 sm:p-8">
            <h2 className="text-[1.45rem] font-semibold text-[var(--brand-brown)]">
              {categoryName} Cake Delivery in Hyderabad
            </h2>
            <p className="mt-4 text-[1rem] leading-8 text-[#6c7396]">
              {buildCollectionSeoDescription(categoryName, filtered.length)}
            </p>
            <p className="mt-3 text-[1rem] leading-8 text-[#6c7396]">{buildGeoCoverageLine()}</p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
