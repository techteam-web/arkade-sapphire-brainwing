// npm i react-zoom-pan-pinch
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

// Framed floor-plan sheet on the dark content area, with a glass zoom pill.
// Matches the "framed print" spec: matted sheet (copper hairline + soft
// elevation), never pinned flush to an edge.
export default function FloorPlanViewer({ src, alt }) {
  return (
    <TransformWrapper key={src} minScale={1} maxScale={4} centerOnInit>
      {({ zoomIn, zoomOut, resetTransform }) => (
        <div className="relative h-full w-full">
          <TransformComponent
            wrapperClass="!h-full !w-full"
            contentClass="!h-full !w-full !flex !items-center !justify-center"
          >
            <img
              src={src}
              alt={alt}
              className="select-none object-contain"
              draggable="false"
              style={{
                maxWidth: "88%",
                maxHeight: "92%",
                borderRadius: "6px",
                border: "1px solid rgba(214,161,105,0.2)",
                boxShadow: "0 26px 50px -12px rgba(0,0,0,0.6)",
              }}
            />
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
