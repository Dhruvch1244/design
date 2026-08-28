import type { MetadataRoute } from "next";

// output: "export" needs every route (including generated ones like this)
// to explicitly opt into static rendering.
export const dynamic = "force-static";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: { userAgent: "*", allow: "/" },
    sitemap: "https://design.dhruvchoudhary.com/sitemap.xml",
  };
}
