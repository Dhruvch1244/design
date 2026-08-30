import { ImageResponse } from "next/og";
import { CASE_STUDIES, findCaseStudyBySlug } from "@/lib/case-studies";

export const alt = "Case study — Dhruv Choudhary";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// output: "export" needs every generated route, images included, to
// explicitly opt into static rendering (same requirement as sitemap.ts).
export const dynamic = "force-static";

export function generateStaticParams() {
  return CASE_STUDIES.map((study) => ({ slug: study.slug }));
}

const VOID = "#07080c";
const ACCENT = "#22d3ee";

export default async function Image({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const study = findCaseStudyBySlug(slug);

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: "80px",
          background: VOID,
          backgroundImage: `radial-gradient(circle at 15% 85%, rgba(34,211,238,0.14), transparent 55%)`,
        }}
      >
        <div style={{ display: "flex", fontSize: 22, letterSpacing: "0.2em", color: ACCENT, textTransform: "uppercase" }}>
          {study?.stack ?? "Case study"}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 96,
            fontWeight: 800,
            textTransform: "uppercase",
            color: "#f5f7fa",
            marginTop: 24,
          }}
        >
          {study?.name ?? "Dhruv Choudhary"}
        </div>
        <div style={{ marginTop: 24, fontSize: 30, color: "#9aa4b2", maxWidth: 900 }}>
          {study?.tagline ?? ""}
        </div>
      </div>
    ),
    { ...size },
  );
}
