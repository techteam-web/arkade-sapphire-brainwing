import { useTransition } from "../context/transition.js";

export default function TransitionOverlay() {
  const { overlayRef } = useTransition();

  return (
    <div
      ref={overlayRef}
      aria-hidden="true"
      className="fixed inset-0 z-50 bg-espresso"
      style={{ opacity: 0, visibility: "hidden" }}
    />
  );
}
