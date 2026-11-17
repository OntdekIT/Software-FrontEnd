// Gedeelde kleurschaal voor kaart (regio's) en legenda. Beide moeten uit deze
// module komen, anders lopen kleur en legenda uit elkaar (issue #86).

export const spectralColors = {
    0: '#5568B8',
    1: '#4E96BC',
    2: '#60AB9E',
    3: '#77B77D',
    4: '#A6BE54',
    5: '#D1B541',
    6: '#E49C39',
    7: '#E67932',
    8: '#DF4828',
    9: '#B8221E'
};

export const NO_DATA_COLOR = 'rgba(136,136,136,0.5)';

const COLOR_COUNT = Object.keys(spectralColors).length;

/**
 * Bepaalt min en max van een waarde (bijvoorbeeld 'avgTemp') in een lijst regio's.
 * Waarden die geen getal zijn ("NaN", null) worden genegeerd.
 * @returns {{min: number, max: number}|null} null als er geen bruikbare waarden zijn
 */
export function computeValueRange(data, key) {
    let min = Infinity;
    let max = -Infinity;
    (data ?? []).forEach((item) => {
        const v = parseFloat(item?.[key]);
        if (Number.isFinite(v)) {
            if (v < min) min = v;
            if (v > max) max = v;
        }
    });
    return Number.isFinite(min) ? { min, max } : null;
}

/** Index (0 tot en met 9) in spectralColors voor een waarde binnen het bereik. */
export function colorIndexFor(value, range) {
    const dif = range.max - range.min !== 0 ? range.max - range.min : 1;
    const fraction = (value - range.min) / dif;
    const index = Math.round(fraction * (COLOR_COUNT - 1));
    return Math.min(COLOR_COUNT - 1, Math.max(0, index));
}

/** Kleur die de kaart gebruikt voor een waarde. */
export function colorFor(value, range) {
    if (!range || !Number.isFinite(value)) return NO_DATA_COLOR;
    return spectralColors[colorIndexFor(value, range)];
}

/**
 * Legenda-blokken: per kleur het waardebereik dat de kaart in die kleur toont.
 * Kleur i hoort bij waarden waarvoor colorIndexFor() i geeft, dus de grenzen
 * liggen op (i - 0.5) / (n - 1) van het bereik, begrensd door min en max.
 */
export function legendSteps(range) {
    const dif = range.max - range.min !== 0 ? range.max - range.min : 1;
    const last = COLOR_COUNT - 1;
    return Object.keys(spectralColors).map(Number).sort((a, b) => a - b).map((i) => ({
        color: spectralColors[i],
        from: Math.max(range.min, range.min + ((i - 0.5) / last) * dif),
        to: Math.min(range.max, range.min + ((i + 0.5) / last) * dif)
    }));
}
