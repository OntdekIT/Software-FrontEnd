import test from 'node:test';
import assert from 'node:assert/strict';
import {
    MAX_STEPS, MIN_STEPS, TIMELINE_STEPS, clampIndex, clampSteps, isLive,
    nextPlaybackIndex, parseTimelapse, regionsForFrame, selectFrame,
} from './timeline.js';

const frame = (timestamp, values) => ({ timestamp, values, stationCount: 3 });
const wijken = [
    { id: 1, name: 'A', coordinates: [[1, 2]] },
    { id: 2, name: 'B', coordinates: [[3, 4]] },
];

test('het aantal stappen van de 24-uursreeks ligt binnen de grenzen van de backend', () => {
    assert.ok(TIMELINE_STEPS >= MIN_STEPS && TIMELINE_STEPS <= MAX_STEPS);
    assert.equal(clampSteps(1), 2);
    assert.equal(clampSteps(100), 48);
    assert.equal(clampSteps(24.4), 24);
});

test('clampIndex houdt de index binnen de frames', () => {
    assert.equal(clampIndex(-3, 5), 0);
    assert.equal(clampIndex(9, 5), 4);
    assert.equal(clampIndex(2, 5), 2);
    assert.equal(clampIndex(2, 0), 0);
});

test('selectFrame geeft het frame bij de index, begrensd, of null zonder frames', () => {
    const frames = [frame('a', []), frame('b', []), frame('c', [])];
    assert.equal(selectFrame(frames, 1).timestamp, 'b');
    assert.equal(selectFrame(frames, 99).timestamp, 'c');
    assert.equal(selectFrame(frames, -1).timestamp, 'a');
    assert.equal(selectFrame([], 0), null);
    assert.equal(selectFrame(null, 0), null);
});

test('LIVE geldt alleen bij het laatste frame', () => {
    assert.equal(isLive(24, 25), true);
    assert.equal(isLive(23, 25), false);
    assert.equal(isLive(0, 25), false);
    assert.equal(isLive(0, 0), false);
});

test('afspelen loopt door en begint na het laatste frame weer vooraan', () => {
    assert.equal(nextPlaybackIndex(0, 5), 1);
    assert.equal(nextPlaybackIndex(3, 5), 4);
    assert.equal(nextPlaybackIndex(4, 5), 0);
    assert.equal(nextPlaybackIndex(0, 1), 0);
});

test('parseTimelapse geeft null bij lege of onbruikbare data', () => {
    assert.equal(parseTimelapse(null), null);
    assert.equal(parseTimelapse({}), null);
    assert.equal(parseTimelapse({ neighbourhoods: wijken, frames: [] }), null);
    assert.equal(parseTimelapse({ neighbourhoods: [], frames: [frame('a', []), frame('b', [])] }), null);
    // een enkel frame is geen tijdlijn
    assert.equal(parseTimelapse({ neighbourhoods: wijken, frames: [frame('a', [{ id: 1, avgTemp: 5 }])] }), null);
    // frames zonder enige meetwaarde
    const empty = [frame('a', [{ id: 1, avgTemp: null, avgPm25: null }]), frame('b', [{ id: 1, avgTemp: null, avgPm25: null }])];
    assert.equal(parseTimelapse({ neighbourhoods: wijken, frames: empty }), null);
});

test('parseTimelapse accepteert een bruikbaar antwoord', () => {
    const frames = [frame('a', [{ id: 1, avgTemp: null, avgPm25: null }]), frame('b', [{ id: 1, avgTemp: 8.5, avgPm25: null }])];
    const parsed = parseTimelapse({ neighbourhoods: wijken, frames });
    assert.equal(parsed.frames.length, 2);
    assert.equal(parsed.neighbourhoods.length, 2);
});

test('regionsForFrame zet ontbrekende waarden om naar NaN en null', () => {
    const regions = regionsForFrame(wijken, frame('a', [{ id: 1, avgTemp: 7.5, avgPm25: 3 }]));
    assert.equal(regions[0].avgTemp, 7.5);
    assert.equal(regions[0].avgPm25, 3);
    assert.ok(Number.isNaN(regions[1].avgTemp));
    assert.equal(regions[1].avgPm25, null);
    assert.equal(regions[1].name, 'B');
});
