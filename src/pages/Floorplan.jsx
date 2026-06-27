import { useRef, useState } from "react";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";
import PlaceholderMedia from "../components/PlaceholderMedia.jsx";

const TYPOLOGIES = [
  { 
    label: "3 BHK — Residencial", 
    carpet: "1,860 sq.ft.", 
    deck: "210 sq.ft."
   },
  { label: "Commercial floor", carpet: "1,910 sq.ft.", deck: "240 sq.ft." },
];



export default function Floorplan() {
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const planRef = useRef(null);
  const titleRef = useRef(null);
  const [typeIdx, setTypeIdx] = useState(0);

  useGSAP(
    () => {
      gsap.set([titleRef.current, panelRef.current, planRef.current], {
        opacity: 0,
        y: "0.5rem",
      });
      const tl = gsap.timeline({ delay: 0.2 });
      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "auraExpo" })
        .to(panelRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "auraExpo" }, "-=0.4")
        .to(planRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "auraExpo" }, "-=0.55");

      return () => tl.kill();
    },
    { scope: rootRef }
  );

  const t = TYPOLOGIES[typeIdx];

  return (
    <main
      ref={rootRef}
      className="relative w-screen h-screen overflow-hidden bg-espresso"
    >
      <h1
        ref={titleRef}
        className="absolute top-20 left-20 font-display text-paper text-3xl leading-none tracking-[-0.01em]"
      >
        Floor Plan
      </h1>

      <div className="absolute inset-x-20 top-36 bottom-16 grid grid-cols-12 gap-10">
        <aside ref={panelRef} className="col-span-3 flex flex-col gap-8 text-paper/85">
          <div className="flex flex-col gap-3">
            {TYPOLOGIES.map((tp, i) => (
              <button
                key={tp.label}
                type="button"
                data-interactive
                onClick={() => setTypeIdx(i)}
                className={`text-left text-[0.85rem] tracking-[0.12em] uppercase bg-transparent border-0 p-0 transition-colors duration-300 ${
                  i === typeIdx ? "text-gold" : "text-paper/70 hover:text-paper"
                }`}
              >
                {tp.label}
              </button>
            ))}
          </div>

          <span className="block w-full h-px bg-platinum/12" />

          <div className="flex flex-col gap-3 text-[0.8rem]">
            <div className="flex justify-between">
              <span className="text-silver">Carpet</span>
              <span className="text-paper">{t.carpet}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-silver">Deck</span>
              <span className="text-paper">{t.deck}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-silver">Bedrooms</span>
              <span className="text-paper">3</span>
            </div>
          </div>
        </aside>

        <div ref={planRef} className="col-span-9 relative">
          <PlaceholderMedia />

         
        </div>
      </div>
    </main>
  );
}
