import test from 'node:test';
import assert from 'node:assert/strict';
import { DEFAULT_SORT_MODE, SORT_MODES, sortOptions, sortRegions } from './region-sort.js';

const regions = [
    { id: 1, name: 'Zuid', avgTemp: 12.5 },
    { id: 2, name: 'Noord', avgTemp: NaN },
    { id: 3, name: 'Centrum', avgTemp: 14 },
    { id: 4, name: 'Oost', avgTemp: '9.1' },
    { id: 5, name: 'West', avgTemp: null },
    { id: 6, name: 'Ekster', avgTemp: 12.5 },
];
const names = (list) => list.map(r => r.name);

test('A tot Z sorteert op naam, ook met hoofdletters en accenten', () => {
    const sorted = sortRegions([{ name: 'zuid' }, { name: 'Ekster' }, { name: 'Ätna' }, { name: 'Centrum' }], SORT_MODES.name, 'avgTemp');
    assert.deepEqual(names(sorted), ['Ätna', 'Centrum', 'Ekster', 'zuid']);
});

test('warmst zet de hoogste waarde bovenaan en wijken zonder data onderaan', () => {
    assert.deepEqual(names(sortRegions(regions, SORT_MODES.high, 'avgTemp')), ['Centrum', 'Ekster', 'Zuid', 'Oost', 'Noord', 'West']);
});

test('koudst zet de laagste waarde bovenaan en wijken zonder data onderaan', () => {
    assert.deepEqual(names(sortRegions(regions, SORT_MODES.low, 'avgTemp')), ['Oost', 'Ekster', 'Zuid', 'Centrum', 'Noord', 'West']);
});

test('gelijke waarden vallen terug op naam', () => {
    const sorted = sortRegions(regions, SORT_MODES.high, 'avgTemp');
    assert.ok(names(sorted).indexOf('Ekster') < names(sorted).indexOf('Zuid'));
});

test('sorteren werkt op het veld van de gekozen laag (PM2.5)', () => {
    const pm = [{ name: 'A', avgPm25: 5 }, { name: 'B', avgPm25: 11 }, { name: 'C', avgPm25: null }];
    assert.deepEqual(names(sortRegions(pm, SORT_MODES.high, 'avgPm25')), ['B', 'A', 'C']);
    assert.deepEqual(names(sortRegions(pm, SORT_MODES.low, 'avgPm25')), ['A', 'B', 'C']);
});

test('de invoer blijft ongewijzigd en een onbekende modus valt terug op A tot Z', () => {
    const input = [{ name: 'B' }, { name: 'A' }];
    const sorted = sortRegions(input, 'onzin', 'avgTemp');
    assert.deepEqual(names(input), ['B', 'A']);
    assert.deepEqual(names(sorted), ['A', 'B']);
});

test('lege of ontbrekende lijst geeft een lege lijst', () => {
    assert.deepEqual(sortRegions([], SORT_MODES.high, 'avgTemp'), []);
    assert.deepEqual(sortRegions(undefined, SORT_MODES.low, 'avgTemp'), []);
});

test('labels volgen de laag en de standaard is A tot Z', () => {
    assert.deepEqual(sortOptions('temperature').map(o => o.label), ['A tot Z', 'Warmst', 'Koudst']);
    assert.deepEqual(sortOptions('pm25').map(o => o.label), ['A tot Z', 'Hoogst', 'Laagst']);
    assert.equal(DEFAULT_SORT_MODE, SORT_MODES.name);
});
