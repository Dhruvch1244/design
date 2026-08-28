import type { MetadataRoute } from "next";
import { PHILOSOPHY_DOCS } from "@/lib/philosophy-docs";

// output: "export" needs every route (including generated ones like this)
// to explicitly opt into static rendering.
export const dynamic = "force-static";

const BASE = "https://design.dhruvchoudhary.com";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: `${BASE}/`, priority: 1 },
    { url: `${BASE}/philosophy/`, priority: 0.9 },
    ...PHILOSOPHY_DOCS.map((doc) => ({
      url: `${BASE}/philosophy/${doc.slug}/`,
      priority: 0.7,
    })),
    { url: `${BASE}/components/`, priority: 0.8 },
  ];
}
