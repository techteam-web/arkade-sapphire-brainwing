import { useEffect, useRef, useState } from "react";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";
import { GALLERY_IMAGES } from "../data/galleryImages.js";

const N = GALLERY_IMAGES.length;
const pad = (n) => String(n + 1).padStart(2, "0");

// Toggle the ambient blurred backdrop.
const AMBIENT_BLUR = true;

// Darkening wash layered over the safety-net photo (set as the backdrop div's
// own CSS background) so it matches the blurred img's brightness(0.55). Lives
// in plain CSS with no GPU filter surface, so it ALWAYS fills every pixel —
// even where a giant blur() gets clipped on high-DPI displays and would
// otherwise reveal the canvas colour.
const BACKDROP_WASH = "linear-gradient(rgba(20,16,12,0.42), rgba(20,16,12,0.42))";

// Glass ghost-arrow (44px) — lightens border + fill on hover, no hue change.
function NavArrow({ dir, onClick, label }) {
  const isPrev = dir < 0;
  return (
    <button
      type="button"
      data-interactive
      aria-label={label}
      onClick={onClick}
      className="group absolute top-1/2 z-30 flex h-[4.4rem] w-[4.4rem] -translate-y-1/2 items-center justify-center rounded-full border backdrop-blur-sm transition-all duration-300 active:scale-95 mob:h-[3.2rem] mob:w-[3.2rem]"
      style={{
        borderColor: "rgba(242,237,230,0.3)",
        background: "rgba(20,16,12,0.3)",
        [isPrev ? "left" : "right"]: "2rem",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = "rgba(242,237,230,0.55)";
        e.currentTarget.style.background = "rgba(20,16,12,0.5)";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = "rgba(242,237,230,0.3)";
        e.currentTarget.style.background = "rgba(20,16,12,0.3)";
      }}
    >
      <svg
        viewBox="0 0 24 24"
        className={`h-[1.6rem] w-[1.6rem] text-linen transition-transform duration-300 ${
          isPrev ? "group-hover:-translate-x-0.5" : "group-hover:translate-x-0.5"
        } mob:h-[1.2rem] mob:w-[1.2rem]`}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d={isPrev ? "M15 18l-6-6 6-6" : "M9 6l6 6-6 6"} strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </button>
  );
}

