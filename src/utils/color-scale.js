// Gedeelde kleurschaal voor kaart (regio's) en legenda. Beide moeten uit deze
// module komen, anders lopen kleur en legenda uit elkaar (issue #86).

// Temperatuur: ColorBrewer RdYlBu (omgekeerd, koud blauw naar warm rood). Dit
// palet staat bij ColorBrewer als kleurenblind-vriendelijk aangemerkt en blijft
// ook bij rood-groenblindheid en blauw-geelblindheid onderscheidbaar (zie de
// simulatietest in color-scale.test.js). Het oude palet liep via groen naar rood
// en viel bij deuteranopie op sommige stappen vrijwel samen.
export const spectralColors = {
    0: '#313695',
    1: '#4575b4',
    2: '#74add1',
    3: '#abd9e9',
    4: '#e0f3f8',
    5: '#fee090',
    6: '#fdae61',
    7: '#f46d43',
    8: '#d73027',
    9: '#a50026'
};

// Fijnstof: Viridis (omgekeerd, geel is schoon, donkerpaars is veel fijnstof).
// Bewust een ander palet dan temperatuur, zodat de twee lagen niet verward worden.
export const pmColors = {
    0: '#fde725',
    1: '#b5de2b',
    2: '#6ece58',
    3: '#35b779',
    4: '#1f9e89',
    5: '#26828e',
    6: '#31688e',
    7: '#3e4989',
    8: '#482878',
    9: '#440154'
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

/** Index (0 tot en met 9) in het palet voor een waarde binnen het bereik. */
export function colorIndexFor(value, range) {
    const dif = range.max - range.min !== 0 ? range.max - range.min : 1;
    const fraction = (value - range.min) / dif;
    const index = Math.round(fraction * (COLOR_COUNT - 1));
    return Math.min(COLOR_COUNT - 1, Math.max(0, index));
}

/** Kleur die de kaart gebruikt voor een waarde. */
export function colorFor(value, range, palette = spectralColors) {
    if (!range || !Number.isFinite(value)) return NO_DATA_COLOR;
    return palette[colorIndexFor(value, range)];
}

/**
 * Legenda-blokken: per kleur het waardebereik dat de kaart in die kleur toont.
 * Kleur i hoort bij waarden waarvoor colorIndexFor() i geeft, dus de grenzen
 * liggen op (i - 0.5) / (n - 1) van het bereik, begrensd door min en max.
 */
export function legendSteps(range, palette = spectralColors) {
    const dif = range.max - range.min !== 0 ? range.max - range.min : 1;
    const last = COLOR_COUNT - 1;
    return Object.keys(palette).map(Number).sort((a, b) => a - b).map((i) => ({
        color: palette[i],
        from: Math.max(range.min, range.min + ((i - 0.5) / last) * dif),
        to: Math.min(range.max, range.min + ((i + 0.5) / last) * dif)
    }));
}
