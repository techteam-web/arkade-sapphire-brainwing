// npm i react-zoom-pan-pinch
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

// A single "view this direction" eye hotspot, pinned to a % position on the
// plan image so it pans/zooms with it.
function ViewEye({ hotspot, onActivate }) {
  return (
    <button
      type="button"
      data-interactive
      aria-label="View this outlook in 360°"
      onMouseDown={(e) => e.stopPropagation()}
      onClick={(e) => {
        e.stopPropagation();
        onActivate?.(hotspot.vp);
      }}
      className="group absolute z-10 -translate-x-1/2 -translate-y-1/2"
      style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
    >
      {/* attention pulse */}
      <span className="absolute inset-0 rounded-full bg-copperlite/40 animate-ping" />
      {/* Fixed px (not rem) so the eye is the SAME size on every breakpoint,
          independent of the proportional font-size scaling. */}
      <span className="relative flex h-[34px] w-[34px] items-center justify-center rounded-full border border-copperlite/70 bg-espresso/75 text-copperlite shadow-[0_6px_18px_-4px_rgba(0,0,0,0.7)] backdrop-blur-sm transition-all duration-300 group-hover:scale-110 group-hover:border-copperlite group-hover:bg-copperlite group-hover:text-espresso">
        <svg viewBox="0 0 24 24" className="h-[17px] w-[17px]" fill="none" stroke="currentColor" strokeWidth="1.7">
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" strokeLinecap="round" strokeLinejoin="round" />
          <circle cx="12" cy="12" r="2.6" />
        </svg>
      </span>
    </button>
  );
}

// Framed floor-plan sheet on the dark content area, with a glass zoom pill.
// Optional `hotspots` overlay eye icons on the plan; clicking one calls
// `onHotspot(vp)` to open the matching 360 viewpoint.
export default function FloorPlanViewer({ src, alt, hotspots = [], onHotspot }) {
  return (
    <TransformWrapper key={src} minScale={1} maxScale={4} centerOnInit>
      {({ zoomIn, zoomOut, resetTransform }) => (
        <div className="relative h-full w-full">
          <TransformComponent
            wrapperClass="!h-full !w-full"
            contentClass="!h-full !w-full !flex !items-center !justify-center"
          >
            {/* Wrapper hugs the image so hotspot %s map to the plan itself. */}
            <div className="relative inline-block" style={{ maxWidth: "88%", maxHeight: "92%" }}>
              <img
                src={src}
                alt={alt}
                className="block max-h-full max-w-full select-none object-contain"
                draggable="false"
                style={{
                  maxHeight: "92vh",
                  borderRadius: "6px",
                  border: "1px solid rgba(214,161,105,0.2)",
                  boxShadow: "0 26px 50px -12px rgba(0,0,0,0.6)",
                }}
              />
              {hotspots.map((h, i) => (
                <ViewEye key={i} hotspot={h} onActivate={onHotspot} />
              ))}
            </div>
          </TransformComponent>

          {/* Glass zoom pill */}
          <div
            className="absolute bottom-[2.4rem] right-[2.8rem] flex items-center gap-[2px] rounded-[2rem] p-[0.4rem] backdrop-blur-md mob:bottom-3 mob:right-3"
            style={{ background: "rgba(20,16,12,0.55)", border: "1px solid rgba(214,161,105,0.25)" }}
          >
            <button
              type="button"
              data-interactive
              aria-label="Zoom out"
              onClick={() => zoomOut()}
              className="grid h-[3rem] w-[3rem] place-items-center rounded-full border-0 bg-transparent text-[1.6rem] leading-none text-linen transition-colors hover:bg-linen/10"
            >
              −
            </button>
            <button
              type="button"
              data-interactive
              onClick={() => resetTransform()}
              className="border-0 bg-transparent px-[0.8rem] text-[1.1rem] text-clay transition-colors hover:text-linen"
            >
              Reset
            </button>
            <button
              type="button"
              data-interactive
              aria-label="Zoom in"
              onClick={() => zoomIn()}
              className="grid h-[3rem] w-[3rem] place-items-center rounded-full border-0 bg-transparent text-[1.6rem] leading-none text-linen transition-colors hover:bg-linen/10"
            >
              +
            </button>
          </div>
        </div>
      )}
    </TransformWrapper>
  );
}
