import { ImageResponse } from "next/og";

// Static (build-time) OG image for the home page — no web-font fetch at
// build time (kept the build reliable rather than depending on a
// network call that could fail mid-CI); the display weight is
// approximated with a heavy system sans + wide letter-spacing instead.
export const alt = "Dhruv Choudhary — a design philosophy, made usable";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
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
        <svg
          width="64"
          height="64"
          viewBox="0 0 40 40"
          fill={ACCENT}
          style={{ marginBottom: 36 }}
        >
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M20 2 L24 16 L33 20 L24 24 L20 30 L16 24 L7 20 L16 16 Z M22.5 20 A2.5 2.5 0 1 1 17.5 20 A2.5 2.5 0 1 1 22.5 20 Z"
          />
        </svg>
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
          <span>A fixed point</span>
          <span>for design decisions.</span>
        </div>
        <div
          style={{
            marginTop: 28,
            fontSize: 26,
            color: "#9aa4b2",
            maxWidth: 820,
          }}
        >
          A cross-AI design philosophy extracted from real shipped apps, plus dsgn — a
          component registry you install with one command.
        </div>
      </div>
    ),
    { ...size },
  );
}
