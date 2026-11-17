import { parseMeasurement } from './region-status.js';
import { average } from './network-summary.js';
import { pickExtremes } from './current-values.js';

// Rekenwerk achter de Wijken-pagina: reeksen per wijk, trend, rangschikking,
// stadsgemiddelde en vergelijking. Puur, zodat het met `node --test` te
// controleren is. Alles wordt afgeleid uit een keer ophalen van de timelapse.

/** Maximaal aantal wijken in de vergelijking. */
export const MAX_COMPARE = 3;

/** Onder dit verschil (in de eenheid van de laag) heet een wijk "stabiel". */
export const TREND_THRESHOLDS = { avgTemp: 0.3, avgPm25: 1 };
const DEFAULT_TREND_THRESHOLD = 0.3;

export const TREND = { up: 'up', down: 'down', flat: 'flat' };

/**
 * Reeks per wijk uit de timelapse-frames.
 * @param frames tijdstappen: [{ timestamp, values: [{ id, avgTemp, avgPm25 }] }]
 * @param key    'avgTemp' of 'avgPm25'
 * @returns Map van wijk-id naar [{ timestamp, value }], value is null zonder meting
 */
export function buildSeriesByRegion(frames, key) {
    const byId = new Map();
    const list = Array.isArray(frames) ? frames : [];
    list.forEach((frame, index) => {
        for (const v of frame?.values ?? []) {
            if (!byId.has(v.id)) byId.set(v.id, new Array(list.length).fill(null));
            byId.get(v.id)[index] = { timestamp: frame.timestamp, value: parseMeasurement(v[key]) };
        }
    });
    // Een wijk die in een frame ontbreekt krijgt daar een lege plek, geen gat in de array.
    for (const series of byId.values()) {
        series.forEach((point, i) => {
            if (point === null) series[i] = { timestamp: list[i]?.timestamp, value: null };
        });
    }
    return byId;
}

/** Stadsgemiddelde per tijdstap: gemiddelde van de wijken met een meting, anders null. */
export function cityAverageSeries(frames, key) {
    return (Array.isArray(frames) ? frames : []).map((frame) => ({
        timestamp: frame?.timestamp,
        value: average((frame?.values ?? []).map((v) => parseMeasurement(v[key]))),
    }));
}

/** Alleen de echte waarden van een reeks, in volgorde. */
export function seriesValues(series) {
    return (series ?? []).map((p) => p?.value).filter((v) => v !== null && v !== undefined);
}

/**
 * Verandering over de reeks: laatste echte waarde min eerste echte waarde.
 * @returns {{delta: number, direction: string}|null} null bij minder dan twee metingen
 */
export function computeTrend(series, threshold = DEFAULT_TREND_THRESHOLD) {
    const values = seriesValues(series);
    if (values.length < 2) return null;
    const delta = values[values.length - 1] - values[0];
    let direction = TREND.flat;
    if (delta > threshold) direction = TREND.up;
    else if (delta < -threshold) direction = TREND.down;
    return { delta, direction };
}

/** Meest recente echte waarde van een reeks, of null. */
export function latestValue(series) {
    const values = seriesValues(series);
    return values.length === 0 ? null : values[values.length - 1];
}

/**
 * Rij per wijk voor de tabel: waarde nu, reeks, trend, stations en status.
 * De waarde nu is alleen de live waarde uit /neighbourhood/history (zie
 * current-values.js). Een wijk zonder die waarde heeft geen waarde: de reeks
 * blijft voor het verloop, maar een oude frame-waarde is niet "nu".
 * @param regions       [{ id, name, avgTemp, avgPm25 }] huidige waarden
 * @param seriesById    uitkomst van buildSeriesByRegion
 * @param stationCounts Map van wijk-id naar aantal actieve stations
 */
export function buildRows(regions, seriesById, stationCounts, key) {
    const threshold = TREND_THRESHOLDS[key] ?? DEFAULT_TREND_THRESHOLD;
    return (regions ?? []).map((region) => {
        const series = seriesById?.get(region.id) ?? [];
        const value = parseMeasurement(region[key]);
        return {
            id: region.id,
            name: region.name,
            [key]: value,
            value,
            hasData: value !== null,
            series,
            // Zonder actuele waarde ook geen trend: de oude reeks zou een verouderd eindpunt als "nu" tonen.
            trend: value === null ? null : computeTrend(series, threshold),
            stations: stationCounts?.get(region.id) ?? 0,
        };
    });
}

/**
 * Samenvatting van de rangschikking: warmst/koudst (of hoogst/laagst) en de
 * grootste verandering in 24 uur. Wijken zonder actuele waarde of zonder trend
 * tellen niet mee. Gelijke waarden beslist de naam (pickExtremes).
 */
export function summarizeRanking(rows) {
    const withValue = (rows ?? []).filter((r) => r.hasData);
    const { highest, lowest } = pickExtremes(withValue, (r) => r.value);
    const biggestChange = withValue
        .filter((r) => r.trend)
        .reduce((best, r) => (best === null || Math.abs(r.trend.delta) > Math.abs(best.trend.delta) ? r : best), null);
    return { highest, lowest, biggestChange };
}

/** Voegt een wijk toe of haalt hem weg; maximaal MAX_COMPARE, de nieuwste valt eruit als het vol is. */
export function toggleCompare(selectedIds, id, max = MAX_COMPARE) {
    const list = selectedIds ?? [];
    if (list.includes(id)) return list.filter((x) => x !== id);
    if (list.length >= max) return list;
    return [...list, id];
}

/**
 * Datapunten voor de vergelijkingsgrafiek: een rij per tijdstip met het
 * stadsgemiddelde en de waarde van elke gekozen wijk onder `r<id>`.
 */
export function buildCompareData(frames, selectedIds, key) {
    const seriesById = buildSeriesByRegion(frames, key);
    const city = cityAverageSeries(frames, key);
    return city.map((point, i) => {
        const row = { timestamp: point.timestamp, city: point.value };
        for (const id of selectedIds ?? []) {
            row[`r${id}`] = seriesById.get(id)?.[i]?.value ?? null;
        }
        return row;
    });
}

/** Ray casting: ligt het punt in de ring? Coordinaten zijn [lat, lng] zoals de backend ze stuurt. */
export function pointInRing(lat, lng, ring) {
    let inside = false;
    for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
        const [yi, xi] = ring[i];
        const [yj, xj] = ring[j];
        const crosses = (yi > lat) !== (yj > lat) && lng < ((xj - xi) * (lat - yi)) / (yj - yi) + xi;
        if (crosses) inside = !inside;
    }
    return inside;
}

/**
 * Aantal actieve stations per wijk, op basis van de plek van het station.
 * Stations zonder locatie of met isActive === false tellen niet mee.
 * @param neighbourhoods [{ id, coordinates: [[lat, lng], ...] }]
 * @returns Map van wijk-id naar aantal
 */
export function countActiveStations(stations, neighbourhoods) {
    const counts = new Map((neighbourhoods ?? []).map((n) => [n.id, 0]));
    for (const s of stations ?? []) {
        if (s?.isActive === false) continue;
        const lat = parseMeasurement(s?.latitude);
        const lng = parseMeasurement(s?.longitude);
        if (lat === null || lng === null) continue;
        const home = (neighbourhoods ?? []).find(
            (n) => Array.isArray(n.coordinates) && n.coordinates.length > 2 && pointInRing(lat, lng, n.coordinates)
        );
        if (home) counts.set(home.id, counts.get(home.id) + 1);
    }
    return counts;
}