export default function Gallery() {
  const rootRef = useRef(null);
  const backLayers = useRef([]); // two blurred-backdrop layers
  const backImgs = useRef([]);
  const foreLayers = useRef([]); // two contained-photo layers
  const foreImgs = useRef([]);
  const captionRef = useRef(null);
  const metaRef = useRef(null);

  const front = useRef(0);
  const busy = useRef(false);
  const [index, setIndex] = useState(0);

  // Preload every render so cross-dissolves never stall.
  useEffect(() => {
    GALLERY_IMAGES.forEach(({ src }) => {
      const img = new Image();
      img.src = src;
    });
  }, []);

  // Paint a backdrop layer: the darkened photo goes on BOTH the blurred <img>
  // (soft look) AND the layer div's own CSS background (a plain cover fill that
  // uses no GPU filter surface, so it can never be clipped). If a giant blur()
  // ever clips at the edges on a high-DPI screen, this fill still covers every
  // pixel — canvas brown can no longer show through.
  const paintBackdrop = (i, src) => {
    const div = backLayers.current[i];
    if (div) div.style.backgroundImage = `${BACKDROP_WASH}, url("${src}")`;
    if (backImgs.current[i]) backImgs.current[i].src = src;
  };

  useGSAP(
    () => {
      const fi = front.current;
      paintBackdrop(fi, GALLERY_IMAGES[0].src);
      foreImgs.current[fi].src = GALLERY_IMAGES[0].src;

      gsap.set(backLayers.current[fi], { autoAlpha: 1, zIndex: 1 });
      gsap.set(foreLayers.current[fi], { autoAlpha: 1, zIndex: 21 });
      gsap.set(backLayers.current[1 - fi], { autoAlpha: 0, zIndex: 0 });
      gsap.set(foreLayers.current[1 - fi], { autoAlpha: 0, zIndex: 20 });
      
      // Removed backdrop image scaling initialization to prevent clipping/gradients
      gsap.set(foreImgs.current[fi], { scale: 1.06, transformOrigin: "50% 50%" });
      gsap.set(captionRef.current, { autoAlpha: 0, y: "1.4rem" });
      gsap.set(metaRef.current, { autoAlpha: 0, y: "1rem" });

      const tl = gsap.timeline({ delay: 0.25 });
      tl.to(foreImgs.current[fi], { scale: 1, duration: 1.8, ease: "auraExpo" }, 0)
        .to(captionRef.current, { autoAlpha: 1, y: 0, duration: 1.1, ease: "auraExpo" }, 0.3)
        .to(metaRef.current, { autoAlpha: 1, y: 0, duration: 0.95, ease: "auraExpo" }, 0.45);

      return () => tl.kill();
    },
    { scope: rootRef }
  );

  const { contextSafe } = useGSAP({ scope: rootRef });

  const go = contextSafe((target) => {
    if (busy.current || target === index) return;
    busy.current = true;

    const fi = front.current;
    const bi = 1 - fi;
    const src = GALLERY_IMAGES[target].src;

    paintBackdrop(bi, src);
    foreImgs.current[bi].src = src;

    gsap.set(backLayers.current[bi], { autoAlpha: 0, zIndex: 1 });
    gsap.set(backLayers.current[fi], { autoAlpha: 1, zIndex: 0 });
    gsap.set(foreLayers.current[bi], { autoAlpha: 0, zIndex: 21 });
    gsap.set(foreLayers.current[fi], { zIndex: 20 });
    gsap.set(foreImgs.current[bi], { scale: 1.06, transformOrigin: "50% 50%" });

    const tl = gsap.timeline({
      onComplete: () => {
        gsap.set([backLayers.current[fi], foreLayers.current[fi]], { autoAlpha: 0 });
        front.current = bi;
        busy.current = false;
      },
    });

    // Cleaned timeline: removed backdrop scale animations causing side clipping artifacts
    tl
      .to(backLayers.current[bi], { autoAlpha: 1, duration: 0.7, ease: "power2.inOut" }, 0)
      .to(foreLayers.current[fi], { autoAlpha: 0, duration: 0.6, ease: "power2.in" }, 0)
      .to(foreImgs.current[fi], { scale: 1.05, duration: 1.0, ease: "power1.out" }, 0)
      .to(foreLayers.current[bi], { autoAlpha: 1, duration: 0.9, ease: "power2.inOut" }, 0.45)
      .to(foreImgs.current[bi], { scale: 1, duration: 1.25, ease: "auraExpo" }, 0.4)
      .to([captionRef.current, metaRef.current], { autoAlpha: 0, y: "-0.5rem", duration: 0.4, ease: "power2.in" }, 0)
      .add(() => setIndex(target), 0.5)
      .set([captionRef.current, metaRef.current], { y: "0.7rem" }, 0.5)
      .to(captionRef.current, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.inOut" }, 0.58)
      .to(metaRef.current, { autoAlpha: 1, y: 0, duration: 0.7, ease: "power2.inOut" }, 0.64);
  });

  const step = (dir) => go((index + dir + N) % N);

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
    <main ref={rootRef} className="relative h-screen w-screen overflow-hidden bg-canvas font-manrope">
      {/* Two blurred backdrops (crossfade) — fixed to scale slightly past boundaries cleanly */}
      {[0, 1].map((i) => (
        <div
          key={`b${i}`}
          ref={(el) => (backLayers.current[i] = el)}
          className="absolute inset-0 z-0 overflow-hidden"
          style={{
            visibility: "hidden",
            backgroundSize: "cover",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        >
          <img
            ref={(el) => (backImgs.current[i] = el)}
            alt=""
            draggable="false"
            className="absolute h-full w-full select-none object-cover"
            style={{
              // Slightly oversized natively to hide edge transparency bleed from blur filter
              transform: "scale(1.15)",
              filter: AMBIENT_BLUR
                ? "blur(38px) brightness(0.55) saturate(1.05)"
                : "brightness(0.55) saturate(1.05)",
            }}
          />
        </div>
      ))}

      {/* Two contained foregrounds (crossfade) — never cropped */}
      {[0, 1].map((i) => (
        <div
          key={`f${i}`}
          ref={(el) => (foreLayers.current[i] = el)}
          className="absolute inset-0 z-20 flex items-center justify-center"
          style={{ visibility: "hidden", padding: "9vh 4vw 11vh" }}
        >
          <img
            ref={(el) => (foreImgs.current[i] = el)}
            alt=""
            draggable="false"
            className="max-h-full max-w-full select-none object-contain"
            style={{ borderRadius: "4px" }}
          />
        </div>
      ))}

      <NavArrow dir={-1} onClick={() => step(-1)} label="Previous image" />
      <NavArrow dir={1} onClick={() => step(1)} label="Next image" />

      {/* Caption row */}
      <div className="absolute bottom-6 left-8 right-8 z-30 flex items-end justify-between gap-6 mob:bottom-4 mob:left-4 mob:right-4">
        <div ref={captionRef} className="min-w-0">
          <h2 className="truncate font-news text-[2.4rem] italic leading-[1.1] text-cream mob:text-[1.5rem]">
            {active.title}
          </h2>
        </div>

        <div ref={metaRef} className="mb-[2.8rem] flex shrink-0 items-center gap-4 mob:mb-[2.2rem]">
          <div className="flex items-center gap-[5px] mob:hidden">
            {GALLERY_IMAGES.map((img, i) => (
              <button
                key={img.src}
                type="button"
                data-interactive
                aria-label={img.title}
                onClick={() => go(i)}
                className="group flex h-3 items-center bg-transparent p-0"
              >
                <span
                  className={`block h-[2px] rounded-full transition-all duration-500 ease-out ${
                    i === index ? "w-5 bg-copperlite" : "w-1.5 bg-linen/40 group-hover:bg-linen/70"
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="text-[0.9rem] tabular-nums tracking-[0.1em] text-linen/70">
            {pad(index)} <span className="text-copperlite">/</span> {pad(N - 1)}
          </div>
        </div>
      </div>
    </main>
  );
}