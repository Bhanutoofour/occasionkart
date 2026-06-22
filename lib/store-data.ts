import productsData from "./products.json";
import type { Product, RawProductRecord } from "./store-schema";
import { normalizeProductRecord } from "./store-schema";

export type Category = {
  title: string;
  description: string;
  href: string;
  emoji: string;
};

export const categories: Category[] = [
  {
    title: "Birthday Cakes",
    description: "Playful designs, photo cakes, and celebration toppers.",
    href: "/cakes?category=Birthday",
    emoji: "🎂",
  },
  {
    title: "Wedding Cakes",
    description: "Tiered centerpieces with floral details and luxury finishes.",
    href: "/cakes?category=Wedding",
    emoji: "💍",
  },
  {
    title: "Anniversary Cakes",
    description: "Romantic palettes, elegant piping, and message plaques.",
    href: "/cakes?category=Anniversary",
    emoji: "💐",
  },
  {
    title: "Custom Themes",
    description: "Cartoon, sports, and minimalist concepts for every age.",
    href: "/cakes?category=Custom",
    emoji: "✨",
  },
];
export type { Product } from "./store-schema";

export const products: Product[] = (productsData as RawProductRecord[]).map(
  normalizeProductRecord,
);

export const perks = [
  "Freshly baked every morning",
  "Same-day delivery across Hyderabad",
  "Eggless and custom message options",
  "WhatsApp order support for bulk events",
];

export const testimonials = [
  {
    name: "Aarushi",
    quote:
      "The wedding cake looked exactly like the design mockup and tasted even better than it looked.",
  },
  {
    name: "Rahul",
    quote:
      "We ordered late for a birthday surprise and still got a perfect same-day delivery slot.",
  },
  {
    name: "Sana",
    quote:
      "Their custom floral cake felt premium, polished, and genuinely memorable for our anniversary dinner.",
  },
];
