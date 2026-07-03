// Single source of truth for the Location page's connectivity list AND map markers.
// Both src/pages/Location.jsx and src/map/LocationMap.jsx import from here.
// All wiring is by `id`, never by array index — reordering this list must not silently
// break the list <-> map linkage.
//
// Coordinates were geocoded against OpenStreetMap (Nominatim) for the Santacruz West
// landmarks in the project brochure. Times are the developer's stated drive times.

export const SITE = {
  id: "arkade-sapphire",
  name: "Arkade Sapphire",
  // S.V. Road, Santacruz West (near Santacruz station / Khira Nagar).
  lng: 72.8402,
  lat: 19.0812,
};

export const SITE_CAMERA = {
  center: [SITE.lng, SITE.lat],
  zoom: 14.6,
  pitch: 55,
  bearing: -18,
};

export const POIS = [
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
];

export function findPoi(id) {
  return POIS.find((p) => p.id === id) ?? null;
}
