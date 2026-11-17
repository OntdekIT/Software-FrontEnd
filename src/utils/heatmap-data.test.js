import { test } from 'node:test';
import assert from 'node:assert/strict';
import { heatRange, parseMeasurementTime, toHeatPoints } from './heatmap-data.js';

const NOW = Date.UTC(2026, 10, 17, 21, 40, 0); // 22:40 in Amsterdam (winter)

function station(id, time, extra = {}, pos = { latitude: 51.55, longitude: 5.09 }) {
    return { stationid: id, ...pos, measurements: [{ timestamp: time, temperature: 9.5, 'pm2.5': null, ...extra }] };
}

test('de backendtijd wordt als Amsterdamse tijd gelezen, winter en zomer', () => {
    assert.equal(parseMeasurementTime('17-11-2026 22:37:57'), Date.UTC(2026, 10, 17, 21, 37, 57));
    assert.equal(parseMeasurementTime('15-07-2026 12:00:00'), Date.UTC(2026, 6, 15, 10, 0, 0));
    assert.equal(parseMeasurementTime('2026-11-17T21:37:57Z'), Date.UTC(2026, 10, 17, 21, 37, 57));
    assert.equal(parseMeasurementTime('onzin'), null);
    assert.equal(parseMeasurementTime(null), null);
});

test('stations zonder recente meting, zonder positie of zonder waarde doen niet mee', () => {
    const stations = [
        station(1, '17-11-2026 22:30:00'),
        station(2, '17-11-2026 11:50:03'), // te oud
        station(3, '17-11-2026 22:30:00', {}, { latitude: 0, longitude: 0 }),
        station(4, '17-11-2026 22:30:00', { temperature: null }),
        { stationid: 5, latitude: 51.5, longitude: 5.1, measurements: [] },
        station(6, '17-11-2026 22:30:00', { temperature: 'NaN' }),
    ];
    const { points, total, excluded } = toHeatPoints(stations, 'temperature', NOW);
    assert.deepEqual(points.map((p) => p.id), [1]);
    assert.equal(total, 6);
    assert.equal(excluded, 5);
});

test('fijnstof leest het veld pm2.5 en slaat stations zonder die sensor over', () => {
    const stations = [
        station(1, '17-11-2026 22:30:00', { 'pm2.5': 4 }),
        station(2, '17-11-2026 22:30:00'),
    ];
    const { points } = toHeatPoints(stations, 'pm25', NOW);
    assert.deepEqual(points.map((p) => [p.id, p.value]), [[1, 4]]);
    assert.deepEqual(toHeatPoints(null, 'temperature', NOW).points, []);
});

test('het kleurbereik krijgt een minimale breedte en is null zonder punten', () => {
    assert.equal(heatRange([], 'temperature'), null);
    const narrow = heatRange([{ value: 9 }, { value: 9.4 }], 'temperature');
    assert.ok(Math.abs(narrow.max - narrow.min - 3) < 1e-9);
    assert.deepEqual(heatRange([{ value: 0 }, { value: 20 }], 'temperature'), { min: 0, max: 20 });
});
