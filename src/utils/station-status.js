// Pure helpers to describe the state of a measuring station in the UI.

// Newest measurement time (ms since epoch) of a station, or null when it has
// no (parseable) measurement. The list endpoint calls the field
// `measurementDtoList`.
export function lastMeasurementTime(station) {
    const list = station?.measurementDtoList ?? station?.measurements ?? [];
    const times = list
        .map((m) => new Date(m.timestamp).getTime())
        .filter((t) => Number.isFinite(t));
    return times.length > 0 ? Math.max(...times) : null;
}

// Index the newest measurement time per station id, from the station list that
// includes measurements.
export function indexLastMeasurements(stationsWithMeasurements) {
    const index = new Map();
    for (const station of stationsWithMeasurements ?? []) {
        const time = lastMeasurementTime(station);
        const id = station.stationid ?? station.id;
        if (time !== null && id != null) index.set(Number(id), time);
    }
    return index;
}

const SENSOR_LABELS = [
    ["tempError", "temperatuur"],
    ["humError", "luchtvochtigheid"],
    ["stofError", "fijnstof"],
    ["locError", "locatie"],
];

// {online, label, faults}: `online` follows the backend `isActive` flag (an
// unknown flag counts as online, like on the dashboard); `faults` lists the
// sensors that report an error.
export function getStationStatus(station) {
    const online = station?.isActive !== false;
    const faults = SENSOR_LABELS
        .filter(([key]) => station?.[key] === true)
        .map(([, label]) => label);
    return {online, label: online ? "Online" : "Offline", faults};
}

export function formatLastMeasurement(time, locale = "nl-NL") {
    if (time == null) return "Geen recente meting";
    return new Date(time).toLocaleString(locale, {
        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
    });
}
