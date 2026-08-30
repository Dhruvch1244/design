import type { MetadataRoute } from "next";
import { PHILOSOPHY_DOCS } from "@/lib/philosophy-docs";
import { CASE_STUDIES } from "@/lib/case-studies";
import { COMPONENTS_DATA } from "@/lib/components-data";

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
    ...COMPONENTS_DATA.map((c) => ({
      url: `${BASE}/components/${c.slug}/`,
      priority: 0.6,
    })),
    { url: `${BASE}/examples/`, priority: 0.8 },
    { url: `${BASE}/theming/`, priority: 0.7 },
    { url: `${BASE}/skill/`, priority: 0.7 },
    { url: `${BASE}/best-practices/`, priority: 0.6 },
    { url: `${BASE}/changelog/`, priority: 0.5 },
    { url: `${BASE}/case-studies/`, priority: 0.8 },
    ...CASE_STUDIES.map((study) => ({
      url: `${BASE}/case-studies/${study.slug}/`,
      priority: 0.6,
    })),
  ];
}
