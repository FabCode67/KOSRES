/**
 * Kigali's CBD reference point (Downtown / Nyarugenge, near Kigali City
 * Tower & Union Trade Centre) — the conventional anchor for "distance to
 * CBD" in Rwandan property work. Change here if valuers use a different
 * reference point (or extend to a per-district reference later).
 */
export const CBD_REFERENCE = { lat: -1.9506, lng: 30.0605 };

/**
 * Straight-line ("as the crow flies") distance in km between two lat/lng
 * points, via the Haversine formula. This is NOT driving distance — Kigali's
 * road network isn't a grid, so real travel distance will usually be higher.
 * Kept explicit in the name/response so nothing downstream conflates the two.
 */
export function haversineKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371.0088; // mean Earth radius, km
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(a));
}

export function distanceToCbdKm(lat: number, lng: number): number {
  return haversineKm(lat, lng, CBD_REFERENCE.lat, CBD_REFERENCE.lng);
}
