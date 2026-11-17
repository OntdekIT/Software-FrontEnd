// Logica achter de tijdlijn onder de kaart: welke frames zijn bruikbaar, welk
// frame hoort bij een stand van de schuifbalk en wanneer is het LIVE. Puur, zodat
// het met `node --test` te controleren is.

/** Aantal tijdstappen voor 24 uur: ieder uur een frame, begin en eind meegeteld. */
export const TIMELINE_HOURS = 24;
export const TIMELINE_STEPS = 25;

// De backend accepteert 2 tot 48 stappen.
export const MIN_STEPS = 2;
export const MAX_STEPS = 48;

/** Afspeelsnelheden: milliseconden per tijdstap. */
export const SPEEDS = [
    { label: '1x', ms: 800 },
    { label: '2x', ms: 400 },
    { label: '4x', ms: 200 },
    { label: '0.5x', ms: 1600 },
];

/** Aantal stappen binnen de grenzen van de backend. */
export function clampSteps(steps) {
    return Math.min(Math.max(Math.round(steps), MIN_STEPS), MAX_STEPS);
}

/** Een index binnen 0..count-1 (0 als er geen frames zijn). */
export function clampIndex(index, count) {
    if (count <= 0) return 0;
    return Math.min(Math.max(Math.round(index), 0), count - 1);
}

/** Het laatste frame is het meest recente: de tijdlijn staat dan "LIVE". */
export function isLive(index, count) {
    return count > 0 && index === count - 1;
}

/** Index van het volgende frame tijdens het afspelen; na het laatste weer vooraan. */
export function nextPlaybackIndex(index, count) {
    if (count <= 1) return 0;
    return index >= count - 1 ? 0 : index + 1;
}

/** Het frame bij een index, of null als er geen is. */
export function selectFrame(frames, index) {
    if (!Array.isArray(frames) || frames.length === 0) return null;
    return frames[clampIndex(index, frames.length)] ?? null;
}

function hasValue(value) {
    return value !== null && value !== undefined && Number.isFinite(Number(value));
}

/**
 * Controleert het antwoord van /neighbourhood/history/timelapse.
 * @returns {{neighbourhoods: object[], frames: object[]}|null}
 *          null bij een onbruikbaar antwoord: geen wijken, minder dan twee
 *          frames of geen enkele meetwaarde. De kaart toont dan geen tijdlijn.
 */
export function parseTimelapse(data) {
    const neighbourhoods = Array.isArray(data?.neighbourhoods) ? data.neighbourhoods : [];
    const frames = Array.isArray(data?.frames)
        ? data.frames.filter(f => f && f.timestamp && Array.isArray(f.values))
        : [];
    if (neighbourhoods.length === 0 || frames.length < MIN_STEPS) return null;

    const anyValue = frames.some(f => f.values.some(v => hasValue(v.avgTemp) || hasValue(v.avgPm25)));
    if (!anyValue) return null;

    return { neighbourhoods, frames };
}

/**
 * Wijken met coordinaten en de waarden van een frame, in de vorm die de kaart
 * verwacht. Een wijk zonder meting krijgt NaN (temperatuur) of null (PM2.5),
 * zodat de kaart hem grijs kleurt in plaats van als koudste waarde.
 */
export function regionsForFrame(neighbourhoods, frame) {
    const valueById = new Map((frame?.values ?? []).map(v => [v.id, v]));
    return neighbourhoods.map(n => {
        const value = valueById.get(n.id);
        return {
            id: n.id,
            name: n.name,
            coordinates: n.coordinates,
            avgTemp: hasValue(value?.avgTemp) ? value.avgTemp : NaN,
            avgPm25: hasValue(value?.avgPm25) ? value.avgPm25 : null,
        };
    });
}

/** Opmaak van het tijdstip van een frame: "14:00", of "ma 14:00" als het niet vandaag is. */
export function formatFrameTime(timestamp, now = new Date()) {
    const date = new Date(timestamp);
    if (Number.isNaN(date.getTime())) return '';
    const time = date.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
    if (date.toDateString() === now.toDateString()) return time;
    const day = date.toLocaleDateString('nl-NL', { weekday: 'short' });
    return `${day} ${time}`;
}
