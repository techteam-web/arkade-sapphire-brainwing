import { useRef } from "react";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";
import PlaceholderMedia from "../components/PlaceholderMedia.jsx";

export default function Brochure() {
  const rootRef = useRef(null);
  const coverRef = useRef(null);
  const titleRef = useRef(null);
  const copyRef = useRef(null);
  const ctaRef = useRef(null);

  useGSAP(
    () => {
      gsap.set([titleRef.current, copyRef.current, ctaRef.current, coverRef.current], {
        opacity: 0,
        y: "0.6rem",
      });

      const tl = gsap.timeline({ delay: 0.2 });
      tl.to(coverRef.current, { opacity: 1, y: 0, duration: 0.9, ease: "auraExpo" })
        .to(titleRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "auraExpo" }, "-=0.6")
        .to(copyRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "auraExpo" }, "-=0.45")
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.55, ease: "auraExpo" }, "-=0.35");

      return () => tl.kill();
    },
    { scope: rootRef }
  );

  return (
    <main
      ref={rootRef}
      className="relative w-screen h-screen overflow-hidden bg-espresso"
    >
      <div className="absolute inset-x-20 top-20 bottom-16 grid grid-cols-12 gap-14 items-center">
        <section className="col-span-6 flex items-center justify-center">
          <div ref={coverRef} className="w-88 h-120">
            <PlaceholderMedia aspect="22 / 30" />
          </div>
        </section>

        <section className="col-span-6 flex flex-col">
          <h1
            ref={titleRef}
            className="font-display text-paper text-4xl leading-[1.05] tracking-[-0.01em]"
          >
            The brochure
          </h1>

          <p
            ref={copyRef}
            className="mt-6 max-w-md text-sm leading-relaxed text-platinum/70"
          >
            Plans, specifications, and the thinking behind Arkade Sapphire.
          </p>

          <div ref={ctaRef} className="mt-10">
            <button
              type="button"
              data-interactive
              className="inline-flex items-center border border-gold/70 bg-transparent text-gold px-7 py-3 text-[0.7rem] tracking-[0.36em] uppercase hover:bg-gold hover:text-espresso transition-colors duration-300"
            >
              Download
            </button>
          </div>
        </section>
      </div>
    </main>
  );
}
