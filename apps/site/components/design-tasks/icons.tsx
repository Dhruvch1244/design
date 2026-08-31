import * as React from "react";

/**
 * One hand-drawn icon set instead of a dependency.
 *
 * Two reasons, both from the brief this project was built against. The dsgn
 * philosophy's "small dependency for a screen of code" rule: this is ~20
 * paths, not a package with its own release cadence. And the soft-minimal
 * voice wants round and friendly rather than tall and technical — so every
 * glyph below is drawn on the same 24-unit grid at stroke 1.75 with round
 * caps and joins, which no general-purpose set gives you for free.
 *
 * Anything decorative gets aria-hidden by default; an icon that carries
 * meaning on its own is given a <title> at the call site instead.
 */

type IconProps = React.SVGProps<SVGSVGElement>;

function Glyph({ children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={1.75}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {children}
    </svg>
  );
}

/** The Alcove mark: an arch, filled, plus its recessed inner shadow. */
export function AlcoveMark(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" aria-hidden="true" {...props}>
      <path
        d="M4 21V11a8 8 0 0 1 16 0v10a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1Z"
        fill="currentColor"
        opacity="0.16"
      />
      <path
        d="M8 21v-9.5a4 4 0 0 1 8 0V21"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
      />
      <path
        d="M4 21V11a8 8 0 0 1 16 0v10"
        stroke="currentColor"
        strokeWidth={1.9}
        strokeLinecap="round"
      />
    </svg>
  );
}

export const SearchIcon = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-3.4-3.4" />
  </Glyph>
);

export const PlusIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M12 5v14M5 12h14" />
  </Glyph>
);

export const FilterIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M4 7h16M7 12h10M10 17h4" />
  </Glyph>
);

export const UndoIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M4 9h11a5 5 0 0 1 0 10h-4" />
    <path d="m8 5-4 4 4 4" />
  </Glyph>
);

export const SunIcon = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 3v1.6M12 19.4V21M4.6 12H3M21 12h-1.6M6.3 6.3 5.2 5.2M18.8 18.8l-1.1-1.1M17.7 6.3l1.1-1.1M5.2 18.8l1.1-1.1" />
  </Glyph>
);

export const MoonIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M20 13.5A8 8 0 0 1 10.5 4a8 8 0 1 0 9.5 9.5Z" />
  </Glyph>
);

export const MenuIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Glyph>
);

export const ChevronDownIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path d="m6 9.5 6 5.5 6-5.5" />
  </Glyph>
);

export const ChevronRightIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path d="m9.5 6 5.5 6-5.5 6" />
  </Glyph>
);

export const CheckIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path d="m5 12.5 4.5 4.5L19 7" />
  </Glyph>
);

export const MoreIcon = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="5.5" cy="12" r="1.1" fill="currentColor" />
    <circle cx="12" cy="12" r="1.1" fill="currentColor" />
    <circle cx="18.5" cy="12" r="1.1" fill="currentColor" />
  </Glyph>
);

export const BoardIcon = (p: IconProps) => (
  <Glyph {...p}>
    <rect x="3" y="4.5" width="5.5" height="15" rx="2" />
    <rect x="10.5" y="4.5" width="5.5" height="10.5" rx="2" />
    <rect x="18" y="4.5" width="3" height="7" rx="1.5" />
  </Glyph>
);

export const ListIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M9 7h11M9 12h11M9 17h11" />
    <circle cx="4.75" cy="7" r="1.1" fill="currentColor" />
    <circle cx="4.75" cy="12" r="1.1" fill="currentColor" />
    <circle cx="4.75" cy="17" r="1.1" fill="currentColor" />
  </Glyph>
);

export const TimelineIcon = (p: IconProps) => (
  <Glyph {...p}>
    <rect x="3.5" y="5.5" width="10" height="4" rx="2" />
    <rect x="8.5" y="14.5" width="12" height="4" rx="2" />
  </Glyph>
);

export const ArchiveIcon = (p: IconProps) => (
  <Glyph {...p}>
    <rect x="3.5" y="5" width="17" height="4.5" rx="2" />
    <path d="M5.5 9.5V18a2 2 0 0 0 2 2h9a2 2 0 0 0 2-2V9.5" />
    <path d="M10 13.5h4" />
  </Glyph>
);

export const CopyIcon = (p: IconProps) => (
  <Glyph {...p}>
    <rect x="9" y="9" width="11" height="11" rx="3" />
    <path d="M15 5.5a2 2 0 0 0-2-2H7a3.5 3.5 0 0 0-3.5 3.5v6a2 2 0 0 0 2 2" />
  </Glyph>
);

export const CommentIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M20 12.5a7 7 0 0 1-7 7H8l-4 2.5.9-3.6A7 7 0 0 1 11 4.5h2a7 7 0 0 1 7 7Z" />
  </Glyph>
);

export const ClockIcon = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="12" cy="12" r="8" />
    <path d="M12 7.75V12l2.75 1.75" />
  </Glyph>
);

export const InboxIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M3.5 13.5h4l1.5 3h6l1.5-3h4" />
    <path d="M5.6 5.2 3.5 13.5v3a3 3 0 0 0 3 3h11a3 3 0 0 0 3-3v-3L18.4 5.2A2 2 0 0 0 16.5 4h-9a2 2 0 0 0-1.9 1.2Z" />
  </Glyph>
);

export const PeopleIcon = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="9.5" cy="8.5" r="3.25" />
    <path d="M3.75 19.5a5.75 5.75 0 0 1 11.5 0" />
    <path d="M16 5.6a3.25 3.25 0 0 1 0 5.8M17.5 14.4a5.75 5.75 0 0 1 2.75 4.9" />
  </Glyph>
);

export const SettingsIcon = (p: IconProps) => (
  <Glyph {...p}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3.5v2M12 18.5v2M4.9 7.75l1.75 1M17.35 15.25l1.75 1M4.9 16.25l1.75-1M17.35 8.75l1.75-1" />
  </Glyph>
);

export const CloseIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path d="m6.5 6.5 11 11M17.5 6.5l-11 11" />
  </Glyph>
);

export const ArrowRightIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M4.5 12h15M14 6.5 19.5 12 14 17.5" />
  </Glyph>
);

export const SparkIcon = (p: IconProps) => (
  <Glyph {...p}>
    <path d="M12 4.5c.9 4 2.6 5.7 6.5 6.5-3.9.8-5.6 2.5-6.5 6.5-.9-4-2.6-5.7-6.5-6.5 3.9-.8 5.6-2.5 6.5-6.5Z" />
  </Glyph>
);
