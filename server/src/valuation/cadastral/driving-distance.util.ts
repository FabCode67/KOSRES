/**
 * Real driving distance/time between two lat/lng points, via OSRM
 * (Open Source Routing Machine) — using OSRM's free public demo server
 * (router.project-osrm.org). This is the "easy and feasible right now"
 * path: no API key, no billing account, no infrastructure to run.
 *
 * Trade-off, and why this function is isolated from the CBD straight-line
 * calculation: the public demo server is meant for light testing, not
 * guaranteed production traffic — it can be slow or occasionally
 * unavailable (the same class of caveat we already hit with public
 * Overpass mirrors). If/when real usage volume shows up, swap the
 * ROUTING_BASE_URL below for either a paid provider (Google/Mapbox
 * Directions API) or a self-hosted OSRM instance loaded with Rwanda's
 * OSM road extract — nothing else in this file needs to change.
 */

const ROUTING_BASE_URL = 'https://router.project-osrm.org/route/v1/driving';

export type DrivingRoute = {
  drivingDistanceKm: number;
  drivingDurationMin: number;
};

/**
 * Returns null (never throws) if the routing server can't be reached or
 * returns no route — callers should treat driving distance as "currently
 * unavailable" rather than fail the whole request over it.
 */
export async function drivingDistanceKm(
  fromLat: number,
  fromLng: number,
  toLat: number,
  toLng: number,
): Promise<DrivingRoute | null> {
  const url = `${ROUTING_BASE_URL}/${fromLng},${fromLat};${toLng},${toLat}?overview=false`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    const res = await fetch(url, { signal: controller.signal });
    clearTimeout(timeout);

    if (!res.ok) return null;
    const data: any = await res.json();
    const route = data?.routes?.[0];
    if (!route || typeof route.distance !== 'number' || typeof route.duration !== 'number') {
      return null;
    }

    return {
      drivingDistanceKm: Math.round((route.distance / 1000) * 100) / 100,
      drivingDurationMin: Math.round(route.duration / 60),
    };
  } catch {
    return null;
  }
}
