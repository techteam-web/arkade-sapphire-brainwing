import { useRef, useState } from "react";
import { gsap, useGSAP } from "../gsap/gsapConfig.js";
import FloorPlanViewer from "../components/FloorPlanViewer.jsx";
import { CATEGORIES } from "../data/floorPlans.js";

export default function Floorplan() {
  const rootRef = useRef(null);
  const titleRef = useRef(null);
  const panelRef = useRef(null);
  const planRef = useRef(null);

  const [categoryId, setCategoryId] = useState(CATEGORIES[0].id);
  const [floorId, setFloorId] = useState(CATEGORIES[0].floors[0].id);

  // derive everything from the two ids (cheap lookups — no useMemo needed)
  const category = CATEGORIES.find((c) => c.id === categoryId);
  const activeFloor =
    category.floors.find((f) => f.id === floorId) ?? category.floors[0];

  // switching category jumps to that category's first floor
  const handleCategory = (id) => {
    const next = CATEGORIES.find((c) => c.id === id);
    setCategoryId(id);
    setFloorId(next.floors[0].id);
  };

  useGSAP(
    () => {
      gsap.set([titleRef.current, panelRef.current, planRef.current], {
        opacity: 0,
        y: "0.5rem",
      });
      const tl = gsap.timeline({ delay: 0.2 });
      tl.to(titleRef.current, { opacity: 1, y: 0, duration: 0.6, ease: "auraExpo" })
        .to(panelRef.current, { opacity: 1, y: 0, duration: 0.7, ease: "auraExpo" }, "-=0.4")
        .to(planRef.current, { opacity: 1, y: 0, duration: 0.8, ease: "auraExpo" }, "-=0.55");
      return () => tl.kill();
    },
    { scope: rootRef }
  );

  return (
    <main ref={rootRef} className="relative h-screen w-screen overflow-hidden bg-espresso">
      <h1 ref={titleRef}
        className="absolute left-20 top-20 font-display text-3xl leading-none tracking-[-0.01em] text-paper mob:left-4 mob:top-14 mob:text-2xl">
        Floor Plan
      </h1>

      <div className="absolute inset-x-20 bottom-16 top-36 grid grid-cols-12 grid-rows-1 gap-10 mob:flex mob:flex-col mob:inset-x-4 mob:top-24 mob:bottom-4 mob:gap-3">
        {/* LEFT — selection panel */}
        <aside ref={panelRef} className="col-span-3 flex min-h-0 flex-col gap-6 text-paper/85 mob:flex-none mob:gap-3">
          {/* category */}
          <div className="flex flex-col gap-3 mob:flex-row mob:gap-5">
            {CATEGORIES.map((c) => (
              <button
                key={c.id}
                type="button"
                data-interactive
                onClick={() => handleCategory(c.id)}
                className={`border-0 bg-transparent p-0 text-left text-[0.85rem] uppercase tracking-[0.12em] transition-colors duration-300 ${
                  c.id === categoryId ? "text-gold" : "text-paper/70 hover:text-paper"
                }`}
              >
                {c.label}
              </button>
            ))}
          </div>

          <span className="block h-px w-full bg-platinum/12 mob:hidden" />

          {/* floor list — vertical scroll on desktop, horizontal chips on phones */}
          <nav className="-mr-2 flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto pr-2 mob:mr-0 mob:flex-none mob:flex-row mob:gap-2 mob:overflow-x-auto mob:overflow-y-hidden mob:pr-0 mob:pb-1">
            {category.floors.map((f) => {
              const isActive = f.id === activeFloor.id;
              return (
                <button
                  key={f.id}
                  type="button"
                  data-interactive
                  onClick={() => setFloorId(f.id)}
                  className={`rounded-sm px-3 py-2 text-left transition-colors duration-200 mob:shrink-0 mob:min-w-34 mob:border mob:border-platinum/12 ${
                    isActive ? "bg-paper/10 mob:border-gold/50" : "hover:bg-paper/5"
                  }`}
                >
                  <span className={`block text-[0.82rem] ${isActive ? "text-gold" : "text-paper"}`}>
                    {f.name}
                  </span>
                  <span className="block text-[0.7rem] text-silver">{f.config}</span>
                </button>
              );
            })}
          </nav>

          <span className="block h-px w-full bg-platinum/12 mob:hidden" />

          {/* info for the selected floor (desktop — a mobile copy sits under the viewer) */}
          <dl className="flex flex-col gap-3 text-[0.8rem] mob:hidden">
            <div className="flex justify-between">
              <dt className="text-silver">Carpet</dt>
              <dd className="text-paper">{activeFloor.carpet}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-silver">Deck</dt>
              <dd className="text-paper">{activeFloor.deck}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-silver">Configuration</dt>
              <dd className="text-paper">{activeFloor.config}</dd>
            </div>
          </dl>
        </aside>

        {/* RIGHT — viewer */}
        <div ref={planRef} className="relative col-span-9 min-h-0 mob:flex-1 mob:min-h-0">
          <FloorPlanViewer src={activeFloor.img} alt={activeFloor.name} />
        </div>

        {/* Mobile-only stat strip under the viewer */}
        <dl className="hidden mob:flex mob:flex-none mob:items-stretch mob:gap-3 mob:text-center">
          {[
            ["Carpet", activeFloor.carpet],
            ["Deck", activeFloor.deck],
            ["Config", activeFloor.config],
          ].map(([label, value]) => (
            <div key={label} className="flex-1 rounded-sm border border-platinum/12 py-2">
              <dt className="text-[0.55rem] tracking-[0.24em] uppercase text-silver">{label}</dt>
              <dd className="mt-1 text-[0.78rem] text-paper">{value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </main>
  );
}