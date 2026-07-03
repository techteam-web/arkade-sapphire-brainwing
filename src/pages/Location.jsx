import { useRef, useState } from "react";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";
import LocationMap from "../map/LocationMap.jsx";
import { POIS } from "../map/locationData.js";

export default function Location() {
  const rootRef = useRef(null);
  const titleRef = useRef(null);
  const rowsRef = useRef([]);
  const mapRef = useRef(null);

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
          { opacity: 1, y: 0, duration: 0.55, ease: "auraExpo", stagger: 0.05 },
          "-=0.45"
        )
        .to(mapRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "auraExpo" }, "-=0.55");

      return () => tl.kill();
    },
    { scope: rootRef }
  );

  const select = (id) => setActiveId((cur) => (cur === id ? null : id));

  return (
    <main ref={rootRef} className="relative w-screen h-screen overflow-hidden bg-espresso">
      <div className="absolute inset-x-20 top-20 bottom-16 grid grid-cols-12 gap-12">
        <section className="col-span-5 min-w-0 flex flex-col">
          <h1
            ref={titleRef}
            className="font-display text-paper text-3xl leading-none tracking-[-0.01em]"
          >
            Location
          </h1>

          <p className="mt-4 text-[0.62rem] tracking-[0.32em] uppercase text-silver/70">
            Select a landmark to trace the route
          </p>

          <ul className="mt-8 flex flex-col">
            {POIS.map((poi, i) => {
              const isActive = activeId === poi.id;
              return (
                <li key={poi.id} ref={(el) => (rowsRef.current[i] = el)}>
                  <button
                    type="button"
                    data-interactive
                    onClick={() => select(poi.id)}
                    onMouseEnter={() => setHoveredId(poi.id)}
                    onMouseLeave={() => setHoveredId(null)}
                    className={`group w-full flex items-baseline justify-between gap-4 py-3.5 border-b transition-colors duration-300 ${
                      isActive ? "border-gold/50" : "border-platinum/10 hover:border-platinum/25"
                    }`}
                  >
                    <span className="flex items-baseline gap-3 min-w-0">
                      <span
                        className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors duration-300 ${
                          isActive ? "bg-gold" : "bg-platinum/30 group-hover:bg-gold/60"
                        }`}
                      />
                      <span
                        className={`text-[0.9rem] text-left truncate transition-colors duration-300 ${
                          isActive ? "text-paper" : "text-paper/85"
                        }`}
                      >
                        {poi.place}
                      </span>
                    </span>
                    <span className={`text-[0.85rem] shrink-0 ${isActive ? "text-gold" : "text-gold/80"}`}>
                      {poi.time}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        <section className="col-span-7 min-w-0 flex items-center justify-center">
          <LocationMap
            mapRef={mapRef}
            activePoiId={activeId}
            hoveredId={hoveredId}
            onSelect={setActiveId}
            onHover={setHoveredId}
          />
        </section>
      </div>
    </main>
  );
}
