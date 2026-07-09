import { useRef, useState, useEffect } from "react";
import { APP_DATA } from "../data";
import Marzipano from "marzipano";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";

// This page has two modes, decided by the `vp` query param:
//
//   /views          → the full tour: level panel, auto-rotate, free 360° pan.
//   /views?vp=0..3  → a floor-plan eye icon: the Top pano aimed at one outlook,
//                     panel hidden and the pan locked to that outlook's arc.
//
// Viewpoints are the initial view (vp 0 = "12 o'clock") plus 90° clockwise
// steps (vp 1 = 3, vp 2 = 6, vp 3 = 9). Yaw = initial yaw + vp · 90°.
const HALF_PI = Math.PI / 2;
const DEG = Math.PI / 180;

// Balcony views are locked to a 100° arc — you can pan ±50° from the opened
// viewpoint and no further.
const HALF_LOCK = 50 * DEG;

const normalizeYaw = (y) => Math.atan2(Math.sin(y), Math.cos(y)); // → [-π, π]

// A yaw limiter that clamps to ±half around `center` using the SHORTEST-ARC
// distance. This is what stops the "snap back to the start" glitch: Marzipano's
// built-in yaw limit does a plain min/max clamp, which misbehaves when the arc
// straddles the ±π seam (as several of these viewpoints do) and can fling the
// camera to the far side. Measuring the signed shortest angle instead means the
// view simply comes to rest at the edge and goes no further.
const lockYaw = (center, half) => (params) => {
  let diff = normalizeYaw(params.yaw - center);
  if (diff > half) diff = half;
  else if (diff < -half) diff = -half;
  params.yaw = normalizeYaw(center + diff);
  return params;
};

const composeLimiters = (a, b) => (params) => b(a(params));

// Same espresso sidebar language as Floor Plan / Location, but translucent —
// this panel floats over the pano rather than owning a column.
const PANEL_BG =
  "radial-gradient(140% 100% at 0% 0%, rgba(51,37,28,0.9) 0%, rgba(32,21,16,0.9) 65%)";
const HAIRLINE = "rgba(214,161,105,0.18)";
const ACTIVE_ROW = "rgba(214,161,105,0.12)";

const FLOOR_DATA = [
  { label: "Top", day: "0-dji_0876_01" },
  { label: "Middle", day: "1-dji_0877_02" },
  { label: "Bottom", day: "2-dji_0878_3" },
];

const TOP_SCENE_ID = FLOOR_DATA[0].day; // APP_DATA.scenes[0]
const TILE_BASE_PATH = "/tiles";

const getTileDirectoryName = (sceneId) => {
  if (sceneId.endsWith("01")) return "01_DAY";
  if (sceneId.endsWith("02")) return "02_DAY";
  if (sceneId.endsWith("03") || sceneId.endsWith("3")) return "03_DAY";
  return sceneId;
};

// null when the page was opened without `?vp` — i.e. the full tour.
const readViewpoint = () => {
  const raw = new URLSearchParams(window.location.search).get("vp");
  if (raw === null) return null;
  return Math.min(3, Math.max(0, parseInt(raw, 10) || 0));
};

