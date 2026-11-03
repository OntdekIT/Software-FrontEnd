// Formatting helpers shared by the data coverage page and its components.

export function formatBucket(iso, granularity) {
    const date = new Date(iso);
    if (granularity === "day") {
        return date.toLocaleDateString("nl-NL", {weekday: "short", day: "numeric", month: "short"});
    }
    return date.toLocaleString("nl-NL", {day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"});
}

export function formatPercent(share) {
    if (share === null || share === undefined) {
        return "–";
    }
    return `${Math.round(share * 100)}%`;
}

// Bucket count to a readable duration, e.g. 3 hour buckets -> "3 uur".
export function formatBuckets(count, granularity) {
    if (granularity === "day") {
        return count === 1 ? "1 dag" : `${count} dagen`;
    }
    if (count >= 48) {
        return `${(count / 24).toFixed(1).replace(".", ",")} dagen`;
    }
    return `${count} uur`;
}

export function formatMinutes(minutes) {
    if (minutes === null || minutes === undefined) {
        return "–";
    }
    if (minutes < 60) {
        return `${Math.round(minutes)} min`;
    }
    return `${(minutes / 60).toFixed(1).replace(".", ",")} uur`;
}

export const STATUS = {
    OK: {label: "Betrouwbaar", className: "bg-success/15 text-success", order: 3},
    IRREGULAR: {label: "Onregelmatig", className: "bg-warning/15 text-warning", order: 0},
    NO_PM: {label: "Geen fijnstof", className: "bg-gray-200 text-gray-700", order: 1},
    NO_DATA: {label: "Geen data", className: "bg-danger/15 text-danger", order: 2},
};
