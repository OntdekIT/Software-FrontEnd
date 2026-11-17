import { test } from 'node:test';
import assert from 'node:assert/strict';
import { METRICS, formatMetricValue } from './map-metrics.js';

test('waarden krijgen de eenheid van de laag', () => {
    assert.equal(formatMetricValue('temperature', '12.34'), '12.3°C');
    assert.equal(formatMetricValue('pm25', 8), '8.0 µg/m³');
});

test('zonder echte meting geeft de opmaak null, geen "NaN" of "--"', () => {
    assert.equal(formatMetricValue('temperature', 'NaN'), null);
    assert.equal(formatMetricValue('pm25', null), null);
});

test('elke laag heeft een eigen palet en eenheid', () => {
    assert.notEqual(METRICS.temperature.palette, METRICS.pm25.palette);
    assert.notEqual(METRICS.temperature.unit, METRICS.pm25.unit);
});

test('formatMetricParts splitst waarde en eenheid, of geeft null zonder meting', async () => {
    const { formatMetricParts } = await import('./map-metrics.js');
    assert.deepEqual(formatMetricParts('temperature', 12.34), { number: '12.3', unit: '°C' });
    assert.deepEqual(formatMetricParts('pm25', '7'), { number: '7.0', unit: 'µg/m³' });
    assert.equal(formatMetricParts('temperature', NaN), null);
    assert.equal(formatMetricParts('temperature', null), null);
});
