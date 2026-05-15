import { useRef } from "react";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";
import LocationMap from "../map/LocationMap.jsx";
import { POIS } from "../map/locationData.js";

export default function Location() {
  const rootRef = useRef(null);
  const titleRef = useRef(null);
  const rowsRef = useRef([]);
  const mapRef = useRef(null);

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
        .to(
          mapRef.current,
          { opacity: 1, y: 0, duration: 0.8, ease: "auraExpo" },
          "-=0.55"
        );

      return () => tl.kill();
    },
    { scope: rootRef }
  );

  return (
    <main
      ref={rootRef}
      className="relative w-screen h-screen overflow-hidden bg-espresso"
    >
      <div className="absolute inset-x-20 top-20 bottom-16 grid grid-cols-12 gap-12">
        <section className="col-span-5 flex flex-col">
          <h1
            ref={titleRef}
            className="font-display text-paper text-3xl leading-none tracking-[-0.01em]"
          >
            Location
          </h1>

          <ul className="mt-10 flex flex-col">
            {POIS.map((poi, i) => (
              <li
                key={poi.id}
                ref={(el) => (rowsRef.current[i] = el)}
                className="flex items-baseline justify-between py-3.5 border-b border-platinum/10"
              >
                <span className="text-[0.9rem] text-paper/85">{poi.place}</span>
                <span className="text-gold text-[0.85rem]">{poi.time}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="col-span-7 flex items-center justify-center">
          <LocationMap mapRef={mapRef} />
        </section>
      </div>
    </main>
  );
}
