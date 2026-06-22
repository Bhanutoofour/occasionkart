/* eslint-disable @next/next/no-img-element */
import Link from "next/link";

import { AddToCartButton } from "@/components/store/add-to-cart-button";
import { getDisplayPrice, resolveVariantPricing } from "@/lib/product-variants";
import { getProductSocialProof } from "@/lib/product-social-proof";
import type { Product } from "@/lib/store-data";

const priceFormatter = new Intl.NumberFormat("en-IN");
const compactProductName = (name: string) => {
  const cleaned = name
    .replace(/\bthe\b\s+/i, "")
    .replace(/\bcakes?\b/gi, "")
    .replace(/\s{2,}/g, " ")
    .trim();

  const baseName = cleaned.length >= 6 ? cleaned : name.replace(/\bcakes?\b/gi, "").trim();
  return `${baseName} Cake`.replace(/\s{2,}/g, " ").trim();
};

export function ProductCard({ product }: { product: Product }) {
  const socialProof = getProductSocialProof(product.slug);
  const displayName = compactProductName(product.name);
  const displayPrice = getDisplayPrice(product);
  const { selectedWeight, selectedFlavor, unitPrice } = resolveVariantPricing(product);

  return (
    <article className="group flex h-full flex-col overflow-hidden rounded-[18px] border border-[rgba(0,0,0,0.12)] bg-white shadow-[0_8px_20px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-y-1 hover:border-[rgba(189,39,26,0.35)] hover:shadow-[0_14px_30px_rgba(189,39,26,0.16)]">
      <Link href={`/cakes/${product.slug}`} className="block">
        <div className="relative aspect-[1/1] overflow-hidden bg-[#f6f2f0]">
          <img
            src={product.image}
            alt={product.name}
            className="h-full w-full object-cover object-center transition-transform duration-300 group-hover:scale-[1.03]"
          />
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <Link
          href={`/cakes/${product.slug}`}
          className="block min-h-[3.1rem] text-[0.95rem] font-semibold leading-[1.3] text-stone-900 transition-colors duration-200 group-hover:text-[var(--brand-red)] sm:min-h-[3.3rem] sm:text-[1.02rem]"
        >
          {displayName}
        </Link>

        <div className="mt-2 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-baseline gap-1.5 leading-none text-[var(--brand-maroon)]">
              <span className="text-[0.82rem] font-semibold tracking-[0.01em] sm:text-[0.9rem]">
                Rs.
              </span>
              <span className="text-[1.15rem] font-bold sm:text-[1.35rem]">
                {priceFormatter.format(displayPrice)}
              </span>
            </div>
          </div>

          <AddToCartButton
            slug={product.slug}
            name={product.name}
            price={unitPrice}
            image={product.image}
            weightId={selectedWeight?.id}
            weightLabel={selectedWeight?.label}
            weightKilograms={selectedWeight?.kilograms}
            flavorId={selectedFlavor?.id}
            flavorLabel={selectedFlavor?.label}
            flavorPricePerKg={selectedFlavor?.pricePerKg}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-[var(--brand-red)] text-white shadow-[0_14px_28px_rgba(189,39,26,0.22)] transition-all duration-200 hover:scale-105 hover:bg-black hover:shadow-[0_16px_30px_rgba(0,0,0,0.35)]"
          >
            <svg
              aria-hidden="true"
              viewBox="0 0 24 24"
              className="h-4.5 w-4.5 fill-none stroke-current"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="18.5" cy="6.5" r="4.5" />
              <path d="M18.5 4.5v4" />
              <path d="M16.5 6.5h4" />
              <path d="M3 4h2l2.1 9.7a1 1 0 0 0 1 .8h7.9a1 1 0 0 0 1-.8L18 8H7" />
              <circle cx="10" cy="19" r="1.5" fill="currentColor" stroke="none" />
              <circle cx="16" cy="19" r="1.5" fill="currentColor" stroke="none" />
            </svg>
          </AddToCartButton>
        </div>

        <p className="mt-1.5 max-w-[8.5rem] text-[0.84rem] font-medium leading-6 text-[#586786]">
          <span className="text-stone-900">{socialProof.rating}</span>{" "}
          <span className="text-[var(--brand-gold)]">&#9733;</span>{" "}
          <span>({socialProof.reviewsLabel})</span>
        </p>
      </div>
    </article>
  );
}
