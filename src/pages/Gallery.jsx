import { useRef, useState } from "react";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";
import PlaceholderMedia from "../components/PlaceholderMedia.jsx";

const SLOTS = [
  { area: "lobby" },
  { area: "res" },
  { area: "amen" },
  { area: "deck" },
  { area: "club" },
  { area: "fac" },
  { area: "sky" },
];

export default function Gallery() {
  const rootRef = useRef(null);
  const tilesRef = useRef([]);
  const lightboxRef = useRef(null);
  const lightboxInner = useRef(null);
  const [openIdx, setOpenIdx] = useState(null);

  useGSAP(
    () => {
      gsap.set(tilesRef.current, { opacity: 0, y: "0.5rem" });
      gsap.set(lightboxRef.current, { autoAlpha: 0 });

      const tl = gsap.to(tilesRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "auraExpo",
        stagger: 0.06,
        delay: 0.2,
      });

      return () => tl.kill();
    },
    { scope: rootRef }
  );

  const { contextSafe } = useGSAP({ scope: rootRef });

  const openLightbox = contextSafe((idx) => {
    setOpenIdx(idx);
    gsap.set(lightboxRef.current, { autoAlpha: 1 });
    gsap.set(lightboxInner.current, { opacity: 0 });
    gsap.to(lightboxInner.current, {
      opacity: 1,
      duration: 0.4,
      ease: "auraEase",
    });
  });

  const closeLightbox = contextSafe(() => {
    gsap.to(lightboxRef.current, {
      autoAlpha: 0,
      duration: 0.35,
      ease: "auraEase",
      onComplete: () => setOpenIdx(null),
    });
  });

  const step = contextSafe((dir) => {
    if (openIdx === null) return;
    setOpenIdx((openIdx + dir + SLOTS.length) % SLOTS.length);
  });

  return (
    <main
      ref={rootRef}
      className="relative w-screen h-screen overflow-hidden bg-espresso"
    >
      <div
        className="absolute inset-20 grid gap-3"
        style={{
          gridTemplateColumns: "1.4fr 1fr 1fr 1.2fr",
          gridTemplateRows: "1.2fr 1fr 1fr",
          gridTemplateAreas: `
            "lobby lobby res amen"
            "lobby lobby deck amen"
            "fac   club  sky  amen"
          `,
        }}
      >
        {SLOTS.map((slot, i) => (
          <button
            key={slot.area}
            type="button"
            data-interactive
            ref={(el) => (tilesRef.current[i] = el)}
            onClick={() => openLightbox(i)}
            className="relative bg-transparent border-0 p-0 block min-h-0 min-w-0"
            style={{ gridArea: slot.area }}
          >
            <PlaceholderMedia />
          </button>
        ))}
      </div>

      <div
        ref={lightboxRef}
        className="fixed inset-0 z-30 bg-espresso/95 flex items-center justify-center"
        style={{ visibility: "hidden", opacity: 0 }}
      >
        <div ref={lightboxInner} className="relative w-[68%] h-[78%]">
          <PlaceholderMedia />
        </div>

        <button
          type="button"
          data-interactive
          aria-label="Previous"
          onClick={() => step(-1)}
          className="absolute left-12 top-1/2 -translate-y-1/2 bg-transparent border-0 text-platinum/60 hover:text-paper transition-colors text-[0.65rem] tracking-[0.32em] uppercase"
        >
          Prev
        </button>
        <button
          type="button"
          data-interactive
          aria-label="Next"
          onClick={() => step(1)}
          className="absolute right-12 top-1/2 -translate-y-1/2 bg-transparent border-0 text-platinum/60 hover:text-paper transition-colors text-[0.65rem] tracking-[0.32em] uppercase"
        >
          Next
        </button>
        <button
          type="button"
          data-interactive
          aria-label="Close"
          onClick={closeLightbox}
          className="absolute top-10 right-12 bg-transparent border-0 text-platinum/60 hover:text-paper transition-colors text-[0.65rem] tracking-[0.32em] uppercase"
        >
          Close
        </button>
      </div>
    </main>
  );
}
