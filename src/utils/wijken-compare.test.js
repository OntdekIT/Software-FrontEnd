import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    MAX_COMPARE, buildCompareData, buildRows, buildSeriesByRegion, cityAverageSeries, computeTrend,
    countActiveStations, latestValue, pointInRing, summarizeRanking, toggleCompare,
} from './wijken-compare.js';

const frames = [
    { timestamp: 't1', values: [{ id: 1, avgTemp: 10 }, { id: 2, avgTemp: null }, { id: 3, avgTemp: 20 }] },
    { timestamp: 't2', values: [{ id: 1, avgTemp: 12 }, { id: 2, avgTemp: 8 }, { id: 3, avgTemp: 20.1 }] },
    { timestamp: 't3', values: [{ id: 1, avgTemp: 11 }, { id: 2, avgTemp: 6 }] },
];

test('reeks per wijk heeft null voor ontbrekende metingen en ontbrekende wijken', () => {
    const byId = buildSeriesByRegion(frames, 'avgTemp');
    assert.deepEqual(byId.get(1).map(p => p.value), [10, 12, 11]);
    assert.deepEqual(byId.get(2).map(p => p.value), [null, 8, 6]);
    assert.deepEqual(byId.get(3).map(p => p.value), [20, 20.1, null]);
    assert.equal(byId.get(3)[2].timestamp, 't3');
    assert.equal(buildSeriesByRegion(undefined, 'avgTemp').size, 0);
});

test('stadsgemiddelde negeert wijken zonder meting', () => {
    const city = cityAverageSeries(frames, 'avgTemp');
    assert.deepEqual(city.map(p => p.value), [15, (12 + 8 + 20.1) / 3, 8.5]);
    assert.equal(cityAverageSeries([{ timestamp: 'x', values: [{ id: 1, avgTemp: null }] }], 'avgTemp')[0].value, null);
});

test('trend: omhoog, omlaag, stabiel en te weinig data', () => {
    const s = (...v) => v.map(value => ({ value }));
    assert.equal(computeTrend(s(10, 11, 12)).direction, 'up');
    assert.equal(computeTrend(s(12, 11, 9)).direction, 'down');
    assert.equal(computeTrend(s(10, 10.2)).direction, 'flat');
    assert.equal(computeTrend(s(null, 10, null)), null);
    assert.equal(computeTrend([]), null);
    assert.equal(computeTrend(s(null, 5, null, 7)).delta, 2);
});

test('latestValue pakt de laatste echte waarde', () => {
    assert.equal(latestValue([{ value: 1 }, { value: null }]), 1);
    assert.equal(latestValue([{ value: null }]), null);
});

const regions = [
    { id: 1, name: 'A', avgTemp: 11 },
    { id: 2, name: 'B', avgTemp: 'NaN' },
    { id: 3, name: 'C', avgTemp: null },
    { id: 4, name: 'D', avgTemp: 5 },
];

test('rijen: alleen de live waarde, geen terugval op een oude frame-waarde', () => {
    const rows = buildRows(regions, buildSeriesByRegion(frames, 'avgTemp'), new Map([[1, 2]]), 'avgTemp');
    assert.equal(rows[0].value, 11);
    assert.equal(rows[0].stations, 2);
    // Wijk 2 en 3 hebben geen live waarde: de reeks blijft, maar "nu" is leeg.
    assert.equal(rows[1].value, null);
    assert.equal(rows[1].hasData, false);
    assert.equal(rows[1].series.length, 3);
    assert.equal(rows[1].trend, null);
    assert.equal(rows[2].value, null);
    assert.equal(rows[2].hasData, false);
    assert.equal(rows[3].hasData, true);
    assert.equal(rows[3].trend, null);
    assert.equal(rows[3].stations, 0);
});

test('rangschikking: hoogst, laagst en grootste verandering, zonder wijken zonder actuele waarde', () => {
    const rows = buildRows(regions, buildSeriesByRegion(frames, 'avgTemp'), new Map(), 'avgTemp');
    const summary = summarizeRanking(rows);
    assert.equal(summary.highest.id, 1);
    assert.equal(summary.lowest.id, 4);
    // Wijk 2 heeft de grootste verandering maar geen actuele waarde: telt niet mee.
    assert.equal(summary.biggestChange.id, 1);
    const empty = summarizeRanking([]);
    assert.equal(empty.highest, null);
    assert.equal(empty.biggestChange, null);
});

test('rangschikking: gelijke waarden beslist de naam', () => {
    const rows = buildRows(
        [{ id: 9, name: 'Zuid', avgTemp: 8 }, { id: 8, name: 'Noord', avgTemp: 8 }],
        new Map(), new Map(), 'avgTemp'
    );
    const summary = summarizeRanking(rows);
    assert.equal(summary.lowest.name, 'Noord');
    assert.equal(summary.highest.name, 'Noord');
});

test('selectie: toevoegen, weghalen en maximaal drie', () => {
    assert.equal(MAX_COMPARE, 3);
    assert.deepEqual(toggleCompare([], 1), [1]);
    assert.deepEqual(toggleCompare([1, 2], 1), [2]);
    assert.deepEqual(toggleCompare([1, 2, 3], 4), [1, 2, 3]);
    assert.deepEqual(toggleCompare(undefined, 5), [5]);
});

test('vergelijkingsdata: stadsgemiddelde en gekozen wijken per tijdstip', () => {
    const data = buildCompareData(frames, [1, 2], 'avgTemp');
    assert.equal(data.length, 3);
    assert.deepEqual(data[0], { timestamp: 't1', city: 15, r1: 10, r2: null });
    assert.equal(data[2].r2, 6);
    assert.deepEqual(buildCompareData(frames, [], 'avgTemp')[1], { timestamp: 't2', city: (12 + 8 + 20.1) / 3 });
});

const square = [[0, 0], [0, 10], [10, 10], [10, 0]];

test('punt in ring', () => {
    assert.equal(pointInRing(5, 5, square), true);
    assert.equal(pointInRing(15, 5, square), false);
    assert.equal(pointInRing(5, -1, square), false);
});

test('actieve stations per wijk', () => {
    const hoods = [
        { id: 1, coordinates: square },
        { id: 2, coordinates: [[20, 20], [20, 30], [30, 30], [30, 20]] },
        { id: 3, coordinates: [] },
    ];
    const stations = [
        { latitude: 5, longitude: 5, isActive: true },
        { latitude: 6, longitude: 6 },
        { latitude: 7, longitude: 7, isActive: false },
        { latitude: 25, longitude: 25, isActive: true },
        { latitude: null, longitude: 5, isActive: true },
        { latitude: 50, longitude: 50, isActive: true },
    ];
    const counts = countActiveStations(stations, hoods);
    assert.equal(counts.get(1), 2);
    assert.equal(counts.get(2), 1);
    assert.equal(counts.get(3), 0);
    assert.equal(countActiveStations(undefined, undefined).size, 0);
});
