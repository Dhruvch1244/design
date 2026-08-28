import Link from "next/link";
import Image from "next/image";
import type { Metadata } from "next";
import { Eyebrow } from "@/components/brand/eyebrow";
import { Frame } from "@/components/brand/frame";
import { Reveal } from "@/components/motion/reveal";
import { CopyButton } from "@/components/copy-button";
import { ThemeExporter } from "@/components/theme-exporter";

export const metadata: Metadata = {
  title: "Theming — Dhruv Choudhary",
  description: "How to reskin every dsgn component for your own brand — the CSS variables that actually matter.",
};

const TOKENS = [
  { name: "--background", role: "Page background" },
  { name: "--foreground", role: "Default text color" },
  { name: "--card", role: "Card / Frame surface background" },
  { name: "--card-foreground", role: "Text on a card surface" },
  { name: "--primary", role: "Primary button fill" },
  { name: "--primary-foreground", role: "Text on a primary button" },
  { name: "--secondary", role: "Secondary button / muted surface fill" },
  { name: "--secondary-foreground", role: "Text on a secondary surface" },
  { name: "--accent", role: "The one brand color — links, focus rings, the accent Button variant" },
  { name: "--accent-foreground", role: "Text on an accent-filled surface" },
  { name: "--muted", role: "Low-emphasis fill (disabled states, subtle backgrounds)" },
  { name: "--muted-foreground", role: "Low-emphasis text (captions, placeholders)" },
  { name: "--destructive", role: "Destructive button fill, error Alert border" },
  { name: "--destructive-foreground", role: "Text on a destructive surface" },
  { name: "--border", role: "Every component's border color" },
  { name: "--ring", role: "Focus-visible ring color" },
] as const;

// Kept in sync by hand with COMPONENTS in scripts/capture-screenshots.mjs —
// small, fixed list, not worth a shared-import round-trip for.
const SCREENSHOT_COMPONENTS = ["button", "card", "badge", "dialog", "table", "accordion"] as const;

const SNIPPET = `:root {
  --background: #ffffff;
  --foreground: #0a0a0a;
  --card: #ffffff;
  --card-foreground: #0a0a0a;
  --primary: #171717;
  --primary-foreground: #fafafa;
  --secondary: #f4f4f5;
  --secondary-foreground: #171717;
  --accent: #2563eb;
  --accent-foreground: #fafafa;
  --muted: #f4f4f5;
  --muted-foreground: #71717a;
  --destructive: #dc2626;
  --destructive-foreground: #fafafa;
  --border: #e4e4e7;
  --ring: #2563eb;
}`;

