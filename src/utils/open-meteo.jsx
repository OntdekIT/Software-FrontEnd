export async function fetchOpenMeteo(baseUrl, params = {}) {
    const url = new URL(baseUrl);
    Object.entries(params).forEach(([k, v]) => {
        if (Array.isArray(v)) url.searchParams.set(k, v.join(','));
        else url.searchParams.set(k, String(v));
    });

    const resp = await fetch(url.toString());
    if (!resp.ok) throw new Error(`Open-Meteo fetch failed: ${resp.status}`);
    return resp.json();
}

/**
 * Transform open-meteo daily response into a convenient shape:
 * - daily.time -> array of Date objects
 * - keep other daily arrays as-is (numbers/arrays)
 */
export function transformDaily(openMeteoJson) {
    if (!openMeteoJson?.daily) return null;
    const d = openMeteoJson.daily;
    const time = (d.time || []).map(t => new Date(t));
    // copy all other fields from daily
    const result = { time };
    Object.entries(d).forEach(([k, v]) => {
        if (k === 'time') return;
        result[k] = Array.isArray(v) ? v : v;
    });
    return result;
}

/**
 * WMO code to emoji definitions.
 *
 * Each entry maps one or more WMO weather condition codes to a single emoji
 * (or emoji sequence) used for compact UI display.
 *
 * @type {Array<{codes: number[], emoji: string}>}
 * @example
 * // An entry { codes: [95], emoji: '⛈️' } means WMO code 95 maps to thunderstorm emoji.
 */
const WMO_EMOJI_DEFS = [
    { codes: [0], emoji: '☀️' },
    { codes: [1], emoji: '🌤️' },
    { codes: [2], emoji: '⛅' },
    { codes: [3], emoji: '☁️' },
    { codes: [45, 48], emoji: '🌫️' },
    { codes: [51, 53, 55], emoji: '🌦️' },
    { codes: [56, 57], emoji: '🌧️' },
    { codes: [61, 63, 65], emoji: '🌧️' },
    { codes: [66, 67], emoji: '🌧️❄️' },
    { codes: [71, 73, 75], emoji: '❄️' },
    { codes: [77], emoji: '🌨️' },
    { codes: [80, 81, 82], emoji: '🌦️' },
    { codes: [85, 86], emoji: '🌨️' },
    { codes: [95], emoji: '⛈️' },
    { codes: [96, 99], emoji: '⛈️🌨️' }
];

/**
 * Lookup map from individual WMO code (number) -> emoji string.
 *
 * Built at module initialization from `WMO_EMOJI_DEFS` for O(1) lookups
 * when converting a WMO code to an emoji.
 *
 * @type {Map<number, string>}
 */
const WMO_CODE_TO_EMOJI = new Map();
WMO_EMOJI_DEFS.forEach(({ codes, emoji }) => {
    codes.forEach(code => WMO_CODE_TO_EMOJI.set(code, emoji));
});

/**
 * Convert a WMO weather code (or an array containing codes) to a display emoji.
 *
 * Behavior:
 * - Accepts a single code (number or numeric string) or an array where the first
 *   element is used.
 * - Coerces the input to a Number and returns the mapped emoji if known.
 * - Returns the fallback '❓' when the input is `null`/`undefined`, not a finite
 *   number, or not present in the mapping.
 *
 * @param {number | string | Array<number|string> | null | undefined} code - WMO code or an array containing codes.
 * @returns {string} The corresponding emoji string, or '❓' when unknown/invalid.
 *
 * @example
 * wmoCodeToEmoji(0)        // '☀️'
 * wmoCodeToEmoji([61,65])  // '🌧️' (uses first element)
 * wmoCodeToEmoji('95')     // '⛈️'
 * wmoCodeToEmoji(null)     // '❓'
 */
export function wmoCodeToEmoji(code) {
    if (code == null) return '❓';
    const raw = Array.isArray(code) ? code[0] : code;
    const n = Number(raw);
    if (!Number.isFinite(n)) return '❓';
    return WMO_CODE_TO_EMOJI.get(n) ?? '❓';
}