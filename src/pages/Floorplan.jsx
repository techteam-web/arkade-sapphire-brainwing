import { useRef, useState } from "react";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";
import FloorPlanViewer from "../components/FloorPlanViewer.jsx";
import { CATEGORIES } from "../data/floorPlans.js";
import { useTransition } from "../context/transition.js";

const SIDEBAR_BG = "radial-gradient(140% 100% at 0% 0%, #33251c 0%, #201510 65%)";
const CONTENT_BG = "radial-gradient(120% 100% at 50% 0%, #2c2119 0%, #1c1712 55%)";
const HAIRLINE = "rgba(214,161,105,0.18)";

// Returning from a 360 view (?floor=<id>) reopens the exact plan we left from.
function resolveInitialFloor() {
  const id = new URLSearchParams(window.location.search).get("floor");
  if (id) {
    for (const cat of CATEGORIES) {
      const f = cat.floors.find((x) => x.id === id);
      if (f) return { categoryId: cat.id, floorId: f.id };
    }
  }
  return { categoryId: CATEGORIES[0].id, floorId: CATEGORIES[0].floors[0].id };
}

export default function Floorplan() {
  const { navigateTo } = useTransition();
  const rootRef = useRef(null);
  const titleRef = useRef(null);
  const panelRef = useRef(null);
  const planRef = useRef(null);
  const firstPlan = useRef(true);

  const [categoryId, setCategoryId] = useState(() => resolveInitialFloor().categoryId);
  const [floorId, setFloorId] = useState(() => resolveInitialFloor().floorId);

  const category = CATEGORIES.find((c) => c.id === categoryId);
  const activeFloor = category.floors.find((f) => f.id === floorId) ?? category.floors[0];

  // Collapse the flat floor list into consecutive runs sharing a `group` (wing)
  // so the nav can render static "A Wing / B Wing / C Wing" sub-heads. Floors
  // with no group (commercial) fall into a single unlabelled run.
  const wingGroups = [];
  category.floors.forEach((f) => {
    const last = wingGroups[wingGroups.length - 1];
    if (last && last.label === (f.group ?? null)) last.floors.push(f);
    else wingGroups.push({ label: f.group ?? null, floors: [f] });
  });

  // Total area ≈ carpet + deck (usable). Swap in real saleable/built-up figures
  // later by adding a `total` field to the data if they differ.
  const sqft = (s) => {
    const m = /([\d,.]+)/.exec(s || "");
    return m ? parseFloat(m[1].replace(/,/g, "")) : 0;
  };
  const totalSqft = sqft(activeFloor.carpet) + sqft(activeFloor.deck);
  const totalArea = totalSqft ? `${totalSqft} sq.ft.` : "—";

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
    ["Total Area", totalArea],
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

          {/* Floor list — grouped under static wing sub-heads (no dropdowns) */}
          <nav className="-mr-2 mt-[1.4rem] flex min-h-0 flex-1 flex-col overflow-y-auto pr-2 mob:mr-0 mob:mt-3 mob:min-h-0 mob:flex-none mob:pr-0">
            {wingGroups.map((wg, gi) => (
              <div key={wg.label ?? `grp-${gi}`} className={gi > 0 ? "mt-[1.4rem]" : ""}>
                {wg.label && (
                  <p className="mb-[0.5rem] pl-[1.4rem] text-[0.95rem] font-semibold uppercase tracking-[0.22em] text-copperlite/80 mob:pl-3">
                    {wg.label}
                  </p>
                )}
                <div className="flex flex-col gap-1">
                  {wg.floors.map((f) => {
                    const isActive = f.id === activeFloor.id;
                    return (
                      <button
                        key={f.id}
                        type="button"
                        data-interactive
                        onClick={() => setFloorId(f.id)}
                        className={`group flex flex-col gap-[0.2rem] rounded-[0.8rem] border-l-2 py-[1.1rem] pl-[1.4rem] pr-[1rem] text-left transition-all duration-300 mob:rounded-md mob:px-3 mob:py-2 ${
                          isActive
                            ? "border-copperlite"
                            : "border-transparent hover:pl-[1.7rem] mob:hover:pl-3"
                        }`}
                        style={isActive ? { background: "rgba(214,161,105,0.12)" } : undefined}
                      >
                        <span
                          className={`text-[1.3rem] transition-colors duration-300 ${
                            isActive ? "font-semibold text-cream" : "font-medium text-sand group-hover:text-cream"
                          }`}
                        >
                          {f.name}
                        </span>
                        <span className={`text-[1.1rem] ${isActive ? "text-clay" : "text-taupe2"}`}>
                          {f.config}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
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
          <FloorPlanViewer
            src={activeFloor.img}
            alt={activeFloor.name}
            hotspots={activeFloor.views || []}
            onHotspot={(vp) => navigateTo(`/views?vp=${vp}&from=${activeFloor.id}`)}
          />
        </div>
      </section>

      {/* Mobile-only stat strip beneath the viewer */}
      <dl className="hidden gap-2 px-4 pb-6 pt-3 text-center mob:flex" style={{ background: CONTENT_BG }}>
        {stats.map(([label, value]) => (
          <div
            key={label}
            className="flex-1 rounded-md py-2"
            style={{ border: `1px solid rgba(214,161,105,0.14)` }}
          >
            <dt className="text-[0.5rem] uppercase tracking-[0.16em] text-taupe">
              {label === "Configuration" ? "Config" : label === "Total Area" ? "Total" : label}
            </dt>
            <dd className={`mt-1 text-[0.72rem] ${label === "Configuration" ? "text-copperlite" : "text-linen"}`}>
              {value}
            </dd>
          </div>
        ))}
      </dl>
    </main>
  );
}