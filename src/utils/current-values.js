import { MAX_AGE_MS } from './heatmap-data.js';
import { parseMeasurementTime } from './measurement-time.js';
import { parseMeasurement } from './region-status.js';

// Een bron voor "wat is de actuele waarde" op Kaart, Heatmap, Wijken en Dashboard.
//
// Regels:
// - De actuele waarde van een wijk is die uit /neighbourhood/history?timestamp=nu.
//   De backend stuurt "NaN" of null voor een wijk zonder recente meting: dat is
//   geen waarde (en nooit 0).
// - De timelapse is voor het verloop, niet voor "nu". Er wordt nooit teruggezocht
//   naar de laatste frame met een waarde: zo kwam Dongewijk (laatste waarde 5 uur
//   geleden) als koudste wijk op /wijken terecht. Alleen als de snapshot ontbreekt
//   telt het laatste frame, en dan alleen als het vers is en iets bevat.
// - "Vers" is hetzelfde als op de heatmap: niet ouder dan CURRENT_MAX_AGE_MS.
// - Tijden worden alleen gelezen met parseMeasurementTime (measurement-time.js).

/** Een waarde of frame ouder dan dit (2 uur) is niet meer actueel. Gelijk aan de heatmap. */
export const CURRENT_MAX_AGE_MS = MAX_AGE_MS;

const KEYS = ['avgTemp', 'avgPm25'];

/** Naam-vergelijking voor gelijke waarden: alfabetisch, hoofdletterongevoelig. */
export function compareByName(a, b) {
    return String(a?.name ?? '').localeCompare(String(b?.name ?? ''), 'nl', { sensitivity: 'base' });
}

/**
 * Wijken met schone getallen: alles wat geen echte meting is wordt null.
 * @param regions [{ id, name, avgTemp, avgPm25 }] uit /neighbourhood/history
 */
export function normalizeRegions(regions) {
    return (Array.isArray(regions) ? regions : []).filter(Boolean).map((r) => {
        const out = { id: r.id, name: r.name };
        for (const key of KEYS) out[key] = parseMeasurement(r[key]);
        return out;
    });
}

/** Is dit frame actueel (tijd binnen het venster) en bevat het minstens een echte waarde? */
export function isFrameCurrent(frame, now = Date.now(), maxAgeMs = CURRENT_MAX_AGE_MS) {
    const time = parseMeasurementTime(frame?.timestamp);
    if (time === null || now - time > maxAgeMs || time - now > maxAgeMs) return false;
    return (frame?.values ?? []).some((v) => KEYS.some((key) => parseMeasurement(v?.[key]) !== null));
}

/** Het laatste frame als het actueel is, anders null. Zoekt nooit verder terug. */
export function currentFrame(frames, now = Date.now(), maxAgeMs = CURRENT_MAX_AGE_MS) {
    const list = Array.isArray(frames) ? frames : [];
    const last = list[list.length - 1];
    return isFrameCurrent(last, now, maxAgeMs) ? last : null;
}

/**
 * Actuele waarde per wijk.
 * @param snapshot  antwoord van /neighbourhood/history (leeg of ontbrekend mag)
 * @param timelapse { neighbourhoods, frames } (parseTimelapse), alleen terugval zonder snapshot
 * @returns [{ id, name, avgTemp, avgPm25 }], waarden zijn getal of null
 */
export function currentRegions(snapshot, timelapse = null, now = Date.now(), maxAgeMs = CURRENT_MAX_AGE_MS) {
    if (Array.isArray(snapshot) && snapshot.length > 0) return normalizeRegions(snapshot);
    const frame = currentFrame(timelapse?.frames, now, maxAgeMs);
    if (!frame) return normalizeRegions(timelapse?.neighbourhoods ?? []).map((r) => ({ ...r, avgTemp: null, avgPm25: null }));
    const byId = new Map(frame.values.map((v) => [v.id, v]));
    return (timelapse?.neighbourhoods ?? []).map((n) => ({
        id: n.id,
        name: n.name,
        avgTemp: parseMeasurement(byId.get(n.id)?.avgTemp),
        avgPm25: parseMeasurement(byId.get(n.id)?.avgPm25),
    }));
}

/** Stadsgemiddelde: gemiddelde van de wijken met een actuele waarde, anders null. */
export function cityAverage(regions, key = 'avgTemp') {
    const values = normalizeRegions(regions).map((r) => r[key]).filter((v) => v !== null);
    return values.length === 0 ? null : values.reduce((a, b) => a + b, 0) / values.length;
}

/**
 * Hoogste en laagste item. Items zonder echte waarde tellen niet mee, gelijke
 * waarden beslist de naam (alfabetisch eerst).
 * @param items    lijst van objecten met een naam
 * @param getValue (item) => waarde (getal of tekst uit de backend)
 * @returns {{highest: object|null, lowest: object|null}} het item zelf
 */
export function pickExtremes(items, getValue) {
    const usable = (Array.isArray(items) ? items : [])
        .map((item) => ({ item, value: parseMeasurement(getValue(item)) }))
        .filter((x) => x.value !== null);
    if (usable.length === 0) return { highest: null, lowest: null };
    const first = (better) => usable.reduce((best, x) => {
        if (x.value === best.value) return compareByName(x.item, best.item) < 0 ? x : best;
        return better(x.value, best.value) ? x : best;
    }).item;
    return { highest: first((a, b) => a > b), lowest: first((a, b) => a < b) };
}

/** Warmste en koudste wijk (of hoogste en laagste voor een andere laag) uit actuele wijken. */
export function pickRegionExtremes(regions, key = 'avgTemp') {
    const { highest, lowest } = pickExtremes(normalizeRegions(regions), (r) => r[key]);
    const view = (r) => (r ? { id: r.id, name: r.name, temp: r[key] } : null);
    return { warmest: view(highest), coldest: view(lowest) };
}