export default function ThemingPage() {
  return (
    <div className="mx-auto max-w-3xl px-6 pb-32">
      <Reveal>
        <Eyebrow>Theming · dsgn</Eyebrow>
        <h1 className="mt-6 font-display text-4xl uppercase leading-tight tracking-wide sm:text-5xl">
          Make it yours.
        </h1>
        <p className="mt-4 text-muted-foreground">
          Every component in the registry — all 23 of them — reads color from exactly 16 CSS
          custom properties. No component hardcodes a hex value; every{" "}
          <code className="font-mono text-accent">bg-primary</code>,{" "}
          <code className="font-mono text-accent">text-foreground</code>, or{" "}
          <code className="font-mono text-accent">border-border</code> class is Tailwind resolving
          to a variable. Change the 16 variables in your own{" "}
          <code className="font-mono text-accent">globals.css</code> and every installed component
          re-themes at once — no component file needs to be touched, no matter how many you&rsquo;ve
          already customized.
        </p>
      </Reveal>

      <Reveal delay={100}>
        <div className="mt-10 space-y-4">
          <h2 className="font-display text-xl uppercase tracking-wide">The 16 tokens</h2>
          <Frame glow={false}>
            <div className="space-y-3">
              {TOKENS.map((token) => (
                <div key={token.name} className="flex flex-col gap-0.5 border-b border-border pb-3 last:border-0 last:pb-0 sm:flex-row sm:items-baseline sm:justify-between sm:gap-4">
                  <code className="shrink-0 font-mono text-sm text-accent">{token.name}</code>
                  <span className="text-sm text-muted-foreground">{token.role}</span>
                </div>
              ))}
            </div>
          </Frame>
        </div>
      </Reveal>

      <Reveal delay={120}>
        <div className="mt-10 space-y-4">
          <h2 className="font-display text-xl uppercase tracking-wide">Try it live</h2>
          <p className="text-sm text-muted-foreground">
            Drag any swatch below — this page (and the site&rsquo;s <Link href="/" className="text-accent hover:underline">Remix panel</Link>{" "}
            in the bottom-right corner of every page) reads from the exact same tokens.
          </p>
          <ThemeExporter />
        </div>
      </Reveal>

      <Reveal delay={150}>
        <div className="mt-10 space-y-4">
          <h2 className="font-display text-xl uppercase tracking-wide">A minimal starting palette</h2>
          <p className="text-sm text-muted-foreground">
            This is the same shape shadcn/ui&rsquo;s own default theme uses — drop it into your
            project&rsquo;s global stylesheet (wherever <code className="font-mono">@import &quot;tailwindcss&quot;</code>{" "}
            lives) and every registry component picks it up immediately, no config file needed.
          </p>
          <div className="relative">
            <pre className="overflow-x-auto rounded-lg border border-border bg-card p-4 pr-12 font-mono text-xs text-accent">
              <code>{SNIPPET}</code>
            </pre>
            <CopyButton text={SNIPPET} className="absolute right-3 top-3" />
          </div>
        </div>
      </Reveal>

      <Reveal delay={200}>
        <div className="mt-10 space-y-4">
          <h2 className="font-display text-xl uppercase tracking-wide">Dark mode</h2>
          <p className="text-sm text-muted-foreground">
            Re-declare the same 16 variable names under whatever selector or media query your
            project uses to trigger dark mode — a <code className="font-mono">.dark</code> class,
            a <code className="font-mono">[data-theme=&quot;dark&quot;]</code> attribute (this site&rsquo;s
            own approach — see{" "}
            <a href="https://github.com/dhruvch1244/design/blob/main/apps/site/app/globals.css" target="_blank" rel="noreferrer" className="text-accent hover:underline">
              apps/site/app/globals.css
            </a>{" "}
            for the real example), or a plain{" "}
            <code className="font-mono">@media (prefers-color-scheme: dark)</code> block. Nothing
            about the components themselves changes — they only ever reference the variable names,
            never a specific theme.
          </p>
        </div>
      </Reveal>

      <Reveal delay={220}>
        <div className="mt-10 space-y-4">
          <h2 className="font-display text-xl uppercase tracking-wide">Proof, not a promise</h2>
          <p className="text-sm text-muted-foreground">
            These aren&rsquo;t hand-maintained mockups — they&rsquo;re real screenshots of the live
            registry, captured with Playwright straight from a running build (see{" "}
            <code className="font-mono text-accent">apps/site/scripts/capture-screenshots.mjs</code>).
            If a component looked wrong in one theme, this gallery would show it.
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {SCREENSHOT_COMPONENTS.map((name) => (
              <div key={name} className="space-y-2 rounded-lg border border-border bg-card p-3">
                <span className="text-xs font-medium uppercase tracking-[0.15em] text-muted-foreground">
                  {name}
                </span>
                <div className="grid grid-cols-2 gap-2">
                  {(["light", "dark"] as const).map((theme) => (
                    <div key={theme} className="space-y-1">
                      <Image
                        src={`/screenshots/${name}-${theme}.png`}
                        alt={`${name} in ${theme} mode`}
                        width={400}
                        height={200}
                        unoptimized
                        className="w-full rounded-md border border-border object-contain"
                        style={theme === "light" ? { background: "#f7f5f2" } : { background: "#07080c" }}
                      />
                      <span className="block text-center text-[10px] uppercase tracking-wide text-muted-foreground">
                        {theme}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </Reveal>

      <Reveal delay={250}>
        <div className="mt-10 flex flex-wrap gap-4">
          <Link href="/components" className="text-sm text-accent hover:underline">
            ← See the components these tokens drive
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
