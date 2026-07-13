// Shared by FullscreenGate (which prompts for fullscreen) and AudioProvider
// (which only lets the score play while we're in it).

export const canFullscreen = () =>
  typeof document !== "undefined" &&
  !!(document.documentElement.requestFullscreen ||
    document.documentElement.webkitRequestFullscreen);

export const isFullscreen = () =>
  typeof document !== "undefined" &&
  !!(document.fullscreenElement || document.webkitFullscreenElement);

// Both events are needed: Safari still only emits the webkit-prefixed one.
export const onFullscreenChange = (handler) => {
  document.addEventListener("fullscreenchange", handler);
  document.addEventListener("webkitfullscreenchange", handler);
  return () => {
    document.removeEventListener("fullscreenchange", handler);
    document.removeEventListener("webkitfullscreenchange", handler);
  };
};
