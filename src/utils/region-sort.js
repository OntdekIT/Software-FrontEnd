import { parseMeasurement } from './region-status.js';

// Sorteren van de wijkenlijst. Puur, zodat het met `node --test` te controleren is.

export const SORT_MODES = {
    name: 'name',
    high: 'high',
    low: 'low',
};

export const DEFAULT_SORT_MODE = SORT_MODES.name;

// Labels per laag: bij temperatuur warmst/koudst, bij fijnstof hoogst/laagst.
const HIGH_LOW_LABELS = {
    temperature: { high: 'Warmst', low: 'Koudst' },
    pm25: { high: 'Hoogst', low: 'Laagst' },
};

/** Opties voor het segmented control: [{ mode, label }] voor de gekozen laag. */
export function sortOptions(metricId) {
    const labels = HIGH_LOW_LABELS[metricId] ?? HIGH_LOW_LABELS.temperature;
    return [
        { mode: SORT_MODES.name, label: 'A tot Z' },
        { mode: SORT_MODES.high, label: labels.high },
        { mode: SORT_MODES.low, label: labels.low },
    ];
}

function compareNames(a, b) {
    return String(a.name ?? '').localeCompare(String(b.name ?? ''), 'nl', { sensitivity: 'base' });
}

/**
 * Nieuwe, gesorteerde lijst (de invoer blijft ongemoeid).
 * Wijken zonder echte meetwaarde staan bij warmst/koudst/hoogst/laagst altijd
 * onderaan, zodat ze de top niet vervuilen; gelijke waarden vallen terug op A tot Z.
 * @param regions wijken met de waarde onder `valueKey` (bijvoorbeeld 'avgTemp')
 * @param mode    een waarde uit SORT_MODES
 */
export function sortRegions(regions, mode, valueKey) {
    const list = [...(regions ?? [])];
    if (mode !== SORT_MODES.high && mode !== SORT_MODES.low) {
        return list.sort(compareNames);
    }

    const direction = mode === SORT_MODES.high ? -1 : 1;
    return list.sort((a, b) => {
        const va = parseMeasurement(a?.[valueKey]);
        const vb = parseMeasurement(b?.[valueKey]);
        if (va === null && vb === null) return compareNames(a, b);
        if (va === null) return 1;
        if (vb === null) return -1;
        if (va !== vb) return (va - vb) * direction;
        return compareNames(a, b);
    });
}
