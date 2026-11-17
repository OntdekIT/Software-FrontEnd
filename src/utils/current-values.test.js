import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    CURRENT_MAX_AGE_MS, cityAverage, currentFrame, currentRegions, isFrameCurrent, normalizeRegions,
    pickExtremes, pickRegionExtremes,
} from './current-values.js';
import { MAX_AGE_MS } from './heatmap-data.js';
import { buildRows, buildSeriesByRegion, summarizeRanking } from './wijken-compare.js';
import { pickWarmestAndColdest } from './network-health.js';
import { summarizeNetwork } from './network-summary.js';
import { findExtremes } from './interpolation.js';

// Meting van 2026-11-17 21:52 UTC: /neighbourhood/history gaf Dongewijk "NaN",
// maar frame 19 van de timelapse (16:52 UTC, 5 uur eerder) had nog 5.875.
const NOW = Date.UTC(2026, 10, 17, 21, 52, 8);
const HOUR = 3600 * 1000;
const iso = (ms) => new Date(ms).toISOString();

const snapshot = [
    { id: 1, name: 'Sint Anna', avgTemp: 8.8125, avgPm25: null },
    { id: 2, name: 'Loven-Besterd', avgTemp: 8.8125, avgPm25: 5 },
    { id: 3, name: 'Armhoef', avgTemp: 9.75, avgPm25: 'NaN' },
    { id: 4, name: 'Dongewijk', avgTemp: 'NaN', avgPm25: null },
    { id: 5, name: 'Binnenstad', avgTemp: null, avgPm25: undefined },
];

// 25 frames, ieder uur; Dongewijk had alleen tot frame 19 (5 uur geleden) een waarde.
const frames = Array.from({ length: 25 }, (_, i) => ({
    timestamp: iso(NOW - (24 - i) * HOUR),
    values: [
        { id: 1, avgTemp: 8.8125, avgPm25: null },
        { id: 2, avgTemp: 8.8125, avgPm25: 5 },
        { id: 3, avgTemp: 9.75, avgPm25: null },
        { id: 4, avgTemp: i <= 19 ? 5.875 : null, avgPm25: null },
        { id: 5, avgTemp: null, avgPm25: null },
    ],
}));

test('de drempel is dezelfde van twee uur als op de heatmap', () => {
    assert.equal(CURRENT_MAX_AGE_MS, MAX_AGE_MS);
    assert.equal(CURRENT_MAX_AGE_MS, 2 * HOUR);
});

test('normalizeRegions: NaN, null en tekst worden null en nooit 0', () => {
    const out = normalizeRegions(snapshot);
    assert.equal(out[3].avgTemp, null);
    assert.equal(out[4].avgTemp, null);
    assert.equal(out[4].avgPm25, null);
    assert.equal(out[2].avgPm25, null);
    assert.equal(out.some((r) => r.avgTemp === 0), false);
    assert.deepEqual(normalizeRegions(undefined), []);
});

test('Dongewijk: een verouderde frame-waarde is niet de koudste wijk', () => {
    const rows = buildRows(snapshot, buildSeriesByRegion(frames, 'avgTemp'), new Map(), 'avgTemp');
    const dongewijk = rows.find((r) => r.name === 'Dongewijk');
    assert.equal(dongewijk.value, null);
    assert.equal(dongewijk.hasData, false);
    // De reeks houdt de oude waarde voor het verloop.
    assert.equal(dongewijk.series[19].value, 5.875);

    const { lowest, highest } = summarizeRanking(rows);
    assert.equal(lowest.name, 'Loven-Besterd'); // gelijk met Sint Anna: naam beslist
    assert.equal(lowest.value, 8.8125);
    assert.equal(highest.name, 'Armhoef');
});

test('Wijken, Dashboard en Kaart kiezen dezelfde warmste en koudste wijk', () => {
    const rows = buildRows(snapshot, buildSeriesByRegion(frames, 'avgTemp'), new Map(), 'avgTemp');
    const wijken = summarizeRanking(rows);
    const dashboard = pickWarmestAndColdest(snapshot);
    const kaart = summarizeNetwork([], snapshot);
    assert.equal(dashboard.coldest.name, wijken.lowest.name);
    assert.equal(dashboard.warmest.name, wijken.highest.name);
    assert.equal(kaart.coldest.name, wijken.lowest.name);
    assert.equal(kaart.warmest.name, wijken.highest.name);
    assert.equal(kaart.coldest.temp, wijken.lowest.value);
});

test('gelijke waarden: de naam beslist, ongeacht de volgorde', () => {
    const a = pickRegionExtremes(snapshot, 'avgTemp');
    const b = pickRegionExtremes([...snapshot].reverse(), 'avgTemp');
    assert.equal(a.coldest.name, 'Loven-Besterd');
    assert.equal(b.coldest.name, 'Loven-Besterd');
});

