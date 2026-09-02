/**
 * Decorative background layers.
 *
 * Three constraints, all from the motion doc's trigger/boundary/off-switch
 * questions:
 *
 * 1. This is a *sibling* of the content, never an ancestor. An ancestor's
 *    opacity cannot be undone by a child setting its own back to 1, so if the
 *    glow and the console shared a parent/child relationship a bug in the
 *    glow's opacity would take the whole console down with it.
 * 2. The drifting glows have a negative inset so their falloff never shows a
 *    hard edge. That bleed is exactly what produces a phantom horizontal
 *    scrollbar on phones — handled once, by `overflow-x: clip` on html/body
 *    in globals.css, not by clamping the effect here.
 * 3. Radial gradients rather than a blur filter. A 120px blur on three
 *    viewport-sized elements is a real per-frame cost on a page that also has
 *    a live-updating table; a gradient with a soft falloff is free and looks
 *    the same.
 *
 * Three hues at once — cyan, magenta, violet — layered with real
 * transparency so they blend at the edges. That is specifically correct in
 * this voice and specifically wrong in the other six.
 */
export function Backdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-0 select-none">
      <div className="gridlines absolute inset-[-10%]" />

      <div
        data-glow-drift
        className="absolute left-[-25%] top-[-30%] h-[75vmax] w-[75vmax]"
        style={{
          background:
            "radial-gradient(circle at center, var(--cyan) 0%, color-mix(in srgb, var(--cyan) 40%, transparent) 28%, transparent 62%)",
          opacity: 0.28,
        }}
      />
      <div
        data-glow-drift
        className="absolute right-[-30%] top-[10%] h-[65vmax] w-[65vmax]"
        style={{
          background:
            "radial-gradient(circle at center, var(--violet) 0%, color-mix(in srgb, var(--violet) 35%, transparent) 30%, transparent 64%)",
          opacity: 0.22,
          animationDelay: "-6s",
        }}
      />
      <div
        data-glow-drift
        className="absolute bottom-[-35%] left-[20%] h-[60vmax] w-[60vmax]"
        style={{
          background:
            "radial-gradient(circle at center, var(--magenta) 0%, color-mix(in srgb, var(--magenta) 30%, transparent) 26%, transparent 58%)",
          opacity: 0.16,
          animationDelay: "-11s",
        }}
      />

      {/* Vignette. Keeps the glow off the page edges so panel borders stay
          readable against it rather than dissolving into the wash. */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "radial-gradient(120% 90% at 50% 0%, transparent 30%, var(--void) 100%)",
        }}
      />
    </div>
  );
}
