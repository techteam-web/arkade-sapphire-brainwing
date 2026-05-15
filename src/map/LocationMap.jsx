import { useCallback, useMemo, useRef, useState } from "react";
import { Map, Marker, AttributionControl } from "react-map-gl/maplibre";
import "maplibre-gl/dist/maplibre-gl.css";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";
import { applyMapTheme, tweenMapTheme } from "./applyMapTheme.js";
import { nightTheme, themeFor, GOLD } from "./mapTheme.js";
import { SITE, SITE_CAMERA, POIS } from "./locationData.js";
import baseStyle from "./arkade-style.json";

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY ?? "";

// Build the style object exactly ONCE per component mount: deep-clone the in-repo
// style and interpolate the MapTiler key into the source + glyphs URL templates.
// react-map-gl receives this as a stable reference and never reloads it — day/night
// is purely setPaintProperty against the live map.
function buildStyle() {
  return JSON.parse(JSON.stringify(baseStyle).replaceAll("{key}", MAPTILER_KEY));
}

export default function LocationMap({ mapRef }) {
  const rootRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [mode, setMode] = useState("night");

  // mapStyle is computed once. NEVER swap this prop on the Map at runtime —
  // doing so would trigger a full style reload and destroy any custom layers
  // we've added (the whole point of this architecture is to avoid that).
  const mapStyle = useMemo(() => buildStyle(), []);

  const handleLoad = useCallback((event) => {
    const map = event.target;
    mapInstanceRef.current = map;

    // Contract-asserting no-op: the style ships with night colors baked in, so
    // this should produce zero visible change. If something flashes here it
    // means the static defaults in arkade-style.json have drifted from
    // nightTheme in mapTheme.js — fix one or the other.
    applyMapTheme(map, nightTheme);

    // Empty route source + 3 line layers (glow, base, dash). Added once and
    // persisted across day/night toggles because the style never reloads.
    // Phase 4 populates the source and drives the dash-offset tween.
    if (!map.getSource("route")) {
      map.addSource("route", {
        type: "geojson",
        data: { type: "FeatureCollection", features: [] },
      });
      map.addLayer({
        id: "route-glow",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": GOLD,
          "line-width": 14,
          "line-opacity": 0.18,
          "line-blur": 6,
        },
      });
      map.addLayer({
        id: "route-base",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": GOLD,
          "line-width": 3,
          "line-opacity": 0.85,
        },
      });
      map.addLayer({
        id: "route-dash",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: {
          "line-color": GOLD,
          "line-width": 1.5,
          "line-opacity": 1,
          "line-dasharray": [0, 4, 3],
        },
      });
    }
  }, []);

  // useGSAP scope owns every tween LocationMap creates. contextSafe wraps event
  // handlers so tweens spawned from clicks register with this context and are
  // auto-killed on unmount — no manual .kill() bookkeeping.
  const { contextSafe } = useGSAP(() => {}, { scope: rootRef });

  const setModeWithTween = contextSafe((next) => {
    if (next === mode) return;
    const fromTheme = themeFor(mode);
    const toTheme = themeFor(next);
    tweenMapTheme(mapInstanceRef.current, fromTheme, toTheme);
    setMode(next);
  });

  return (
    <div
      ref={(node) => {
        rootRef.current = node;
        if (mapRef) mapRef.current = node;
      }}
      className="relative w-full h-full overflow-hidden"
    >
      <Map
        initialViewState={{
          longitude: SITE.lng,
          latitude: SITE.lat,
          zoom: SITE_CAMERA.zoom,
          pitch: SITE_CAMERA.pitch,
          bearing: SITE_CAMERA.bearing,
        }}
        mapStyle={mapStyle}
        onLoad={handleLoad}
        attributionControl={false}
        maxPitch={75}
        dragRotate={true}
        touchPitch={true}
        style={{ width: "100%", height: "100%" }}
      >
        <Marker longitude={SITE.lng} latitude={SITE.lat} anchor="bottom">
          <div className="flex flex-col items-center pointer-events-none">
            <span className="font-display text-paper text-[0.85rem] tracking-[0.12em] uppercase whitespace-nowrap mb-1.5 px-2 py-0.5 bg-espresso/75 border border-gold/40">
              Arkade Sapphire
            </span>
            <span className="w-2.5 h-2.5 rounded-full bg-gold ring-2 ring-paper/40 shadow-[0_0_0.5rem_rgba(198,138,58,0.65)]" />
          </div>
        </Marker>

        {/* POI markers — rendered now (Phase 1) so they're visible on the map.
            Phase 3 will wire hover/click → flyTo via activePoiId. */}
        {POIS.map((poi) => (
          <Marker
            key={poi.id}
            longitude={poi.lng}
            latitude={poi.lat}
            anchor="center"
          >
            <span
              data-poi-id={poi.id}
              className="block w-1.5 h-1.5 rounded-full bg-paper/85 ring-1 ring-gold/60 pointer-events-none"
              aria-label={poi.place}
            />
          </Marker>
        ))}

        <AttributionControl compact position="bottom-left" />
      </Map>

      {/* Top scrim — invisible in night, lifts chrome (Menu + MuteToggle)
          legibility in day. Always present so we don't need PersistentChrome
          to know about day/night state. Tradeoff: a tiny perpetual gradient
          even at night, accepted in exchange for zero coupling. */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-20 bg-linear-to-b from-espresso/55 to-transparent pointer-events-none z-10"
      />

      {/* Day/night toggle — bottom-right of map area to avoid collision with
          PersistentChrome's top-right Menu/MuteToggle. Mirrors the Floorplan
          typology-selector pattern: text buttons, gold active, paper/70 inactive. */}
      <div className="absolute bottom-6 right-6 flex gap-4 z-10">
        {["day", "night"].map((m) => (
          <button
            key={m}
            type="button"
            data-interactive
            onClick={() => setModeWithTween(m)}
            className={`bg-transparent border-0 p-0 text-[0.7rem] tracking-[0.32em] uppercase transition-colors duration-300 ${
              mode === m ? "text-gold" : "text-paper/70 hover:text-paper"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}
