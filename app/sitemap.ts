import type { MetadataRoute } from "next";
import { siteSeo } from "@/lib/seo";
import { listProducts } from "@/lib/server/catalog";

const staticRoutes: Array<{
  path: string;
  priority: number;
  changeFrequency: MetadataRoute.Sitemap[number]["changeFrequency"];
}> = [
  { path: "/", priority: 1, changeFrequency: "daily" },
  { path: "/cakes", priority: 0.95, changeFrequency: "daily" },
  { path: "/about", priority: 0.8, changeFrequency: "monthly" },
  { path: "/birthday-specials", priority: 0.85, changeFrequency: "weekly" },
  { path: "/contact", priority: 0.8, changeFrequency: "monthly" },
  { path: "/corporate-orders", priority: 0.8, changeFrequency: "weekly" },
  { path: "/custom-orders", priority: 0.85, changeFrequency: "weekly" },
  { path: "/faq", priority: 0.8, changeFrequency: "monthly" },
  { path: "/gallery", priority: 0.8, changeFrequency: "weekly" },
  { path: "/menu", priority: 0.9, changeFrequency: "daily" },
  { path: "/offers", priority: 0.9, changeFrequency: "daily" },
  { path: "/privacy-policy", priority: 0.4, changeFrequency: "yearly" },
  { path: "/refund-policy", priority: 0.4, changeFrequency: "yearly" },
  { path: "/terms-and-conditions", priority: 0.4, changeFrequency: "yearly" },
  { path: "/testimonials", priority: 0.7, changeFrequency: "monthly" },
];

const slugify = (value: string) =>
  value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const entries: MetadataRoute.Sitemap = staticRoutes.map((route) => ({
    url: `${siteSeo.siteUrl}${route.path}`,
    lastModified: now,
    changeFrequency: route.changeFrequency,
    priority: route.priority,
  }));

  try {
    const products = await listProducts({ limit: 10000 });
    const categorySet = new Set<string>();

    for (const product of products) {
      entries.push({
        url: `${siteSeo.siteUrl}/cakes/${product.slug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
        images: [product.image],
      });

      for (const category of product.categories ?? []) {
        const slug = slugify(category);
        if (slug) {
          categorySet.add(slug);
        }
      }
    }

    for (const categorySlug of categorySet) {
      entries.push({
        url: `${siteSeo.siteUrl}/category/${categorySlug}`,
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.75,
      });
    }
  } catch {
    // Fall back to static routes only when product/category sources are unavailable.
  }

  return entries;
}
