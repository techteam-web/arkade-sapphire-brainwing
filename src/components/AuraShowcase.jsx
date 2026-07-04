import { useEffect, useRef, useState } from "react";
import { AURA_IMAGES } from "../data/auraImages.js";

const N = AURA_IMAGES.length;
const HOLD_MS = 2800; // how long each image is held before the (instant) swap
const pad = (n) => String(n + 1).padStart(2, "0");

export default function AuraShowcase({ open, onClose }) {
  const [index, setIndex] = useState(0);
  const timerRef = useRef(null);

  // Auto-advance while open — no transition on the swap itself, just a hold delay
  // so the images don't change immediately.
  const arm = () => {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setIndex((i) => (i + 1) % N), HOLD_MS);
  };

  useEffect(() => {
    if (!open) return;
    setIndex(0);
    // Preload the whole set so swaps are instant (no flash).
    AURA_IMAGES.forEach((src) => {
      const img = new Image();
      img.src = src;
    });
  }, [open]);

  useEffect(() => {
    if (!open) return;
    arm();
    return () => clearTimeout(timerRef.current);
  }, [open, index]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      else if (e.key === "ArrowRight") setIndex((i) => (i + 1) % N);
      else if (e.key === "ArrowLeft") setIndex((i) => (i - 1 + N) % N);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;

  const go = (dir) => setIndex((i) => (i + dir + N) % N);

  return (
    <div className="fixed inset-0 z-[70] bg-espresso flex items-center justify-center">
      {/* Image — instant swap, no transition */}
      <img
        key={AURA_IMAGES[index]}
        src={AURA_IMAGES[index]}
        alt={`Arkade Aura ${pad(index)}`}
        draggable="false"
        className="max-w-full max-h-full w-full h-full object-contain select-none"
      />

      {/* Title */}
      <div className="absolute top-8 left-10 z-10 flex items-center gap-3 mob:top-5 mob:left-5">
        <span className="w-8 h-px bg-gold/70" />
        <span className="font-display text-paper text-lg tracking-[0.06em] mob:text-base">
          Arkade Aura
        </span>
      </div>

      {/* Close */}
      <button
        type="button"
        data-interactive
        aria-label="Close"
        onClick={onClose}
        className="absolute top-8 right-10 z-10 w-11 h-11 rounded-full border border-platinum/25 flex items-center justify-center text-platinum/80 hover:text-paper hover:border-gold transition-colors mob:top-5 mob:right-5 mob:w-10 mob:h-10"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth="1.5">
          <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
        </svg>
      </button>

      {/* Prev / Next */}
      <button
        type="button"
        data-interactive
        aria-label="Previous"
        onClick={() => go(-1)}
        className="group absolute left-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full border border-platinum/20 bg-espresso/30 backdrop-blur-sm flex items-center justify-center hover:border-gold transition-colors mob:left-3 mob:w-10 mob:h-10"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-platinum/80 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M15 5l-7 7 7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <button
        type="button"
        data-interactive
        aria-label="Next"
        onClick={() => go(1)}
        className="group absolute right-6 top-1/2 -translate-y-1/2 z-10 w-12 h-12 rounded-full border border-platinum/20 bg-espresso/30 backdrop-blur-sm flex items-center justify-center hover:border-gold transition-colors mob:right-3 mob:w-10 mob:h-10"
      >
        <svg viewBox="0 0 24 24" className="w-4 h-4 text-platinum/80 group-hover:text-gold transition-colors" fill="none" stroke="currentColor" strokeWidth="1.4">
          <path d="M9 5l7 7-7 7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>

      {/* Counter */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 font-display text-base tracking-[0.1em] tabular-nums mob:bottom-6">
        <span className="text-gold">{pad(index)}</span>
        <span className="text-platinum/50"> / {pad(N - 1)}</span>
      </div>
    </div>
  );
}
