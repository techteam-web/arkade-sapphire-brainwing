import { useEffect, useRef, useState } from "react";
import { gsap } from "../gsap/gsapConfig.js";
import { useAudio } from "../context/audio.js";
import { canFullscreen, isFullscreen, onFullscreenChange } from "../utils/fullscreen.js";

// Espresso hero gradient + faint copper glow, matching the tour's other pages.
const GATE_BG =
  "radial-gradient(130% 110% at 50% 12%, #3a2a20 0%, #241a14 46%, #1c1712 74%)";
const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

export default function FullscreenGate() {
  const { start } = useAudio();

  // If the browser can't do the Fullscreen API (e.g. iOS Safari), never gate —
  // otherwise the user could get stuck behind a prompt they can never satisfy.
  // `?noboot` also disables it (shared debug bypass, same as the boot loader).
  const bypass =
    typeof window !== "undefined" &&
    new URLSearchParams(window.location.search).has("noboot");
  const supported = canFullscreen() && !bypass;
  const [open, setOpen] = useState(() => supported && !isFullscreen());

  const rootRef = useRef(null);
  const backdropRef = useRef(null);
  const contentRef = useRef(null);
  const btnRef = useRef(null);
  const sweepRef = useRef(null);
  const itemsRef = useRef([]);
  const tlRef = useRef(null);
  const sweepTlRef = useRef(null);
  const setItem = (el, i) => {
    if (el) itemsRef.current[i] = el;
  };

  // Re-open the gate whenever fullscreen is left — by Esc, F-keys, gestures, etc.
  useEffect(() => {
    if (!supported) return;
    return onFullscreenChange(() => setOpen(!isFullscreen()));
  }, [supported]);

  // Loops a diagonal light-sweep across the gold button to keep drawing the eye.
  const startSweep = () => {
    sweepTlRef.current?.kill();
    if (!sweepRef.current) return;
    gsap.set(sweepRef.current, { opacity: 1 });
    sweepTlRef.current = gsap.fromTo(
      sweepRef.current,
      { xPercent: -140 },
      {
        xPercent: 140,
        duration: 1.15,
        ease: "power2.inOut",
        repeat: -1,
        repeatDelay: 2.4,
      }
    );
  };

  // Entrance: text slides up, the button POPS in with an overshoot + shimmer.
  // Exit: the whole gate zooms outward and dissolves, like being drawn inside.
  useEffect(() => {
    if (!supported) return;
    const items = itemsRef.current.filter(Boolean);
    tlRef.current?.kill();

    if (open) {
      gsap.set(rootRef.current, { autoAlpha: 1, pointerEvents: "auto" });
      gsap.set(backdropRef.current, { autoAlpha: 0, scale: 1 });
      gsap.set(contentRef.current, { autoAlpha: 1, scale: 1 });
      gsap.set(items, { autoAlpha: 0, yPercent: 65 });
      gsap.set(btnRef.current, { autoAlpha: 0, scale: 0.7, y: "1.2rem" });
      gsap.set(sweepRef.current, { opacity: 0 });

      tlRef.current = gsap
        .timeline()
        .to(backdropRef.current, { autoAlpha: 1, duration: 0.7, ease: "power2.out" }, 0)
        .to(
          items,
          { autoAlpha: 1, yPercent: 0, duration: 1.0, ease: "auraExpo", stagger: 0.09 },
          0.12
        )
        .to(
          btnRef.current,
          { autoAlpha: 1, scale: 1, y: 0, duration: 0.75, ease: "back.out(2.2)" },
          0.5
        )
        .add(startSweep, 1.15);
    } else {
      sweepTlRef.current?.kill();
      tlRef.current = gsap
        .timeline({
          onComplete: () => gsap.set(rootRef.current, { pointerEvents: "none", autoAlpha: 0 }),
        })
        // quick button press before the veil pulls away
        .to(btnRef.current, { scale: 0.92, duration: 0.14, ease: "power2.in" }, 0)
        .to(
          contentRef.current,
          { autoAlpha: 0, scale: 1.14, duration: 0.55, ease: "power3.in" },
          0.06
        )
        .to(
          backdropRef.current,
          { autoAlpha: 0, scale: 1.12, duration: 0.65, ease: "power2.inOut" },
          0.12
        );
    }

    return () => tlRef.current?.kill();
  }, [open, supported]);

  useEffect(() => () => sweepTlRef.current?.kill(), []);

  const enter = () => {
    // Start the score first: it has to run inside this click, and it should play
    // even if the browser then refuses the fullscreen request.
    start();

    const el = document.documentElement;
    const req = el.requestFullscreen || el.webkitRequestFullscreen;
    try {
      const p = req?.call(el);
      if (p && typeof p.catch === "function") p.catch(() => {});
    } catch {
      /* fullscreen denied — leave the gate up, user can try again */
    }
  };

  if (!supported) return null;

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Enter fullscreen"
      onClick={enter}
      className="fixed inset-0 z-[90] flex cursor-pointer items-center justify-center overflow-hidden"
      style={{ visibility: "hidden" }}
    >
      <div ref={backdropRef} className="absolute inset-0" style={{ background: GATE_BG }} />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(46% 42% at 50% 44%, rgba(198,138,58,0.15), rgba(28,23,18,0) 70%)",
        }}
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 opacity-[0.05] mix-blend-soft-light"
        style={{ backgroundImage: GRAIN, backgroundSize: "160px 160px" }}
      />

      <div ref={contentRef} className="relative flex flex-col items-center px-8 text-center">
        <img
          ref={(el) => setItem(el, 0)}
          src="/arkade-logo-light.webp"
          alt="Arkade Sapphire"
          draggable="false"
          className="h-6 w-auto select-none 2xl:h-7 mob:h-5"
        />

        <h2
          ref={(el) => setItem(el, 1)}
          className="mt-14 font-news text-[3.4rem] italic leading-[1.04] text-cream mob:mt-10 mob:text-[2.1rem]"
        >
          Enter Fullscreen
        </h2>

        <button
          ref={btnRef}
          type="button"
          data-interactive
          onClick={(e) => {
            e.stopPropagation();
            enter();
          }}
          className="group relative mt-11 inline-flex items-center gap-3.5 overflow-hidden rounded-full bg-gold px-9 py-4 text-[0.7rem] font-medium uppercase tracking-[0.3em] text-espresso shadow-[0_10px_30px_-10px_rgba(198,138,58,0.6)] transition-[gap,background-color,box-shadow] duration-300 hover:gap-5 hover:bg-paper hover:shadow-[0_14px_40px_-8px_rgba(198,138,58,0.8)] mob:mt-8 mob:px-7 mob:py-3.5 mob:text-[0.62rem]"
        >
          {/* Looping light-sweep glint */}
          <span
            ref={sweepRef}
            aria-hidden
            className="pointer-events-none absolute inset-y-0 left-0 w-full"
            style={{
              background:
                "linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.5) 50%, transparent 60%)",
            }}
          />
          <svg
            viewBox="0 0 24 24"
            className="relative h-4 w-4 mob:h-3.5 mob:w-3.5"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.7"
          >
            <path
              d="M8 3H5a2 2 0 0 0-2 2v3M16 3h3a2 2 0 0 1 2 2v3M8 21H5a2 2 0 0 1-2-2v-3M16 21h3a2 2 0 0 0 2-2v-3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          <span className="relative">Enter Fullscreen</span>
        </button>

        <span
          ref={(el) => setItem(el, 2)}
          className="mt-7 text-[0.6rem] uppercase tracking-[0.3em] text-silver/55 mob:mt-6 mob:text-[0.52rem]"
        >
          Click anywhere to continue
        </span>
      </div>
    </div>
  );
}
