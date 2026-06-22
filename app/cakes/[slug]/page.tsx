/* eslint-disable @next/next/no-img-element */
import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { ProductCard } from "@/components/store/product-card";
import { SiteFooter } from "@/components/store/site-footer";
import { SiteHeader } from "@/components/store/site-header";
import { toJsonLd } from "@/lib/json-ld";
import { getProductSocialProof } from "@/lib/product-social-proof";
import {
  buildProductKeywords,
  buildProductSeoDescription,
} from "@/lib/seo-content";
import { createMetadata, siteSeo } from "@/lib/seo";
import { getProductBySlug, listProducts } from "@/lib/server/catalog";
import { ProductPurchasePanel } from "./product-purchase-panel";
import { ProductReviewsSection } from "./product-reviews-section";
import { ProductSummaryPanel } from "./product-summary-panel";

type CakeDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export const dynamic = "force-dynamic";

function buildProductDetailFaqs(productName: string) {
  return [
    {
      question: "What's the difference between fresh and pre-made cakes?",
      answer:
        "Our cakes are baked in small daily batches and finished close to dispatch. We do not ship frozen pre-made cakes for regular orders.",
    },
    {
      question: "Can I get same-day delivery to my area?",
      answer:
        "Yes, same-day delivery is available in serviceable Hyderabad pincodes when you place the order before 7:00 PM. Use the pincode checker on this page to confirm.",
    },
    {
      question: "What's your refund policy?",
      answer:
        "Because cakes are perishable, returns are not accepted after delivery. If there is a quality issue, contact us quickly with photo proof and our team will review for replacement or refund support.",
    },
    {
      question: "Can I customize flavors?",
      answer:
        "Yes. Most cakes support flavor and weight selection before checkout. For fully custom designs, use our custom-orders flow and share your event details.",
    },
    {
      question: "How are photo cakes made?",
      answer:
        `For photo cakes like ${productName}, we print your uploaded image on edible sheet material using food-safe edible inks, then place it on freshly frosted cake.`,
    },
    {
      question: "What's the shelf life of your cakes?",
      answer:
        "For best taste and texture, consume within 24 hours. Keep refrigerated and avoid direct heat once delivered.",
    },
  ];
}

function getRelatedProductsForDetail(
  allProducts: Awaited<ReturnType<typeof listProducts>>,
  slug: string,
  category: string,
  categories: string[],
) {
  return allProducts
    .filter((candidate) => candidate.slug !== slug)
    .map((candidate) => {
      const samePrimaryCategory = candidate.category === category ? 3 : 0;
      const overlappingCategories = candidate.categories.filter((item) =>
        categories.includes(item),
      ).length;
      return {
        candidate,
        score: samePrimaryCategory + overlappingCategories,
      };
    })
    .sort(
      (left, right) =>
        right.score - left.score ||
        left.candidate.name.localeCompare(right.candidate.name),
    )
    .slice(0, 6)
    .map((item) => item.candidate);
}

export async function generateMetadata({
  params,
}: CakeDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    return createMetadata({
      title: "Cake not found | Occasionkart",
      path: `/cakes/${slug}`,
      noIndex: true,
    });
  }

  return createMetadata({
    title: `${product.name} | Occasionkart`,
    description: buildProductSeoDescription({
      name: product.name,
      category: product.category,
      description: product.description,
      leadTime: product.leadTime,
    }),
    keywords: buildProductKeywords(product.name, product.category),
    path: `/cakes/${slug}`,
    image: product.image,
  });
}

