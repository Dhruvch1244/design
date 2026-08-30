"use client";

import { useSyncExternalStore } from "react";

// Query-string reads for the playground permalinks, modeled on the same
// useSyncExternalStore pattern this site already uses for theme/accent
// (theme-toggle.tsx, palette-picker.tsx) — getServerSnapshot always returns
// null so the hydration-matching render never diverges from the static
// export's defaults, and React's own post-hydration snapshot recheck (not
// an effect we write) is what surfaces the real value afterward. This
// avoids the react-hooks/set-state-in-effect rule entirely: there's no
// setState inside a useEffect body anywhere in this file.
const URL_PARAM_EVENT = "dsgn:url-param-change";

export function setUrlParam(key: string, value: string) {
  const params = new URLSearchParams(window.location.search);
  params.set(key, value);
  window.history.replaceState(null, "", `${window.location.pathname}?${params}${window.location.hash}`);
  window.dispatchEvent(new Event(URL_PARAM_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(URL_PARAM_EVENT, callback);
  window.addEventListener("popstate", callback);
  return () => {
    window.removeEventListener(URL_PARAM_EVENT, callback);
    window.removeEventListener("popstate", callback);
  };
}

function getServerSnapshot() {
  return null;
}

/** Reads one URL query param reactively; null when absent. Client-only value — always null during the static build/hydration pass. */
export function useUrlParam(key: string): string | null {
  const getSnapshot = () => new URLSearchParams(window.location.search).get(key);
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
