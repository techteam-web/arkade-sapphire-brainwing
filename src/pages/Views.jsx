import { useRef, useEffect } from "react";
import { APP_DATA } from "../data";
import Marzipano from "marzipano";

// Floor-plan eye icons open the Top pano aimed at one of four viewpoints:
// the initial view (vp 0 = "12 o'clock") plus 90° clockwise steps
// (vp 1 = 3, vp 2 = 6, vp 3 = 9). Yaw = initial yaw + vp · 90°.
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

const TOP_SCENE_ID = "0-dji_0876_01"; // APP_DATA.scenes[0]
const TILE_BASE_PATH = "/tiles";

const getTileDirectoryName = (sceneId) => {
  if (sceneId.endsWith("01")) return "01_DAY";
  if (sceneId.endsWith("02")) return "02_DAY";
  if (sceneId.endsWith("03") || sceneId.endsWith("3")) return "03_DAY";
  return sceneId;
};

export default function Views() {
  const rootRef = useRef(null);
  const viewerRef = useRef(null);
  const scenesRef = useRef({});

  useEffect(() => {
    if (!rootRef.current) return;

    viewerRef.current = new Marzipano.Viewer(rootRef.current, {
      controls: { mouseViewMode: "drag" },
    });

    // Centre of the 140° lock = the viewpoint we're opening (?vp=0..3), or the
    // initial view when arrived without one.
    const base = APP_DATA.scenes[0].initialViewParameters;
    const vpRaw = new URLSearchParams(window.location.search).get("vp");
    const vp = vpRaw !== null ? Math.min(3, Math.max(0, parseInt(vpRaw, 10) || 0)) : 0;
    const centerYaw = normalizeYaw(base.yaw + vp * HALF_PI);

    APP_DATA.scenes.forEach((sceneData) => {
      const tileDir = getTileDirectoryName(sceneData.id);
      const source = Marzipano.ImageUrlSource.fromString(
        `${TILE_BASE_PATH}/${tileDir}/{z}/{f}/{y}/{x}.jpg`,
        { cubeMapPreviewUrl: `${TILE_BASE_PATH}/${tileDir}/preview.jpg` }
      );
      const geometry = new Marzipano.CubeGeometry(sceneData.levels);

      let limiter = Marzipano.RectilinearView.limit.traditional(
        sceneData.faceSize,
        (100 * Math.PI) / 180,
        (120 * Math.PI) / 180
      );
      // The Top pano is the only one shown; give it the 140° balcony lock.
      const isTop = sceneData.id === TOP_SCENE_ID;
      if (isTop) limiter = composeLimiters(limiter, lockYaw(centerYaw, HALF_LOCK));

      const initParams = isTop
        ? { yaw: centerYaw, pitch: base.pitch, fov: base.fov }
        : sceneData.initialViewParameters;
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
  }, []);

  return <main ref={rootRef} className="relative h-screen w-screen overflow-hidden bg-canvas" />;
}
