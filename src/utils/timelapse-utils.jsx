/**
 * Hulpdingen voor de time-lapse van de heatmap.
 *
 * Deze staan los van de slider-component omdat een bestand dat zowel een
 * component als constanten exporteert fast refresh in de weg zit (eslint-regel
 * react-refresh/only-export-components).
 */

/** Afspeelsnelheden, als milliseconden per tijdstap. */
export const PLAYBACK_SPEEDS = [
    { label: "0.5×", ms: 1600 },
    { label: "1×", ms: 800 },
    { label: "2×", ms: 400 },
    { label: "4×", ms: 200 },
];

/** Toont een tijdstip zoals een Nederlandse gebruiker het verwacht. */
export function formatStepLabel(isoTimestamp) {
    if (!isoTimestamp) return "—";
    const date = new Date(isoTimestamp);
    if (Number.isNaN(date.getTime())) return "—";
    return date.toLocaleString("nl-NL", {
        weekday: "short",
        day: "numeric",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
    });
}

/**
 * Bepaalt één kleurschaal over álle tijdstappen samen.
 *
 * Zonder dit schaalt elk frame zich op zijn eigen min/max en zie je bij het
 * afspelen geen verandering maar alleen herschaling. De uitersten van de hele
 * reeks geven een schaal waarop frames onderling te vergelijken zijn.
 *
 * @param frames tijdstappen uit /neighbourhood/history/timelapse
 * @param key    welke waarde geschaald wordt, bijvoorbeeld 'avgTemp'
 * @returns {{min: number, max: number}|null} null als er geen bruikbare waarden zijn
 */
export function computeColorRange(frames, key) {
    let min = Infinity;
    let max = -Infinity;

    frames.forEach((frame) => {
        (frame.values ?? []).forEach((value) => {
            const v = Number(value[key]);
            if (Number.isFinite(v)) {
                if (v < min) min = v;
                if (v > max) max = v;
            }
        });
    });

    if (!Number.isFinite(min) || !Number.isFinite(max)) return null;
    // Een reeks met overal dezelfde waarde zou een bereik van 0 geven; dan valt
    // alles op dezelfde kleur en is de legenda onleesbaar.
    if (min === max) return { min: min - 0.5, max: max + 0.5 };
    return { min, max };
}
