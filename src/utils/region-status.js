// Status van een wijk: heeft hij een echte meetwaarde of niet?
// De backend stuurt voor een wijk zonder meting NaN (of null) mee. Die mag nergens
// als temperatuur, kleur of "--" verschijnen: het is geen fout maar een lege plek.

export const NO_RECENT_DATA_LABEL = 'Geen recente data';

/** Zet een waarde uit de backend om naar een getal, of null als het geen echte meting is. */
export function parseMeasurement(value) {
    if (value === null || value === undefined || value === '') return null;
    const n = parseFloat(value);
    return Number.isFinite(n) ? n : null;
}

/** Heeft deze waarde een echte meting? */
export function hasMeasurement(value) {
    return parseMeasurement(value) !== null;
}

/**
 * Tijdstip van de laatste bucket met een echte waarde, uit de history van een
 * wijk (/measurement/history/average/region/{id}).
 * @param key veld in een bucket: 'avg' (temperatuur) of 'pm25'
 * @returns {string|null} timestamp zoals de backend hem stuurt, of null
 */
export function lastMeasurementTimestamp(history, key = 'avg') {
    if (!Array.isArray(history)) return null;
    for (let i = history.length - 1; i >= 0; i--) {
        if (hasMeasurement(history[i]?.[key]) && history[i]?.timestamp) {
            return history[i].timestamp;
        }
    }
    return null;
}
