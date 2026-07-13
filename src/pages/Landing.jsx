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
      gsap.set(imgWrapRef.current, { opacity: 0 });
      gsap.set(heroImgRef.current, { scale: 1.22 });
      gsap.set([logoRef.current, taglineRef.current, ctaRef.current], {
        opacity: 0,
        y: "0.9rem",
      });

      const tl = gsap.timeline({ delay: 0.25 });
      tl.to(imgWrapRef.current, { opacity: 1, duration: 1.6, ease: "power2.out" }, 0)
        .to(heroImgRef.current, { scale: 1, duration: 2.2, ease: "auraExpo" }, 0)
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
      {/* Full-bleed hero render covering the entire viewport. */}
      <div ref={imgWrapRef} className="absolute inset-0 overflow-hidden">
        <img
          ref={heroImgRef}
          src="/hero/twilight-final.webp"
          alt="Arkade Sapphire at twilight"
          draggable="false"
          className="w-full h-full object-cover select-none"
        />
      </div>

      {/* Evoke-style gradient — deep on the left & top-left, fading to clear over
          the render on the right so the building stays crisp. */}
      <div
        aria-hidden
        className="absolute inset-0 pointer-events-none mob:hidden"
        style={{
          background: [
            "linear-gradient(105deg, rgba(24,16,14,0.95) 0%, rgba(38,26,21,0.86) 20%, rgba(43,29,23,0.55) 38%, rgba(43,29,23,0.16) 54%, rgba(43,29,23,0) 68%)",
            "radial-gradient(85% 80% at 0% 0%, rgba(18,11,10,0.55), rgba(18,11,10,0) 58%)",
            "linear-gradient(to top, rgba(24,16,14,0.5) 0%, rgba(24,16,14,0) 30%)",
          ].join(", "),
        }}
      />
      {/* Phone gradient — anchored to the bottom where the content sits. */}
      <div
        aria-hidden
        className="hidden mob:block absolute inset-0 pointer-events-none"
        style={{
          background:
            "linear-gradient(to top, rgba(24,16,14,0.94) 0%, rgba(30,20,18,0.72) 26%, rgba(43,29,23,0.2) 52%, rgba(43,29,23,0) 74%)",
        }}
      />

      {/* Subtle warm glow behind the wordmark for depth */}
      <div
        aria-hidden
        className="absolute left-0 top-1/2 -translate-y-1/2 w-[55%] h-[60%] pointer-events-none mob:hidden"
        style={{
          background:
            "radial-gradient(55% 55% at 32% 50%, rgba(198,138,58,0.10), rgba(59,42,34,0) 72%)",
        }}
      />

      {/* Content — left-centered on desktop, anchored to the bottom on phones */}
      <div className="absolute inset-y-0 left-20 z-10 flex flex-col justify-center max-w-2xl mob:inset-y-auto mob:top-auto mob:bottom-0 mob:left-0 mob:right-0 mob:max-w-full mob:justify-end mob:px-6 mob:pb-14">
        <img
          ref={logoRef}
          src="/arkade-logo-light.webp"
          alt="Arkade Sapphire"
          draggable="false"
          className="w-full max-w-2xl 2xl:max-w-3xl h-auto object-contain select-none mob:max-w-[88vw]"
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
