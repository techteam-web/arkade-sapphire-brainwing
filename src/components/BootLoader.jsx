import { useRef } from "react";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";

export default function BootLoader({ onComplete }) {
  const rootRef = useRef(null);
  const wordmarkRef = useRef(null);

  useGSAP(
    () => {
      gsap.set(rootRef.current, { autoAlpha: 1 });
      gsap.set(wordmarkRef.current, { opacity: 0, y: "0.75rem" });

      const tl = gsap.timeline({
        onComplete: () => {
          try {
            sessionStorage.setItem("aura.booted", "1");
          } catch {
            // sessionStorage may be unavailable — silently continue.
          }
          onComplete?.();
        },
      });

      tl.to(wordmarkRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "auraExpo",
      })
        .to(wordmarkRef.current, { opacity: 0, duration: 0.6, ease: "auraEase" }, "+=0.6")
        .to(rootRef.current, { autoAlpha: 0, duration: 0.4, ease: "auraEase" }, "-=0.2");

      return () => tl.kill();
    },
    { scope: rootRef }
  );

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-60 bg-espresso flex items-center justify-center"
      style={{ opacity: 0, visibility: "hidden" }}
    >
      <h1
        ref={wordmarkRef}
        className="font-display text-paper text-5xl leading-none tracking-[-0.01em]"
      >
        Arkade Aura
      </h1>
    </div>
  );
}
