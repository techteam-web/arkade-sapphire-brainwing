import { useRef } from "react";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";
import PlaceholderMedia from "../components/PlaceholderMedia.jsx";

const CONNECTIVITY = [
  { place: "Western Express Highway",    time: "2 mins"  },
  { place: "Santacruz Station",          time: "3 mins"  },
  { place: "Metro Line 2A / 7",          time: "7 mins"  },
  { place: "Domestic Airport (T1)",      time: "10 mins" },
  { place: "SCLR",                       time: "15 mins" },
  { place: "Bandra-Worli Sealink",       time: "20 mins" },
  { place: "International Airport (T2)", time: "20 mins" },
  { place: "JVLR",                       time: "30 mins" },
];

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
            {CONNECTIVITY.map((row, i) => (
              <li
                key={row.place}
                ref={(el) => (rowsRef.current[i] = el)}
                className="flex items-baseline justify-between py-3.5 border-b border-platinum/10"
              >
                <span className="text-[0.9rem] text-paper/85">{row.place}</span>
                <span className="text-gold text-[0.85rem]">{row.time}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="col-span-7 flex items-center justify-center">
          <div ref={mapRef} className="w-full h-full">
            <PlaceholderMedia />
          </div>
        </section>
      </div>
    </main>
  );
}
