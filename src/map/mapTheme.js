// Theme contract — flat values only.
// Every value in nightTheme / dayTheme MUST be a flat hex string or a flat number.
// Zoom-dependent or expression-based paint (interpolations, ramps, step functions)
// lives in arkade-style.json — NOT here. tweenMapTheme linearly interpolates these
// values and will crash on anything non-flat.
//
// THEMED_LAYER_IDS is the single source of truth for what is themable. applyMapTheme
// iterates this list — it does NOT walk map.getStyle().layers or string-match IDs.
//
// nightTheme exactly mirrors the static defaults already baked into arkade-style.json,
// so applyMapTheme(map, nightTheme) on load is a no-op that asserts the contract.

// Palette tokens — must match the CSS variables in src/index.css @theme block.
export const ESPRESSO  = "#3B2A22";
export const COCOA     = "#2A1D17";
export const GOLD      = "#C68A3A";
export const COPPER    = "#A85A33";
export const TWILIGHT  = "#16294A";
export const PLATINUM  = "#CFCBC8";
export const SILVER    = "#8A8480";
export const PAPER     = "#F4F1EB";
export const INK       = "#201B19";

// Every basemap layer ID that exists in arkade-style.json and is subject to theming.
// If you add a layer to the style, add its ID here AND give it entries in both themes.
export const THEMED_LAYER_IDS = [
  "bg",
  "landcover",
  "landuse",
  "park",
  "water",
  "waterway",
  "road-minor",
  "road-secondary",
  "road-primary",
  "road-motorway",
  "building",
  "building-3d",
  "boundary",
  "label-place-minor",
  "label-place-major",
  "label-road",
];

export const nightTheme = {
  bg:                 { "background-color": ESPRESSO },
  landcover:          { "fill-color": COCOA,    "fill-opacity": 0.6 },
  landuse:            { "fill-color": COCOA,    "fill-opacity": 0.4 },
  park:               { "fill-color": COCOA,    "fill-opacity": 0.75 },
  water:              { "fill-color": TWILIGHT, "fill-opacity": 1 },
  waterway:           { "line-color": TWILIGHT, "line-opacity": 1 },
  "road-minor":       { "line-color": SILVER,   "line-opacity": 0.25 },
  "road-secondary":   { "line-color": COPPER,   "line-opacity": 0.75 },
  "road-primary":     { "line-color": GOLD,     "line-opacity": 0.85 },
  "road-motorway":    { "line-color": GOLD,     "line-opacity": 1 },
  building:           { "fill-color": COCOA,    "fill-opacity": 0.85 },
  "building-3d":      { "fill-extrusion-color": COCOA, "fill-extrusion-opacity": 0.9 },
  boundary:           { "line-color": SILVER,   "line-opacity": 0.3 },
  "label-place-minor":{ "text-color": SILVER,   "text-halo-color": ESPRESSO, "text-halo-width": 1 },
  "label-place-major":{ "text-color": PAPER,    "text-halo-color": ESPRESSO, "text-halo-width": 1 },
  "label-road":       { "text-color": SILVER,   "text-halo-color": ESPRESSO, "text-halo-width": 1 },
};

export const dayTheme = {
  bg:                 { "background-color": PAPER },
  landcover:          { "fill-color": PLATINUM, "fill-opacity": 0.55 },
  landuse:            { "fill-color": PLATINUM, "fill-opacity": 0.4 },
  park:               { "fill-color": PLATINUM, "fill-opacity": 0.75 },
  water:              { "fill-color": TWILIGHT, "fill-opacity": 0.55 },
  waterway:           { "line-color": TWILIGHT, "line-opacity": 0.6 },
  "road-minor":       { "line-color": SILVER,   "line-opacity": 0.35 },
  "road-secondary":   { "line-color": GOLD,     "line-opacity": 0.75 },
  "road-primary":     { "line-color": COPPER,   "line-opacity": 0.85 },
  "road-motorway":    { "line-color": COPPER,   "line-opacity": 1 },
  building:           { "fill-color": PLATINUM, "fill-opacity": 0.9 },
  "building-3d":      { "fill-extrusion-color": PLATINUM, "fill-extrusion-opacity": 0.85 },
  boundary:           { "line-color": SILVER,   "line-opacity": 0.35 },
  "label-place-minor":{ "text-color": SILVER,   "text-halo-color": PAPER, "text-halo-width": 1 },
  "label-place-major":{ "text-color": INK,      "text-halo-color": PAPER, "text-halo-width": 1 },
  "label-road":       { "text-color": SILVER,   "text-halo-color": PAPER, "text-halo-width": 1 },
};

export function themeFor(mode) {
  return mode === "day" ? dayTheme : nightTheme;
}
