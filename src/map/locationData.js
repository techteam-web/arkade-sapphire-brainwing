// Single source of truth for the Location page's connectivity list AND map markers.
// Both src/pages/Location.jsx and src/map/LocationMap.jsx import from here.
// All wiring is by `id`, never by array index — reordering this list must not silently
// break the list ↔ map linkage.
//
// Coordinates are approximate placeholders and need site-survey verification.
// The map will render reasonably with these values but exact positioning is TODO.

// TODO: confirm coordinates with the developer for all entries below.

export const SITE = {
  id: "arkade-sapphire",
  name: "Arkade Sapphire",
  lng: 72.841,
  lat: 19.081,
};

export const SITE_CAMERA = {
  center: [SITE.lng, SITE.lat],
  zoom: 15.5,
  pitch: 55,
  bearing: -18,
};

export const POIS = [
  {
    id: "western-express-highway",
    place: "Western Express Highway",
    time: "2 mins",
    lng: 72.852,
    lat: 19.083,
    camera: { zoom: 14.5, pitch: 40, bearing: 20 },
  },
  {
    id: "santacruz-station",
    place: "Santacruz Station",
    time: "3 mins",
    lng: 72.840,
    lat: 19.080,
    camera: { zoom: 15, pitch: 40, bearing: -5 },
  },
  {
    id: "metro-line-2a-7",
    place: "Metro Line 2A / 7",
    time: "7 mins",
    lng: 72.832,
    lat: 19.094,
    camera: { zoom: 14.5, pitch: 40, bearing: 0 },
  },
  {
    id: "airport-t1",
    place: "Domestic Airport (T1)",
    time: "10 mins",
    lng: 72.847,
    lat: 19.090,
    camera: { zoom: 14, pitch: 45, bearing: 30 },
  },
  {
    id: "sclr",
    place: "SCLR",
    time: "15 mins",
    lng: 72.872,
    lat: 19.073,
    camera: { zoom: 13.5, pitch: 40, bearing: 25 },
  },
  {
    id: "sealink",
    place: "Bandra-Worli Sealink",
    time: "20 mins",
    lng: 72.821,
    lat: 19.038,
    camera: { zoom: 13, pitch: 45, bearing: -30 },
  },
  {
    id: "airport-t2",
    place: "International Airport (T2)",
    time: "20 mins",
    lng: 72.866,
    lat: 19.097,
    camera: { zoom: 13.5, pitch: 45, bearing: 30 },
  },
  {
    id: "jvlr",
    place: "JVLR",
    time: "30 mins",
    lng: 72.879,
    lat: 19.122,
    camera: { zoom: 13, pitch: 40, bearing: 35 },
  },
];

export function findPoi(id) {
  return POIS.find((p) => p.id === id) ?? null;
}
