// Pure helpers behind the summary strip on the homepage. Kept free of React so
// they can be unit tested with `node --test`.

import {parseMeasurementTime} from "./measurement-time.js";

function toNumber(value) {
    const n = typeof value === "number" ? value : parseFloat(value);
    return Number.isFinite(n) ? n : null;
}

// Average of the finite numbers in a list, or null when there are none.
export function average(values) {
    const nums = values.map(toNumber).filter((n) => n !== null);
    if (nums.length === 0) return null;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
}

// The wijk with the highest (or lowest) average temperature. Wijken without a
// usable temperature are ignored. Returns {name, temp} or null.
export function pickExtremeRegion(regions, mode) {
    const withTemp = (regions ?? [])
        .map((r) => ({name: r.name, temp: toNumber(r.avgTemp)}))
        .filter((r) => r.temp !== null);
    if (withTemp.length === 0) return null;
    return withTemp.reduce((best, r) => {
        const better = mode === "max" ? r.temp > best.temp : r.temp < best.temp;
        return better ? r : best;
    });
}

// Newest measurement time (ms since epoch) over all stations, or null. The
// backend list endpoint exposes the measurements as `measurementDtoList`.
export function latestMeasurementTime(stations) {
    let latest = null;
    for (const station of stations ?? []) {
        const list = station.measurementDtoList ?? station.measurements ?? [];
        for (const m of list) {
            const t = parseMeasurementTime(m.timestamp);
            if (t !== null && (latest === null || t > latest)) latest = t;
        }
    }
    return latest;
}

export function summarizeNetwork(stations, regions) {
    const list = stations ?? [];
    return {
        avgTemp: average((regions ?? []).map((r) => r.avgTemp)),
        avgPm25: average((regions ?? []).map((r) => r.avgPm25)),
        warmest: pickExtremeRegion(regions, "max"),
        coldest: pickExtremeRegion(regions, "min"),
        activeCount: list.filter((s) => s.isActive !== false).length,
        totalCount: list.length,
        failingCount: list.filter(
            (s) => s.isActive === false || s.tempError || s.humError || s.stofError || s.locError
        ).length,
        lastUpdate: latestMeasurementTime(list),
    };
}
