// Pure helpers for the counters and warnings on the admin dashboard.

// A workshop code that expires within this many hours counts as "bijna verlopen".
export const EXPIRING_SOON_HOURS = 24;

const HOUR_MS = 60 * 60 * 1000;

// "verlopen" | "bijna-verlopen" | "actief" for one workshop, based on its
// expirationDate. Without a usable date the code is treated as active.
export function getWorkshopExpiry(workshop, now = new Date(), soonHours = EXPIRING_SOON_HOURS) {
    const time = new Date(workshop?.expirationDate).getTime();
    if (!Number.isFinite(time)) return "actief";
    const remaining = time - now.getTime();
    if (remaining <= 0) return "verlopen";
    return remaining <= soonHours * HOUR_MS ? "bijna-verlopen" : "actief";
}

// Counts for the workshop codes: `active` are still valid (including the ones
// that expire soon), `expired` is the number of codes already past.
export function summarizeWorkshops(activeWorkshops, expiredWorkshops, now = new Date()) {
    const active = activeWorkshops ?? [];
    const expiringSoon = active.filter((w) => getWorkshopExpiry(w, now) === "bijna-verlopen").length;
    // The backend decides what is expired; codes in the active list that are
    // already past their date (clock skew) are counted as expired too.
    const pastInActiveList = active.filter((w) => getWorkshopExpiry(w, now) === "verlopen").length;
    return {
        active: active.length - pastInActiveList,
        expiringSoon,
        expired: (expiredWorkshops ?? []).length + pastInActiveList,
    };
}

// Stations that delivered no measurement around the requested moment. The list
// endpoint calls the field `measurementDtoList`.
export function countStationsWithoutRecentMeasurement(stations) {
    return (stations ?? []).filter((s) => (s.measurementDtoList ?? s.measurements ?? []).length === 0).length;
}

// Headline numbers from the data coverage response (/measurement/coverage).
export function summarizeCoverage(coverage) {
    if (!coverage) return null;
    const stations = coverage.stations ?? [];
    return {
        networkPmCoverage: coverage.networkPmCoverage ?? null,
        noData: stations.filter((s) => s.status === "NO_DATA").length,
        irregular: stations.filter((s) => s.status === "IRREGULAR").length,
        networkGaps: (coverage.networkGaps ?? []).length,
    };
}
