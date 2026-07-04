import { useRef } from "react";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";

const BROCHURE_PDF = "/Arkade-Sapphire-Brochure.pdf";

export default function Brochure() {
  const rootRef = useRef(null);
  const coverRef = useRef(null);
  const coverInner = useRef(null);
  const glareRef = useRef(null);
  const eyebrowRef = useRef(null);
  const titleRef = useRef(null);
  const copyRef = useRef(null);
  const metaRef = useRef(null);
  const ctaRef = useRef(null);

  const rotX = useRef(null);
  const rotY = useRef(null);
  const floatTl = useRef(null);

  useGSAP(
    () => {
      gsap.set(coverRef.current, { opacity: 0, y: "1.4rem", rotateX: 8, transformPerspective: 900 });
      gsap.set([eyebrowRef.current, titleRef.current, copyRef.current, metaRef.current, ctaRef.current], {
        opacity: 0,
        y: "0.7rem",
      });

      const tl = gsap.timeline({ delay: 0.2 });
      tl.to(coverRef.current, { opacity: 1, y: 0, rotateX: 0, duration: 1.1, ease: "auraExpo" })
        .to(eyebrowRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "auraExpo" }, "-=0.75")
        .to(titleRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "auraExpo" }, "-=0.5")
        .to(copyRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "auraExpo" }, "-=0.45")
        .to(metaRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "auraExpo" }, "-=0.4")
        .to(ctaRef.current, { opacity: 1, y: 0, duration: 0.55, ease: "auraExpo" }, "-=0.35")
        .add(() => {
          floatTl.current = gsap.to(coverInner.current, {
            y: "-0.5rem",
            duration: 3.4,
            ease: "sine.inOut",
            yoyo: true,
            repeat: -1,
          });
        });

      // Smooth pointer-driven tilt.
      rotX.current = gsap.quickTo(coverInner.current, "rotationX", { duration: 0.6, ease: "auraEase" });
      rotY.current = gsap.quickTo(coverInner.current, "rotationY", { duration: 0.6, ease: "auraEase" });

      return () => {
        tl.kill();
        floatTl.current?.kill();
      };
    },
    { scope: rootRef }
  );

  const onMove = (e) => {
    const el = coverRef.current;
    if (!el || !rotX.current) return;
    const r = el.getBoundingClientRect();
    const px = (e.clientX - r.left) / r.width - 0.5;
    const py = (e.clientY - r.top) / r.height - 0.5;
    rotY.current(px * 14);
    rotX.current(-py * 14);
    gsap.to(glareRef.current, {
      opacity: 0.35,
      x: `${px * 40}%`,
      y: `${py * 40}%`,
      duration: 0.6,
      ease: "auraEase",
    });
  };

  const onLeave = () => {
    rotX.current?.(0);
    rotY.current?.(0);
    gsap.to(glareRef.current, { opacity: 0, duration: 0.5, ease: "auraEase" });
  };

  return (
    <main ref={rootRef} className="relative w-screen h-screen overflow-hidden bg-espresso">
      <div className="absolute inset-x-20 top-20 bottom-16 grid grid-cols-12 gap-14 items-center mob:flex mob:flex-col mob:justify-center mob:inset-x-6 mob:top-16 mob:bottom-6 mob:gap-8">
        {/* Cover */}
        <section className="col-span-6 flex items-center justify-center mob:order-1">
          <div
            ref={coverRef}
            onMouseMove={onMove}
            onMouseLeave={onLeave}
            className="relative"
            style={{ transformStyle: "preserve-3d", perspective: "900px" }}
          >
            <div
              ref={coverInner}
              className="relative w-100 aspect-square rounded-xs overflow-hidden shadow-[0_40px_80px_-20px_rgba(0,0,0,0.7)] ring-1 ring-gold/30 mob:w-[62vw]"
              style={{ transformStyle: "preserve-3d" }}
            >
              <img
                src="/brochure-cover.webp"
                alt="Arkade Sapphire brochure cover"
                className="w-full h-full object-cover select-none"
                draggable="false"
              />
              {/* Spine + edge sheen */}
              <div className="absolute inset-y-0 left-0 w-6 bg-linear-to-r from-black/35 to-transparent pointer-events-none" />
              <div
                ref={glareRef}
                className="absolute -inset-1/4 opacity-0 pointer-events-none"
                style={{
                  background:
                    "radial-gradient(circle, rgba(244,241,235,0.25), transparent 60%)",
                }}
              />
            </div>
          </div>
        </section>

        {/* Copy */}
        <section className="col-span-6 flex flex-col mob:order-2 mob:items-center mob:text-center">
          <div ref={eyebrowRef} className="flex items-center gap-4">
            <span className="w-10 h-px bg-gold/70" />
            <span className="text-[0.62rem] tracking-[0.42em] uppercase text-gold">
              Collateral
            </span>
          </div>

          <h1
            ref={titleRef}
            className="mt-6 font-display text-paper text-5xl leading-[1.03] tracking-[-0.01em] mob:mt-4 mob:text-4xl"
          >
            The Brochure
          </h1>

          <p
            ref={copyRef}
            className="mt-6 max-w-md text-sm leading-relaxed text-platinum/70"
          >
            Plans, specifications, and the thinking behind Arkade Sapphire — a
            residence composed for those who belong here.
          </p>

          <div
            ref={metaRef}
            className="mt-8 flex items-center gap-6 text-[0.6rem] tracking-[0.32em] uppercase text-silver/70"
          >
            <span>23 Pages</span>
            <span className="w-px h-3 bg-platinum/20" />
            <span>PDF</span>
            <span className="w-px h-3 bg-platinum/20" />
            <span>16 MB</span>
          </div>

          <div ref={ctaRef} className="mt-10 flex items-center gap-4 mob:mt-7 mob:flex-wrap mob:justify-center">
            <a
              href={BROCHURE_PDF}
              target="_blank"
              rel="noopener noreferrer"
              data-interactive
              className="inline-flex items-center gap-3 bg-gold text-espresso px-8 py-3 text-[0.7rem] tracking-[0.32em] uppercase hover:bg-paper transition-colors duration-300"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" strokeLinecap="round" strokeLinejoin="round" />
                <circle cx="12" cy="12" r="2.5" />
              </svg>
              View Brochure
            </a>
            <a
              href={BROCHURE_PDF}
              download="Arkade-Sapphire-Brochure.pdf"
              data-interactive
              className="inline-flex items-center gap-3 border border-gold/70 text-gold px-8 py-3 text-[0.7rem] tracking-[0.32em] uppercase hover:bg-gold hover:text-espresso transition-colors duration-300"
            >
              <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Download
            </a>
          </div>
        </section>
      </div>
    </main>
  );
}
