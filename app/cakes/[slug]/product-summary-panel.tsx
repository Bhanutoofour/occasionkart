"use client";

import { useMemo, useState } from "react";

import type { Product } from "@/lib/store-schema";

const priceFormatter = new Intl.NumberFormat("en-IN");

type DescriptionSection = {
  title: string;
  points: string[];
};

function cleanCatalogText(text: string) {
  return text
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/â€“|â€”/g, "-")
    .replace(/â€™/g, "'")
    .replace(/â€œ|â€�/g, "\"")
    .replace(/\s+/g, " ")
    .trim();
}

function getDescriptionLines(description: string, productName: string) {
  return description
    .replace(/\\n/g, "\n")
    .split(/\n+/)
    .map(cleanCatalogText)
    .filter(Boolean)
    .filter((line, index) => {
      const normalizedLine = line.toLowerCase();
      const normalizedName = productName.toLowerCase();
      return !(index === 0 && normalizedLine.includes(normalizedName));
    });
}

function isSectionHeading(line: string) {
  const words = line.split(/\s+/).length;

  return (
    line.endsWith("?") ||
    /^why choose/i.test(line) ||
    /^(product details|some info|some information|care to be taken|instructions|service areas|more than|order )/i.test(
      line,
    ) ||
    (/^[A-Z]/.test(line) && words <= 9 && !/[.!]$/.test(line))
  );
}

function splitPoint(line: string) {
  return line
    .split(/(?<=[.!?])\s+(?=[A-Z0-9])/)
    .map((point) => point.trim())
    .filter(Boolean);
}

function buildDescriptionSections(description: string, productName: string) {
  const lines = getDescriptionLines(description, productName);
  const sections: DescriptionSection[] = [];
  let current: DescriptionSection = { title: "Product Highlights", points: [] };

  for (const line of lines) {
    if (isSectionHeading(line)) {
      if (current.points.length > 0) {
        sections.push(current);
      }
      current = { title: line.replace(/:$/, ""), points: [] };
      continue;
    }

    current.points.push(...splitPoint(line));
  }

  if (current.points.length > 0) {
    sections.push(current);
  }

  return sections.length > 0
    ? sections
    : [{ title: "Product Highlights", points: [cleanCatalogText(description)] }];
}

export function ProductSummaryPanel({
  product,
  rating,
  reviewsLabel,
}: {
  product: Product;
  rating: number | string;
  reviewsLabel: string;
}) {
  const [expanded, setExpanded] = useState(false);
  const descriptionSections = useMemo(
    () => buildDescriptionSections(product.description, product.name),
    [product.description, product.name],
  );
  const visibleSections = useMemo(
    () => (expanded ? descriptionSections : descriptionSections.slice(0, 2)),
    [descriptionSections, expanded],
  );
  const totalPoints = descriptionSections.reduce(
    (total, section) => total + section.points.length,
    0,
  );
  const shouldCollapse = descriptionSections.length > 2 || totalPoints > 7;
  const numericRating = Number(rating);
  const ratingLabel = Number.isFinite(numericRating)
    ? numericRating.toFixed(1)
    : String(rating);

  return (
    <div className="rounded-[28px] border border-[var(--line)] bg-white p-5 shadow-[0_18px_45px_rgba(77,37,28,0.06)] sm:p-7 lg:rounded-[32px]">
      <p className="text-[0.8rem] font-semibold tracking-[0.08em] text-[var(--brand-red)]">
        {product.category}
      </p>
      <h1 className="mt-2 text-[1.9rem] font-semibold leading-[1.15] text-[var(--brand-brown)] sm:text-[2.35rem] xl:text-[2.55rem]">
        {product.name}
      </h1>

      <div className="mt-3 flex flex-wrap items-center gap-x-2 gap-y-2 text-[0.98rem] font-medium text-[#586786]">
        <span className="text-stone-900">{ratingLabel}</span>
        <span className="text-[var(--brand-gold)]">★</span>
        <span>({reviewsLabel})</span>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="text-[2rem] font-bold leading-none text-[var(--brand-brown)] sm:text-[2.2rem]">
          Rs. {priceFormatter.format(product.price)}
        </div>
        <div className="rounded-full bg-[var(--cream-strong)] px-3 py-1.5 text-[0.78rem] font-semibold text-stone-700">
          {product.leadTime} delivery
        </div>
      </div>

      <div className="mt-5 space-y-4 rounded-[22px] bg-[#fffaf6] p-4 text-stone-700">
        {visibleSections.map((section) => (
          <section key={section.title}>
            <h2 className="text-[0.9rem] font-semibold text-[var(--brand-brown)]">
              {section.title}
            </h2>
            <ul className="mt-3 space-y-2 text-[0.95rem] leading-6">
              {section.points.slice(0, expanded ? undefined : 5).map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="mt-[0.55rem] h-1.5 w-1.5 shrink-0 rounded-full bg-[#ef7f41]" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        ))}
        {shouldCollapse ? (
          <button
            type="button"
            className="text-[0.95rem] font-semibold text-[var(--brand-brown)] transition hover:text-[var(--brand-red)]"
            onClick={() => setExpanded((current) => !current)}
          >
            {expanded ? "Read less" : "Read more"}
          </button>
        ) : null}
      </div>
    </div>
  );
}
