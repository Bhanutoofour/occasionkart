"use client";

/* eslint-disable @next/next/no-img-element */
import { useMemo, useState } from "react";

type ProductReviewsSectionProps = {
  productName: string;
  productSlug: string;
};

type ReviewItem = {
  id: string;
  name: string;
  title: string;
  text: string;
  photoUrl: string;
};

const reviewerPool: Array<{ name: string; photoUrl: string }> = [
  { name: "Ranjith", photoUrl: "https://i.pravatar.cc/120?img=12" },
  { name: "Keerthi", photoUrl: "https://i.pravatar.cc/120?img=26" },
  { name: "Srinivas", photoUrl: "https://i.pravatar.cc/120?img=33" },
  { name: "Aishwarya", photoUrl: "https://i.pravatar.cc/120?img=47" },
  { name: "Naveen", photoUrl: "https://i.pravatar.cc/120?img=54" },
  { name: "Pragathi", photoUrl: "https://i.pravatar.cc/120?img=64" },
];

function buildReviews(productName: string, productSlug: string): ReviewItem[] {
  const seed = [...productSlug].reduce((sum, char) => sum + char.charCodeAt(0), 0);
  const start = seed % reviewerPool.length;
  const selected = [
    reviewerPool[start % reviewerPool.length],
    reviewerPool[(start + 2) % reviewerPool.length],
    reviewerPool[(start + 4) % reviewerPool.length],
  ];

  return [
    {
      id: "review-1",
      name: selected[0].name,
      photoUrl: selected[0].photoUrl,
      title: "Great taste and finishing",
      text: `${productName} looked premium and tasted fresh. Packing was clean and delivery was on time in Hyderabad.`,
    },
    {
      id: "review-2",
      name: selected[1].name,
      photoUrl: selected[1].photoUrl,
      title: "Good support for customization",
      text: "Flavor and message customization was simple. The team confirmed details quickly before dispatch.",
    },
    {
      id: "review-3",
      name: selected[2].name,
      photoUrl: selected[2].photoUrl,
      title: "Reliable same-day delivery",
      text: "Ordered late afternoon and still received the cake in the selected slot. Perfect for a last-minute celebration.",
    },
  ];
}

export function ProductReviewsSection({
  productName,
  productSlug,
}: ProductReviewsSectionProps) {
  const reviews = useMemo(() => buildReviews(productName, productSlug), [productName, productSlug]);
  const [votes, setVotes] = useState<Record<string, "helpful" | "not_helpful" | null>>({});

  return (
    <section className="mt-10 rounded-[30px] border border-[var(--line)] bg-white p-6 sm:p-8">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <h2 className="text-[1.45rem] font-semibold text-[var(--brand-brown)]">
          Customer Reviews
        </h2>
        <p className="text-[0.9rem] text-[#6c7396]">Verified purchase feedback</p>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {reviews.map((review) => {
          const vote = votes[review.id] ?? null;
          return (
            <article
              key={review.id}
              className="rounded-[18px] border border-[rgba(0,0,0,0.08)] bg-[#fffdfb] p-4"
            >
              <div className="flex items-center gap-3">
                <img
                  src={review.photoUrl}
                  alt={`${review.name} review profile`}
                  className="h-11 w-11 rounded-full object-cover"
                  loading="lazy"
                />
                <div>
                  <p className="text-[0.95rem] font-semibold text-stone-900">{review.name}</p>
                  <p className="text-[0.78rem] font-semibold uppercase tracking-[0.12em] text-[#2f8f2f]">
                    Verified purchase
                  </p>
                </div>
              </div>

              <h3 className="mt-4 text-[1rem] font-semibold text-stone-900">{review.title}</h3>
              <p className="mt-2 text-[0.92rem] leading-7 text-[#6c7396]">{review.text}</p>

              <div className="mt-4 flex items-center gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setVotes((prev) => ({
                      ...prev,
                      [review.id]: prev[review.id] === "helpful" ? null : "helpful",
                    }))
                  }
                  className={`rounded-full border px-3 py-1.5 text-[0.82rem] font-semibold ${
                    vote === "helpful"
                      ? "border-[#2f8f2f] bg-[#ebf8eb] text-[#2f8f2f]"
                      : "border-[var(--line)] text-stone-700"
                  }`}
                >
                  Helpful
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setVotes((prev) => ({
                      ...prev,
                      [review.id]: prev[review.id] === "not_helpful" ? null : "not_helpful",
                    }))
                  }
                  className={`rounded-full border px-3 py-1.5 text-[0.82rem] font-semibold ${
                    vote === "not_helpful"
                      ? "border-[#b53131] bg-[#fff0f0] text-[#b53131]"
                      : "border-[var(--line)] text-stone-700"
                  }`}
                >
                  Not helpful
                </button>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
