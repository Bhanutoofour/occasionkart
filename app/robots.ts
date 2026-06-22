import type { MetadataRoute } from "next";
import { siteSeo } from "@/lib/seo";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/admin/",
          "/api/",
          "/account/",
          "/cart/",
          "/checkout/",
          "/login/",
          "/register/",
          "/track-order/",
        ],
      },
    ],
    sitemap: `${siteSeo.siteUrl}/sitemap.xml`,
    host: siteSeo.siteUrl,
  };
}

