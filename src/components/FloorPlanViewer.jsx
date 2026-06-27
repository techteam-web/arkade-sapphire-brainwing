// npm i react-zoom-pan-pinch
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";

export default function FloorPlanViewer({ src, alt }) {
  return (
    <TransformWrapper key={src} minScale={1} maxScale={4} centerOnInit>
      {({ zoomIn, zoomOut, resetTransform }) => (
        <div className="relative h-full w-full">
          <TransformComponent wrapperClass="!h-full !w-full" contentClass="!h-full !w-full">
            <img src={src} alt={alt} className="h-full w-full object-contain" />
          </TransformComponent>
          <div className="absolute bottom-4 right-4 flex gap-1 rounded-full border border-platinum/15 bg-espresso/80 p-1 backdrop-blur">
            <button onClick={() => zoomOut()} className="grid h-8 w-8 place-items-center rounded-full text-paper hover:bg-paper/10">−</button>
            <button onClick={() => resetTransform()} className="grid h-8 place-items-center rounded-full px-3 text-xs text-paper hover:bg-paper/10">Reset</button>
            <button onClick={() => zoomIn()} className="grid h-8 w-8 place-items-center rounded-full text-paper hover:bg-paper/10">+</button>
          </div>
        </div>
      )}
    </TransformWrapper>
  );
}