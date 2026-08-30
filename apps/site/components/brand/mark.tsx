/**
 * The North Star mark.
 *
 * "Dhruv" (ध्रुव) is Sanskrit for the pole star — the one fixed point in the
 * sky that every other star appears to revolve around, historically used to
 * navigate by. That's the whole concept: an asymmetric four-point star (the
 * north spike is nearly twice the length of the other three, so it reads as
 * "pointing" rather than as a symmetric sparkle/AI-glyph) with a hollow
 * center — a compass rose's pivot, not a solid dot.
 *
 * Deliberately not the generic 4-point "sparkle" glyph every AI product
 * uses: the asymmetry and the punched-out center are what make it legible
 * as *this* mark at 16px in a favicon and not just noise.
 */
export function Mark({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M20 2 L24 16 L33 20 L24 24 L20 30 L16 24 L7 20 L16 16 Z
           M22.5 20 A2.5 2.5 0 1 1 17.5 20 A2.5 2.5 0 1 1 22.5 20 Z"
      />
    </svg>
  );
}
