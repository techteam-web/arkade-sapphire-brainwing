import { useRef, useState } from "react";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";
import { useTransition } from "../context/transition.js";
import AuraShowcase from "../components/AuraShowcase.jsx";

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
  const imgWrapRef = useRef(null);
  const heroImgRef = useRef(null);
  const kenRef = useRef(null);
  const [auraOpen, setAuraOpen] = useState(false);

  useGSAP(
    () => {
      gsap.set(imgWrapRef.current, { clipPath: "inset(0% 0% 0% 100%)" });
      gsap.set(heroImgRef.current, { scale: 1.2 });
      gsap.set(rowsRef.current, { opacity: 0, y: "0.6rem" });

      const tl = gsap.timeline({ delay: 0.2 });
      tl.to(imgWrapRef.current, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "auraExpo" }, 0)
        .to(heroImgRef.current, { scale: 1, duration: 1.9, ease: "auraExpo" }, 0)
        .to(
          rowsRef.current,
          { opacity: 1, y: 0, duration: 0.7, ease: "auraExpo", stagger: 0.07 },
          0.35
        )
        .add(() => {
          kenRef.current = gsap.to(heroImgRef.current, {
            scale: 1.08,
            duration: 16,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        });

      return () => {
        tl.kill();
        kenRef.current?.kill();
      };
    },
    { scope: rootRef }
  );

  return (
    <main ref={rootRef} className="relative w-screen h-screen overflow-hidden bg-espresso">
      {/* Full-height render — bleeds off the right on desktop, full-bleed on phones */}
      <div
        ref={imgWrapRef}
        className="absolute top-0 right-0 bottom-0 w-[52%] overflow-hidden mob:inset-0 mob:w-full"
      >
        <img
          ref={heroImgRef}
          src="/aminities/golden-hour.webp"
          alt="Arkade Sapphire"
          draggable="false"
          className="edge-fade w-full h-full object-cover select-none"
        />
        {/* Phone-only scrim so the nav stays legible over the render */}
        <div className="hidden mob:block absolute inset-0 pointer-events-none bg-linear-to-r from-espresso via-espresso/75 to-espresso/30" />
      </div>

      {/* Subtle warm glow behind the nav for depth */}
      <div
        aria-hidden
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[55%] h-[65%] pointer-events-none"
        style={{
          background:
            "radial-gradient(55% 55% at 30% 50%, rgba(198,138,58,0.08), rgba(59,42,34,0) 72%)",
        }}
      />

      {/* Navigation */}
      <div className="absolute inset-y-0 left-20 z-10 flex flex-col justify-center mob:left-0 mob:right-0 mob:px-7">
        <ul className="flex flex-col">
          {ROWS.map((row, i) => (
            <li key={row.path}>
              <button
                type="button"
                data-interactive
                ref={(el) => (rowsRef.current[i] = el)}
                onClick={() => navigateTo(row.path)}
                className="group flex items-baseline gap-8 bg-transparent border-0 p-0 py-4 text-left w-fit mob:gap-5 mob:py-3.5"
              >
                <span className="font-display text-silver text-base leading-none w-10 group-hover:text-gold transition-colors duration-300 mob:w-7">
                  {row.num}
                </span>
                <span className="text-paper/85 text-2xl tracking-[0.16em] uppercase font-sans font-medium group-hover:text-paper transition-colors duration-300 mob:text-xl">
                  {row.name}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      {/* Arkade Aura — opens the render showcase */}
      <button
        type="button"
        data-interactive
        onClick={() => setAuraOpen(true)}
        className="group absolute bottom-10 left-20 z-20 inline-flex items-center gap-3 border border-gold/45 bg-espresso/30 backdrop-blur-sm px-5 py-3 transition-colors duration-300 hover:border-gold hover:bg-gold/10 mob:bottom-6 mob:left-7 mob:px-4 mob:py-2.5"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-gold" fill="none" stroke="currentColor" strokeWidth="1.5">
          <rect x="3" y="3" width="18" height="18" rx="2" />
          <circle cx="8.5" cy="8.5" r="1.5" />
          <path d="M21 15l-5-5L5 21" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span className="text-[0.7rem] tracking-[0.28em] uppercase text-paper/85 transition-colors group-hover:text-gold mob:text-[0.62rem]">
          Arkade Aura
        </span>
      </button>

      <AuraShowcase open={auraOpen} onClose={() => setAuraOpen(false)} />

      {/* Film grain for filmic texture + gradient smoothing */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none opacity-[0.05] mix-blend-soft-light"
        style={{
          backgroundImage:
            "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")",
          backgroundSize: "160px 160px",
        }}
      />
    </main>
  );
}
