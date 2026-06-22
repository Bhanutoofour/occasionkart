import type { MetadataRoute } from "next";
import { siteSeo } from "@/lib/seo";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: siteSeo.siteName,
    short_name: siteSeo.siteName,
    description: siteSeo.defaultDescription,
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#ef7f41",
    icons: [
      {
        src: "/icon.jpg",
        sizes: "192x192",
        type: "image/jpeg",
      },
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}

