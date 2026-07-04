// Arkade Aura render set — served from /public/aura (see aura-XX.webp).
export const AURA_IMAGES = Array.from(
  { length: 19 },
  (_, i) => `/aura/aura-${String(i + 1).padStart(2, "0")}.webp`
);
