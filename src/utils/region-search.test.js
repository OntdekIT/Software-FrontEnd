import test from 'node:test';
import assert from 'node:assert/strict';
import { searchRegions } from './region-search.js';

const regions = [
    { id: 1, name: 'Reeshof' },
    { id: 2, name: 'Heikant' },
    { id: 3, name: 'De Reeshof Noord' },
    { id: 4, name: 'Centrum' },
];

test('searchRegions zoekt hoofdletterongevoelig en zet beginmatches eerst', () => {
    assert.deepEqual(searchRegions(regions, 'REES').map(r => r.id), [1, 3]);
});

test('searchRegions geeft niets bij een lege zoekterm of zonder treffer', () => {
    assert.deepEqual(searchRegions(regions, '  '), []);
    assert.deepEqual(searchRegions(regions, 'xyz'), []);
    assert.deepEqual(searchRegions(null, 'a'), []);
});

test('searchRegions begrenst het aantal resultaten', () => {
    assert.equal(searchRegions(regions, 'e', 2).length, 2);
});
