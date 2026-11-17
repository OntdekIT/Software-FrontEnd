import { test } from 'node:test';
import assert from 'node:assert/strict';
import {
    MAX_COVERAGE_KM, boundsAround, buildGrid, coverageAlpha, distanceKm, estimateAt, findExtremes,
    isUsablePoint, nearestPoints,
} from './interpolation.js';

const A = { id: 1, lat: 51.55, lng: 5.09, value: 10 };
const B = { id: 2, lat: 51.55, lng: 5.1, value: 20 };

test('zonder stations is er geen schatting', () => {
    assert.deepEqual(estimateAt([], 51.55, 5.09), { value: null, alpha: 0, nearestKm: null });
    assert.deepEqual(estimateAt(null, 51.55, 5.09), { value: null, alpha: 0, nearestKm: null });
    const grid = buildGrid([], { west: 5, south: 51, east: 6, north: 52 }, 4, 3);
    assert.ok(grid.values.every(Number.isNaN));
    assert.ok(grid.alphas.every((a) => a === 0));
});

test('met 1 station is de schatting die waarde, vervaagt en stopt voorbij het bereik', () => {
    const at = estimateAt([A], A.lat, A.lng);
    assert.equal(at.value, 10);
    assert.equal(at.alpha, 1);
    const near = estimateAt([A], A.lat + 0.01, A.lng); // ongeveer 1,1 km
    assert.equal(near.value, 10);
    assert.ok(near.alpha < 1 && near.alpha > 0);
    const far = estimateAt([A], A.lat + 0.05, A.lng); // ongeveer 5,5 km
    assert.equal(far.value, null);
    assert.equal(far.alpha, 0);
    assert.ok(far.nearestKm > MAX_COVERAGE_KM);
});

test('met 2 stations ligt het midden ertussen en bij gelijke afstand op het gemiddelde', () => {
    const mid = estimateAt([A, B], 51.55, 5.095);
    assert.ok(Math.abs(mid.value - 15) < 1e-9);
    const closeToA = estimateAt([A, B], 51.55, 5.0925);
    assert.ok(closeToA.value > 10 && closeToA.value < 15);
    // een schatting overschrijdt nooit de gemeten waarden
    const outside = estimateAt([A, B], 51.551, 5.0875);
    assert.ok(outside.value >= 10 && outside.value <= 20);
});

test('op de plek van een station geeft de schatting exact zijn waarde', () => {
    assert.equal(estimateAt([A, B], B.lat, B.lng).value, 20);
});

test('identieke waarden geven overal die waarde en geen hot of coolspot', () => {
    const same = [{ ...A, value: 9.5 }, { ...B, value: 9.5 }];
    assert.ok(Math.abs(estimateAt(same, 51.5505, 5.093).value - 9.5) < 1e-9);
    assert.deepEqual(findExtremes(same), { hot: null, cold: null });
});

test('NaN, null en 0,0 worden genegeerd', () => {
    const dirty = [
        A,
        { lat: 51.55, lng: 5.1, value: NaN },
        { lat: 51.55, lng: 5.1, value: null },
        { lat: NaN, lng: 5.1, value: 30 },
        { lat: 0, lng: 0, value: 40 },
        undefined,
    ];
    assert.equal(isUsablePoint(dirty[1]), false);
    assert.equal(isUsablePoint(dirty[4]), false);
    assert.equal(estimateAt(dirty, 51.5505, 5.09).value, 10);
    assert.equal(nearestPoints(dirty, 51.55, 5.09, 5).length, 1);
    assert.deepEqual(findExtremes(dirty), { hot: null, cold: null });
    const grid = buildGrid(dirty, boundsAround([A]), 5, 5);
    assert.ok(grid.values.every((v) => Number.isNaN(v) || v === 10));
});

test('de dichtstbijzijnde stations staan op afstand gesorteerd', () => {
    const c = { id: 3, lat: 51.56, lng: 5.09, value: 5 };
    const list = nearestPoints([c, B, A], 51.55, 5.0905, 2);
    assert.deepEqual(list.map((n) => n.point.id), [1, 2]);
    assert.ok(list[0].distanceKm < list[1].distanceKm);
});

test('hotspot en coolspot zijn het hoogste en laagste station', () => {
    const c = { id: 3, lat: 51.56, lng: 5.09, value: 5 };
    const { hot, cold } = findExtremes([A, B, c]);
    assert.equal(hot.id, 2);
    assert.equal(cold.id, 3);
    assert.deepEqual(findExtremes([A]), { hot: null, cold: null });
});

test('het raster is transparant ver van stations en dekt de omgeving van een station', () => {
    const bounds = boundsAround([A], MAX_COVERAGE_KM);
    const grid = buildGrid([A], bounds, 21, 21);
    const center = 10 * 21 + 10;
    assert.equal(grid.values[center], 10);
    assert.equal(grid.alphas[center], 1);
    // hoek: ver weg (>2,5 km) dus geen waarde
    assert.ok(Number.isNaN(grid.values[0]));
    assert.equal(grid.alphas[0], 0);
});

test('coverageAlpha en distanceKm gedragen zich netjes', () => {
    assert.equal(coverageAlpha(0.2), 1);
    assert.equal(coverageAlpha(MAX_COVERAGE_KM), 0);
    assert.equal(coverageAlpha(NaN), 0);
    const half = coverageAlpha(1.75);
    assert.ok(half > 0 && half < 1);
    assert.ok(Math.abs(distanceKm(51.55, 5.09, 51.56, 5.09) - 1.1057) < 1e-6);
    assert.equal(boundsAround([]), null);
});
