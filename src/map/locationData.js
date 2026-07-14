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
        lng: 72.84693,
        lat: 19.08039,
        camera: { zoom: 15, pitch: 45, bearing: 10 },
      },
      {
        id: "santacruz-station",
        place: "Santacruz Rly Stn",
        time: "2 mins",
        lng: 72.8416,
        lat: 19.081,
        camera: { zoom: 15.5, pitch: 45, bearing: -5 },
      },
      {
        id: "metro-2b",
        place: "Metroline 2B Station (Upcoming)",
        time: "4 mins",
        lng: 72.83648,
        lat: 19.08586,
        camera: { zoom: 15.2, pitch: 45, bearing: 0 },
      },
      {
        id: "domestic-airport",
        place: "Domestic Airport (T1)",
        time: "12 mins",
        lng: 72.8663,
        lat: 19.0896,
        camera: { zoom: 14, pitch: 45, bearing: 25 },
      },
      {
        id: "sclr",
        place: "SCLR",
        time: "8 mins",
        lng: 72.86899,
        lat: 19.07401,
        camera: { zoom: 14, pitch: 45, bearing: 20 },
      },
      {
        id: "bandra-worli-sealink",
        place: "Bandra-Worli Sealink",
        time: "14 mins",
        lng: 72.8175,
        lat: 19.0433,
        camera: { zoom: 13.5, pitch: 50, bearing: -25 },
      },
      {
        id: "airport-t2",
        place: "T2 Terminal (Intl. Airport)",
        time: "14 mins",
        lng: 72.87259,
        lat: 19.10136,
        camera: { zoom: 13.8, pitch: 45, bearing: 30 },
      },
      {
        id: "jvlr",
        place: "JVLR",
        time: "14 mins",
        lng: 72.8598,
        lat: 19.1355,
        camera: { zoom: 13.5, pitch: 45, bearing: 30 },
      },
      {
        id: "bkc-connector",
        place: "BKC Connector Bridge",
        time: "14 mins",
        lng: 72.8492,
        lat: 19.0625,
        camera: { zoom: 14, pitch: 48, bearing: -12 },
      },
    ],
  },
  {
    id: "lifestyle",
    label: "Lifestyle",
    pois: [
      { id: "high-street-linking-road", place: "High Street Retail, Linking Road", time: "6 mins", lng: 72.83439, lat: 19.07807 },
      { id: "willingdon-gymkhana", place: "Willingdon Gymkhana", time: "4 mins", lng: 72.828, lat: 19.09 },
      { id: "khar-gymkhana", place: "Khar Gymkhana", time: "6 mins", lng: 72.83161, lat: 19.0704 },
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
