import { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { gsap } from "../gsap/gsapConfig.js";
import { TransitionContext } from "./transition.js";

export function TransitionProvider({ children }) {
  const navigate = useNavigate();
  const overlayRef = useRef(null);
  const [isTransitioning, setIsTransitioning] = useState(false);

  const navigateTo = useCallback(
    (path) => {
      if (isTransitioning) return;
      const overlay = overlayRef.current;
      if (!overlay) {
        navigate(path);
        return;
      }
      setIsTransitioning(true);

      const tl = gsap.timeline({
        onComplete: () => setIsTransitioning(false),
      });

      tl.set(overlay, { autoAlpha: 0 })
        .to(overlay, { autoAlpha: 1, duration: 0.4, ease: "auraEase" })
        .call(() => navigate(path))
        .to(overlay, {
          autoAlpha: 0,
          duration: 0.5,
          ease: "auraEase",
          delay: 0.08,
        });
    },
    [navigate, isTransitioning]
  );

  const value = useMemo(
    () => ({ navigateTo, isTransitioning, overlayRef }),
    [navigateTo, isTransitioning]
  );

  return (
    <TransitionContext.Provider value={value}>
      {children}
    </TransitionContext.Provider>
  );
}
