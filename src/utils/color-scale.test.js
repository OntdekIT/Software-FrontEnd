import { test } from 'node:test';
import assert from 'node:assert/strict';
import { colorFor, colorIndexFor, computeValueRange, legendSteps, spectralColors, NO_DATA_COLOR } from './color-scale.js';

test('computeValueRange negeert NaN en lege waarden', () => {
    const data = [{ avgTemp: '12.5' }, { avgTemp: 'NaN' }, { avgTemp: null }, { avgTemp: 20 }];
    assert.deepEqual(computeValueRange(data, 'avgTemp'), { min: 12.5, max: 20 });
    assert.equal(computeValueRange([], 'avgTemp'), null);
});

test('uitersten krijgen eerste en laatste kleur', () => {
    const range = { min: 10, max: 30 };
    assert.equal(colorFor(10, range), spectralColors[0]);
    assert.equal(colorFor(30, range), spectralColors[9]);
    assert.equal(colorFor(NaN, range), NO_DATA_COLOR);
});

test('legenda en kaart zijn consistent voor elke waarde in het bereik', () => {
    const range = { min: -3.2, max: 27.9 };
    const steps = legendSteps(range);
    assert.equal(steps.length, 10);
    assert.equal(steps[0].from, range.min);
    assert.equal(steps[9].to, range.max);
    for (let i = 0; i <= 1000; i++) {
        const value = range.min + ((range.max - range.min) * i) / 1000;
        const step = steps.find((s) => s.color === colorFor(value, range));
        assert.ok(step, 'kleur ontbreekt in legenda');
        assert.ok(value >= step.from - 1e-9 && value <= step.to + 1e-9,
            `${value} valt buiten legenda-blok ${step.from}..${step.to}`);
    }
});

test('bereik van nul breed geeft geen NaN', () => {
    assert.equal(colorIndexFor(5, { min: 5, max: 5 }), 0);
});
