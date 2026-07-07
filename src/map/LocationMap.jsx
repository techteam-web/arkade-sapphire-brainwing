import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Map, Marker, AttributionControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import "maplibre-gl/dist/maplibre-gl.css";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";
import { applyMapTheme, tweenMapTheme } from "./applyMapTheme.js";
import { nightTheme, themeFor } from "./mapTheme.js";
import { SITE, SITE_CAMERA, POIS, CATEGORIES, findPoi } from "./locationData.js";
import baseStyle from "./arkade-style.json";

const MAPTILER_KEY = import.meta.env.VITE_MAPTILER_KEY ?? "";

const EMPTY_FC = { type: "FeatureCollection", features: [] };

// Route theme coloring — Day optimized for a vivid Google Maps style blue
const ROUTE_NIGHT = "#2FE0C4";
const ROUTE_DAY = "#1A73E8"; 

const ROUTE_DASH_NIGHT = "#EAFFF9"; 
const ROUTE_DASH_DAY = "#0D47A1";

const routeColor = (m) => (m === "day" ? ROUTE_DAY : ROUTE_NIGHT);
const dashColor = (m) => (m === "day" ? ROUTE_DASH_DAY : ROUTE_DASH_NIGHT);

const DASH_SEQUENCE = [
  [0, 4, 3], [0.5, 4, 2.5], [1, 4, 2], [1.5, 4, 1.5],
  [2, 4, 1], [2.5, 4, 0.5], [3, 4, 0], [0, 0.5, 3, 3.5],
  [0, 1, 3, 3], [0, 1.5, 3, 2.5], [0, 2, 3, 2],
  [0, 2.5, 3, 1.5], [0, 3, 3, 1], [0, 3.5, 3, 0.5],
];

function buildStyle() {
  const raw = JSON.stringify(baseStyle);
  if (MAPTILER_KEY) {
    return JSON.parse(raw.replaceAll("{key}", MAPTILER_KEY));
  }
  const style = JSON.parse(raw);
  style.glyphs = "https://tiles.openfreemap.org/fonts/{fontstack}/{range}.pbf";
  style.sources.openmaptiles = {
    type: "vector",
    url: "https://tiles.openfreemap.org/planet",
  };
  return style;
}

