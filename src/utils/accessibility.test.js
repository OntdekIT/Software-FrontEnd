import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pmColors, spectralColors } from './color-scale.js';

// Kleurenblindheid-simulatie (Machado e.a. 2009, volledige ernst) in lineair RGB,
// afstand als CIE76 deltaE in Lab. Zo controleren we dat opeenvolgende stappen
// van een palet ook voor kleurenblinde gebruikers van elkaar te onderscheiden zijn.
const CVD_MATRICES = {
    protanopie: [[0.152286, 1.052583, -0.204868], [0.114503, 0.786281, 0.099216], [-0.003882, -0.048116, 1.051998]],
    deuteranopie: [[0.367322, 0.860646, -0.227968], [0.280085, 0.672501, 0.047413], [-0.011820, 0.042940, 0.968881]],
    tritanopie: [[1.255528, -0.076749, -0.178779], [-0.078411, 0.930809, 0.147602], [0.004733, 0.691367, 0.303900]],
};

const toRgb = (hex) => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16) / 255);
const toLinear = (c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4);

function toLab(linear) {
    const [r, g, b] = linear;
    const x = (0.4124 * r + 0.3576 * g + 0.1805 * b) / 0.95047;
    const y = 0.2126 * r + 0.7152 * g + 0.0722 * b;
    const z = (0.0193 * r + 0.1192 * g + 0.9505 * b) / 1.08883;
    const f = (t) => (t > 0.008856 ? Math.cbrt(t) : 7.787 * t + 16 / 116);
    return [116 * f(y) - 16, 500 * (f(x) - f(y)), 200 * (f(y) - f(z))];
}

function simulate(hex, matrix) {
    const linear = toRgb(hex).map(toLinear);
    const out = matrix.map((row) => Math.min(1, Math.max(0, row[0] * linear[0] + row[1] * linear[1] + row[2] * linear[2])));
    return toLab(out);
}

const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

function minAdjacentDistance(palette, matrix) {
    const colors = Object.keys(palette).map(Number).sort((a, b) => a - b).map((i) => simulate(palette[i], matrix));
    return Math.min(...colors.slice(1).map((c, i) => distance(c, colors[i])));
}

for (const [name, palette] of [['temperatuur', spectralColors], ['fijnstof', pmColors]]) {
    for (const [cvd, matrix] of Object.entries(CVD_MATRICES)) {
        test(`palet ${name}: opeenvolgende stappen blijven te onderscheiden bij ${cvd}`, () => {
            assert.ok(minAdjacentDistance(palette, matrix) >= 6, `${name} ${cvd}`);
        });
    }
}

// WCAG 2.x contrastverhouding voor de tekstkleuren in de kaart en wijkenlijst.
function luminance(hex) {
    const [r, g, b] = toRgb(hex).map(toLinear);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(foreground, background) {
    const [hi, lo] = [luminance(foreground), luminance(background)].sort((a, b) => b - a);
    return (hi + 0.05) / (lo + 0.05);
}

// Pairs: [tekst, achtergrond, plek]. Achtergronden zijn de gemengde kleuren
// zoals de browser ze toont (wit 70% over #fecb3d is #ffefc5).
const TEXT_PAIRS = [
    ['#b23610', '#ffefc5', 'temperatuurwaarde in wijkenlijst'],
    ['#b23610', '#ffe082', 'temperatuurwaarde bij hover'],
    ['#00608a', '#ffefc5', 'wijknaam in lijst'],
    ['#4b5563', '#ffefc5', 'Geen recente data in lijst'],
    ['#ffffff', '#0079b0', 'kop van de wijkenlijst'],
    ['#374151', '#ffffff', 'legenda en popup'],
    ['#111827', '#fecb3d', 'actieve laagknop'],
];

for (const [fg, bg, where] of TEXT_PAIRS) {
    test(`WCAG AA (4.5:1) voor ${where}`, () => {
        assert.ok(contrast(fg, bg) >= 4.5, `${where}: ${contrast(fg, bg).toFixed(2)}`);
    });
}
