import { useEffect, useState } from "react";

// `mob` in index.css is (max-width: 480px) — keep the two in step.
const MOBILE_QUERY = "(max-width: 480px)";
const REDUCED_QUERY = "(prefers-reduced-motion: reduce)";

// Devices that should get the cheap animation path. The width-only `mob` query
// misses a phone held in landscape (e.g. 844x390), which is plainly still a
// phone — hence the coarse-pointer + short-viewport arm.
const LIGHT_MOTION_QUERY = "(max-width: 480px), (pointer: coarse) and (max-height: 540px)";

const useMediaQuery = (query) => {
  const [matches, setMatches] = useState(
    () => typeof window !== "undefined" && window.matchMedia?.(query).matches
  );

  useEffect(() => {
    if (!window.matchMedia) return;
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener("change", onChange);
    return () => mql.removeEventListener("change", onChange);
  }, [query]);

  return !!matches;
};

export const useIsMobile = () => useMediaQuery(MOBILE_QUERY);
export const usePrefersReducedMotion = () => useMediaQuery(REDUCED_QUERY);
export const usePrefersLightMotion = () => useMediaQuery(LIGHT_MOTION_QUERY);
