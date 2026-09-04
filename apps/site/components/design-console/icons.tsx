import * as React from "react";
import {
  CHECK_GEOMETRY,
  PLUS_GEOMETRY,
  SEARCH_GEOMETRY,
} from "@/components/icons/shared";

/**
 * One icon set, hand-drawn on a single 24px grid at 1.5 stroke — the same
 * grid and weight the dsgn registry uses for the chevrons it ships inside
 * accordion/pagination/select. Mixing in a second icon library would put two
 * different stroke weights next to each other in the same table row, which
 * reads as sloppy immediately.
 *
 * Icons are decorative here by default (aria-hidden); anything conveying
 * meaning on its own carries a sibling <span class="sr-only"> at the call
 * site instead of a title element, so the accessible name lives with the
 * control rather than with the glyph.
 */
type IconProps = React.SVGProps<SVGSVGElement>;

function Icon({ children, ...props }: IconProps & { children: React.ReactNode }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
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

export const IconGauge = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 20a8 8 0 1 0-8-8" />
    <path d="M4 12h2m12 0h2M12 4v2" />
    <path d="m12 12 4.5-3.5" />
    <circle cx="12" cy="12" r="1.2" />
  </Icon>
);

export const IconKey = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="7.5" cy="15.5" r="3.5" />
    <path d="m10 13 8-8 3 3-2 2-2-2-1.5 1.5 2 2L15 13l-2-2" />
  </Icon>
);

export const IconWebhook = (p: IconProps) => (
  <Icon {...p}>
    <path d="M9 9a3 3 0 1 1 4.2 2.75L16 17" />
    <path d="M18.5 13.5a3 3 0 1 1-1.8 5.4H10" />
    <path d="M6.5 18.9A3 3 0 1 1 5.7 13L9 8" />
  </Icon>
);

export const IconPulse = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3 12h3.5l2-6 3.5 12 2.5-7 1.5 3H21" />
  </Icon>
);

export const IconFlag = (p: IconProps) => (
  <Icon {...p}>
    <path d="M5 21V4" />
    <path d="M5 4.5h11l-2 3.5 2 3.5H5" />
  </Icon>
);

export const IconEye = (p: IconProps) => (
  <Icon {...p}>
    <path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" />
    <circle cx="12" cy="12" r="2.75" />
  </Icon>
);

export const IconEyeOff = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 4.5 20 19.5" />
    <path d="M9.6 9.7A2.75 2.75 0 0 0 12 14.75c.72 0 1.38-.28 1.87-.73" />
    <path d="M6.4 6.9C4.1 8.5 2.5 12 2.5 12s3.5 6.5 9.5 6.5c1.5 0 2.8-.4 3.9-1" />
    <path d="M17.8 15.2c2-1.6 3.7-3.2 3.7-3.2S18 5.5 12 5.5c-.9 0-1.7.15-2.5.4" />
  </Icon>
);

export const IconCopy = (p: IconProps) => (
  <Icon {...p}>
    <rect x="9" y="9" width="11" height="11" rx="2" />
    <path d="M5 15H4.5A1.5 1.5 0 0 1 3 13.5v-9A1.5 1.5 0 0 1 4.5 3h9A1.5 1.5 0 0 1 15 4.5V5" />
  </Icon>
);

export const IconRotate = (p: IconProps) => (
  <Icon {...p}>
    <path d="M20 12a8 8 0 1 1-2.4-5.7" />
    <path d="M20.5 4v4h-4" />
  </Icon>
);

export const IconTrash = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 6.5h16" />
    <path d="M9.5 6.5V4.8A1.3 1.3 0 0 1 10.8 3.5h2.4a1.3 1.3 0 0 1 1.3 1.3v1.7" />
    <path d="M6.5 6.5 7.4 19a1.5 1.5 0 0 0 1.5 1.4h6.2a1.5 1.5 0 0 0 1.5-1.4l.9-12.5" />
    <path d="M10.5 10v6.5M13.5 10v6.5" />
  </Icon>
);

