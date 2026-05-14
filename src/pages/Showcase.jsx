import { useRef } from "react";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";
import PlaceholderMedia from "../components/PlaceholderMedia.jsx";

export default function Showcase() {
  const rootRef = useRef(null);
  const titleRef = useRef(null);
  const frameRef = useRef(null);
  const playRef = useRef(null);

  useGSAP(
    () => {
      gsap.set([titleRef.current, frameRef.current, playRef.current], {
        opacity: 0,
        y: "0.5rem",
      });

      const tl = gsap.timeline({ delay: 0.2 });
      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "auraExpo" })
        .to(frameRef.current, { opacity: 1, y: 0, duration: 0.9, ease: "auraExpo" }, "-=0.4")
        .to(playRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "auraExpo" }, "-=0.45");

      return () => tl.kill();
    },
    { scope: rootRef }
  );

  const { contextSafe } = useGSAP({ scope: rootRef });

  const onPlay = contextSafe(() => {
    gsap.to(playRef.current, {
      scale: 0.94,
      duration: 0.12,
      ease: "auraEase",
      yoyo: true,
      repeat: 1,
    });
    // TODO: when a video source arrives, swap PlaceholderMedia for a <video> element.
  });

  return (
    <main
      ref={rootRef}
      className="relative w-screen h-screen overflow-hidden bg-cocoa"
    >
      <h1
        ref={titleRef}
        className="absolute top-20 left-20 font-display text-paper text-3xl leading-none tracking-[-0.01em]"
      >
        Showcase
      </h1>

      <div className="absolute inset-0 flex items-center justify-center">
        <div ref={frameRef} className="relative w-240 h-135">
          <PlaceholderMedia aspect="16 / 9" />

          <button
            type="button"
            data-interactive
            ref={playRef}
            onClick={onPlay}
            aria-label="Play showcase film"
            className="absolute inset-0 m-auto w-16 h-16 rounded-full border border-gold/60 bg-transparent flex items-center justify-center text-gold hover:bg-gold hover:text-espresso transition-colors duration-300"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 ml-0.5">
              <polygon points="8 5 19 12 8 19 8 5" />
            </svg>
          </button>
        </div>
      </div>
    </main>
  );
}