function haversineMeters(a, b) {
  const R = 6371000;
  const toRad = (d) => (d * Math.PI) / 180;
  const dLat = toRad(b.lat - a.lat);
  const dLng = toRad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(a.lat)) * Math.cos(toRad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

async function fetchDirections(from, to) {
  const url =
    `https://router.project-osrm.org/route/v1/driving/` +
    `${from.lng},${from.lat};${to.lng},${to.lat}` +
    `?overview=full&geometries=geojson&steps=false`;
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Routing failed: ${res.status}`);
  const data = await res.json();
  const route = data.routes?.[0];
  if (!route) throw new Error("No route returned");
  return { geometry: route.geometry, distance: route.distance };
}

export default function LocationMap({
  mapRef,
  activePoiId = null,
  activeCategory = null,
  hoveredId = null,
  onSelect,
  onHover,
}) {
  const rootRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const dashTweenRef = useRef(null);
  const [mode, setMode] = useState("night");
  const [ready, setReady] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);

  const mapStyle = useMemo(() => buildStyle(), []);

  const handleLoad = useCallback((event) => {
    const map = event.target;
    mapInstanceRef.current = map;
    applyMapTheme(map, nightTheme);

    if (!map.getSource("route")) {
      map.addSource("route", { type: "geojson", data: EMPTY_FC });
      map.addLayer({
        id: "route-glow",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": routeColor(mode), "line-width": 18, "line-opacity": 0.28, "line-blur": 8 },
      });
      map.addLayer({
        id: "route-base",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": routeColor(mode), "line-width": 4, "line-opacity": 0.95 },
      });
      map.addLayer({
        id: "route-dash",
        type: "line",
        source: "route",
        layout: { "line-cap": "round", "line-join": "round" },
        paint: { "line-color": dashColor(mode), "line-width": 1.75, "line-opacity": 1, "line-dasharray": [0, 4, 3] },
      });
    }
    setReady(true);
  }, [mode]);

  const { contextSafe } = useGSAP(() => {}, { scope: rootRef });

  const setModeWithTween = contextSafe((next) => {
    if (next === mode) return;
    const map = mapInstanceRef.current;
    tweenMapTheme(map, themeFor(mode), themeFor(next));
    const c = routeColor(next);
    const dc = dashColor(next);
    if (map?.getLayer("route-glow")) map.setPaintProperty("route-glow", "line-color", c);
    if (map?.getLayer("route-base")) map.setPaintProperty("route-base", "line-color", c);
    if (map?.getLayer("route-dash")) map.setPaintProperty("route-dash", "line-color", dc);
    setMode(next);
  });

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !ready) return;
    const src = map.getSource("route");
    let cancelled = false;

    if (!activePoiId) {
      src?.setData(EMPTY_FC);
      setRouteInfo(null);
      return;
    }

    const poi = findPoi(activePoiId);
    if (!poi) return;

    (async () => {
      let geometry;
      let distanceMeters;
      try {
        const r = await fetchDirections(SITE, poi);
        geometry = r.geometry;
        distanceMeters = r.distance;
      } catch {
        geometry = {
          type: "LineString",
          coordinates: [[SITE.lng, SITE.lat], [poi.lng, poi.lat]],
        };
        distanceMeters = haversineMeters(SITE, poi);
      }
      if (cancelled) return;

      src?.setData({ type: "Feature", properties: {}, geometry });
      setRouteInfo({ poi, distanceKm: (distanceMeters / 1000).toFixed(1) });

      const coords = geometry.coordinates;
      const bounds = coords.reduce(
        (b, c) => b.extend(c),
        new maplibregl.LngLatBounds(coords[0], coords[0])
      );
      map.fitBounds(bounds, {
        padding: { top: 90, bottom: 90, left: 80, right: 80 },
        duration: 1600,
        pitch: 48,
        bearing: -14,
        maxZoom: 16,
        essential: true,
      });
    })();

    return () => {
      cancelled = true;
    };
  }, [activePoiId, ready]);

  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map || !ready || activePoiId) return;

    const cat = activeCategory ? CATEGORIES.find((c) => c.id === activeCategory) : null;
    if (cat) {
      const pts = [[SITE.lng, SITE.lat], ...cat.pois.map((p) => [p.lng, p.lat])];
      const bounds = pts.reduce(
        (b, c) => b.extend(c),
        new maplibregl.LngLatBounds(pts[0], pts[0])
      );
      map.fitBounds(bounds, {
        padding: { top: 90, bottom: 90, left: 80, right: 80 },
        duration: 1400,
        pitch: 42,
        bearing: -14,
        maxZoom: 15.5,
        essential: true,
      });
    } else {
      map.easeTo({
        center: [SITE.lng, SITE.lat],
        zoom: SITE_CAMERA.zoom,
        pitch: SITE_CAMERA.pitch,
        bearing: SITE_CAMERA.bearing,
        duration: 1400,
        essential: true,
      });
    }
  }, [activeCategory, activePoiId, ready]);

  useGSAP(
    () => {
      const map = mapInstanceRef.current;
      if (!map || !routeInfo) return;
      const proxy = { step: 0 };
      dashTweenRef.current = gsap.to(proxy, {
        step: DASH_SEQUENCE.length,
        duration: DASH_SEQUENCE.length * 0.07,
        repeat: -1,
        ease: "none",
        onUpdate: () => {
          if (!map.getLayer("route-dash")) return;
          const idx = Math.floor(proxy.step) % DASH_SEQUENCE.length;
          map.setPaintProperty("route-dash", "line-dasharray", DASH_SEQUENCE[idx]);
        },
      });
      return () => {
        dashTweenRef.current?.kill();
        dashTweenRef.current = null;
      };
    },
    { dependencies: [routeInfo], scope: rootRef }
  );

  const toggle = (id) => onSelect?.(activePoiId === id ? null : id);

  return (
    <div
      ref={(node) => {
        rootRef.current = node;
        if (mapRef) mapRef.current = node;
      }}
      className="relative w-full h-full overflow-hidden"
    >
      <style dangerouslySetInnerHTML={{__html: `
        ::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />

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
        {/* Site marker */}
        <Marker longitude={SITE.lng} latitude={SITE.lat} anchor="bottom">
          <div className="flex flex-col items-center pointer-events-none">
            <span className="flex items-center whitespace-nowrap mb-1.5 px-2.5 py-1 bg-espresso/80 border border-gold/40">
              <img
                src="/arkade-logo-light.webp"
                alt="Arkade Sapphire"
                draggable="false"
                className="h-3.5 w-auto object-contain select-none"
              />
            </span>
            <span className="relative w-3 h-3">
              <span className="absolute inset-0 rounded-full bg-gold/40 animate-ping" />
              <span className="absolute inset-0 rounded-full bg-gold ring-2 ring-paper/40 shadow-[0_0_0.5rem_rgba(198,138,58,0.65)]" />
            </span>
          </div>
        </Marker>

        {/* POI markers */}
        {POIS.map((poi) => {
          const isActive = activePoiId === poi.id;
          const isHover = hoveredId === poi.id;
          const lifted = isActive || isHover;
          const dimmed = activeCategory && poi.category !== activeCategory && !isActive;
          return (
            <Marker key={poi.id} longitude={poi.lng} latitude={poi.lat} anchor="center">
              <button
                type="button"
                data-interactive
                onClick={() => toggle(poi.id)}
                onMouseEnter={() => onHover?.(poi.id)}
                onMouseLeave={() => onHover?.(null)}
                style={{ opacity: dimmed ? 0.25 : 1 }}
                className="relative flex flex-col items-center bg-transparent border-0 p-0 transition-opacity duration-500"
                aria-label={poi.place}
              >
                <span
                  className={`block rounded-full transition-all duration-300 ${
                    isActive
                      ? "w-3.5 h-3.5 bg-gold ring-2 ring-paper/60 shadow-[0_0_0.7rem_rgba(198,138,58,0.8)]"
                      : isHover
                      ? "w-3 h-3 bg-gold/90 ring-2 ring-paper/40"
                      : "w-2 h-2 bg-paper/80 ring-1 ring-gold/60"
                  }`}
                />
                <span
                  className={`absolute bottom-full mb-2 whitespace-nowrap px-2 py-1 bg-espresso/90 border border-gold/40 text-[0.6rem] tracking-[0.18em] uppercase transition-all duration-300 ${
                    lifted ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 pointer-events-none"
                  }`}
                >
                  <span className="text-paper">{poi.place}</span>
                  <span className="text-gold ml-2">{poi.time}</span>
                </span>
              </button>
            </Marker>
          );
        })}

        <AttributionControl compact position="bottom-left" />
      </Map>

      {/* Top scrim */}
      <div
        aria-hidden
        className="absolute top-0 left-0 right-0 h-20 bg-linear-to-b from-canvas/55 to-transparent pointer-events-none z-10"
      />
      
      {/* Left-edge seam gradient */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none z-10 mob:hidden"
        style={{ background: "linear-gradient(90deg, rgba(20,14,9,0.25) 0%, rgba(20,14,9,0) 14%)" }}
      />

      {/* Route info card */}
      {routeInfo && (
        <div className="absolute left-6 top-6 z-20 w-72 bg-espresso/85 border border-gold/30 backdrop-blur-md px-5 py-4 shadow-[0_8px_32px_rgba(0,0,0,0.5)] mob:left-3 mob:top-3 mob:w-56 mob:px-3 mob:py-2.5">
          <div className="flex items-start gap-3 mob:gap-2">
            <span className="mt-1 w-8 h-8 rounded-full border border-gold/60 bg-gold/10 flex items-center justify-center shrink-0 mob:hidden">
              <svg viewBox="0 0 24 24" className="w-4 h-4 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M3 11l19-9-9 19-2-8-8-2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <div className="flex-1 min-w-0">
              <p className="text-[0.55rem] tracking-[0.28em] uppercase text-silver/80 mob:text-[0.48rem] mob:tracking-[0.2em]">
                From Arkade Sapphire
              </p>
              <h3 className="mt-1 font-display text-paper text-lg leading-tight truncate mob:mt-0.5 mob:text-sm">
                {routeInfo.poi.place}
              </h3>
              <div className="mt-3 flex items-center gap-5 mob:mt-1.5 mob:gap-3">
                <div>
                  <p className="text-[0.5rem] tracking-[0.24em] uppercase text-silver/70 mob:tracking-[0.16em]">Distance</p>
                  <p className="text-paper text-sm mt-0.5 tabular-nums mob:text-xs mob:mt-0">{routeInfo.distanceKm} km</p>
                </div>
                <span className="w-px h-7 bg-platinum/20 mob:h-5" />
                <div>
                  <p className="text-[0.5rem] tracking-[0.24em] uppercase text-silver/70 mob:tracking-[0.16em]">Drive</p>
                  <p className="text-gold text-sm mt-0.5 mob:text-xs mob:mt-0">{routeInfo.poi.time}</p>
                </div>
              </div>
            </div>
            <button
              type="button"
              data-interactive
              onClick={() => onSelect?.(null)}
              aria-label="Clear route"
              className="w-7 h-7 rounded-full border border-platinum/25 flex items-center justify-center text-platinum/70 hover:text-paper hover:border-gold/60 transition-colors shrink-0 mob:w-5 mob:h-5"
            >
              <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 mob:w-3 mob:h-3" fill="none" stroke="currentColor" strokeWidth="1.6">
                <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
              </svg>
            </button>
          </div>
        </div>
      )}

      {/* Day/night capsule switch */}
      <div
        className="absolute right-10 top-[4.6rem] z-20 flex items-center gap-[2px] rounded-full p-[0.4rem] backdrop-blur-md mob:left-4 mob:right-auto mob:top-16"
        style={{ background: "rgba(20,16,12,0.55)", border: "1px solid rgba(214,161,105,0.3)" }}
      >
        {["day", "night"].map((m) => (
          <button
            key={m}
            type="button"
            data-interactive
            onClick={() => setModeWithTween(m)}
            className={`rounded-full border-0 px-[1.4rem] py-[0.6rem] text-[0.7rem] font-bold uppercase tracking-[0.08em] transition-colors duration-300 ${
              mode === m ? "bg-copperlite text-canvas" : "bg-transparent text-taupe2 hover:text-linen"
            }`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}