export const IconMore = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="5" cy="12" r="1.1" fill="currentColor" />
    <circle cx="12" cy="12" r="1.1" fill="currentColor" />
    <circle cx="19" cy="12" r="1.1" fill="currentColor" />
  </Icon>
);

export const IconChevronDown = (p: IconProps) => (
  <Icon {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);

export const IconChevronRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="m9 6 6 6-6 6" />
  </Icon>
);

/* Three glyphs below draw geometry shared with the other showcases (see
   components/icons/shared.tsx). Only the geometry is shared — the wrapper
   above still owns this set's 1.5 stroke and round caps. */
export const IconPlus = (p: IconProps) => <Icon {...p}>{PLUS_GEOMETRY}</Icon>;

export const IconSearch = (p: IconProps) => <Icon {...p}>{SEARCH_GEOMETRY}</Icon>;

export const IconCheck = (p: IconProps) => <Icon {...p}>{CHECK_GEOMETRY}</Icon>;

export const IconWarning = (p: IconProps) => (
  <Icon {...p}>
    <path d="M12 4.5 21 19.5H3L12 4.5Z" />
    <path d="M12 10v4" />
    <circle cx="12" cy="16.8" r="0.9" fill="currentColor" stroke="none" />
  </Icon>
);

export const IconInfo = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M12 11v5.5" />
    <circle cx="12" cy="8" r="0.9" fill="currentColor" stroke="none" />
  </Icon>
);

export const IconTerminal = (p: IconProps) => (
  <Icon {...p}>
    <rect x="3" y="4.5" width="18" height="15" rx="2" />
    <path d="m7.5 10 2.5 2.2-2.5 2.2M13 15h4" />
  </Icon>
);

export const IconGlobe = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17" />
    <path d="M12 3.5c2.2 2.4 3.3 5.4 3.3 8.5S14.2 18.1 12 20.5c-2.2-2.4-3.3-5.4-3.3-8.5S9.8 5.9 12 3.5Z" />
  </Icon>
);

export const IconBolt = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13.5 3 5 13.5h5.5L10 21l8.5-10.5H13L13.5 3Z" />
  </Icon>
);

export const IconArrowUpRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 17 17 7M8.5 7H17v8.5" />
  </Icon>
);

export const IconArrowDownRight = (p: IconProps) => (
  <Icon {...p}>
    <path d="M7 7l10 10M17 8.5V17H8.5" />
  </Icon>
);

export const IconInbox = (p: IconProps) => (
  <Icon {...p}>
    <path d="M3.5 13.5h4l1.5 3h6l1.5-3h4" />
    <path d="M5.4 5.2 3.5 13.5v4A1.5 1.5 0 0 0 5 19h14a1.5 1.5 0 0 0 1.5-1.5v-4L18.6 5.2A1.5 1.5 0 0 0 17.2 4H6.8a1.5 1.5 0 0 0-1.4 1.2Z" />
  </Icon>
);

export const IconExternal = (p: IconProps) => (
  <Icon {...p}>
    <path d="M13.5 4.5H19.5V10.5" />
    <path d="M19.5 4.5 11 13" />
    <path d="M18 14v4.5A1.5 1.5 0 0 1 16.5 20h-11A1.5 1.5 0 0 1 4 18.5v-11A1.5 1.5 0 0 1 5.5 6H10" />
  </Icon>
);

export const IconFilter = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 6h16l-6 7v5.5l-4 1.5V13L4 6Z" />
  </Icon>
);

export const IconUndo = (p: IconProps) => (
  <Icon {...p}>
    <path d="M4 9h10a5 5 0 0 1 0 10h-3.5" />
    <path d="M7.5 5.5 4 9l3.5 3.5" />
  </Icon>
);

export const IconLive = (p: IconProps) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="2.5" fill="currentColor" stroke="none" />
    <path d="M7.8 7.8a6 6 0 0 0 0 8.4M16.2 16.2a6 6 0 0 0 0-8.4" />
    <path d="M5 5a10 10 0 0 0 0 14M19 19a10 10 0 0 0 0-14" />
  </Icon>
);
