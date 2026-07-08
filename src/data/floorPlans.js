// Residential floors carry a `group` (wing) so the sidebar can show static
// "A Wing / B Wing / C Wing" sub-heads with their plans listed below — no
// dropdowns. Commercial floors have no group and render as a flat list.
//
// `views` = 360° eye hotspots. Each sits in the sheet's whitespace, OFF the unit
// drawing, on the side its balcony/outlook faces:
//   x, y  → position as a % of the plan image (0–100)
//   vp    → which viewpoint on the Top pano to open — the balcony's facing in
//           the drawing: 0 = up (12 o'clock / initial), 1 = right (3),
//           2 = down (6), 3 = left (9).
// Positions/directions are a best-fit read of each plan — tweak freely here.
export const CATEGORIES = [
  {
    id: "residential",
    label: "Residential",
    floors: [
      { id: "a-8",      group: "A Wing", name: "8th Floor (Unit 1)",           config: "2 BHK", carpet: "735 sq.ft.",  deck: "54 sq.ft.",  img: "/floorplans/Sapphire Residencial plan/wing-a-8.webp",      views: [{ x: 30.0, y: 45.0, vp: 3 }] },
      { id: "b-8",      group: "B Wing", name: "8th Floor (Unit 2)",           config: "2 BHK", carpet: "661 sq.ft.",  deck: "29 sq.ft.",  img: "/floorplans/Sapphire Residencial plan/wing-b-8.webp",      views: [{ x: 31.0, y: 80.0, vp: 2 }] },
      { id: "b-7-13",   group: "B Wing", name: "7th, 9–13th Floor (Unit 2)",   config: "3 BHK", carpet: "1267 sq.ft.", deck: "123 sq.ft.", img: "/floorplans/Sapphire Residencial plan/wing-b-7-13.webp",   views: [{ x: 52.0, y: 13.0, vp: 0 }, { x: 40.0, y: 82.0, vp: 2 }] },
      { id: "c-8-lg",   group: "C Wing", name: "8th Floor (3 BHK)",            config: "3 BHK", carpet: "1194 sq.ft.", deck: "—",          img: "/floorplans/Sapphire Residencial plan/wing-c-8-3bhk.webp", views: [{ x: 39.0, y: 16.0, vp: 0 }, { x: 44.0, y: 88.0, vp: 2 }] },
      { id: "c-4-13-a", group: "C Wing", name: "4–7th, 9–13th Floor (Unit 1)", config: "3 BHK", carpet: "1180 sq.ft.", deck: "63 sq.ft.",  img: "/floorplans/Sapphire Residencial plan/wing-c-4-13-a.webp", views: [{ x: 55.0, y: 15.0, vp: 0 }, { x: 48.0, y: 86.0, vp: 2 }] },
      { id: "c-4-13-b", group: "C Wing", name: "4–7th, 9–13th Floor (Unit 2)", config: "3 BHK", carpet: "1067 sq.ft.", deck: "—",          img: "/floorplans/Sapphire Residencial plan/wing-c-4-13-b.webp", views: [{ x: 52.0, y: 29.0, vp: 0 }, { x: 41.0, y: 87.0, vp: 2 }] },
    ],
  },
  {
    id: "commercial",
    label: "Commercial",
    floors: [
      { id: "comm-ground", name: "Ground Floor · All Shops", config: "Shops 1–3", carpet: "3019 sq.ft.", deck: "—", img: "/floorplans/Sapphire Commercial floor plan/commercial-ground.webp" },
      { id: "comm-first",  name: "First Floor · All Shops",  config: "Shops 1–3", carpet: "2792 sq.ft.", deck: "—", img: "/floorplans/Sapphire Commercial floor plan/commerical-first.webp" },
      { id: "shop-1",      name: "Shop 1 · Ground + First",  config: "Duplex",    carpet: "2091 sq.ft.", deck: "—", img: "/floorplans/Sapphire Commercial floor plan/shop-1.webp" },
      { id: "shop-2",      name: "Shop 2 · Ground + First",  config: "Duplex",    carpet: "1734 sq.ft.", deck: "—", img: "/floorplans/Sapphire Commercial floor plan/shop-2.webp" },
      { id: "shop-3",      name: "Shop 3 · Ground + First",  config: "Duplex",    carpet: "1986 sq.ft.", deck: "—", img: "/floorplans/Sapphire Commercial floor plan/shop-3.webp" },
    ],
  },
];