export default async function CakeDetailPage({ params }: CakeDetailPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const socialProof = getProductSocialProof(product.slug);
  const productFaqs = buildProductDetailFaqs(product.name);
  const allProducts = await listProducts({ limit: 80 });
  const relatedProducts = getRelatedProductsForDetail(
    allProducts,
    product.slug,
    product.category,
    product.categories,
  );
  const reviewCount = Number.parseInt(String(socialProof.reviewsLabel).replace(/[^0-9]/g, ""), 10);
  const productSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: [product.image],
    description: buildProductSeoDescription({
      name: product.name,
      category: product.category,
      description: product.description,
      leadTime: product.leadTime,
    }),
    brand: {
      "@type": "Brand",
      name: "OccasionKart",
    },
    offers: {
      "@type": "Offer",
      availability: "https://schema.org/InStock",
      priceCurrency: "INR",
      price: String(product.price),
      url: `${siteSeo.siteUrl}/cakes/${product.slug}`,
    },
    aggregateRating: {
      "@type": "AggregateRating",
      ratingValue: String(socialProof.rating),
      reviewCount: Number.isFinite(reviewCount) && reviewCount > 0 ? reviewCount : 100,
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: productFaqs.map((faq) => ({
      "@type": "Question",
      name: faq.question,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.answer,
      },
    })),
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
        name: product.name,
        item: `${siteSeo.siteUrl}/cakes/${product.slug}`,
      },
    ],
  };

  return (
    <>
      <SiteHeader />
      <main className="flex-1">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(productSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(faqSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: toJsonLd(breadcrumbSchema) }}
        />

        <section className="page-pad mx-auto w-full max-w-7xl py-8 sm:py-10 lg:py-12">
          <Link href="/cakes" className="text-sm font-semibold text-[var(--brand-red)]">
            Back to cakes
          </Link>

          <div className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1.02fr)_minmax(0,0.98fr)] xl:items-start">
            <div
              className={`overflow-hidden rounded-[28px] bg-gradient-to-br ${product.accent} p-3 shadow-[0_28px_70px_rgba(77,37,28,0.12)] sm:p-4 lg:rounded-[36px]`}
            >
              <img
                src={product.image}
                alt={product.name}
                className="aspect-[4/3] max-h-[640px] w-full rounded-[22px] object-cover object-center sm:aspect-[16/11] lg:rounded-[30px] xl:aspect-auto xl:h-[min(64vh,620px)]"
              />
            </div>

            <div className="space-y-6">
              <ProductSummaryPanel
                product={product}
                rating={socialProof.rating}
                reviewsLabel={socialProof.reviewsLabel}
              />

              <div className="rounded-[28px] border border-[var(--line)] bg-white p-5 shadow-[0_18px_45px_rgba(77,37,28,0.06)] sm:p-6 lg:rounded-[32px]">
                <div className="flex flex-wrap items-end justify-between gap-4 border-b border-[var(--line)] pb-5">
                  <div>
                    <p className="mt-1 text-sm text-stone-500">{product.flavor}</p>
                  </div>
                  <div className="rounded-full bg-[var(--cream-strong)] px-4 py-2 text-sm font-semibold text-stone-700">
                    {product.leadTime} delivery
                  </div>
                </div>

                <ProductPurchasePanel product={product} />
              </div>
            </div>
          </div>

          <section className="mt-10 rounded-[30px] border border-[var(--line)] bg-[#fffaf6] p-6 sm:p-8">
            <h2 className="text-[1.45rem] font-semibold text-[var(--brand-brown)]">
              Frequently Asked Questions
            </h2>
            <p className="mt-4 text-[0.98rem] leading-8 text-[#6c7396]">
              Here are the most common questions customers ask before ordering{" "}
              {product.name} online.
            </p>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {productFaqs.map((faq) => (
                <article
                  key={faq.question}
                  className="rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-white p-4"
                >
                  <h3 className="text-[1rem] font-semibold text-stone-900">{faq.question}</h3>
                  <p className="mt-2 text-[0.95rem] leading-7 text-[#6c7396]">{faq.answer}</p>
                </article>
              ))}
            </div>
          </section>

          <ProductReviewsSection productName={product.name} productSlug={product.slug} />

          <section className="mt-10">
            <div className="flex flex-wrap items-end justify-between gap-3">
              <h2 className="text-[1.45rem] font-semibold text-[var(--brand-brown)]">
                Customers Also Ordered
              </h2>
              <div className="flex flex-wrap gap-2 text-[0.84rem]">
                <Link
                  href="/category/chocolate-combinations"
                  className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 font-semibold text-stone-700"
                >
                  Cake + Chocolates
                </Link>
                <Link
                  href="/category/heart-shape-cakes"
                  className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 font-semibold text-stone-700"
                >
                  Cake + Flowers
                </Link>
                <Link
                  href="/category/photo-cakes"
                  className="rounded-full border border-[var(--line)] bg-white px-3 py-1.5 font-semibold text-stone-700"
                >
                  Photo Cake Bundles
                </Link>
              </div>
            </div>

            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {relatedProducts.map((relatedProduct) => (
                <ProductCard key={relatedProduct.id} product={relatedProduct} />
              ))}
            </div>
          </section>
        </section>
      </main>
      <SiteFooter />
    </>
  );
}
