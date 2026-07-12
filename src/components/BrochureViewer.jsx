import { useCallback, useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import PdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { gsap } from "../gsap/gsapConfig.js";
import {
  useIsMobile,
  usePrefersLightMotion,
  usePrefersReducedMotion,
} from "../utils/useMediaQuery.js";

pdfjsLib.GlobalWorkerOptions.workerSrc = PdfWorker;

const PANEL_BG = "radial-gradient(120% 100% at 50% 0%, #2c2119 0%, #1c1712 55%)";
const HAIRLINE = "rgba(214,161,105,0.18)";

const ZOOM_LEVELS = [1, 1.5, 2];

// The stage claims this much of the viewport width; expanding trades the
// surrounding espresso margin for page.
const STAGE_WIDTH = { normal: 0.74, expanded: 0.96 };

// Cap the backing store so a 4K screen doesn't allocate a 10k-wide canvas per
// page. 2400 covers a 2560px display at 1x zoom with room to spare.
const MAX_CANVAS_WIDTH = 2400;

// Vertical space the top rail, the controls pill and the gaps between them take
// out of the panel, leaving the rest for the page itself.
const CHROME_ALLOWANCE = "9rem";

const FLIP_DURATION = 1.05;

const clamp = (n, lo, hi) => Math.max(lo, Math.min(hi, n));

// Always an explicit px string. GSAP does not append a unit to `maxWidth` for a
// bare number (it just no-ops), and tweening from a "74vw" start would make it
// read the target as vw — a cap of ~1000vw, i.e. no cap at all.
const panelWidthPx = (isExpanded) =>
  `${window.innerWidth * (isExpanded ? STAGE_WIDTH.expanded : STAGE_WIDTH.normal)}px`;

export default function BrochureViewer({ open, onClose, src, onDownload }) {
  const isMobile = useIsMobile(); // layout only — matches the `mob:` variant
  const reducedMotion = usePrefersReducedMotion();
  const lightMotion = usePrefersLightMotion();
  // No 3D turn on phones (either orientation) or under reduced motion.
  const flat = lightMotion || reducedMotion;

  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  // Width / height of the page on screen. Pages are not uniform here (cover is
  // 2.13:1, page 2 is square, the rest are 2:1 spreads).
  const [ratio, setRatio] = useState(2);
  const [zoomIdx, setZoomIdx] = useState(0);
  const [expanded, setExpanded] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);

  const rootRef = useRef(null);
  const backdropRef = useRef(null);
  const panelRef = useRef(null);
  const stageRef = useRef(null);
  const sheetRef = useRef(null);
  const zoomRef = useRef(null);
  const leafRef = useRef(null);
  const frontRef = useRef(null);
  const backRef = useRef(null);
  const shadeRef = useRef(null);
  const glareRef = useRef(null);
  const chromeRef = useRef([]);

  const pdfRef = useRef(null);
  const renderTaskRef = useRef(null);
  const renderedPageRef = useRef(0);
  const flippingRef = useRef(false);
  const panRef = useRef({ x: 0, y: 0 });
  const dragRef = useRef({ active: false, x: 0, y: 0, ox: 0, oy: 0 });

  const zoom = ZOOM_LEVELS[zoomIdx];
  const setChrome = (el, i) => {
    if (el) chromeRef.current[i] = el;
  };

  // ── PDF document ────────────────────────────────────────────────
  useEffect(() => {
    if (!open || pdfRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        // pdfjs v6 no longer accepts a bare URL string here.
        const pdf = await pdfjsLib.getDocument({ url: src }).promise;
        if (cancelled) return;
        pdfRef.current = pdf;
        setNumPages(pdf.numPages);
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          console.error("BrochureViewer: failed to load PDF", err);
          setFailed(true);
          setLoading(false);
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, src]);

  useEffect(
    () => () => {
      try {
        renderTaskRef.current?.cancel();
      } catch {
        /* already settled */
      }
      pdfRef.current?.destroy();
      pdfRef.current = null;
    },
    []
  );

  // ── Rendering ───────────────────────────────────────────────────
  // Rendering into a canvas CLEARS it (setting .width wipes the bitmap), and
  // pdf.js then paints asynchronously. So we never render straight into the
  // canvas the user is looking at — that was the white flash mid-flip. We always
  // render into the hidden back face, then blit it across in a single frame.
  const paintInto = useCallback(async (canvas, pageNum) => {
    const pdf = pdfRef.current;
    if (!pdf || !canvas) return null;

    try {
      renderTaskRef.current?.cancel();
    } catch {
      /* already settled */
    }

    const pdfPage = await pdf.getPage(pageNum);
    const base = pdfPage.getViewport({ scale: 1 });

    const cssWidth = sheetRef.current?.clientWidth || 1200;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    const targetWidth = Math.min(cssWidth * dpr, MAX_CANVAS_WIDTH);
    const viewport = pdfPage.getViewport({ scale: targetWidth / base.width });

    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const task = pdfPage.render({ canvasContext: canvas.getContext("2d"), viewport });
    renderTaskRef.current = task;
    await task.promise;

    return base.width / base.height;
  }, []);

  const blit = (dst, srcCanvas) => {
    if (!dst || !srcCanvas) return;
    dst.width = srcCanvas.width;
    dst.height = srcCanvas.height;
    dst.getContext("2d").drawImage(srcCanvas, 0, 0);
  };

  // Render `pageNum` into the back face, then hand the bitmap to the front face.
  // The visible canvas is only ever written synchronously.
  const showPage = useCallback(
    async (pageNum) => {
      const nextRatio = await paintInto(backRef.current, pageNum);
      if (nextRatio) setRatio(nextRatio);
      blit(frontRef.current, backRef.current);
      renderedPageRef.current = pageNum;
      return nextRatio;
    },
    [paintInto]
  );

  useEffect(() => {
    if (!open || loading || failed) return;
    if (renderedPageRef.current === page) return;

    let cancelled = false;
    (async () => {
      try {
        await showPage(page);
        if (cancelled) return;
      } catch (err) {
        if (err?.name !== "RenderingCancelledException") setFailed(true);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [open, loading, failed, page, showPage]);

  // Re-render at the new CSS size after a resize or expand so the raster stays
  // crisp; scaling the existing bitmap would just blur it.
  const repaintCurrent = useCallback(async () => {
    if (!pdfRef.current || flippingRef.current || !renderedPageRef.current) return;
    try {
      await showPage(renderedPageRef.current);
    } catch {
      /* superseded by a newer render */
    }
  }, [showPage]);

  useEffect(() => {
    if (!open) return;
    let frame = 0;
    const onResize = () => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => {
        // The panel cap is stored in px, so it has to be recomputed by hand.
        if (!isMobile && panelRef.current) {
          gsap.set(panelRef.current, { maxWidth: panelWidthPx(expanded) });
        }
        repaintCurrent();
      });
    };
    window.addEventListener("resize", onResize);
    return () => {
      window.removeEventListener("resize", onResize);
      cancelAnimationFrame(frame);
    };
  }, [open, repaintCurrent, isMobile, expanded]);

  // ── Panning (only meaningful while zoomed) ──────────────────────
  // Zoom/pan live on a wrapper ABOVE the rotating leaf, so the two transforms
  // never fight over the same element.
  const applyPan = useCallback(() => {
    if (zoomRef.current) gsap.set(zoomRef.current, panRef.current);
  }, []);

  useEffect(() => {
    if (zoomIdx === 0) panRef.current = { x: 0, y: 0 };
    if (zoomRef.current) {
      gsap.to(zoomRef.current, {
        scale: ZOOM_LEVELS[zoomIdx],
        x: panRef.current.x,
        y: panRef.current.y,
        duration: 0.45,
        ease: "auraExpo",
      });
    }
  }, [zoomIdx]);

  const onPointerDown = (e) => {
    if (zoomIdx === 0) return;
    dragRef.current = {
      active: true,
      x: e.clientX,
      y: e.clientY,
      ox: panRef.current.x,
      oy: panRef.current.y,
    };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e) => {
    if (!dragRef.current.active) return;
    const sheet = sheetRef.current;
    if (!sheet) return;
    const rect = sheet.getBoundingClientRect();
    const maxX = (rect.width * (zoom - 1)) / 2;
    const maxY = (rect.height * (zoom - 1)) / 2;
    panRef.current = {
      x: clamp(dragRef.current.ox + (e.clientX - dragRef.current.x), -maxX, maxX),
      y: clamp(dragRef.current.oy + (e.clientY - dragRef.current.y), -maxY, maxY),
    };
    applyPan();
  };

  const onPointerUp = (e) => {
    dragRef.current.active = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      /* pointer already released */
    }
  };

  // ── Page turn ───────────────────────────────────────────────────
  const flip = useCallback(
    async (dir) => {
      if (flippingRef.current || !pdfRef.current) return;
      const next = clamp(page + dir, 1, numPages);
      if (next === page) return;

      flippingRef.current = true;
      setZoomIdx(0);

      // Paint the incoming page onto the BACK face before anything moves. The
      // back is turned away from the camera, so this is invisible.
      let nextRatio = null;
      try {
        nextRatio = await paintInto(backRef.current, next);
      } catch (err) {
        flippingRef.current = false;
        if (err?.name !== "RenderingCancelledException") setFailed(true);
        return;
      }

      const settle = () => {
        // The leaf has turned a full 180°: the back face is now facing us. Copy
        // it onto the front and reset the rotation, so the next turn starts from
        // a clean 0° with both faces showing the current page.
        blit(frontRef.current, backRef.current);
        gsap.set(leafRef.current, { rotateY: 0 });
        renderedPageRef.current = next;
        setPage(next);
        flippingRef.current = false;
        // Pages differ in width, so the sheet resized under the bitmap we just
        // blitted. Re-render once at the settled size. Safe to do on the visible
        // canvas now only because showPage() paints offscreen and blits.
        requestAnimationFrame(() => repaintCurrent());
      };

      if (flat) {
        gsap
          .timeline({ onComplete: settle })
          .to(zoomRef.current, { opacity: 0, duration: 0.2, ease: "power2.in" })
          .add(() => {
            blit(frontRef.current, backRef.current);
            if (nextRatio) setRatio(nextRatio);
          })
          .to(zoomRef.current, { opacity: 1, duration: 0.28, ease: "auraExpo" });
        return;
      }

      const turn = dir > 0 ? -180 : 180;

      // The face swap happens at 90° of ROTATION, not at 50% of time — the ease
      // makes those different instants. Hanging the aspect/counter change off a
      // timestamp let the incoming page render letterboxed inside the outgoing
      // page's box. Watch the angle instead.
      let swapped = false;
      const swapAtEdgeOn = () => {
        if (swapped) return;
        const angle = Math.abs(gsap.getProperty(leafRef.current, "rotateY"));
        if (angle < 90) return;
        swapped = true;
        // Claim the render BEFORE setPage, or the paint effect would fire and
        // re-render into the back canvas — the very face now facing the camera.
        renderedPageRef.current = next;

        // Resize the sheet in THIS frame. Going through setRatio alone left the
        // first back-face frame showing the incoming page letterboxed inside the
        // outgoing page's box, because React commits a frame later. setRatio
        // still runs, to keep React's idea of the sheet in sync.
        const sheet = sheetRef.current;
        if (sheet && nextRatio) {
          sheet.style.aspectRatio = `${nextRatio}`;
          if (!isMobile) {
            sheet.style.maxWidth = `calc((92vh - ${CHROME_ALLOWANCE}) * ${nextRatio})`;
          }
        }
        if (nextRatio) setRatio(nextRatio);
        setPage(next);
      };

      gsap
        .timeline({ onComplete: settle })
        // The leaf turns a full half-revolution. Past 90° the front face hides
        // itself (backface-visibility) and the back face comes into view, so a
        // page is on screen the whole way round — no blank, no jump cut.
        .to(
          leafRef.current,
          { rotateY: turn, duration: FLIP_DURATION, ease: "auraEase", onUpdate: swapAtEdgeOn },
          0
        )
        // Lift the sheet slightly as it turns; it reads as paper leaving the pile.
        .to(
          sheetRef.current,
          { scale: 0.965, duration: FLIP_DURATION / 2, ease: "sine.inOut", yoyo: true, repeat: 1 },
          0
        )
        // Shading peaks edge-on, where a real page would catch the least light.
        .to(
          shadeRef.current,
          { opacity: 0.55, duration: FLIP_DURATION / 2, ease: "sine.in" },
          0
        )
        .to(
          shadeRef.current,
          { opacity: 0, duration: FLIP_DURATION / 2, ease: "sine.out" },
          FLIP_DURATION / 2
        )
        // A specular sweep across the paper as it passes the light.
        .fromTo(
          glareRef.current,
          { opacity: 0, xPercent: dir > 0 ? -60 : 60 },
          { opacity: 0.5, xPercent: 0, duration: FLIP_DURATION / 2, ease: "sine.in" },
          0
        )
        .to(
          glareRef.current,
          { opacity: 0, xPercent: dir > 0 ? 60 : -60, duration: FLIP_DURATION / 2, ease: "sine.out" },
          FLIP_DURATION / 2
        );
    },
    [page, numPages, paintInto, flat, repaintCurrent, isMobile]
  );

  // ── Expand / restore ────────────────────────────────────────────
  // The panel owns the width; the stage is w-full inside it. Sizing the stage
  // directly made its width depend on its own content — a feedback loop that
  // grew the sheet by its border on every pass.
  const toggleExpand = useCallback(() => {
    const panel = panelRef.current;
    if (!panel) return;
    const next = !expanded;
    setExpanded(next);

    gsap.to(panel, {
      maxWidth: panelWidthPx(next),
      duration: 0.7,
      ease: "auraExpo",
      onComplete: repaintCurrent,
    });
  }, [expanded, repaintCurrent]);

  // ── Open / close choreography ───────────────────────────────────
  const close = useCallback(() => {
    const chrome = chromeRef.current.filter(Boolean);

    // Reset the transient view state as the overlay leaves, so it reopens at
    // 100% and un-expanded. The loaded document stays cached in pdfRef.
    //
    // renderedPageRef must reset too: closing unmounts the canvases, so the ones
    // we get on reopen are blank. Leaving the ref pointing at the last page made
    // the paint effect think it was already drawn, and the sheet came back empty.
    const finish = () => {
      setZoomIdx(0);
      setExpanded(false);
      panRef.current = { x: 0, y: 0 };
      renderedPageRef.current = 0;
      onClose();
    };

    gsap
      .timeline({ onComplete: finish })
      .to(chrome, { autoAlpha: 0, y: "0.5rem", duration: 0.25, ease: "power2.in", stagger: 0.04 }, 0)
      .to(
        panelRef.current,
        { autoAlpha: 0, scale: 0.94, y: "1.2rem", duration: 0.42, ease: "power3.in" },
        0.08
      )
      .to(backdropRef.current, { autoAlpha: 0, duration: 0.5, ease: "power2.inOut" }, 0.12);
  }, [onClose]);

  useEffect(() => {
    if (!open) return;
    const chrome = chromeRef.current.filter(Boolean);

    gsap.set(rootRef.current, { autoAlpha: 1 });
    gsap.set(backdropRef.current, { autoAlpha: 0 });
    gsap.set(panelRef.current, {
      autoAlpha: 0,
      scale: 0.94,
      y: "1.4rem",
      rotateX: 6,
      ...(isMobile ? {} : { maxWidth: panelWidthPx(false) }),
    });
    gsap.set(chrome, { autoAlpha: 0, y: "0.6rem" });
    // Clear anything a previous turn left on the leaf before it was closed.
    gsap.set(leafRef.current, { rotateY: 0 });
    gsap.set(sheetRef.current, { scale: 1 });
    gsap.set(zoomRef.current, { scale: 1, x: 0, y: 0, opacity: 1 });
    gsap.set([shadeRef.current, glareRef.current], { opacity: 0 });

    const tl = gsap
      .timeline()
      .to(backdropRef.current, { autoAlpha: 1, duration: 0.55, ease: "power2.out" }, 0)
      .to(
        panelRef.current,
        { autoAlpha: 1, scale: 1, y: 0, rotateX: 0, duration: 0.85, ease: "auraExpo" },
        0.1
      )
      .to(chrome, { autoAlpha: 1, y: 0, duration: 0.5, ease: "auraExpo", stagger: 0.07 }, 0.42);

    return () => tl.kill();
  }, [open, isMobile]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === "Escape") close();
      else if (e.key === "ArrowRight") flip(1);
      else if (e.key === "ArrowLeft") flip(-1);
      else if (e.key.toLowerCase() === "f" && !isMobile) toggleExpand();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, close, flip, toggleExpand, isMobile]);

  if (!open) return null;

  const atStart = page <= 1;
  const atEnd = page >= numPages;

  // The card chrome lives on the FACES, not on the sheet. Put it on the sheet
  // and the bordered card sits still while the artwork squirms inside it; on the
  // faces, the card itself turns.
  const faceClass = "absolute inset-0 h-full w-full rounded-[0.4rem] object-contain";
  const faceStyle = {
    backfaceVisibility: "hidden",
    WebkitBackfaceVisibility: "hidden",
    background: PANEL_BG,
    border: `1px solid ${HAIRLINE}`,
    boxShadow: "0 40px 90px -30px rgba(0,0,0,0.8)",
  };

  return (
    <div
      ref={rootRef}
      role="dialog"
      aria-modal="true"
      aria-label="Brochure viewer"
      className="fixed inset-0 z-[80] flex items-center justify-center font-manrope"
      style={{ visibility: "hidden" }}
    >
      <div
        ref={backdropRef}
        onClick={close}
        className="absolute inset-0 bg-canvas/85 backdrop-blur-md"
      />

      <div
        ref={panelRef}
        className="relative flex w-full max-h-[92vh] flex-col items-center gap-[1.2rem] mob:gap-3 mob:px-3"
        // maxWidth is owned entirely by GSAP (see the open effect / toggleExpand).
        // Declaring it here as `undefined` made React clear the inline value on
        // every re-render, silently undoing the cap. On mobile `w-full` suffices.
        style={{ perspective: "1600px" }}
      >
        {/* Top rail — page counter + expand + close */}
        <div
          ref={(el) => setChrome(el, 0)}
          className="flex w-full items-center justify-between gap-[1.4rem] mob:gap-2"
        >
          <span className="text-[0.72rem] uppercase tracking-[0.28em] text-clay mob:text-[0.6rem]">
            {loading ? "Loading" : `Page ${String(page).padStart(2, "0")} / ${numPages}`}
          </span>

          <div className="flex items-center gap-[0.5rem]">
            {!isMobile && (
              <button
                type="button"
                data-interactive
                onClick={toggleExpand}
                aria-label={expanded ? "Restore size" : "Enlarge"}
                className="group grid h-[2.2rem] w-[2.2rem] place-items-center rounded-full border-0 bg-espresso/50 text-sand backdrop-blur transition-colors duration-300 hover:bg-copperlite hover:text-espresso"
                style={{ border: `1px solid ${HAIRLINE}` }}
              >
                <svg viewBox="0 0 24 24" className="h-[0.95rem] w-[0.95rem] transition-transform duration-500 group-hover:scale-110" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                  {expanded ? (
                    <path d="M9 3v6H3M15 21v-6h6M3 15h6v6M21 9h-6V3" />
                  ) : (
                    <path d="M8 3H3v5M16 3h5v5M21 16v5h-5M8 21H3v-5" />
                  )}
                </svg>
              </button>
            )}

            <button
              type="button"
              data-interactive
              onClick={close}
              aria-label="Close brochure"
              className="group grid h-[2.2rem] w-[2.2rem] place-items-center rounded-full border-0 bg-espresso/50 text-sand backdrop-blur transition-colors duration-300 hover:bg-copperlite hover:text-espresso mob:h-[2rem] mob:w-[2rem]"
              style={{ border: `1px solid ${HAIRLINE}` }}
            >
              <svg viewBox="0 0 24 24" className="h-[0.95rem] w-[0.95rem] transition-transform duration-500 group-hover:rotate-90" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Stage */}
        <div ref={stageRef} className="relative w-full">
          <div
            ref={sheetRef}
            // Transparent frame. It must NOT clip: `overflow: hidden` forces
            // transform-style: flat on its subtree, which would collapse the two
            // faces onto one plane and kill the turn. Clipping is only switched
            // on while zoomed — and zooming always resets before a turn.
            className={`relative mx-auto w-full ${zoomIdx > 0 ? "overflow-hidden rounded-[0.4rem]" : ""}`}
            style={{
              aspectRatio: `${ratio}`,
              // Cap the HEIGHT by capping the width: aspect-ratio alone would let
              // the square page grow as tall as the stage is wide and shove the
              // controls off-screen. CHROME_ALLOWANCE is the rail + pill + gaps.
              maxWidth: isMobile ? "100%" : `calc((92vh - ${CHROME_ALLOWANCE}) * ${ratio})`,
              // The leaf is a grandchild, so perspective has to sit here — the
              // panel's own perspective only reaches its direct children.
              perspective: "1800px",
            }}
          >
            <div
              ref={zoomRef}
              onPointerDown={onPointerDown}
              onPointerMove={onPointerMove}
              onPointerUp={onPointerUp}
              onPointerCancel={onPointerUp}
              className="h-full w-full touch-none select-none"
              style={{ cursor: zoomIdx > 0 ? "grab" : "default", transformStyle: "preserve-3d" }}
            >
              <div ref={leafRef} className="relative h-full w-full" style={{ transformStyle: "preserve-3d" }}>
                <canvas ref={frontRef} className={faceClass} style={faceStyle} />
                <canvas
                  ref={backRef}
                  className={faceClass}
                  style={{ ...faceStyle, transform: "rotateY(180deg)" }}
                />

                {/* Light on the turning paper. Inside the leaf, so they travel
                    with the card rather than hanging in front of it. */}
                <div
                  ref={shadeRef}
                  aria-hidden
                  className="pointer-events-none absolute inset-0 rounded-[0.4rem] opacity-0"
                  style={{ background: "linear-gradient(100deg, rgba(0,0,0,0.8), rgba(0,0,0,0.2))" }}
                />
                <div
                  ref={glareRef}
                  aria-hidden
                  className="pointer-events-none absolute inset-0 overflow-hidden rounded-[0.4rem] opacity-0"
                  style={{
                    background:
                      "linear-gradient(104deg, transparent 42%, rgba(244,241,235,0.16) 50%, transparent 58%)",
                  }}
                />
              </div>
            </div>

            {loading && (
              <div
                className="absolute inset-0 grid place-items-center rounded-[0.4rem]"
                style={{ background: PANEL_BG, border: `1px solid ${HAIRLINE}` }}
              >
                <span className="text-[0.7rem] uppercase tracking-[0.3em] text-taupe">
                  Loading brochure
                </span>
              </div>
            )}
            {failed && (
              <div
                className="absolute inset-0 grid place-items-center rounded-[0.4rem] px-6 text-center"
                style={{ background: PANEL_BG, border: `1px solid ${HAIRLINE}` }}
              >
                <span className="text-[0.75rem] uppercase tracking-[0.2em] text-taupe">
                  Could not display the brochure. Use Download instead.
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Controls pill */}
        <div
          ref={(el) => setChrome(el, 1)}
          className="flex items-center gap-[1.1rem] rounded-full px-[1.2rem] py-[0.6rem] backdrop-blur-md mob:gap-3 mob:px-3 mob:py-2"
          style={{ background: "rgba(20,16,12,0.62)", border: `1px solid ${HAIRLINE}` }}
        >
          <button
            type="button"
            data-interactive
            onClick={() => flip(-1)}
            disabled={atStart}
            aria-label="Previous page"
            className={`grid h-[1.9rem] w-[1.9rem] place-items-center rounded-full border-0 bg-transparent text-copperlite transition-all duration-300 ${
              atStart ? "cursor-default opacity-25" : "hover:bg-copperlite/15 hover:-translate-x-[0.1rem]"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-[1rem] w-[1rem]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 18l-6-6 6-6" />
            </svg>
          </button>

          <span className="min-w-[4.6rem] text-center text-[0.68rem] uppercase tracking-[0.2em] text-linen tabular-nums mob:min-w-[3.4rem] mob:text-[0.58rem]">
            {String(page).padStart(2, "0")} / {numPages || "--"}
          </span>

          <button
            type="button"
            data-interactive
            onClick={() => flip(1)}
            disabled={atEnd}
            aria-label="Next page"
            className={`grid h-[1.9rem] w-[1.9rem] place-items-center rounded-full border-0 bg-transparent text-copperlite transition-all duration-300 ${
              atEnd ? "cursor-default opacity-25" : "hover:bg-copperlite/15 hover:translate-x-[0.1rem]"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-[1rem] w-[1rem]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 6l6 6-6 6" />
            </svg>
          </button>

          <span className="h-[1.1rem] w-px" style={{ background: HAIRLINE }} />

          <button
            type="button"
            data-interactive
            onClick={() => setZoomIdx((i) => Math.max(0, i - 1))}
            disabled={zoomIdx === 0}
            aria-label="Zoom out"
            className={`grid h-[1.9rem] w-[1.9rem] place-items-center rounded-full border-0 bg-transparent text-sand transition-colors duration-300 ${
              zoomIdx === 0 ? "cursor-default opacity-25" : "hover:text-copperlite"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-[0.95rem] w-[0.95rem]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5M8 11h6" />
            </svg>
          </button>

          <span className="w-[2.4rem] text-center text-[0.6rem] tracking-[0.1em] text-taupe tabular-nums mob:hidden">
            {Math.round(zoom * 100)}%
          </span>

          <button
            type="button"
            data-interactive
            onClick={() => setZoomIdx((i) => Math.min(ZOOM_LEVELS.length - 1, i + 1))}
            disabled={zoomIdx === ZOOM_LEVELS.length - 1}
            aria-label="Zoom in"
            className={`grid h-[1.9rem] w-[1.9rem] place-items-center rounded-full border-0 bg-transparent text-sand transition-colors duration-300 ${
              zoomIdx === ZOOM_LEVELS.length - 1 ? "cursor-default opacity-25" : "hover:text-copperlite"
            }`}
          >
            <svg viewBox="0 0 24 24" className="h-[0.95rem] w-[0.95rem]" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3.5-3.5M8 11h6M11 8v6" />
            </svg>
          </button>

          <span className="h-[1.1rem] w-px" style={{ background: HAIRLINE }} />

          <button
            type="button"
            data-interactive
            onClick={onDownload}
            aria-label="Download brochure"
            className="grid h-[1.9rem] w-[1.9rem] place-items-center rounded-full border-0 bg-transparent text-sand transition-colors duration-300 hover:text-copperlite"
          >
            <svg viewBox="0 0 24 24" className="h-[0.95rem] w-[0.95rem]" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 3v12m0 0l-4-4m4 4l4-4M4 21h16" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
