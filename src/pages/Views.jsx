import { useRef, useState , useEffect } from "react";
import { APP_DATA } from "../data"
import Marzipano from "marzipano";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";



export default function Views() {

  const FLOOR_DATA = [ 
    {label: "Top" , day:"0-dji_0876_01" },
    {label: "Middle" , day:"1-dji_0877_02" },
    {label: "Bottom" , day:"2-dji_0878_3" }
  ]
 
  const TILE_BASE_PATH = "/tiles"; 

  const rootRef = useRef(null); // Connects to the HTML div
  const panelRef = useRef(null); // Connects to the side menu panel
  const autorotateRef = useRef(null); // Ref to store the autorotate configuration
  const viewerRef = useRef(null);      // Stores the Marzipano Viewer instance
  const scenesRef = useRef({});        // Stores all our created scenes

  const [currentFloorIdx, setCurrentFloorIdx] = useState(0); // 0 is Terrace based on our array
  const [isAutoRotating, setIsAutoRotating] = useState(false); // Auto-rotate toggle

  const [currentSceneId, setCurrentSceneId] = useState(APP_DATA.scenes[0].id);

  const getTileDirectoryName = (sceneId) => {
    if (sceneId.endsWith("01")) return "01_DAY";
    if (sceneId.endsWith("02")) return "02_DAY";
    if (sceneId.endsWith("03") || sceneId.endsWith("3")) return "03_DAY";
    return sceneId;
  };

  useGSAP(
    () => {
      gsap.set(panelRef.current, {
        opacity: 0,
        x: "-1.5rem",
      });
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

    // 1. Initialize Viewer
    const viewerOpts = { controls: { mouseViewMode: 'drag' } };
    viewerRef.current = new Marzipano.Viewer(rootRef.current, viewerOpts);

    //  Setup Autorotate movement
    autorotateRef.current = Marzipano.autorotate({
        yawSpeed: 0.05,        // Speed of rotation (adjust as needed)
        targetPitch: 0,        // Looks straight ahead while rotating
        targetFov: Math.PI / 2 // Standard zoom level
    });

    // 2. Create all scenes
    APP_DATA.scenes.forEach((sceneData) => {
      const tileDir = getTileDirectoryName(sceneData.id);
      const source = Marzipano.ImageUrlSource.fromString(
        `${TILE_BASE_PATH}/${tileDir}/{z}/{f}/{y}/{x}.jpg`,
        { cubeMapPreviewUrl: `${TILE_BASE_PATH}/${tileDir}/preview.jpg` }
      );
      const geometry = new Marzipano.CubeGeometry(sceneData.levels);
      const limiter = Marzipano.RectilinearView.limit.traditional(sceneData.faceSize, 100 * Math.PI / 180, 120 * Math.PI / 180);
      const view = new Marzipano.RectilinearView(sceneData.initialViewParameters, limiter);

      scenesRef.current[sceneData.id] = viewerRef.current.createScene({
        source, geometry, view, pinFirstLevel: true // pinFirstLevel ensures the first / low level is always loaded
      });
    });

    // 3. Show initial scene (Terrace Day)
    const initialSceneId = FLOOR_DATA[0].day;
    if (scenesRef.current[initialSceneId]) {
      scenesRef.current[initialSceneId].switchTo();
    } 
    return () => {
      if (viewerRef.current) {
        viewerRef.current.destroy();
        viewerRef.current = null;
      }
    };
  }, []);

  const switchSceneSynced = ( newFloorIdx) => {
    const viewer = viewerRef.current;
    const oldScene = viewer.scene();
    
    // Look up the exact scene ID from our data array
    const targetSceneId = FLOOR_DATA[newFloorIdx].day;
    const newScene = scenesRef.current[targetSceneId];

    if (oldScene && newScene) {
        const oldView = oldScene.view();
        newScene.view().setParameters({
            yaw: oldView.yaw(),
            pitch: oldView.pitch(),
            fov: oldView.fov()
        });

        newScene.switchTo();
        setCurrentFloorIdx(newFloorIdx);
    } 
  };

   const switchSceneById = (sceneId) => {
    const scene = scenesRef.current[sceneId];
    if (!scene) return;

    scene.switchTo();
    setCurrentSceneId(sceneId);
  };

  // Toggle Auto Rotate
  const toggleAutoRotate = () => {
      const viewer = viewerRef.current;
      if (!viewer || !autorotateRef.current) return;
      if (isAutoRotating) {
          viewer.stopMovement();
          viewer.setIdleMovement(Infinity, null);
      } else {
          viewer.startMovement(autorotateRef.current);
          viewer.setIdleMovement(3000, autorotateRef.current); 
          // Restarts auto-rotate 3 seconds after user stops dragging
      }
      setIsAutoRotating(!isAutoRotating);
  };

  
  return (
    <main
      ref={rootRef}
      className="relative w-screen h-screen overflow-hidden bg-paper text-ink"
    >
      {/* Premium Side Menu */}
      <aside
        ref={panelRef}
        className="absolute right-10 top-28 z-10 w-72 bg-paper/80 backdrop-blur-md border border-ink/5 p-8 rounded-lg flex flex-col gap-6 text-ink shadow-sm pointer-events-auto mob:right-3 mob:top-20 mob:w-40 mob:p-3.5 mob:gap-2.5 mob:rounded-md"
      >
        <div>
          <span className="text-[0.65rem] tracking-[0.25em] uppercase text-silver font-medium block mb-1 mob:text-[0.5rem] mob:mb-0.5">
            Interactive
          </span>
          <h1 className="font-display text-3xl leading-[1.05] tracking-[-0.01em] text-ink mob:text-base">
            360° Views
          </h1>
        </div>

        <span className="block h-px w-full bg-ink/10" />

        <div className="flex flex-col gap-3">
          <span className="text-[0.65rem] tracking-[0.15em] uppercase text-silver font-medium mob:text-[0.5rem]">
            Select Level
          </span>
          <div className="flex flex-col gap-1">
            {FLOOR_DATA.map((floor, idx) => {
              const isActive = idx === currentFloorIdx;
              return (
                <button
                  key={floor.label}
                  type="button"
                  data-interactive
                  onClick={() => switchSceneSynced(idx)}
                  className="group relative border-0 bg-transparent py-2.5 pl-4 pr-2 text-left transition-all duration-300 flex items-center justify-between cursor-pointer mob:py-1.5 mob:pl-3"
                >
                  {/* Left active line accent */}
                  <span
                    className={`absolute left-0 top-1/2 -translate-y-1/2 w-[2px] h-4 bg-gold rounded transition-all duration-300 ${
                      isActive
                        ? "opacity-100 scale-y-100"
                        : "opacity-0 scale-y-50 group-hover:opacity-50 group-hover:scale-y-75"
                    }`}
                  />
                  <span
                    className={`text-xs uppercase tracking-[0.15em] transition-colors duration-300 mob:text-[0.6rem] ${
                      isActive
                        ? "text-gold font-semibold"
                        : "text-ink/60 group-hover:text-ink"
                    }`}
                  >
                    {floor.label}
                  </span>
                  <span
                    className={`text-[0.65rem] tracking-[0.05em] uppercase font-light transition-colors duration-300 mob:text-[0.5rem] ${
                      isActive
                        ? "text-gold"
                        : "text-silver group-hover:text-ink/80"
                    }`}
                  >
                    Day View
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <span className="block h-px w-full bg-ink/10" />

        <div className="flex items-center justify-between">
          <span className="text-[0.65rem] tracking-[0.15em] uppercase text-silver font-medium mob:text-[0.5rem]">
            Auto Rotate
          </span>
          <button
            type="button"
            data-interactive
            onClick={toggleAutoRotate}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              isAutoRotating ? "bg-gold" : "bg-ink/10"
            }`}
            aria-label="Toggle auto rotation"
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-paper shadow ring-0 transition duration-200 ease-in-out ${
                isAutoRotating ? "translate-x-4" : "translate-x-0"
              }`}
            />
          </button>
        </div>
      </aside>
    </main>
  );
}
