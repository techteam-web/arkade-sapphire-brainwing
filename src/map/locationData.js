// Single source of truth for the Location page's category list AND map markers.
// Both src/pages/Location.jsx and src/map/LocationMap.jsx import from here.
// All wiring is by `id`, never by array index — reordering must not silently
// break the list <-> map linkage.
//
// Coordinates were geocoded against OpenStreetMap (Nominatim) for the Santacruz
// West landmarks in the project brochure. A couple of landmarks not present in
// OSM (Willingdon Gymkhana, Rose Manor) use area-accurate coordinates consistent
// with their stated drive times. Times are the developer's stated drive times.

export const SITE = {
  id: "arkade-sapphire",
  name: "Arkade Sapphire",
  // S.V. Road, Santacruz West (near Santacruz station / Khira Nagar).
  lng: 72.839833,
  lat: 19.082165,
};

export const SITE_CAMERA = {
  center: [SITE.lng, SITE.lat],
  zoom: 14.6,
  pitch: 55,
  bearing: -18,
};

// Every landmark lives inside a category. Categories drive the accordion UI on the
// Location page; the flattened POIS list below drives the map markers + routing.
export const CATEGORIES = [
  {
    id: "connectivity",
    label: "Connectivity",
    pois: [
      {
        id: "western-express-highway",
        place: "Western Express Highway",
        time: "9 mins",
        lng: 72.84661545034251,
        lat: 19.08071304594529,
        camera: { zoom: 15, pitch: 45, bearing: 10 },
      },
      {
        id: "santacruz-station",
        place: "Santacruz Rly Stn",
        time: "2 mins",
        lng: 72.84175023524631,
        lat: 19.081705909858638,
        camera: { zoom: 15.5, pitch: 45, bearing: -5 },
      },
      {
        id: "metro-2b",
        place: "Metroline 2B Station (Upcoming)",
        time: "4 mins",
        lng: 72.83789686214136,
        lat: 19.08218139942353,
        camera: { zoom: 15.2, pitch: 45, bearing: 0 },
      },
      {
        id: "domestic-airport",
        place: "Domestic Airport (T1)",
        time: "12 mins",
        lng: 72.85584336244247,
        lat: 19.09352152474725,
        camera: { zoom: 14, pitch: 45, bearing: 25 },
      },
      {
        id: "sclr",
        place: "SCLR",
        time: "8 mins",
        lng: 72.84763800792814,
        lat: 19.07461512907186,
        camera: { zoom: 14, pitch: 45, bearing: 20 },
      },
      {
        id: "bandra-worli-sealink",
        place: "Bandra-Worli Sealink",
        time: "14 mins",
        lng: 72.82495466214574,
        lat: 19.04331665300068,
        camera: { zoom: 13.5, pitch: 50, bearing: -25 },
      },
      {
        id: "airport-t2",
        place: "T2 Terminal (Intl. Airport)",
        time: "14 mins",
        lng: 72.87453122307333,
        lat: 19.099362461114175,
        camera: { zoom: 13.8, pitch: 45, bearing: 30 },
      },
      {
        id: "jvlr",
        place: "JVLR",
        time: "14 mins",
        lng: 72.85515340929281,
        lat: 19.140741932147993,
        camera: { zoom: 13.5, pitch: 45, bearing: 30 },
      },
      {
        id: "bkc-connector",
        place: "BKC Connector Bridge",
        time: "14 mins",
        lng: 72.86451638747741,
        lat: 19.059636913963462,
        camera: { zoom: 14, pitch: 48, bearing: -12 },
      },
    ],
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    pois: [
      { id: "high-street-linking-road", place: "High Street Retail, Linking Road", time: "6 mins", lng: 72.83439, lat: 19.07807 },
      { id: "willingdon-gymkhana", place: "Willingdon Gymkhana", time: "4 mins", lng: 72.84034679099874, lat: 19.074836192851542 },
      { id: "khar-gymkhana", place: "Khar Gymkhana", time: "6 mins", lng: 72.83180755051872, lat: 19.070957541072886 },
      { id: "taj-santacruz", place: "Taj Santacruz", time: "10 mins", lng: 72.8544, lat: 19.09269 },
      { id: "grand-hyatt", place: "Grand Hyatt", time: "10 mins", lng: 72.85144, lat: 19.07753 },
    ],
  },
  {
    id: "education",
    label: "Education",
    pois: [
      { id: "rn-podar", place: "R N Podar International School", time: "3 mins", lng: 72.83797, lat: 19.07905 },
      { id: "mithibai", place: "NM & Mithibai Colleges", time: "8 mins", lng: 72.83742, lat: 19.10288 },
      { id: "sndt", place: "SNDT Women's University", time: "6 mins", lng: 72.83103, lat: 19.08777 },
      { id: "ls-raheja", place: "L.S. Raheja College", time: "6 mins", lng: 72.83302, lat: 19.08582 },
      { id: "rose-manor", place: "Rose Manor International School", time: "5 mins", lng: 72.8355, lat: 19.084 },
    ],
  },
  {
    id: "healthcare",
    label: "Healthcare",
    pois: [
      { id: "nanavati", place: "Nanavati Hospital", time: "6 mins", lng: 72.84001, lat: 19.09597 },
      { id: "surya", place: "Surya Hospitals", time: "4 mins", lng: 72.83773, lat: 19.08573 },
    ],
  },
  {
    id: "commercial",
    label: "Commercial Hubs",
    pois: [
      { id: "bkc", place: "BKC", time: "16 mins", lng: 72.86133, lat: 19.05927 },
      { id: "nesco", place: "Nesco", time: "20 mins", lng: 72.85502, lat: 19.15249 },
      { id: "malad-mindspace", place: "Malad Mindspace", time: "28 mins", lng: 72.83414, lat: 19.18478 },
    ],
  },
];

// Flattened list (each POI tagged with its category id) — powers the map markers,
// routing and id lookups.
export const POIS = CATEGORIES.flatMap((c) =>
  c.pois.map((p) => ({ ...p, category: c.id }))
);

export function findPoi(id) {
  return POIS.find((p) => p.id === id) ?? null;
}
