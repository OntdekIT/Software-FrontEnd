// Pure helpers behind the Dashboard (/dashboard): the health of the
// measurement network. No React, so they run under `node --test`.

import {getStationStatus} from "./station-status.js";
import {parseMeasurementTime} from "./measurement-time.js";
import {pickRegionExtremes} from "./current-values.js";

export const HOUR_MS = 60 * 60 * 1000;
// A station counts as "recent" when its newest measurement is at most this old.
export const RECENT_MEASUREMENT_MS = HOUR_MS;

export const REASON_OUTAGE = "uitval";
export const REASON_SENSOR = "sensorfout";
export const REASON_LATE = "late meting";

function toNumber(value) {
    const n = typeof value === "number" ? value : parseFloat(value);
    return Number.isFinite(n) ? n : null;
}

function readings(station) {
    return station?.measurementDtoList ?? station?.measurements ?? [];
}

// Newest measurement time (ms) of a station in this snapshot, or null.
export function newestReadingTime(station) {
    let newest = null;
    for (const m of readings(station)) {
        const t = parseMeasurementTime(m?.timestamp);
        if (t !== null && (newest === null || t > newest)) newest = t;
    }
    return newest;
}

export function stationId(station) {
    return station?.stationid ?? station?.id;
}

export function stationLabel(station) {
    return station?.name || `Station ${stationId(station)}`;
}

function hasSensorFault(station) {
    return getStationStatus(station).faults.length > 0;
}

// Why a station delivers nothing recent: offline (uitval), a sensor error, or
// just a late measurement from a station that still reports as online.
export function classifyStaleReason(station) {
    if (station?.isActive === false) return REASON_OUTAGE;
    if (hasSensorFault(station)) return REASON_SENSOR;
    return REASON_LATE;
}

// Stations without a measurement in the last `maxAgeMs`, newest last-seen
// first (stations never seen last). `backfill` is an optional Map of
// stationId -> ms with older sightings, used when the current snapshot holds
// no measurement for a station. Each entry:
// {id, name, lastSeen (ms|null), reason, faults, online}.
export function listStaleStations(stations, now = Date.now(), maxAgeMs = RECENT_MEASUREMENT_MS, backfill = new Map()) {
    const stale = [];
    for (const station of stations ?? []) {
        const id = stationId(station);
        const current = newestReadingTime(station);
        const older = backfill.get(Number(id)) ?? null;
        const lastSeen = current ?? older;
        if (lastSeen !== null && now - lastSeen <= maxAgeMs) continue;
        const status = getStationStatus(station);
        stale.push({
            id,
            name: stationLabel(station),
            lastSeen,
            reason: classifyStaleReason(station),
            faults: status.faults,
            online: status.online,
        });
    }
    return stale.sort((a, b) => (b.lastSeen ?? -Infinity) - (a.lastSeen ?? -Infinity));
}

// Count per reason, for the explanation block.
export function countByReason(staleStations) {
    const counts = {[REASON_OUTAGE]: 0, [REASON_SENSOR]: 0, [REASON_LATE]: 0};
    for (const s of staleStations ?? []) counts[s.reason] += 1;
    return counts;
}

// Active (online) and failing (offline or sensor fault) stations.
export function countStationHealth(stations) {
    const list = stations ?? [];
    const failing = list.filter((s) => {
        const status = getStationStatus(s);
        return !status.online || status.faults.length > 0;
    }).length;
    return {total: list.length, active: list.filter((s) => s.isActive !== false).length, failing};
}

// Percentage (0 to 100) of `part` in `total`, or null without a total.
export function coveragePercent(part, total) {
    if (!Number.isFinite(part) || !Number.isFinite(total) || total <= 0) return null;
    return Math.min(100, Math.max(0, (part / total) * 100));
}

// Average of a reading over the stations with a measurement at most `maxAgeMs`
// old: the live city average. Null when there is none.
export function cityAverageFromStations(stations, key, now = Date.now(), maxAgeMs = RECENT_MEASUREMENT_MS) {
    const values = [];
    for (const station of stations ?? []) {
        for (const m of readings(station)) {
            const t = parseMeasurementTime(m?.timestamp);
            const v = toNumber(m?.[key]);
            if (t !== null && v !== null && now - t <= maxAgeMs) values.push(v);
        }
    }
    if (values.length === 0) return null;
    return values.reduce((a, b) => a + b, 0) / values.length;
}

// City average per time step from the timelapse frames (wijk averages averaged
// per frame). Frames without a usable value give null so the chart shows a gap.
export function cityAverageSeries(frames, key) {
    return (frames ?? []).map((frame) => {
        const values = (frame.values ?? []).map((v) => toNumber(v?.[key])).filter((v) => v !== null);
        return {
            time: parseMeasurementTime(frame.timestamp),
            value: values.length > 0 ? values.reduce((a, b) => a + b, 0) / values.length : null,
        };
    });
}

// Data coverage of the last 24 hours: the mean share of the network's stations
// that delivered a usable measurement per timelapse step (0 to 100).
export function coverageFromFrames(frames, totalStations) {
    const shares = (frames ?? [])
        .map((f) => coveragePercent(toNumber(f.stationCount), totalStations))
        .filter((s) => s !== null);
    if (shares.length === 0) return null;
    return shares.reduce((a, b) => a + b, 0) / shares.length;
}

// Warmest and coldest wijk (with id, for the link to /wijk/:id). Shared rule in
// current-values.js: no value is never 0, ties go to the name.
export function pickWarmestAndColdest(regions) {
    return pickRegionExtremes(regions, "avgTemp");
}

// Newest known sighting per station id over several older snapshots.
export function buildBackfill(snapshots) {
    const index = new Map();
    for (const snapshot of snapshots ?? []) {
        for (const station of snapshot ?? []) {
            const t = newestReadingTime(station);
            const id = stationId(station);
            if (t === null || id == null) continue;
            if (!index.has(Number(id)) || t > index.get(Number(id))) index.set(Number(id), t);
        }
    }
    return index;
}
