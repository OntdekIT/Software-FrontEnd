import { parseMeasurement } from './region-status.js';

// Zet de stationslijst (/Meetstation/stationsMetMeasurements) om naar punten
// voor de interpolatie. Alleen stations met een recente, echte meting doen mee.

/** Een meting ouder dan dit telt niet meer mee (een station meldt zich elke paar minuten). */
export const MAX_AGE_MS = 2 * 60 * 60 * 1000;

// Veld in een meting per laag.
const MEASUREMENT_KEYS = { temperature: 'temperature', pm25: 'pm2.5' };

// Kleurschaal: minimaal zoveel eenheden breed, anders wordt een verschil van een
// tiende graad een regenboog. De kaart zelf schaalt op min en max.
export const MIN_RANGE_SPAN = { temperature: 3, pm25: 10 };

const AMSTERDAM = 'Europe/Amsterdam';

// Verschil (ms) tussen Amsterdamse wandtijd en UTC op een moment.
function amsterdamOffsetMs(utcMs) {
    const parts = new Intl.DateTimeFormat('en-US', {
        timeZone: AMSTERDAM, hourCycle: 'h23',
        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit', second: '2-digit',
    }).formatToParts(new Date(utcMs));
    const get = (type) => Number(parts.find((p) => p.type === type).value);
    const asUtc = Date.UTC(get('year'), get('month') - 1, get('day'), get('hour'), get('minute'), get('second'));
    return asUtc - Math.floor(utcMs / 1000) * 1000;
}

/**
 * Tijdstip van een meting in ms, of null. De backend stuurt "17-11-2026 22:30:19"
 * (Amsterdamse tijd); ISO-teksten worden ook begrepen.
 */
export function parseMeasurementTime(text) {
    if (typeof text !== 'string') return null;
    const match = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2}):(\d{2})$/.exec(text.trim());
    if (!match) {
        const iso = new Date(text).getTime();
        return Number.isFinite(iso) ? iso : null;
    }
    const [, d, mo, y, h, mi, s] = match.map(Number);
    const wall = Date.UTC(y, mo - 1, d, h, mi, s);
    // Twee keer verfijnen vangt de zomertijdgrens op.
    let utc = wall - amsterdamOffsetMs(wall);
    utc = wall - amsterdamOffsetMs(utc);
    return utc;
}

/**
 * @returns {{points: Array, total: number, excluded: number}}
 *   points: {id, lat, lng, value, time}; excluded: stations zonder recente meting voor deze laag
 */
export function toHeatPoints(stations, metricId, now = Date.now(), maxAgeMs = MAX_AGE_MS) {
    const key = MEASUREMENT_KEYS[metricId] ?? MEASUREMENT_KEYS.temperature;
    const list = Array.isArray(stations) ? stations : [];
    const points = [];

    for (const station of list) {
        const lat = parseFloat(station?.latitude);
        const lng = parseFloat(station?.longitude);
        if (!Number.isFinite(lat) || !Number.isFinite(lng) || (lat === 0 && lng === 0)) continue;

        let best = null;
        for (const m of station.measurements ?? station.measurementDtoList ?? []) {
            const value = parseMeasurement(m?.[key]);
            const time = parseMeasurementTime(m?.timestamp);
            if (value === null || time === null) continue;
            if (best === null || time > best.time) best = { value, time };
        }
        if (best === null || now - best.time > maxAgeMs || best.time - now > maxAgeMs) continue;

        points.push({ id: station.stationid ?? station.id, name: station.name ?? null, lat, lng, value: best.value, time: best.time });
    }
    return { points, total: list.length, excluded: list.length - points.length };
}

/** Kleurbereik {min, max} voor de punten, met een minimale breedte rond het midden. Null zonder punten. */
export function heatRange(points, metricId) {
    const values = (points ?? []).map((p) => p.value).filter(Number.isFinite);
    if (values.length === 0) return null;
    let min = Math.min(...values);
    let max = Math.max(...values);
    const span = MIN_RANGE_SPAN[metricId] ?? MIN_RANGE_SPAN.temperature;
    if (max - min < span) {
        const mid = (min + max) / 2;
        min = mid - span / 2;
        max = mid + span / 2;
    }
    return { min, max };
}