export default function Views() {
  const rootRef = useRef(null);
  const panelRef = useRef(null);
  const autorotateRef = useRef(null);
  const viewerRef = useRef(null);
  const scenesRef = useRef({});

  // Read once on mount: the mode can't change without remounting the page.
  const [viewpoint] = useState(readViewpoint);
  const isLocked = viewpoint !== null;

  const [currentFloorIdx, setCurrentFloorIdx] = useState(0);
  const [isAutoRotating, setIsAutoRotating] = useState(false);

  useGSAP(
    () => {
      if (!panelRef.current) return;
      gsap.set(panelRef.current, { opacity: 0, x: "-1.5rem" });
      const tl = gsap.to(panelRef.current, {
        opacity: 1,
        x: 0,
        duration: 0.8,
        delay: 0.25,
        ease: "auraExpo",
      });
      return () => tl.kill();
    },
    { scope: rootRef }
  );

  useEffect(() => {
    if (!rootRef.current) return;

    viewerRef.current = new Marzipano.Viewer(rootRef.current, {
      controls: { mouseViewMode: "drag" },
    });

    autorotateRef.current = Marzipano.autorotate({
      yawSpeed: 0.05,
      targetPitch: 0,
      targetFov: Math.PI / 2,
    });

    const base = APP_DATA.scenes[0].initialViewParameters;
    const centerYaw = isLocked ? normalizeYaw(base.yaw + viewpoint * HALF_PI) : 0;

    APP_DATA.scenes.forEach((sceneData) => {
      const tileDir = getTileDirectoryName(sceneData.id);
      const source = Marzipano.ImageUrlSource.fromString(
        `${TILE_BASE_PATH}/${tileDir}/{z}/{f}/{y}/{x}.jpg`,
        { cubeMapPreviewUrl: `${TILE_BASE_PATH}/${tileDir}/preview.jpg` }
      );
      const geometry = new Marzipano.CubeGeometry(sceneData.levels);

      // `traditional` only bounds zoom and pitch; yaw stays free, so the full
      // tour pans a complete 360°. The arc lock is layered on top of it, and
      // only for the one pano an eye icon can open.
      let limiter = Marzipano.RectilinearView.limit.traditional(
        sceneData.faceSize,
        (100 * Math.PI) / 180,
        (120 * Math.PI) / 180
      );
      let initParams = sceneData.initialViewParameters;

      if (isLocked && sceneData.id === TOP_SCENE_ID) {
        limiter = composeLimiters(limiter, lockYaw(centerYaw, HALF_LOCK));
        initParams = { yaw: centerYaw, pitch: base.pitch, fov: base.fov };
      }

      const view = new Marzipano.RectilinearView(initParams, limiter);

      scenesRef.current[sceneData.id] = viewerRef.current.createScene({
        source,
        geometry,
        view,
        pinFirstLevel: true,
      });
    });

    scenesRef.current[TOP_SCENE_ID]?.switchTo();

    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, [isLocked, viewpoint]);

  // Carry the current yaw/pitch/fov across so changing level feels like riding
  // an elevator rather than jumping to a new heading.
  const switchSceneSynced = (newFloorIdx) => {
    const viewer = viewerRef.current;
    if (!viewer) return;

    const oldScene = viewer.scene();
    const newScene = scenesRef.current[FLOOR_DATA[newFloorIdx].day];
    if (!oldScene || !newScene) return;

    const oldView = oldScene.view();
    newScene.view().setParameters({
      yaw: oldView.yaw(),
      pitch: oldView.pitch(),
      fov: oldView.fov(),
    });

    newScene.switchTo();
    setCurrentFloorIdx(newFloorIdx);
  };

  const toggleAutoRotate = () => {
    const viewer = viewerRef.current;
    if (!viewer || !autorotateRef.current) return;

    if (isAutoRotating) {
      viewer.stopMovement();
      viewer.setIdleMovement(Infinity, null);
    } else {
      viewer.startMovement(autorotateRef.current);
      // Restarts auto-rotate 3 seconds after the user stops dragging.
      viewer.setIdleMovement(3000, autorotateRef.current);
    }
    setIsAutoRotating(!isAutoRotating);
  };

  return (
    <main ref={rootRef} className="relative h-screen w-screen overflow-hidden bg-canvas font-manrope">
      {!isLocked && (
        <aside
          ref={panelRef}
          className="pointer-events-auto absolute right-[2.4rem] top-[6.5rem] z-10 flex w-[16.5rem] flex-col gap-[1rem] rounded-[0.7rem] p-[1.2rem] backdrop-blur-md mob:right-3 mob:top-[4.5rem] mob:w-[10.5rem] mob:gap-2 mob:rounded-md mob:p-2.5"
          style={{
            background: PANEL_BG,
            border: `1px solid ${HAIRLINE}`,
            boxShadow: "0 18px 36px -14px rgba(0,0,0,0.55)",
          }}
        >
          <div className="flex flex-col">
            <p className="mb-[0.5rem] pl-[0.9rem] text-[0.8rem] font-semibold uppercase tracking-[0.22em] text-copperlite/80 mob:pl-2 mob:text-[0.6rem]">
              Select Level
            </p>

            <div className="flex flex-col gap-[0.15rem]">
              {FLOOR_DATA.map((floor, idx) => {
                const isActive = idx === currentFloorIdx;
                return (
                  <button
                    key={floor.label}
                    type="button"
                    data-interactive
                    onClick={() => switchSceneSynced(idx)}
                    className={`group flex items-baseline justify-between gap-[0.7rem] rounded-[0.5rem] border-l-2 py-[0.6rem] pl-[0.9rem] pr-[0.7rem] text-left transition-all duration-300 mob:pl-2 ${
                      isActive
                        ? "border-copperlite"
                        : "border-transparent hover:pl-[1.1rem] mob:hover:pl-2"
                    }`}
                    style={isActive ? { background: ACTIVE_ROW } : undefined}
                  >
                    <span
                      className={`text-[1.05rem] transition-colors duration-300 mob:text-[0.8rem] ${
                        isActive
                          ? "font-semibold text-cream"
                          : "font-medium text-sand group-hover:text-cream"
                      }`}
                    >
                      {floor.label}
                    </span>
                    <span
                      className={`shrink-0 text-[0.75rem] uppercase tracking-[0.08em] mob:text-[0.55rem] ${
                        isActive ? "text-clay" : "text-taupe2"
                      }`}
                    >
                      Day View
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className="flex items-center justify-between pt-[1rem] mob:pt-2"
            style={{ borderTop: `1px solid ${HAIRLINE}` }}
          >
            <span className="text-[0.8rem] uppercase tracking-[0.12em] text-taupe mob:text-[0.55rem]">
              Auto Rotate
            </span>
            <button
              type="button"
              data-interactive
              onClick={toggleAutoRotate}
              aria-label="Toggle auto rotation"
              aria-pressed={isAutoRotating}
              className="relative inline-flex h-[1.25rem] w-[2.4rem] shrink-0 items-center rounded-full border-0 p-[0.15rem] transition-colors duration-300"
              style={{
                background: isAutoRotating ? "var(--color-copperlite)" : "rgba(214,161,105,0.18)",
              }}
            >
              <span
                className={`pointer-events-none block h-[0.95rem] w-[0.95rem] rounded-full bg-cream transition-transform duration-300 ease-out ${
                  isAutoRotating ? "translate-x-[1.15rem]" : "translate-x-0"
                }`}
              />
            </button>
          </div>
        </aside>
      )}
    </main>
  );
}
