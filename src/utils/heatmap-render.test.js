import { test } from 'node:test';
import assert from 'node:assert/strict';
import { gridToRgba, rampRgb } from './heatmap-render.js';
import { pmColors, spectralColors } from './color-scale.js';

const RANGE = { min: 0, max: 10 };

test('de uiteinden van de ramp zijn de eerste en laatste paletkleur', () => {
    assert.deepEqual(rampRgb(0, RANGE), [0x31, 0x36, 0x95]);
    assert.deepEqual(rampRgb(10, RANGE), [0xa5, 0x00, 0x26]);
    assert.deepEqual(rampRgb(-5, RANGE), rampRgb(0, RANGE));
    assert.deepEqual(rampRgb(0, RANGE, pmColors), [0xfd, 0xe7, 0x25]);
    assert.ok(spectralColors[0]);
});

test('NaN of geen bereik geeft geen kleur', () => {
    assert.equal(rampRgb(NaN, RANGE), null);
    assert.equal(rampRgb(5, null), null);
});

test('cellen zonder dekking blijven transparant', () => {
    const grid = { cols: 2, rows: 1, values: Float32Array.from([5, NaN]), alphas: Float32Array.from([0.5, 0]) };
    const px = gridToRgba(grid, RANGE);
    assert.equal(px[3], 128);
    assert.deepEqual(Array.from(px.slice(4)), [0, 0, 0, 0]);
});
