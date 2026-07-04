import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";
import { GALLERY_IMAGES } from "../data/galleryImages.js";

const N = GALLERY_IMAGES.length;
const pad = (n) => String(n + 1).padStart(2, "0");

export default function Gallery() {
  const rootRef = useRef(null);
  const layers = useRef([]); // two full-bleed layer divs
  const imgs = useRef([]); // two <img> elements
  const captionRef = useRef(null);
  const counterRef = useRef(null);

  const front = useRef(0); // which layer (0|1) currently holds the visible image
  const kenRef = useRef(null); // the slow idle zoom
  const busy = useRef(false);

  const [index, setIndex] = useState(0);

  // Slow, continuous "breathing" zoom on the active image — the classy idle motion.
  const kenBurns = (img) => {
    kenRef.current?.kill();
    kenRef.current = gsap.fromTo(
      img,
      { scale: 1.0 },
      { scale: 1.09, duration: 16, ease: "none", overwrite: true }
    );
  };

  useEffect(() => {
    // Preload everything so transitions never stall on a fetch.
    GALLERY_IMAGES.forEach(({ src }) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  useGSAP(
    () => {
      const f = imgs.current[front.current];
      f.src = GALLERY_IMAGES[0].src;

      gsap.set(layers.current[front.current], { autoAlpha: 1, zIndex: 2 });
      gsap.set(layers.current[1 - front.current], { autoAlpha: 0, zIndex: 1 });
      gsap.set(f, { scale: 1.14, transformOrigin: "50% 50%" });
      gsap.set(captionRef.current, { autoAlpha: 0, y: "1.4rem" });
      gsap.set(counterRef.current, { autoAlpha: 0, y: "1rem" });

      const tl = gsap.timeline({ delay: 0.3 });
      tl.to(f, { scale: 1, duration: 2.2, ease: "auraExpo" }, 0)
        .to(captionRef.current, { autoAlpha: 1, y: 0, duration: 1.2, ease: "auraExpo" }, 0.35)
        .to(counterRef.current, { autoAlpha: 1, y: 0, duration: 1.0, ease: "auraExpo" }, 0.55)
        .add(() => kenBurns(f), 1.4);

      return () => {
        tl.kill();
        kenRef.current?.kill();
      };
    },
    { scope: rootRef }
  );

  const { contextSafe } = useGSAP({ scope: rootRef });

  const go = contextSafe((target, dir) => {
    if (busy.current || target === index) return;
    busy.current = true;
    kenRef.current?.kill();

    const fi = front.current;
    const bi = 1 - fi;
    const fLayer = layers.current[fi];
    const bLayer = layers.current[bi];
    const fImg = imgs.current[fi];
    const bImg = imgs.current[bi];

    bImg.src = GALLERY_IMAGES[target].src;

    // Incoming layer sits on top and fades in; because both images overscan
    // (scale > 1) the small directional drift never exposes an edge.
    gsap.set(bLayer, { autoAlpha: 0, zIndex: 2 });
    gsap.set(fLayer, { zIndex: 1 });
    gsap.set(bImg, { scale: 1.16, xPercent: dir * 2.5, transformOrigin: "50% 50%" });

    const tl = gsap.timeline({
      defaults: { ease: "auraExpo" },
      onComplete: () => {
        gsap.set(fLayer, { autoAlpha: 0 });
        front.current = bi;
        busy.current = false;
        kenBurns(bImg);
      },
    });

    // Cross-dissolve the imagery (slow + soft), with gentle parallax on both.
    tl.to(bLayer, { autoAlpha: 1, duration: 1.5, ease: "auraEase" }, 0)
      .to(bImg, { scale: 1, xPercent: 0, duration: 2.0 }, 0)
      .to(fImg, { scale: 1.07, xPercent: -dir * 2, duration: 2.0 }, 0)
      // Caption gracefully lifts out, swaps, and settles back in.
      .to([captionRef.current, counterRef.current], {
        autoAlpha: 0,
        y: "-0.9rem",
        duration: 0.6,
        ease: "auraEase",
      }, 0)
      .add(() => setIndex(target), 0.62)
      .set([captionRef.current, counterRef.current], { y: "1.1rem" }, 0.62)
      .to(captionRef.current, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.72)
      .to(counterRef.current, { autoAlpha: 1, y: 0, duration: 0.9 }, 0.8);
  });

  const step = (dir) => go((index + dir + N) % N, dir);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "ArrowRight") step(1);
      else if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  const active = GALLERY_IMAGES[index];

  return (
    <main ref={rootRef} className="relative w-screen h-screen overflow-hidden bg-espresso">
      {/* Image stage */}
      <div className="absolute inset-0">
        {[0, 1].map((i) => (
          <div
            key={i}
            ref={(el) => (layers.current[i] = el)}
            className="absolute inset-0 overflow-hidden"
            style={{ visibility: "hidden" }}
          >
            <img
              ref={(el) => (imgs.current[i] = el)}
              alt=""
              className="w-full h-full object-cover select-none"
              draggable="false"
            />
          </div>
        ))}

        {/* Light vignette — just enough for caption/counter legibility */}
        <div className="absolute inset-0 z-10 pointer-events-none bg-linear-to-t from-espresso/55 via-transparent to-transparent" />
        <div className="absolute inset-0 z-10 pointer-events-none bg-linear-to-r from-espresso/20 via-transparent to-transparent" />
      </div>

      {/* Page heading (hidden on phones — the persistent brand already sits here) */}
      <div className="absolute top-20 left-20 z-20 mob:hidden">
        <span className="text-[0.62rem] tracking-[0.42em] uppercase text-platinum/70">Gallery</span>
      </div>

      {/* Caption */}
      <div ref={captionRef} className="absolute bottom-20 left-20 z-20 max-w-xl mob:bottom-24 mob:left-6 mob:right-6 mob:max-w-full">
        <h2 className="font-display text-paper text-5xl leading-[1.02] tracking-[-0.01em] mob:text-3xl">
          {active.title}
        </h2>
      </div>

      {/* Counter */}
      <div ref={counterRef} className="absolute bottom-20 right-20 z-20 mob:bottom-7 mob:right-6">
        <div className="font-display text-paper text-lg tracking-widest tabular-nums">
          <span className="text-gold">{pad(index)}</span>
          <span className="text-platinum/50"> / {pad(N - 1)}</span>
        </div>
      </div>

      {/* Side arrows */}
      <button
        type="button"
        data-interactive
        aria-label="Previous image"
        onClick={() => step(-1)}
        className="group absolute left-8 top-1/2 -translate-y-1/2 z-20 w-16 h-16 rounded-full border border-platinum/25 bg-espresso/20 backdrop-blur-sm flex items-center justify-center hover:border-gold hover:bg-espresso/40 transition-all duration-300 mob:w-11 mob:h-11 mob:left-3"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-platinum/80 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        data-interactive
        aria-label="Next image"
        onClick={() => step(1)}
        className="group absolute right-8 top-1/2 -translate-y-1/2 z-20 w-16 h-16 rounded-full border border-platinum/25 bg-espresso/20 backdrop-blur-sm flex items-center justify-center hover:border-gold hover:bg-espresso/40 transition-all duration-300 mob:w-11 mob:h-11 mob:right-3"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 text-platinum/80 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Thumbnail rail (hidden on phones — arrows + swipe drive navigation there) */}
      <div className="absolute top-1/2 right-28 -translate-y-1/2 z-20 flex flex-col gap-2.5 mob:hidden">
        {GALLERY_IMAGES.map((img, i) => (
          <button
            key={img.src}
            type="button"
            data-interactive
            aria-label={img.title}
            onClick={() => go(i, i >= index ? 1 : -1)}
            className="group relative flex items-center justify-end gap-3"
          >
            <span
              className={`text-[0.55rem] tracking-[0.3em] uppercase whitespace-nowrap transition-all duration-300 ${
                i === index ? "text-gold opacity-100" : "text-platinum/50 opacity-0 group-hover:opacity-100"
              }`}
            >
              {img.title}
            </span>
            <span
              className={`h-px transition-all duration-500 ease-out ${
                i === index
                  ? "w-10 bg-gold"
                  : "w-5 bg-platinum/35 group-hover:w-8 group-hover:bg-platinum/70"
              }`}
            />
          </button>
        ))}
      </div>
    </main>
  );
}
