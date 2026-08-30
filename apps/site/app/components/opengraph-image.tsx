import { ImageResponse } from "next/og";
import { readFileSync } from "node:fs";
import path from "node:path";

export const alt = "dsgn — the component registry";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
const VOID = "#07080c";
const ACCENT = "#22d3ee";

// Read the real, live registry count the same way the badge does, so this
// image can't go stale the way a hardcoded stat already did once on this
// site (see /examples's Registry components stat fix).
function realComponentCount() {
  const registryPath = path.join(process.cwd(), "../../packages/registry/registry.json");
  const registry = JSON.parse(readFileSync(registryPath, "utf8"));
  return registry.items.filter((item: { type: string }) => item.type === "registry:ui").length;
}

export default function Image() {
  const count = realComponentCount();
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
          backgroundImage: `radial-gradient(circle at 80% 20%, rgba(34,211,238,0.16), transparent 55%)`,
        }}
      >
        <div style={{ display: "flex", fontSize: 22, letterSpacing: "0.2em", color: ACCENT, textTransform: "uppercase" }}>
          Registry · dsgn
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "baseline",
            gap: 24,
            marginTop: 28,
          }}
        >
          <span style={{ fontSize: 160, fontWeight: 800, color: "#f5f7fa" }}>{count}</span>
          <span style={{ fontSize: 40, fontWeight: 700, textTransform: "uppercase", color: "#f5f7fa" }}>
            components
          </span>
        </div>
        <div style={{ marginTop: 24, fontSize: 26, color: "#9aa4b2", maxWidth: 820 }}>
          Copied straight into your project — no runtime dependency, nothing to eject later.
        </div>
      </div>
    ),
    { ...size },
  );
}
