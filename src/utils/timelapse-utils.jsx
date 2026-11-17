/** Hulpdingen voor de tijdlijn op de kaart. */

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
