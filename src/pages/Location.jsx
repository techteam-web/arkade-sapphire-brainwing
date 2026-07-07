import { useRef, useState } from "react";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";
import LocationMap from "../map/LocationMap.jsx";
import { CATEGORIES } from "../map/locationData.js";

const SIDEBAR_BG = "radial-gradient(140% 100% at 0% 0%, #33251c 0%, #201510 65%)";

export default function Location() {
  const rootRef = useRef(null);
  const titleRef = useRef(null);
  const introRef = useRef(null);
  const rowsRef = useRef([]);
  const mapRef = useRef(null);

  const [openCat, setOpenCat] = useState(CATEGORIES[0].id);
  const [activeId, setActiveId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  useGSAP(
    () => {
      gsap.set([titleRef.current, introRef.current], { opacity: 0, y: "0.5rem" });
      gsap.set(rowsRef.current, { opacity: 0, y: "0.4rem" });
      gsap.set(mapRef.current, { opacity: 0 });

      const tl = gsap.timeline({ delay: 0.2 });
      tl.to(mapRef.current, { opacity: 1, duration: 1.1, ease: "auraEase" }, 0)
        .to(titleRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "auraExpo" }, 0.1)
        .to(introRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "auraExpo" }, "-=0.5")
        .to(rowsRef.current, { opacity: 1, y: 0, duration: 0.55, ease: "auraExpo", stagger: 0.08 }, "-=0.4");

      return () => tl.kill();
    },
    { scope: rootRef }
  );

  const toggleCat = (id) => setOpenCat((c) => (c === id ? null : id));
  const selectPoi = (id) => setActiveId((cur) => (cur === id ? null : id));

  return (
    <main
      ref={rootRef}
      className="relative flex h-screen w-screen overflow-hidden bg-canvas font-manrope mob:flex-col"
    >
      {/* ── LEFT · category sidebar ──────────────────────────────── */}
      <aside
        className="flex w-[34rem] shrink-0 flex-col px-[2.6rem] pb-[2.4rem] pt-24 mob:order-2 mob:h-auto mob:w-full mob:flex-1 mob:px-4 mob:pb-6 mob:pt-5"
        style={{ background: SIDEBAR_BG, borderRight: `1px solid rgba(214,161,105,0.14)` }}
      >
        <h1 ref={titleRef} className="font-news text-[2.6rem] leading-none text-cream mob:text-[2rem]">
          Location
        </h1>
        <p
          ref={introRef}
          className="mt-[0.6rem] text-[1.1rem] leading-relaxed tracking-[0.06em] text-taupe mob:mt-2 mob:text-[0.72rem]"
        >
          Browse by category · tap a landmark to trace the route
        </p>

        <div className="-mr-2 mt-[2.2rem] flex min-h-0 flex-1 flex-col gap-[0.8rem] overflow-y-auto pr-2 mob:mt-4">
          {CATEGORIES.map((cat, i) => {
            const isOpen = openCat === cat.id;
            const count = String(cat.pois.length).padStart(2, "0");
            return (
              <div key={cat.id} ref={(el) => (rowsRef.current[i] = el)} className="shrink-0">
                {/* Category header */}
                <button
                  type="button"
                  data-interactive
                  onClick={() => toggleCat(cat.id)}
                  className={`flex w-full items-center justify-between rounded-[1rem] border-l-2 bg-transparent py-[1.4rem] pl-[1.6rem] pr-[1.6rem] text-left transition-all duration-300 ${
                    isOpen ? "border-copperlite" : "border-transparent hover:pl-[1.9rem]"
                  }`}
                  style={isOpen ? { background: "rgba(214,161,105,0.12)" } : undefined}
                >
                  <span
                    className={`text-[1.25rem] uppercase tracking-[0.08em] transition-colors duration-300 ${
                      isOpen ? "font-bold text-cream" : "font-semibold text-sand"
                    }`}
                  >
                    {cat.label}
                  </span>
                  <span className="flex items-center gap-[1rem]">
                    <span
                      className={`text-[1.1rem] font-bold tabular-nums transition-colors duration-300 ${
                        isOpen ? "text-copperlite" : "text-taupe2"
                      }`}
                      style={isOpen ? { background: "rgba(217,154,92,0.18)", padding: "0.2rem 0.8rem", borderRadius: "1rem" } : undefined}
                    >
                      {count}
                    </span>
                    <svg
                      viewBox="0 0 12 8"
                      className={`h-[0.8rem] w-[1.2rem] shrink-0 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`}
                      fill="none"
                    >
                      <path d="M1 1l5 5 5-5" stroke={isOpen ? "#d99a5c" : "#6b6055"} strokeWidth="1.6" />
                    </svg>
                  </span>
                </button>

                {/* Landmarks (accordion) */}
                <div
                  className={`grid transition-all duration-500 ease-out ${
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                  }`}
                >
                  <ul className="overflow-hidden px-[1.6rem]">
                    {cat.pois.map((poi) => {
                      const isActive = activeId === poi.id;
                      return (
                        <li key={poi.id}>
                          <button
                            type="button"
                            data-interactive
                            onClick={() => selectPoi(poi.id)}
                            onMouseEnter={() => setHoveredId(poi.id)}
                            onMouseLeave={() => setHoveredId(null)}
                            className="group flex w-full items-baseline justify-between gap-4 py-[0.9rem] text-left"
                            style={{ borderTop: "1px solid rgba(214,161,105,0.08)" }}
                          >
                            <span className="flex min-w-0 items-baseline gap-[0.9rem]">
                              <span
                                className={`h-[0.5rem] w-[0.5rem] shrink-0 rounded-full transition-colors duration-300 ${
                                  isActive ? "bg-copperlite" : "bg-linen/25 group-hover:bg-copperlite/60"
                                }`}
                              />
                              <span
                                className={`truncate text-[1.15rem] transition-colors duration-300 ${
                                  isActive ? "text-cream" : "text-sand/80 group-hover:text-cream"
                                }`}
                              >
                                {poi.place}
                              </span>
                            </span>
                            <span className={`shrink-0 text-[1.1rem] ${isActive ? "text-copperlite" : "text-copperlite/70"}`}>
                              {poi.time}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                    <li className="h-[0.6rem]" aria-hidden />
                  </ul>
                </div>
              </div>
            );
          })}
        </div>
      </aside>

      {/* ── RIGHT · full-bleed map ───────────────────────────────── */}
      <section className="relative min-w-0 flex-1 mob:order-1 mob:h-[46vh] mob:flex-none">
        <LocationMap
          mapRef={mapRef}
          activePoiId={activeId}
          activeCategory={openCat}
          hoveredId={hoveredId}
          onSelect={setActiveId}
          onHover={setHoveredId}
        />
      </section>
    </main>
  );
}
