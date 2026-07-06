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
  const busy = useRef(false);

  const [index, setIndex] = useState(0);

  const stageRef = useRef(null);
  const indexRef = useRef(0);
  const ratios = useRef({}); // src -> naturalWidth / naturalHeight
  const [frame, setFrame] = useState({ padX: 0, padY: 0 });
  const [isMobile, setIsMobile] = useState(false);

  // Measure where the *contained* image actually sits inside the stage, so the
  // caption / counter / scrubber can be anchored inside the render itself and
  // never straddle the espresso letterbox.
  const measure = () => {
    const el = stageRef.current;
    if (!el) return;
    const r = ratios.current[GALLERY_IMAGES[indexRef.current].src];
    const W = el.clientWidth;
    const H = el.clientHeight;
    if (!r || !W || !H) return;
    let dispW, dispH;
    if (W / H > r) {
      dispH = H;
      dispW = H * r;
    } else {
      dispW = W;
      dispH = W / r;
    }
    setFrame({ padX: Math.max(0, (W - dispW) / 2), padY: Math.max(0, (H - dispH) / 2) });
  };

  useEffect(() => {
    // Preload everything (so transitions never stall) and capture aspect ratios.
    GALLERY_IMAGES.forEach(({ src }) => {
      const img = new Image();
      img.onload = () => {
        ratios.current[src] = img.naturalWidth / img.naturalHeight;
        if (GALLERY_IMAGES[indexRef.current].src === src) measure();
      };
      img.src = src;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    indexRef.current = index;
    measure();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index]);

  useEffect(() => {
    const onResize = () => {
      setIsMobile(window.innerWidth < 480);
      measure();
    };
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useGSAP(
    () => {
      const f = imgs.current[front.current];
      f.src = GALLERY_IMAGES[0].src;

      gsap.set(layers.current[front.current], { autoAlpha: 1, zIndex: 2 });
      gsap.set(layers.current[1 - front.current], { autoAlpha: 0, zIndex: 1 });
      gsap.set(f, { scale: 1.06, transformOrigin: "50% 50%" });
      gsap.set(captionRef.current, { autoAlpha: 0, y: "1.4rem" });
      gsap.set(counterRef.current, { autoAlpha: 0, y: "1rem" });

      const tl = gsap.timeline({ delay: 0.3 });
      tl.to(f, { scale: 1, duration: 2.2, ease: "auraExpo" }, 0)
        .to(captionRef.current, { autoAlpha: 1, y: 0, duration: 1.2, ease: "auraExpo" }, 0.35)
        .to(counterRef.current, { autoAlpha: 1, y: 0, duration: 1.0, ease: "auraExpo" }, 0.55);

      return () => {
        tl.kill();
      };
    },
    { scope: rootRef }
  );

  const { contextSafe } = useGSAP({ scope: rootRef });

  const go = contextSafe((target, dir) => {
    if (busy.current || target === index) return;
    busy.current = true;

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
    gsap.set(bImg, { scale: 1.05, xPercent: dir * 1.5, transformOrigin: "50% 50%" });

    const tl = gsap.timeline({
      defaults: { ease: "auraExpo" },
      onComplete: () => {
        gsap.set(fLayer, { autoAlpha: 0 });
        front.current = bi;
        busy.current = false;
      },
    });

    // Cross-dissolve the imagery (slow + soft), with gentle parallax on both.
    tl.to(bLayer, { autoAlpha: 1, duration: 1.5, ease: "auraEase" }, 0)
      .to(bImg, { scale: 1, xPercent: 0, duration: 2.0 }, 0)
      .to(fImg, { scale: 1.03, xPercent: -dir * 1.5, duration: 2.0 }, 0)
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
  // Anchor overlays inside the render's rendered box (px letterbox + a rem gutter).
  const insetX = `calc(${frame.padX}px + 2.4rem)`;
  const insetB = `calc(${frame.padY}px + 2rem)`;
  const captionMax = `min(36rem, calc(100vw - ${frame.padX * 2}px - 4.8rem))`;

  return (
    <main ref={rootRef} className="relative w-screen h-screen overflow-hidden bg-espresso">
      {/* Image stage — sits below the top navbar band so the render never runs
          behind the logo / menu. Every overlay anchors inside this stage. */}
      <div ref={stageRef} className="absolute inset-x-0 bottom-0 top-24 mob:top-20">
        {[0, 1].map((i) => (
          <div
            key={i}
            ref={(el) => (layers.current[i] = el)}
            className="absolute inset-0 overflow-hidden bg-espresso"
            style={{ visibility: "hidden" }}
          >
            <img
              ref={(el) => (imgs.current[i] = el)}
              alt=""
              className="w-full h-full object-contain select-none"
              draggable="false"
            />
          </div>
        ))}

        {/* Subtle symmetric vignette — reads as an intentional frame and adds
            depth to the espresso margins without filtering the render. */}
        <div
          aria-hidden
          className="absolute inset-0 z-10 pointer-events-none"
          style={{
            background:
              "radial-gradient(130% 120% at 50% 46%, transparent 60%, rgba(0,0,0,0.34) 100%)",
          }}
        />

        {/* Caption — anchored inside the render's bottom-left on desktop; on
            phones it drops into the espresso band below the render. */}
        <div
          ref={captionRef}
          className={`absolute z-20 ${isMobile ? "left-6 right-6 bottom-19" : ""}`}
          style={isMobile ? undefined : { left: insetX, bottom: insetB, maxWidth: captionMax }}
        >
          <h2 className="font-display text-paper text-5xl leading-[1.02] tracking-[-0.01em] mob:text-3xl" style={{ textShadow: "0 2px 16px rgba(0,0,0,0.5)" }}>
            {active.title}
          </h2>
        </div>

        {/* Counter — inside the render's bottom-right on desktop; below it on phones */}
        <div
          ref={counterRef}
          className={`absolute z-20 ${isMobile ? "right-6 bottom-7" : ""}`}
          style={isMobile ? undefined : { right: insetX, bottom: insetB }}
        >
          <div className="font-display text-paper text-lg tracking-widest tabular-nums" style={{ textShadow: "0 2px 12px rgba(0,0,0,0.55)" }}>
            <span className="text-gold">{pad(index)}</span>
            <span className="text-platinum/50"> / {pad(N - 1)}</span>
          </div>
        </div>

        {/* Side arrows — vertically centred on the render */}
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

        {/* Bottom scrubber — centred inside the render's bottom band */}
        <div
          className="absolute left-1/2 -translate-x-1/2 z-20 flex items-end gap-2.5 mob:hidden"
          style={{ bottom: `calc(${frame.padY}px + 1.4rem)`, filter: "drop-shadow(0 2px 10px rgba(0,0,0,0.45))" }}
        >
          {GALLERY_IMAGES.map((img, i) => (
            <button
              key={img.src}
              type="button"
              data-interactive
              aria-label={img.title}
              onClick={() => go(i, i >= index ? 1 : -1)}
              className="group flex h-7 items-end bg-transparent border-0 p-0"
            >
              <span
                className={`w-px rounded-full transition-all duration-500 ease-out ${
                  i === index
                    ? "h-6 bg-gold"
                    : "h-2.5 bg-platinum/40 group-hover:h-4 group-hover:bg-platinum/70"
                }`}
              />
            </button>
          ))}
        </div>
      </div>
    </main>
  );
}
