import { useRef } from "react";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";
import { useTransition } from "../context/transition.js";

export default function Landing() {
  const { navigateTo } = useTransition();
  const rootRef = useRef(null);
  const imgWrapRef = useRef(null);
  const heroImgRef = useRef(null);
  const logoRef = useRef(null);
  const taglineRef = useRef(null);
  const ctaRef = useRef(null);
  const kenRef = useRef(null);

  useGSAP(
    () => {
      gsap.set(imgWrapRef.current, { clipPath: "inset(0% 0% 0% 100%)" });
      gsap.set(heroImgRef.current, { scale: 1.22 });
      gsap.set([logoRef.current, taglineRef.current, ctaRef.current], {
        opacity: 0,
        y: "0.9rem",
      });

      const tl = gsap.timeline({ delay: 0.25 });
      tl.to(imgWrapRef.current, { clipPath: "inset(0% 0% 0% 0%)", duration: 1.5, ease: "auraExpo" }, 0)
        .to(heroImgRef.current, { scale: 1, duration: 2.0, ease: "auraExpo" }, 0)
        .to(logoRef.current, { opacity: 1, y: 0, duration: 0.9, ease: "auraExpo" }, 0.5)
        .to(taglineRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "auraExpo" }, 0.75)
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "auraExpo" }, 0.9)
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
      {/* Full-height hero render — bleeds off the right edge on desktop, goes
          full-bleed behind the content on phones. */}
      <div
        ref={imgWrapRef}
        className="absolute top-0 right-0 bottom-0 w-[52%] overflow-hidden mob:inset-0 mob:w-full"
      >
        <img
          ref={heroImgRef}
          src="/aminities/twilight.webp"
          alt="Arkade Sapphire at twilight"
          draggable="false"
          className="edge-fade w-full h-full object-cover select-none"
        />
        {/* Phone-only bottom scrim for text legibility */}
        <div className="hidden mob:block absolute inset-0 pointer-events-none bg-linear-to-t from-espresso via-espresso/55 to-espresso/10" />
      </div>

      {/* Subtle warm glow behind the wordmark for depth */}
      <div
        aria-hidden
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[55%] h-[60%] pointer-events-none"
        style={{
          background:
            "radial-gradient(55% 55% at 32% 50%, rgba(198,138,58,0.09), rgba(59,42,34,0) 72%)",
        }}
      />

      {/* Content — left-centered on desktop, anchored to the bottom on phones */}
      <div className="absolute inset-y-0 left-20 z-10 flex flex-col justify-center max-w-2xl mob:inset-y-auto mob:top-auto mob:bottom-0 mob:left-0 mob:right-0 mob:max-w-full mob:justify-end mob:px-6 mob:pb-14">
        <img
          ref={logoRef}
          src="/arkade-logo-light.webp"
          alt="Arkade Sapphire"
          draggable="false"
          className="w-full max-w-lg 2xl:max-w-xl h-auto object-contain select-none mob:max-w-[78vw]"
        />

        <p ref={taglineRef} className="mt-7 max-w-md text-sm leading-relaxed text-platinum/70 mob:mt-5">
          Twenty-eight residences at Santacruz West.
        </p>

        <div ref={ctaRef} className="mt-12 mob:mt-8">
          <button
            type="button"
            data-interactive
            onClick={() => navigateTo("/menu")}
            className="inline-flex items-center border border-gold/70 bg-transparent text-gold px-7 py-3 text-[0.7rem] tracking-[0.36em] uppercase hover:bg-gold hover:text-espresso transition-colors duration-300"
          >
            Enter
          </button>
        </div>
      </div>

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
