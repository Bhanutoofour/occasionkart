import type { Metadata } from "next";
import { buildSeoKeywords } from "@/lib/seo-content";

const siteName = "OccasionKart";
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://occasionkart.com";
const defaultDescription =
  "Order cakes online in Hyderabad with OccasionKart for same day cake delivery, custom cakes, birthday cakes, anniversary cakes, and premium celebration designs.";
const defaultOgImage = "/icon.jpg";

type CreateMetadataInput = {
  title: string;
  description?: string;
  keywords?: string[];
  path?: string;
  image?: string;
  noIndex?: boolean;
};

export function createMetadata({
  title,
  description = defaultDescription,
  keywords = [],
  path,
  image,
  noIndex = false,
}: CreateMetadataInput): Metadata {
  const canonicalPath = path;
  const mergedKeywords = buildSeoKeywords(keywords);

  return {
    title,
    description,
    metadataBase: new URL(siteUrl),
    keywords: mergedKeywords,
    alternates: canonicalPath
      ? {
          canonical: canonicalPath,
        }
      : undefined,
    robots: {
      index: !noIndex,
      follow: true,
      nocache: false,
      googleBot: {
        index: !noIndex,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title,
      description,
      siteName,
      type: "website",
      locale: "en_IN",
      url: canonicalPath,
      images: [
        {
          url: image ?? defaultOgImage,
          alt: title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image ?? defaultOgImage],
    },
  };
}

export const siteSeo = {
  siteName,
  siteUrl,
  defaultDescription,
  defaultOgImage,
};
