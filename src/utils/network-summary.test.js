import test from "node:test";
import assert from "node:assert/strict";
import {average, latestMeasurementTime, pickExtremeRegion, summarizeNetwork} from "./network-summary.js";

const regions = [
    {id: 1, name: "Centrum", avgTemp: 18.2, avgPm25: 6},
    {id: 2, name: "Reeshof", avgTemp: 16.4, avgPm25: null},
    {id: 3, name: "Noord", avgTemp: "NaN", avgPm25: 8},
    {id: 4, name: "Berkel", avgTemp: 19.6, avgPm25: 7},
];

test("average ignores non-numeric values and returns null when empty", () => {
    assert.equal(average([10, "20", null, "NaN"]), 15);
    assert.equal(average([]), null);
    assert.equal(average([null, undefined]), null);
});

test("pickExtremeRegion finds warmest and coldest and skips NaN", () => {
    assert.deepEqual(pickExtremeRegion(regions, "max"), {name: "Berkel", temp: 19.6});
    assert.deepEqual(pickExtremeRegion(regions, "min"), {name: "Reeshof", temp: 16.4});
});

test("pickExtremeRegion returns null without usable data", () => {
    assert.equal(pickExtremeRegion([], "max"), null);
    assert.equal(pickExtremeRegion([{name: "X", avgTemp: "NaN"}], "min"), null);
    assert.equal(pickExtremeRegion(undefined, "min"), null);
});

test("latestMeasurementTime picks the newest timestamp over all stations", () => {
    const stations = [
        {measurementDtoList: [{timestamp: "2026-05-10T14:00:00Z"}]},
        {measurementDtoList: [{timestamp: "2026-05-10T14:20:00Z"}, {timestamp: "kapot"}]},
        {measurementDtoList: null},
    ];
    assert.equal(latestMeasurementTime(stations), new Date("2026-05-10T14:20:00Z").getTime());
    assert.equal(latestMeasurementTime([]), null);
});

test("summarizeNetwork counts active and failing stations", () => {
    const stations = [
        {isActive: true},
        {isActive: false},
        {isActive: true, tempError: true},
    ];
    const summary = summarizeNetwork(stations, regions);
    assert.equal(summary.activeCount, 2);
    assert.equal(summary.totalCount, 3);
    assert.equal(summary.failingCount, 2);
    assert.equal(summary.lastUpdate, null);
});

test("summarizeNetwork copes with empty input", () => {
    const summary = summarizeNetwork([], []);
    assert.equal(summary.avgTemp, null);
    assert.equal(summary.warmest, null);
    assert.equal(summary.activeCount, 0);
});
