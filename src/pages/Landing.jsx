import { useRef } from "react";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";
import { useTransition } from "../context/transition.js";
import PlaceholderMedia from "../components/PlaceholderMedia.jsx";

export default function Landing() {
  const { navigateTo } = useTransition();
  const rootRef = useRef(null);
  const titleRef = useRef(null);
  const taglineRef = useRef(null);
  const ctaRef = useRef(null);
  const mediaRef = useRef(null);

  useGSAP(
    () => {
      gsap.set([titleRef.current, taglineRef.current, ctaRef.current, mediaRef.current], {
        opacity: 0,
        y: "0.75rem",
      });

      const tl = gsap.timeline({ delay: 0.2 });
      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "auraExpo" })
        .to(taglineRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "auraExpo" }, "-=0.5")
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "auraExpo" }, "-=0.4")
        .to(mediaRef.current, { opacity: 1, y: 0, duration: 0.9, ease: "auraExpo" }, "-=0.75");

      return () => tl.kill();
    },
    { scope: rootRef }
  );

  return (
    <main ref={rootRef} className="relative w-screen h-screen overflow-hidden bg-espresso">
      <div className="absolute inset-0 grid grid-cols-12 gap-8 px-20 py-24">
        <section className="col-span-6 flex flex-col justify-center">
          <h1
            ref={titleRef}
            className="font-display text-paper text-7xl leading-[0.95] tracking-[-0.015em]"
          >
            Arkade Sapphire
          </h1>

          <p
            ref={taglineRef}
            className="mt-7 max-w-md text-sm leading-relaxed text-platinum/70"
          >
            Twenty-eight residences at Santacruz West.
          </p>

          <div ref={ctaRef} className="mt-12">
            <button
              type="button"
              data-interactive
              onClick={() => navigateTo("/menu")}
              className="inline-flex items-center border border-gold/70 bg-transparent text-gold px-7 py-3 text-[0.7rem] tracking-[0.36em] uppercase hover:bg-gold hover:text-espresso transition-colors duration-300"
            >
              Enter
            </button>
          </div>
        </section>

        <section className="col-span-6 flex items-center justify-center">
          <div ref={mediaRef} className="w-104 h-136">
            <PlaceholderMedia />
          </div>
        </section>
      </div>
    </main>
  );
}
