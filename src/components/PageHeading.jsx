import { useRef } from "react";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";

export default function PageHeading({ title, align = "left", tone = "paper" }) {
  const rootRef = useRef(null);
  const titleRef = useRef(null);

  const titleColor = tone === "ink" ? "text-ink" : "text-paper";
  const alignClass = align === "center" ? "items-center text-center" : "items-start text-left";

  useGSAP(
    () => {
      gsap.set(titleRef.current, { opacity: 0, y: "0.5rem" });
      const tl = gsap.to(titleRef.current, {
        opacity: 1,
        y: 0,
        duration: 0.7,
        ease: "auraExpo",
        delay: 0.15,
      });
      return () => tl.kill();
    },
    { scope: rootRef }
  );

  return (
    <div ref={rootRef} className={`flex flex-col ${alignClass}`}>
      <h1
        ref={titleRef}
        className={`font-display ${titleColor} text-4xl leading-[1.05] tracking-[-0.01em]`}
      >
        {title}
      </h1>
    </div>
  );
}
