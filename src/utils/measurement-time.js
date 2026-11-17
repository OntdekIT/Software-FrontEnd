// Reads the measurement times the backend sends.

const BACKEND_DATE = /^(\d{2})-(\d{2})-(\d{4}) (\d{2}):(\d{2})(?::(\d{2}))?$/;

// Backend measurement times come as "17-11-2026 21:22:49" (UTC, day first);
// `new Date()` cannot read that. ISO strings and Dates work too.
// Returns ms since epoch or null.
export function parseMeasurementTime(timestamp) {
    if (timestamp === null || timestamp === undefined || timestamp === "") return null;
    if (typeof timestamp === "string") {
        const m = BACKEND_DATE.exec(timestamp.trim());
        if (m) {
            const [, day, month, year, hour, minute, second = "0"] = m;
            return Date.UTC(+year, +month - 1, +day, +hour, +minute, +second);
        }
    }
    const t = new Date(timestamp).getTime();
    return Number.isFinite(t) ? t : null;
}
