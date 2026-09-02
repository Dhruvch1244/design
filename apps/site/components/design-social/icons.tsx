/**
 * Thrum's icon set.
 *
 * Hand-drawn rather than installed. A social feed needs about fourteen
 * glyphs; pulling an icon package for that is the exact "npm install
 * left-pad" shape the dsgn philosophy's std-first pillar rules out — and it
 * would also hand a third party control of the stroke weight, which is a
 * voice decision here, not an implementation detail.
 *
 * Every glyph is a 24x24 viewBox, `stroke="currentColor"`, stroke width
 * 1.5, no fills. One shared wrapper means the weight is a single edit.
 */

import * as React from "react";
import { cn } from "@/lib/utils";

type IconProps = React.SVGProps<SVGSVGElement>;

function Glyph({ className, children, ...props }: IconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      className={cn("h-5 w-5 shrink-0", className)}
      {...props}
    >
      {children}
    </svg>
  );
}

export function HomeIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M3.5 10.5 12 3.75l8.5 6.75V19a1.25 1.25 0 0 1-1.25 1.25H4.75A1.25 1.25 0 0 1 3.5 19z" />
      <path d="M9.5 20.25v-6h5v6" />
    </Glyph>
  );
}

export function CompassIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="8.5" />
      <path d="m15 9-1.9 4.1L9 15l1.9-4.1z" />
    </Glyph>
  );
}

export function BellIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M6.25 10a5.75 5.75 0 0 1 11.5 0c0 3.1.7 4.9 1.5 5.9H4.75c.8-1 1.5-2.8 1.5-5.9Z" />
      <path d="M10.25 19a1.9 1.9 0 0 0 3.5 0" />
    </Glyph>
  );
}

export function UserIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="8.5" r="3.75" />
      <path d="M4.75 20.25a7.25 7.25 0 0 1 14.5 0" />
    </Glyph>
  );
}

/** Thrum's spark — the like. Deliberately not a heart. */
export function SparkIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M12 3.25 13.9 9l5.85 1.9L13.9 12.8 12 18.55 10.1 12.8 4.25 10.9 10.1 9z" />
      <path d="M18.75 16.5 19.5 18.6l2.1.75-2.1.75-.75 2.1-.75-2.1-2.1-.75 2.1-.75z" />
    </Glyph>
  );
}

export function ReplyIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M20.25 11.25c0 3.87-3.7 7-8.25 7a9.6 9.6 0 0 1-2.6-.35L4.5 19.75l1.3-3.4a6.55 6.55 0 0 1-2.05-4.6c0-3.87 3.7-7 8.25-7s8.25 3.13 8.25 7Z" />
    </Glyph>
  );
}

export function EchoIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M4.75 9.25V8a2.25 2.25 0 0 1 2.25-2.25h9.25" />
      <path d="m13.75 3 2.75 2.75-2.75 2.75" />
      <path d="M19.25 14.75V16a2.25 2.25 0 0 1-2.25 2.25H7.75" />
      <path d="M10.25 21 7.5 18.25l2.75-2.75" />
    </Glyph>
  );
}

export function MoreIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <circle cx="5.5" cy="12" r="1.1" />
      <circle cx="12" cy="12" r="1.1" />
      <circle cx="18.5" cy="12" r="1.1" />
    </Glyph>
  );
}

export function SearchIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <circle cx="10.75" cy="10.75" r="6.5" />
      <path d="m15.5 15.5 4.25 4.25" />
    </Glyph>
  );
}

export function PenIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M15.5 4.75 19.25 8.5 8.5 19.25 3.75 20.25l1-4.75z" />
      <path d="m13.5 6.75 3.75 3.75" />
    </Glyph>
  );
}

export function ChevronIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="m6.75 9.5 5.25 5 5.25-5" />
    </Glyph>
  );
}

export function CheckIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="m4.75 12.5 4.5 4.5 10-10.5" />
    </Glyph>
  );
}

export function VerifiedIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="m12 3.25 2.35 1.9 3-.2.55 2.96 2.6 1.53-1.3 2.72 1.3 2.72-2.6 1.53-.55 2.96-3-.2L12 21.06l-2.35-1.89-3 .2-.55-2.96-2.6-1.53 1.3-2.72-1.3-2.72 2.6-1.53.55-2.96 3 .2z" />
      <path d="m9 12.2 2.1 2.05 4-4.4" />
    </Glyph>
  );
}

export function MenuIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M4.25 7.5h15.5" />
      <path d="M4.25 12h15.5" />
      <path d="M4.25 16.5h10.5" />
    </Glyph>
  );
}

export function SettingsIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <circle cx="12" cy="12" r="2.9" />
      <path d="M12 3.25h.9l.45 2.2a6.9 6.9 0 0 1 1.85.78l1.9-1.2 1.28 1.27-1.2 1.9c.34.57.6 1.19.78 1.85l2.2.45v1.8l-2.2.45a6.9 6.9 0 0 1-.78 1.85l1.2 1.9-1.27 1.28-1.9-1.2c-.58.34-1.2.6-1.86.78l-.45 2.2h-1.8l-.45-2.2a6.9 6.9 0 0 1-1.85-.78l-1.9 1.2-1.28-1.27 1.2-1.9a6.9 6.9 0 0 1-.78-1.86l-2.2-.45v-1.8l2.2-.45c.18-.66.44-1.28.78-1.85l-1.2-1.9L6.9 5.03l1.9 1.2c.57-.34 1.19-.6 1.85-.78l.45-2.2z" />
    </Glyph>
  );
}

export function InboxIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M3.75 13.5h4l1.25 2.5h6l1.25-2.5h4" />
      <path d="M5.6 5.25h12.8l1.85 8.25v4.25a1.25 1.25 0 0 1-1.25 1.25H5a1.25 1.25 0 0 1-1.25-1.25V13.5z" />
    </Glyph>
  );
}

export function PlusIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M12 5.25v13.5" />
      <path d="M5.25 12h13.5" />
    </Glyph>
  );
}

export function RoomIcon(props: IconProps) {
  return (
    <Glyph {...props}>
      <path d="M4.25 8.25h15.5" />
      <path d="M4.25 15.75h15.5" />
      <path d="M10.5 3.75 8.75 20.25" />
      <path d="M15.75 3.75 14 20.25" />
    </Glyph>
  );
}

/** Icon lookup for the view registry, which stores an icon *name*, not a node. */
export const VIEW_ICONS = {
  home: HomeIcon,
  compass: CompassIcon,
  bell: BellIcon,
  user: UserIcon,
} as const;
