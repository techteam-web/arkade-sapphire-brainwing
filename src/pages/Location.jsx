import { useRef, useState } from "react";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";
import LocationMap from "../map/LocationMap.jsx";
import { CATEGORIES } from "../map/locationData.js";

export default function Location() {
  const rootRef = useRef(null);
  const titleRef = useRef(null);
  const rowsRef = useRef([]);
  const mapRef = useRef(null);

  const [openCat, setOpenCat] = useState(null);
  const [activeId, setActiveId] = useState(null);
  const [hoveredId, setHoveredId] = useState(null);

  useGSAP(
    () => {
      gsap.set(titleRef.current, { opacity: 0, y: "0.5rem" });
      gsap.set(rowsRef.current, { opacity: 0, y: "0.4rem" });
      gsap.set(mapRef.current, { opacity: 0, y: "0.5rem" });

      const tl = gsap.timeline({ delay: 0.2 });
      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "auraExpo" })
        .to(
          rowsRef.current,
          { opacity: 1, y: 0, duration: 0.55, ease: "auraExpo", stagger: 0.08 },
          "-=0.45"
        )
        .to(mapRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "auraExpo" }, "-=0.55");

      return () => tl.kill();
    },
    { scope: rootRef }
  );

  const toggleCat = (id) => setOpenCat((c) => (c === id ? null : id));
  const selectPoi = (id) => setActiveId((cur) => (cur === id ? null : id));

  return (
    <main ref={rootRef} className="relative w-screen h-screen overflow-hidden bg-espresso">
      <div className="absolute inset-x-20 top-20 bottom-16 grid grid-cols-12 gap-12 mob:flex mob:flex-col mob:inset-x-4 mob:top-16 mob:bottom-4 mob:gap-4">
        <section className="col-span-5 min-w-0 flex flex-col min-h-0 mob:order-2 mob:flex-1">
          <h1
            ref={titleRef}
            className="font-display text-paper text-3xl leading-none tracking-[-0.01em] mob:text-2xl"
          >
            Location
          </h1>

          <p className="mt-4 text-[0.62rem] tracking-[0.32em] uppercase text-silver/70 mob:mt-2">
            Browse by category · tap a landmark to trace the route
          </p>

          <div className="-mr-2 mt-7 flex min-h-0 flex-1 flex-col overflow-y-auto pr-2 mob:mt-3">
            {CATEGORIES.map((cat, i) => {
              const isOpen = openCat === cat.id;
              return (
                <div
                  key={cat.id}
                  ref={(el) => (rowsRef.current[i] = el)}
                  className={`border-b transition-colors duration-300 ${
                    isOpen ? "border-gold/40" : "border-platinum/10"
                  }`}
                >
                  {/* Category header */}
                  <button
                    type="button"
                    data-interactive
                    onClick={() => toggleCat(cat.id)}
                    className="group flex w-full items-center justify-between gap-4 py-4 text-left"
                  >
                    <span className="flex items-baseline gap-3">
                      <span
                        className={`text-[0.72rem] tracking-[0.3em] uppercase transition-colors duration-300 ${
                          isOpen ? "text-gold" : "text-paper/85 group-hover:text-paper"
                        }`}
                      >
                        {cat.label}
                      </span>
                      <span className="text-[0.58rem] tabular-nums text-silver/45">
                        {String(cat.pois.length).padStart(2, "0")}
                      </span>
                    </span>
                    <svg
                      viewBox="0 0 24 24"
                      className={`w-3.5 h-3.5 shrink-0 transition-all duration-300 ${
                        isOpen ? "rotate-180 text-gold" : "text-silver/60 group-hover:text-paper/80"
                      }`}
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.6"
                    >
                      <path d="M6 9l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>

                  {/* Landmarks (dropdown) */}
                  <div
                    className={`grid transition-all duration-500 ease-out ${
                      isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0"
                    }`}
                  >
                    <ul className="overflow-hidden">
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
                              className="group flex w-full items-baseline justify-between gap-4 py-2.5 pl-1 text-left"
                            >
                              <span className="flex items-baseline gap-3 min-w-0">
                                <span
                                  className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300 ${
                                    isActive ? "bg-gold" : "bg-platinum/25 group-hover:bg-gold/60"
                                  }`}
                                />
                                <span
                                  className={`text-[0.85rem] text-left truncate transition-colors duration-300 ${
                                    isActive ? "text-paper" : "text-paper/75 group-hover:text-paper"
                                  }`}
                                >
                                  {poi.place}
                                </span>
                              </span>
                              <span className={`text-[0.8rem] shrink-0 ${isActive ? "text-gold" : "text-gold/70"}`}>
                                {poi.time}
                              </span>
                            </button>
                          </li>
                        );
                      })}
                      <li className="h-2" aria-hidden />
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        <section className="col-span-7 min-w-0 flex items-center justify-center mob:order-1 mob:w-full mob:h-[44vh]">
          <LocationMap
            mapRef={mapRef}
            activePoiId={activeId}
            activeCategory={openCat}
            hoveredId={hoveredId}
            onSelect={setActiveId}
            onHover={setHoveredId}
          />
        </section>
      </div>
    </main>
  );
}
