import { useRef, useState } from "react";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";
import FloorPlanViewer from "../components/FloorPlanViewer.jsx";
import { CATEGORIES } from "../data/floorPlans.js";

const SIDEBAR_BG = "radial-gradient(140% 100% at 0% 0%, #33251c 0%, #201510 65%)";
const CONTENT_BG = "radial-gradient(120% 100% at 50% 0%, #2c2119 0%, #1c1712 55%)";
const HAIRLINE = "rgba(214,161,105,0.18)";

export default function Floorplan() {
  const rootRef = useRef(null);
  const titleRef = useRef(null);
  const panelRef = useRef(null);
  const planRef = useRef(null);
  const firstPlan = useRef(true);

  const [categoryId, setCategoryId] = useState(CATEGORIES[0].id);
  const [floorId, setFloorId] = useState(CATEGORIES[0].floors[0].id);

  const category = CATEGORIES.find((c) => c.id === categoryId);
  const activeFloor = category.floors.find((f) => f.id === floorId) ?? category.floors[0];

  const handleCategory = (id) => {
    const next = CATEGORIES.find((c) => c.id === id);
    setCategoryId(id);
    setFloorId(next.floors[0].id);
  };

  useGSAP(
    () => {
      gsap.set([titleRef.current, panelRef.current, planRef.current], { opacity: 0, y: "0.5rem" });
      const tl = gsap.timeline({ delay: 0.2 });
      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "auraExpo" })
        .to(panelRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "auraExpo" }, "-=0.4")
        .to(planRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "auraExpo" }, "-=0.55");
      return () => tl.kill();
    },
    { scope: rootRef }
  );

  // Micro-interaction: cross-fade the plan whenever the floor changes.
  useGSAP(
    () => {
      if (firstPlan.current) {
        firstPlan.current = false;
        return;
      }
      gsap.fromTo(
        planRef.current,
        { autoAlpha: 0.35, scale: 0.99 },
        { autoAlpha: 1, scale: 1, duration: 0.55, ease: "auraExpo" }
      );
    },
    { dependencies: [floorId], scope: rootRef }
  );

  const stats = [
    ["Carpet", activeFloor.carpet],
    ["Deck", activeFloor.deck],
    ["Configuration", activeFloor.config],
  ];

  return (
    <main
      ref={rootRef}
      className="relative flex h-screen w-screen overflow-hidden bg-canvas font-manrope mob:flex-col mob:overflow-y-auto"
    >
      {/* CLEAN INJECTION: Removes all visible scrollbar tracks across WebKit, 
          Firefox, and IE browsers without interrupting standard scroll functions. */}
      <style dangerouslySetInnerHTML={{__html: `
        ::-webkit-scrollbar {
          display: none !important;
          width: 0 !important;
          height: 0 !important;
        }
        * {
          -ms-overflow-style: none !important;
          scrollbar-width: none !important;
        }
      `}} />

      {/* ── LEFT · espresso sidebar ─────────────────────────────── */}
      <aside
        className="flex w-[34rem] shrink-0 flex-col px-[2.8rem] pb-[2.4rem] pt-24 mob:w-full mob:px-4 mob:pb-4 mob:pt-16"
        style={{ background: SIDEBAR_BG, borderRight: `1px solid rgba(214,161,105,0.14)` }}
      >
        <h1 ref={titleRef} className="font-news text-[2.6rem] leading-none text-cream mob:text-[2rem]">
          Floor Plan
        </h1>

        <div ref={panelRef} className="mt-[2rem] flex min-h-0 flex-1 flex-col mob:mt-4">
          {/* Tabs — Residential / Commercial with sliding copper underline */}
          <div className="flex gap-[2.2rem]" style={{ borderBottom: `1px solid ${HAIRLINE}` }}>
            {CATEGORIES.map((c) => {
              const isActive = c.id === categoryId;
              return (
                <button
                  key={c.id}
                  type="button"
                  data-interactive
                  onClick={() => handleCategory(c.id)}
                  className={`relative -mb-px bg-transparent p-0 pb-[1rem] text-[1.2rem] font-bold uppercase tracking-[0.1em] transition-colors duration-300 ${
                    isActive ? "text-copperlite" : "text-taupe2 hover:text-sand"
                  }`}
                >
                  {c.label}
                  <span
                    className={`absolute inset-x-0 -bottom-px h-[2px] origin-left rounded-full bg-copperlite transition-transform duration-300 ease-out ${
                      isActive ? "scale-x-100" : "scale-x-0"
                    }`}
                  />
                </button>
              );
            })}
          </div>

          {/* Floor list */}
          <nav className="-mr-2 mt-[1.4rem] flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-2 mob:mr-0 mob:mt-3 mob:flex-none mob:flex-row mob:gap-2 mob:overflow-x-auto mob:overflow-y-hidden mob:pb-1 mob:pr-0">
            {category.floors.map((f) => {
              const isActive = f.id === activeFloor.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  data-interactive
                  onClick={() => setFloorId(f.id)}
                  className={`group flex flex-col gap-[0.2rem] rounded-[0.8rem] border-l-2 py-[1.2rem] pl-[1.4rem] pr-[1rem] text-left transition-all duration-300 mob:shrink-0 mob:rounded-md mob:border mob:border-l-2 mob:px-3 mob:py-2 ${
                    isActive
                      ? "border-copperlite mob:border-copperlite"
                      : "border-transparent hover:pl-[1.7rem] mob:border-[rgba(214,161,105,0.14)] mob:hover:pl-3"
                  }`}
                  style={isActive ? { background: "rgba(214,161,105,0.12)" } : undefined}
                >
                  <span
                    className={`text-[1.35rem] transition-colors duration-300 ${
                      isActive ? "font-semibold text-cream" : "font-medium text-sand group-hover:text-cream"
                    }`}
                  >
                    {f.name}
                  </span>
                  <span className={`text-[1.15rem] ${isActive ? "text-clay" : "text-taupe2"}`}>
                    {f.config}
                  </span>
                </button>
              );
            })}
          </nav>

          {/* Footer stat block */}
          <dl
            className="mt-[1.6rem] flex flex-col gap-[1rem] pt-[1.6rem] mob:hidden"
            style={{ borderTop: `1px solid ${HAIRLINE}` }}
          >
            {stats.map(([label, value]) => (
              <div key={label} className="flex items-center justify-between">
                <dt className="text-[1.2rem] text-taupe">{label}</dt>
                <dd
                  className={`text-[1.35rem] font-semibold ${
                    label === "Configuration" ? "text-copperlite" : "text-linen"
                  }`}
                >
                  {value}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      </aside>

      {/* ── RIGHT · framed plan sheet ───────────────────────────── */}
      <section
        className="relative min-w-0 flex-1 mob:h-[54vh] mob:flex-none"
        style={{ background: CONTENT_BG, padding: "5vh 4vw" }}
      >
        <div ref={planRef} className="relative h-full w-full">
          <FloorPlanViewer src={activeFloor.img} alt={activeFloor.name} />
        </div>
      </section>

      {/* Mobile-only stat strip beneath the viewer */}
      <dl className="hidden gap-3 px-4 pb-6 pt-3 text-center mob:flex" style={{ background: CONTENT_BG }}>
        {stats.map(([label, value]) => (
          <div
            key={label}
            className="flex-1 rounded-md py-2"
            style={{ border: `1px solid rgba(214,161,105,0.14)` }}
          >
            <dt className="text-[0.55rem] uppercase tracking-[0.2em] text-taupe">
              {label === "Configuration" ? "Config" : label}
            </dt>
            <dd className={`mt-1 text-[0.78rem] ${label === "Configuration" ? "text-copperlite" : "text-linen"}`}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </main>
  );
}