import { useRef, useState } from "react";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";

const VIEWPOINTS = ["Aerial", "Podium", "Eco-deck", "Skyline"];

export default function Views() {
  const rootRef = useRef(null);
  const titleRef = useRef(null);
  const viewerRef = useRef(null);
  const stripRef = useRef(null);
  const [active, setActive] = useState(0);

  useGSAP(
    () => {
      gsap.set([titleRef.current, viewerRef.current, stripRef.current], {
        opacity: 0,
        y: "0.5rem",
      });
      const tl = gsap.timeline({ delay: 0.2 });
      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "auraExpo" })
        .to(
          viewerRef.current,
          { opacity: 1, y: 0, duration: 0.8, ease: "auraExpo" },
          "-=0.5"
        )
        .to(
          stripRef.current,
          { opacity: 1, y: 0, duration: 0.6, ease: "auraExpo" },
          "-=0.55"
        );

      return () => tl.kill();
    },
    { scope: rootRef }
  );

  return (
    <main
      ref={rootRef}
      className="relative w-screen h-screen overflow-hidden bg-paper text-ink"
    >
      <h1
        ref={titleRef}
        className="absolute top-20 left-20 font-display text-ink text-3xl leading-none tracking-[-0.01em]"
      >
        Views
      </h1>

      <div className="absolute inset-x-20 top-36 bottom-28">
        <div
          ref={viewerRef}
          className="relative w-full h-full bg-paper border border-ink/10"
        />
      </div>

      <div
        ref={stripRef}
        className="absolute inset-x-20 bottom-10 flex justify-center gap-10"
      >
        {VIEWPOINTS.map((v, i) => (
          <button
            key={v}
            type="button"
            data-interactive
            onClick={() => setActive(i)}
            className={`bg-transparent border-0 p-0 text-[0.7rem] tracking-[0.32em] uppercase transition-colors duration-300 ${
              i === active ? "text-ink" : "text-ink/35 hover:text-ink/70"
            }`}
          >
            {v}
          </button>
        ))}
      </div>
    </main>
  );
}
