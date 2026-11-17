// Van raster naar pixels: een vloeiende kleurovergang over hetzelfde palet als
// de kaart en de legenda (color-scale.js), zodat kleur en legenda kloppen.
import { spectralColors } from './color-scale.js';

/** Maximale dekking van het kleurvlak (0 tot 1): de kaart eronder blijft zichtbaar. */
export const SURFACE_OPACITY = 0.78;

function hexToRgb(hex) {
    const n = parseInt(hex.slice(1), 16);
    return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

/** [r, g, b] voor een waarde: lineair tussen de paletstappen. Null zonder geldige waarde of bereik. */
export function rampRgb(value, range, palette = spectralColors) {
    if (!range || !Number.isFinite(value)) return null;
    const stops = Object.keys(palette).map(Number).sort((a, b) => a - b).map((i) => hexToRgb(palette[i]));
    const dif = range.max - range.min !== 0 ? range.max - range.min : 1;
    const f = Math.min(1, Math.max(0, (value - range.min) / dif)) * (stops.length - 1);
    const lo = Math.floor(f);
    const hi = Math.min(stops.length - 1, lo + 1);
    const t = f - lo;
    return stops[lo].map((c, i) => Math.round(c + (stops[hi][i] - c) * t));
}

/** RGBA-bytes (Uint8ClampedArray) voor een raster; cellen zonder dekking zijn volledig transparant. */
export function gridToRgba(grid, range, palette = spectralColors) {
    const out = new Uint8ClampedArray(grid.cols * grid.rows * 4);
    for (let i = 0; i < grid.values.length; i++) {
        const rgb = rampRgb(grid.values[i], range, palette);
        if (!rgb || !(grid.alphas[i] > 0)) continue;
        out[i * 4] = rgb[0];
        out[i * 4 + 1] = rgb[1];
        out[i * 4 + 2] = rgb[2];
        out[i * 4 + 3] = Math.round(grid.alphas[i] * 255);
    }
    return out;
}