test('heatmap: stations met gelijke waarde beslist ook de naam', () => {
    const pts = [
        { id: 1, name: 'Zuid', lat: 51.5, lng: 5.1, value: 8 },
        { id: 2, name: 'Noord', lat: 51.6, lng: 5.1, value: 8 },
        { id: 3, name: 'Midden', lat: 51.55, lng: 5.1, value: 9 },
    ];
    const { hot, cold } = findExtremes(pts);
    assert.equal(hot.name, 'Midden');
    assert.equal(cold.name, 'Noord');
});

test('pickExtremes: ontbrekende waarden tellen niet mee en 0 is geen ontbrekende waarde', () => {
    const items = [{ name: 'A', v: null }, { name: 'B', v: 'NaN' }, { name: 'C', v: 0 }, { name: 'D', v: 3 }];
    const { highest, lowest } = pickExtremes(items, (i) => i.v);
    assert.equal(highest.name, 'D');
    assert.equal(lowest.name, 'C');
    assert.deepEqual(pickExtremes([{ name: 'A', v: null }], (i) => i.v), { highest: null, lowest: null });
    assert.deepEqual(pickExtremes(undefined, (i) => i.v), { highest: null, lowest: null });
});

test('stadsgemiddelde: gemiddelde van wijken met een waarde, null zonder', () => {
    assert.equal(cityAverage(snapshot, 'avgTemp'), (8.8125 + 8.8125 + 9.75) / 3);
    assert.equal(cityAverage(snapshot, 'avgPm25'), 5);
    assert.equal(cityAverage([{ id: 1, name: 'A', avgTemp: 'NaN' }], 'avgTemp'), null);
    assert.equal(cityAverage([], 'avgTemp'), null);
    assert.equal(cityAverage(undefined, 'avgTemp'), null);
});

test('een verouderd frame is niet actueel', () => {
    const stale = { timestamp: iso(NOW - 3 * HOUR), values: [{ id: 1, avgTemp: 5 }] };
    const fresh = { timestamp: iso(NOW - 10 * 60 * 1000), values: [{ id: 1, avgTemp: 5 }] };
    assert.equal(isFrameCurrent(stale, NOW), false);
    assert.equal(isFrameCurrent(fresh, NOW), true);
    assert.equal(currentFrame([fresh, stale], NOW), null); // zoekt niet terug naar het verse frame
    assert.equal(currentFrame([stale, fresh], NOW), fresh);
});

test('een leeg frame of een frame zonder tijd is niet actueel', () => {
    const empty = { timestamp: iso(NOW), values: [{ id: 1, avgTemp: null, avgPm25: 'NaN' }] };
    assert.equal(isFrameCurrent(empty, NOW), false);
    assert.equal(isFrameCurrent({ timestamp: iso(NOW), values: [] }, NOW), false);
    assert.equal(isFrameCurrent({ values: [{ id: 1, avgTemp: 5 }] }, NOW), false);
    assert.equal(isFrameCurrent(null, NOW), false);
});

test('frametijden worden via measurement-time gelezen (ook het backendformaat)', () => {
    const frame = { timestamp: '17-11-2026 21:30:00', values: [{ id: 1, avgTemp: 5 }] };
    assert.equal(isFrameCurrent(frame, NOW), true);
    assert.equal(isFrameCurrent({ ...frame, timestamp: '17-11-2026 18:30:00' }, NOW), false);
});

const timelapse = { neighbourhoods: snapshot.map(({ id, name }) => ({ id, name })), frames };

test('currentRegions: de snapshot wint, de timelapse is alleen terugval', () => {
    const regions = currentRegions(snapshot, timelapse, NOW);
    assert.equal(regions.find((r) => r.name === 'Dongewijk').avgTemp, null);

    const fallback = currentRegions([], timelapse, NOW);
    assert.equal(fallback.find((r) => r.name === 'Armhoef').avgTemp, 9.75);
    // Terugval gebruikt alleen het laatste frame: Dongewijk blijft leeg, ook al had frame 19 een waarde.
    assert.equal(fallback.find((r) => r.name === 'Dongewijk').avgTemp, null);
});

test('currentRegions: een verouderde timelapse geeft geen waarden', () => {
    const old = { ...timelapse, frames: frames.map((f) => ({ ...f, timestamp: iso(Date.parse(f.timestamp) - 6 * HOUR) })) };
    const regions = currentRegions(undefined, old, NOW);
    assert.equal(regions.length, 5);
    assert.ok(regions.every((r) => r.avgTemp === null && r.avgPm25 === null));
    assert.deepEqual(currentRegions(undefined, null, NOW), []);
});
