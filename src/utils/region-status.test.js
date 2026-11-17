import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hasMeasurement, lastMeasurementTimestamp, parseMeasurement } from './region-status.js';

test('echte waarden worden getallen, de rest is geen meting', () => {
    assert.equal(parseMeasurement('12.5'), 12.5);
    assert.equal(parseMeasurement(0), 0);
    assert.equal(parseMeasurement('NaN'), null);
    assert.equal(parseMeasurement(NaN), null);
    assert.equal(parseMeasurement(null), null);
    assert.equal(parseMeasurement(undefined), null);
    assert.equal(parseMeasurement(''), null);
});

test('0 graden is wel een meting', () => {
    assert.equal(hasMeasurement(0), true);
    assert.equal(hasMeasurement('NaN'), false);
});

test('laatste meting is de laatste bucket met een gemiddelde', () => {
    const history = [
        { timestamp: 'a', avg: 10 },
        { timestamp: 'b', avg: 11 },
        { timestamp: 'c', avg: null },
        { timestamp: 'd', avg: 'NaN' },
    ];
    assert.equal(lastMeasurementTimestamp(history), 'b');
    assert.equal(lastMeasurementTimestamp([{ timestamp: 'x', avg: null }]), null);
    assert.equal(lastMeasurementTimestamp([]), null);
    assert.equal(lastMeasurementTimestamp(undefined), null);
});
