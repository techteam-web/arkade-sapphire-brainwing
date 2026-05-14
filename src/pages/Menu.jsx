import { useRef } from "react";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";
import { useTransition } from "../context/transition.js";

const ROWS = [
  { num: "01", name: "Views",     path: "/views"     },
  { num: "02", name: "Gallery",   path: "/gallery"   },
  { num: "03", name: "Floorplan", path: "/floorplan" },
  { num: "04", name: "Location",  path: "/location"  },
  { num: "05", name: "Brochure",  path: "/brochure"  },
  { num: "06", name: "Showcase",  path: "/showcase"  },
];

export default function Menu() {
  const { navigateTo } = useTransition();
  const rootRef = useRef(null);
  const rowsRef = useRef([]);

  useGSAP(
    () => {
      gsap.set(rowsRef.current, { opacity: 0, y: "0.6rem" });
      const tl = gsap.to(rowsRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "auraExpo",
        stagger: 0.07,
        delay: 0.25,
      });
      return () => tl.kill();
    },
    { scope: rootRef }
  );

  return (
    <main
      ref={rootRef}
      className="relative w-screen h-screen overflow-hidden bg-espresso"
    >
      <div className="absolute inset-0 flex flex-col justify-center px-20">
        <ul className="flex flex-col">
          {ROWS.map((row, i) => (
            <li key={row.path}>
              <button
                type="button"
                data-interactive
                ref={(el) => (rowsRef.current[i] = el)}
                onClick={() => navigateTo(row.path)}
                className="group flex items-baseline gap-8 bg-transparent border-0 p-0 py-4 text-left w-full"
              >
                <span className="font-display text-silver text-base leading-none w-10 group-hover:text-gold transition-colors duration-300">
                  {row.num}
                </span>
                <span className="text-paper/85 text-2xl tracking-[0.16em] uppercase font-sans font-medium group-hover:text-paper transition-colors duration-300">
                  {row.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </main>
  );
}
