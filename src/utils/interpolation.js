// Pure functies voor de heatmap: IDW (inverse distance weighting) tussen
// meetstations. Geen DOM, geen kaart, zodat alles te testen is.
//
// Een punt is {lat, lng, value, ...}. Punten met een niet-eindige waarde of
// positie worden overal genegeerd (NaN mag nooit in de kleurvlak lekken).

import { pickExtremes } from './current-values.js';

export const KM_PER_DEG_LAT = 110.57;
export const KM_PER_DEG_LNG_AT_EQUATOR = 111.32;

/** Binnen deze afstand (km) telt het kleurvlak voor 100% mee. */
export const FULL_COVERAGE_KM = 1;
/** Voorbij deze afstand (km) tot het dichtstbijzijnde station is er geen schatting. */
export const MAX_COVERAGE_KM = 2.5;
export const IDW_POWER = 2;
const SAME_SPOT_KM = 0.001;

/** Is dit een bruikbaar punt: eindige waarde en een echte positie (niet 0,0)? */
export function isUsablePoint(p) {
    if (!p || typeof p.value !== 'number') return false;
    if (!Number.isFinite(p.value) || !Number.isFinite(p.lat) || !Number.isFinite(p.lng)) return false;
    return !(p.lat === 0 && p.lng === 0);
}

export function usablePoints(points) {
    return Array.isArray(points) ? points.filter(isUsablePoint) : [];
}

/** Afstand in km tussen twee posities (vlakke benadering, ruim genoeg op stadsschaal). */
export function distanceKm(lat1, lng1, lat2, lng2) {
    const meanLat = ((lat1 + lat2) / 2) * (Math.PI / 180);
    const dx = (lng2 - lng1) * KM_PER_DEG_LNG_AT_EQUATOR * Math.cos(meanLat);
    const dy = (lat2 - lat1) * KM_PER_DEG_LAT;
    return Math.hypot(dx, dy);
}

/** De n dichtstbijzijnde bruikbare punten, dichtstbij eerst, elk met `distanceKm`. */
export function nearestPoints(points, lat, lng, n = 3) {
    return usablePoints(points)
        .map((point) => ({ point, distanceKm: distanceKm(lat, lng, point.lat, point.lng) }))
        .sort((a, b) => a.distanceKm - b.distanceKm)
        .slice(0, Math.max(0, n));
}

/** 1 dichtbij een station, daalt zacht naar 0 aan de rand van het bereik. */
export function coverageAlpha(nearestKm, fullKm = FULL_COVERAGE_KM, maxKm = MAX_COVERAGE_KM) {
    if (!Number.isFinite(nearestKm)) return 0;
    if (nearestKm <= fullKm) return 1;
    if (nearestKm >= maxKm) return 0;
    const t = (maxKm - nearestKm) / (maxKm - fullKm);
    return t * t * (3 - 2 * t);
}

/**
 * Geschatte waarde op een positie.
 * @returns {{value: number|null, alpha: number, nearestKm: number|null}}
 *   value is null als er geen station binnen maxKm ligt; alpha is de betrouwbaarheid (0 tot 1).
 */
export function estimateAt(points, lat, lng, options = {}) {
    const { power = IDW_POWER, fullKm = FULL_COVERAGE_KM, maxKm = MAX_COVERAGE_KM } = options;
    const near = nearestPoints(points, lat, lng, Infinity);
    if (near.length === 0) return { value: null, alpha: 0, nearestKm: null };

    const nearestKm = near[0].distanceKm;
    if (nearestKm > maxKm) return { value: null, alpha: 0, nearestKm };
    if (nearestKm < SAME_SPOT_KM) return { value: near[0].point.value, alpha: 1, nearestKm };

    let weightSum = 0;
    let valueSum = 0;
    for (const { point, distanceKm: d } of near) {
        if (d > maxKm) break;
        const w = 1 / Math.pow(d, power);
        weightSum += w;
        valueSum += w * point.value;
    }
    return { value: valueSum / weightSum, alpha: coverageAlpha(nearestKm, fullKm, maxKm), nearestKm };
}

/** Rechthoek om de bruikbare punten, `marginKm` ruim, begrensd door `limit`. Null zonder punten. */
export function boundsAround(points, marginKm = MAX_COVERAGE_KM, limit = null) {
    const pts = usablePoints(points);
    if (pts.length === 0) return null;
    const lats = pts.map((p) => p.lat);
    const lngs = pts.map((p) => p.lng);
    const south = Math.min(...lats);
    const north = Math.max(...lats);
    const west = Math.min(...lngs);
    const east = Math.max(...lngs);
    const dLat = marginKm / KM_PER_DEG_LAT;
    const dLng = marginKm / (KM_PER_DEG_LNG_AT_EQUATOR * Math.cos(((south + north) / 2) * (Math.PI / 180)));
    const box = { west: west - dLng, south: south - dLat, east: east + dLng, north: north + dLat };
    if (!limit) return box;
    return {
        west: Math.max(box.west, limit.west),
        south: Math.max(box.south, limit.south),
        east: Math.min(box.east, limit.east),
        north: Math.min(box.north, limit.north),
    };
}

/**
 * Schat een raster. Rij 0 is de noordkant. Cellen buiten bereik hebben
 * value NaN en alpha 0.
 * @returns {{cols: number, rows: number, values: Float32Array, alphas: Float32Array}}
 */
export function buildGrid(points, bounds, cols, rows, options = {}) {
    const width = Math.max(1, Math.floor(cols));
    const height = Math.max(1, Math.floor(rows));
    const values = new Float32Array(width * height).fill(NaN);
    const alphas = new Float32Array(width * height);
    const pts = usablePoints(points);
    if (pts.length === 0 || !bounds) return { cols: width, rows: height, values, alphas };

    for (let row = 0; row < height; row++) {
        const lat = bounds.north - ((row + 0.5) / height) * (bounds.north - bounds.south);
        for (let col = 0; col < width; col++) {
            const lng = bounds.west + ((col + 0.5) / width) * (bounds.east - bounds.west);
            const { value, alpha } = estimateAt(pts, lat, lng, options);
            if (value !== null) {
                values[row * width + col] = value;
                alphas[row * width + col] = alpha;
            }
        }
    }
    return { cols: width, rows: height, values, alphas };
}

/**
 * Warmste (hoogste) en koudste (laagste) punt. Zonder spreiding (0 of 1 punt,
 * of overal dezelfde waarde) valt er niets op en zijn beide null.
 */
export function findExtremes(points) {
    const pts = usablePoints(points);
    if (pts.length < 2) return { hot: null, cold: null };
    // Gelijke waarden beslist de naam, net als bij wijken (current-values.js).
    const { highest, lowest } = pickExtremes(pts, (p) => p.value);
    return highest.value === lowest.value ? { hot: null, cold: null } : { hot: highest, cold: lowest };
}
