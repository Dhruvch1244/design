import { Avatar, AvatarFallback } from "../../components/avatar/avatar";
import { Card, CardContent } from "../../components/card/card";

const TESTIMONIALS = [
  {
    initials: "PN",
    name: "Priya Nair",
    role: "Head of Design, Ferro",
    quote: "We shipped a rebrand in a week instead of a quarter — the tokens did the heavy lifting.",
  },
  {
    initials: "SO",
    name: "Sam Okafor",
    role: "Founder, Loop",
    quote: "Every voice looks like a different product, but it's the same components underneath.",
  },
  {
    initials: "JB",
    name: "Jules Bianchi",
    role: "Staff Engineer, Verge",
    quote: "No black-box npm package to fight with — the code lands in our repo and we own it.",
  },
  {
    initials: "AK",
    name: "Amara Klein",
    role: "Product Designer, Halyard",
    quote: "The seven voices gave us a real starting point instead of a blank canvas.",
  },
  {
    initials: "TR",
    name: "Theo Reyes",
    role: "CTO, Sableroot",
    quote: "Swapping data-voice on the root element and watching the whole app repaint still feels like a trick.",
  },
] as const;

/**
 * A horizontally auto-scrolling row of quote cards that pauses on hover.
 * The track is duplicated once so the loop reads as continuous, and the
 * whole animation lives in one scoped `@keyframes` declared inline via a
 * plain `<style>` tag — no `@theme inline` entry required in the consumer's
 * global CSS (unlike Accordion, which needs one; see this registry's
 * component-registry reference). `prefers-reduced-motion` is handled the
 * same way the rest of this codebase's own animated pieces handle it (see
 * `apps/site/components/motion/magnetic.tsx` and the `@media
 * (prefers-reduced-motion: reduce)` blocks in `apps/site/app/globals.css`):
 * the animation is disabled outright, no partial-motion fallback.
 */
export function TestimonialMarquee() {
  const track = [...TESTIMONIALS, ...TESTIMONIALS];

  return (
    <div className="w-full max-w-4xl overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_5%,black_95%,transparent)]">
      <style>{`
        @keyframes dsgn-testimonial-marquee-scroll {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }
        .dsgn-testimonial-marquee-track {
          animation: dsgn-testimonial-marquee-scroll 40s linear infinite;
        }
        .dsgn-testimonial-marquee-track:hover {
          animation-play-state: paused;
        }
        @media (prefers-reduced-motion: reduce) {
          .dsgn-testimonial-marquee-track {
            animation: none;
          }
        }
      `}</style>
      <div className="dsgn-testimonial-marquee-track flex w-max gap-4">
        {track.map((person, i) => (
          <Card key={`${person.name}-${i}`} className="w-80 shrink-0">
            <CardContent className="space-y-4 pt-6">
              <p className="text-sm leading-relaxed text-foreground">&ldquo;{person.quote}&rdquo;</p>
              <div className="flex items-center gap-3">
                <Avatar className="h-9 w-9 shrink-0">
                  <AvatarFallback>{person.initials}</AvatarFallback>
                </Avatar>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{person.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{person.role}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
