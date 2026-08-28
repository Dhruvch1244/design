import { ImageResponse } from "next/og";

export const alt = "Changelog — Dhruv Choudhary";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
// output: "export" needs every generated route, images included, to
// explicitly opt into static rendering (same requirement as sitemap.ts).
export const dynamic = "force-static";

const VOID = "#07080c";
const ACCENT = "#22d3ee";

export default function Image() {
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
          backgroundImage:
            `radial-gradient(circle at 15% 20%, rgba(34,211,238,0.16), transparent 55%), ` +
            `radial-gradient(circle at 85% 85%, rgba(34,211,238,0.10), transparent 50%)`,
        }}
      >
        <div
          style={{
            fontSize: 20,
            fontWeight: 600,
            letterSpacing: "0.2em",
            textTransform: "uppercase",
            color: ACCENT,
            marginBottom: 24,
          }}
        >
          Changelog · dsgn
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            fontSize: 68,
            fontWeight: 800,
            letterSpacing: "0.01em",
            textTransform: "uppercase",
            color: "#f5f7fa",
            lineHeight: 1.05,
          }}
        >
          <span>What actually</span>
          <span>shipped.</span>
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 26,
            color: "#9aa4b2",
            maxWidth: 820,
          }}
        >
          Real, dated release history for @dhruvchoudhary/dsgn — reconstructed from git history,
          not a marketing timeline.
        </div>
      </div>
    ),
    { ...size },
  );
}
