import * as React from "react";
import { Avatar, AvatarImage, AvatarFallback } from "../avatar/avatar";
import { cn } from "../../lib/utils";

export interface AvatarGroupItem {
  src?: string;
  alt?: string;
  fallback: React.ReactNode;
}

export interface AvatarGroupProps {
  avatars: AvatarGroupItem[];
  /** How many avatars render before the rest collapse into a trailing "+N" avatar. Default 5. */
  max?: number;
  className?: string;
  /** Applied to every rendered Avatar, including the trailing "+N" one. */
  avatarClassName?: string;
}

/**
 * A row of overlapping Avatars -- negative margin stacking plus a
 * `ring-background` border so each one separates cleanly against whatever
 * sits behind it. `max` collapses any overflow into a trailing "+N" avatar
 * styled identically to the real ones. `zIndex` descends left-to-right so
 * earlier avatars stack visually on top, matching the overlap direction.
 */
export function AvatarGroup({ avatars, max = 5, className, avatarClassName }: AvatarGroupProps) {
  const visible = avatars.slice(0, max);
  const overflow = avatars.length - visible.length;

  return (
    <div className={cn("flex items-center -space-x-3", className)}>
      {visible.map((avatar, i) => (
        <Avatar
          key={i}
          className={cn("ring-2 ring-background", avatarClassName)}
          style={{ zIndex: visible.length - i }}
        >
          {avatar.src && <AvatarImage src={avatar.src} alt={avatar.alt ?? ""} />}
          <AvatarFallback>{avatar.fallback}</AvatarFallback>
        </Avatar>
      ))}
      {overflow > 0 && (
        <Avatar
          className={cn("ring-2 ring-background", avatarClassName)}
          style={{ zIndex: 0 }}
          aria-label={`${overflow} more`}
        >
          <AvatarFallback>+{overflow}</AvatarFallback>
        </Avatar>
      )}
    </div>
  );
}
