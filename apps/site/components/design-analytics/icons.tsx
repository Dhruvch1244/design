import type { SVGProps } from "react";

/**
 * A hand-rolled icon set rather than a dependency.
 *
 * Two reasons, both from the philosophy this project is demonstrating:
 * the set is small, frozen, and fully understood (pillar 7 — reach for a
 * dozen lines before a package with its own transitive tree and update
 * cadence), and it lets every glyph share one geometry: 24px box, 1.6
 * stroke, round caps and joins. A general-purpose icon library mixes stroke
 * weights across its catalogue, which reads as inconsistent at 16px in a
 * dense UI — exactly the size everything here renders at.
 *
 * Every icon is decorative by default (aria-hidden); the accessible name
 * belongs on the control that wraps it, not on the glyph.
 */
type IconProps = SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.6}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export function IconOverview(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="3" y="3" width="7.5" height="7.5" rx="1.5" />
      <rect x="13.5" y="3" width="7.5" height="4.5" rx="1.5" />
      <rect x="13.5" y="10.5" width="7.5" height="10.5" rx="1.5" />
      <rect x="3" y="13.5" width="7.5" height="7.5" rx="1.5" />
    </Icon>
  );
}

export function IconPulse(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 12h3.5l2.5-6 4 12 2.5-6H21" />
    </Icon>
  );
}

export function IconFunnel(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M3 4.5h18l-6.75 7.5v7.2l-4.5 2.3v-9.5z" />
    </Icon>
  );
}

export function IconSources(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="6" cy="18" r="2.6" />
      <circle cx="18" cy="6" r="2.6" />
      <circle cx="18" cy="18" r="2.6" />
      <path d="M8.4 16.4 15.6 8.2M8.6 18h6.8" />
    </Icon>
  );
}

export function IconBell(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M6 9.5a6 6 0 1 1 12 0c0 3.1.7 4.8 1.6 5.9.4.5.1 1.3-.6 1.3H5c-.7 0-1-.8-.6-1.3C5.3 14.3 6 12.6 6 9.5Z" />
      <path d="M10 20.2a2.4 2.4 0 0 0 4 0" />
    </Icon>
  );
}

export function IconSettings(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h10M18 7h2M4 17h2M10 17h10" />
      <circle cx="16" cy="7" r="2.2" />
      <circle cx="8" cy="17" r="2.2" />
    </Icon>
  );
}

export function IconSearch(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 4.5 4.5" />
    </Icon>
  );
}

export function IconMenu(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 7h16M4 12h16M4 17h16" />
    </Icon>
  );
}

export function IconClose(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m6 6 12 12M18 6 6 18" />
    </Icon>
  );
}

export function IconSun(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2.5v2M12 19.5v2M4.2 4.2l1.4 1.4M18.4 18.4l1.4 1.4M2.5 12h2M19.5 12h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4" />
    </Icon>
  );
}

export function IconMoon(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M20 13.5A8.2 8.2 0 0 1 10.5 4a8.5 8.5 0 1 0 9.5 9.5Z" />
    </Icon>
  );
}

export function IconChevronDown(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m7 9.5 5 5 5-5" />
    </Icon>
  );
}

export function IconChevronRight(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="m9.5 6 5 6-5 6" />
    </Icon>
  );
}

export function IconMore(props: IconProps) {
  return (
    <Icon {...props} strokeWidth={2}>
      <path d="M5 12h.01M12 12h.01M19 12h.01" />
    </Icon>
  );
}

export function IconDownload(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M12 3.5v11M8 11l4 3.5 4-3.5" />
      <path d="M4.5 16v2.5a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2V16" />
    </Icon>
  );
}

export function IconArrowUp(props: IconProps) {
  return (
    <Icon {...props} strokeWidth={2}>
      <path d="M12 19V6M6.5 11.5 12 6l5.5 5.5" />
    </Icon>
  );
}

export function IconArrowDown(props: IconProps) {
  return (
    <Icon {...props} strokeWidth={2}>
      <path d="M12 5v13M6.5 12.5 12 18l5.5-5.5" />
    </Icon>
  );
}

export function IconUsers(props: IconProps) {
  return (
    <Icon {...props}>
      <circle cx="9.5" cy="8" r="3.2" />
      <path d="M3.5 19.5a6 6 0 0 1 12 0" />
      <path d="M16.5 5.2a3.2 3.2 0 0 1 0 5.6M17.5 14.2a6 6 0 0 1 3 5.3" />
    </Icon>
  );
}

export function IconTrash(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4.5 6.5h15M9.5 6.5V5a1.5 1.5 0 0 1 1.5-1.5h2A1.5 1.5 0 0 1 14.5 5v1.5" />
      <path d="M6.5 6.5 7.4 19a1.6 1.6 0 0 0 1.6 1.5h6a1.6 1.6 0 0 0 1.6-1.5l.9-12.5" />
      <path d="M10.5 10.5v6M13.5 10.5v6" />
    </Icon>
  );
}

export function IconCopy(props: IconProps) {
  return (
    <Icon {...props}>
      <rect x="9" y="9" width="11.5" height="11.5" rx="2" />
      <path d="M15 5.8A2.3 2.3 0 0 0 12.7 3.5H5.8A2.3 2.3 0 0 0 3.5 5.8v6.9A2.3 2.3 0 0 0 5.8 15" />
    </Icon>
  );
}

export function IconInspect(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M14 3.5h6.5V10" />
      <path d="M20.5 3.5 13 11" />
      <path d="M19 14.5v4a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-11a2 2 0 0 1 2-2h4" />
    </Icon>
  );
}

export function IconBook(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M4 5.2A1.7 1.7 0 0 1 5.7 3.5H10a2.5 2.5 0 0 1 2 1v14a2.5 2.5 0 0 0-2-1H5.7A1.7 1.7 0 0 1 4 16.8Z" />
      <path d="M20 5.2a1.7 1.7 0 0 0-1.7-1.7H14a2.5 2.5 0 0 0-2 1v14a2.5 2.5 0 0 1 2-1h4.3a1.7 1.7 0 0 0 1.7-1.7Z" />
    </Icon>
  );
}

export function IconSpark(props: IconProps) {
  return (
    <Icon {...props}>
      <path d="M13.5 3 5 13.5h5.5L9.5 21 18 10.5h-5.5z" />
    </Icon>
  );
}

/** Halyard's wordmark glyph: a rising three-bar mast, drawn not imported. */
export function HalyardMark(props: IconProps) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" focusable="false" {...props}>
      <rect x="1.5" y="1.5" width="21" height="21" rx="6" fill="currentColor" opacity="0.1" />
      <rect
        x="1.5"
        y="1.5"
        width="21"
        height="21"
        rx="6"
        stroke="currentColor"
        strokeOpacity="0.25"
      />
      <path
        d="M7 16.5V11M12 16.5V7M17 16.5v-3"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
