import { gsap } from "../gsap/gsapConfig.js";
import { THEMED_LAYER_IDS } from "./mapTheme.js";

// applyMapTheme — flat write. Iterates the explicit themed-layer-ID allowlist and
// calls setPaintProperty for every (layerId, paintProp, value) tuple. Does NOT walk
// map.getStyle().layers, does NOT filter by string-matching IDs.
//
// Skips layers that aren't on the map yet (defensive: lets us call this from onLoad
// even if the style is still settling).
export function applyMapTheme(map, theme) {
  if (!map) return;
  for (const id of THEMED_LAYER_IDS) {
    const layerPaint = theme[id];
    if (!layerPaint) continue;
    if (!map.getLayer(id)) continue;
    for (const prop of Object.keys(layerPaint)) {
      map.setPaintProperty(id, prop, layerPaint[prop]);
    }
  }
}

function parseHex(hex) {
  const h = hex.replace("#", "");
  return [
    parseInt(h.slice(0, 2), 16),
    parseInt(h.slice(2, 4), 16),
    parseInt(h.slice(4, 6), 16),
  ];
}

function toHex(r, g, b) {
  const c = (v) => v.toString(16).padStart(2, "0");
  return `#${c(r)}${c(g)}${c(b)}`;
}

function mixHex(a, b, t) {
  const [ar, ag, ab] = parseHex(a);
  const [br, bg, bb] = parseHex(b);
  return toHex(
    Math.round(ar + (br - ar) * t),
    Math.round(ag + (bg - ag) * t),
    Math.round(ab + (bb - ab) * t)
  );
}

function mix(from, to, t) {
  if (typeof from === "number" && typeof to === "number") {
    return from + (to - from) * t;
  }
  if (typeof from === "string" && typeof to === "string") {
    return mixHex(from, to, t);
  }
  // Mismatched or non-flat — fall through to target value (defensive; the contract
  // guard below should have prevented this).
  return to;
}

// Build a flat list of (layerId, paintProp, from, to) tuples once, up front.
// Asserts the theme contract: every value must be a flat string or number — if
// someone slips an expression array or object into a theme, this throws loudly
// instead of silently producing visual garbage.
function buildTween(fromTheme, toTheme) {
  const tuples = [];
  for (const id of THEMED_LAYER_IDS) {
    const fromPaint = fromTheme[id];
    const toPaint = toTheme[id];
    if (!fromPaint || !toPaint) continue;
    for (const prop of Object.keys(toPaint)) {
      const from = fromPaint[prop];
      const to = toPaint[prop];
      if (from === undefined || to === undefined) continue;
      if (
        !(typeof from === "string" || typeof from === "number") ||
        !(typeof to === "string" || typeof to === "number")
      ) {
        throw new Error(
          `mapTheme contract violation: ${id}.${prop} must be a flat hex string or number, got ${typeof from} → ${typeof to}. Move expressions to arkade-style.json.`
        );
      }
      tuples.push({ id, prop, from, to });
    }
  }
  return tuples;
}

const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia &&
  window.matchMedia("(prefers-reduced-motion: reduce)").matches;

// tweenMapTheme — proxy-tweens a {t: 0→1} object with auraExpo, mixing every paint
// value on each frame and writing it via setPaintProperty. Returns the GSAP tween so
// the caller's useGSAP context can auto-kill it on unmount or when re-invoked.
//
// If the user prefers reduced motion, jumps straight to the target theme.
export function tweenMapTheme(map, fromTheme, toTheme, { duration = 0.6, ease = "auraExpo" } = {}) {
  if (!map) return null;

  if (prefersReducedMotion()) {
    applyMapTheme(map, toTheme);
    return null;
  }

  const tuples = buildTween(fromTheme, toTheme);
  const proxy = { t: 0 };

  return gsap.to(proxy, {
    t: 1,
    duration,
    ease,
    onUpdate: () => {
      const t = proxy.t;
      for (const tup of tuples) {
        if (!map.getLayer(tup.id)) continue;
        map.setPaintProperty(tup.id, tup.prop, mix(tup.from, tup.to, t));
      }
    },
  });
}
