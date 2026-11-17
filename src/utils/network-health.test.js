import test from "node:test";
import assert from "node:assert/strict";
import {parseMeasurementTime} from "./measurement-time.js";
import {
    buildBackfill,
    cityAverageFromStations,
    cityAverageSeries,
    classifyStaleReason,
    countByReason,
    countStationHealth,
    coverageFromFrames,
    coveragePercent,
    listStaleStations,
    pickWarmestAndColdest,
} from "./network-health.js";

const NOW = Date.UTC(2026, 10, 17, 22, 0, 0);
const at = (hhmm) => `17-11-2026 ${hhmm}:00`;

const stations = [
    {stationid: 1, name: "Centrum", isActive: true, measurements: [{timestamp: at("21:50"), temperature: 10, "pm2.5": 4}]},
    {stationid: 2, name: null, isActive: true, measurements: [{timestamp: at("19:10"), temperature: 8}]},
    {stationid: 3, name: "Noord", isActive: false, measurements: []},
    {stationid: 4, name: "Zuid", isActive: true, stofError: true, measurements: [{timestamp: at("18:00"), temperature: 6}]},
    {stationid: 5, name: "Oost", isActive: true, measurements: [{timestamp: at("21:45"), temperature: 12, "pm2.5": 6}]},
];

test("parseMeasurementTime reads the backend format as UTC and ISO", () => {
    assert.equal(parseMeasurementTime("17-11-2026 21:22:49"), Date.UTC(2026, 10, 17, 21, 22, 49));
    assert.equal(parseMeasurementTime("2026-11-17T21:22:49Z"), Date.UTC(2026, 10, 17, 21, 22, 49));
    assert.equal(parseMeasurementTime(""), null);
    assert.equal(parseMeasurementTime("nonsense"), null);
    assert.equal(parseMeasurementTime(null), null);
});

test("listStaleStations lists stations without a recent measurement, newest first", () => {
    const list = listStaleStations(stations, NOW);
    assert.deepEqual(list.map((s) => s.id), [2, 4, 3]);
    assert.equal(list[0].name, "Station 2");
    assert.equal(list[0].lastSeen, Date.UTC(2026, 10, 17, 19, 10));
    assert.equal(list[2].lastSeen, null);
});

test("listStaleStations uses backfill for stations with an empty snapshot", () => {
    const backfill = new Map([[3, Date.UTC(2026, 10, 16, 8, 0)]]);
    const list = listStaleStations(stations, NOW, undefined, backfill);
    assert.equal(list.find((s) => s.id === 3).lastSeen, Date.UTC(2026, 10, 16, 8, 0));
});

test("listStaleStations handles empty and missing input", () => {
    assert.deepEqual(listStaleStations([], NOW), []);
    assert.deepEqual(listStaleStations(undefined, NOW), []);
});

test("classifyStaleReason separates outage, sensor fault and late measurement", () => {
    assert.equal(classifyStaleReason(stations[2]), "uitval");
    assert.equal(classifyStaleReason(stations[3]), "sensorfout");
    assert.equal(classifyStaleReason(stations[1]), "late meting");
    assert.deepEqual(countByReason(listStaleStations(stations, NOW)), {uitval: 1, sensorfout: 1, "late meting": 1});
});

test("countStationHealth counts active and failing stations", () => {
    assert.deepEqual(countStationHealth(stations), {total: 5, active: 4, failing: 2});
    assert.deepEqual(countStationHealth(undefined), {total: 0, active: 0, failing: 0});
});

test("coveragePercent is a clamped percentage and null without a total", () => {
    assert.equal(coveragePercent(30, 40), 75);
    assert.equal(coveragePercent(50, 40), 100);
    assert.equal(coveragePercent(5, 0), null);
    assert.equal(coveragePercent(undefined, 10), null);
});

test("cityAverageFromStations only uses recent readings and skips missing values", () => {
    assert.equal(cityAverageFromStations(stations, "temperature", NOW), 11);
    assert.equal(cityAverageFromStations(stations, "pm2.5", NOW), 5);
    assert.equal(cityAverageFromStations([], "temperature", NOW), null);
    assert.equal(cityAverageFromStations(stations, "humidity", NOW), null);
});

test("cityAverageSeries averages the wijken per frame and leaves gaps as null", () => {
    const frames = [
        {timestamp: "2026-11-17T10:00:00Z", values: [{avgTemp: 10}, {avgTemp: 12}, {avgTemp: null}]},
        {timestamp: "2026-11-17T11:00:00Z", values: [{avgTemp: null}]},
    ];
    const series = cityAverageSeries(frames, "avgTemp");
    assert.equal(series[0].value, 11);
    assert.equal(series[1].value, null);
    assert.equal(series[0].time, Date.UTC(2026, 10, 17, 10));
    assert.deepEqual(cityAverageSeries(undefined, "avgTemp"), []);
});

test("coverageFromFrames averages the share of stations per step", () => {
    const frames = [{stationCount: 30}, {stationCount: 20}, {stationCount: 40}];
    assert.equal(coverageFromFrames(frames, 40), 75);
    assert.equal(coverageFromFrames([], 40), null);
    assert.equal(coverageFromFrames(frames, 0), null);
});

test("pickWarmestAndColdest returns ids and skips NaN", () => {
    const regions = [
        {id: 1, name: "A", avgTemp: 9}, {id: 2, name: "B", avgTemp: "NaN"},
        {id: 3, name: "C", avgTemp: 12}, {id: 4, name: "D", avgTemp: 7},
    ];
    const {warmest, coldest} = pickWarmestAndColdest(regions);
    assert.deepEqual(warmest, {id: 3, name: "C", temp: 12});
    assert.deepEqual(coldest, {id: 4, name: "D", temp: 7});
    assert.deepEqual(pickWarmestAndColdest([]), {warmest: null, coldest: null});
});

test("buildBackfill keeps the newest sighting per station", () => {
    const index = buildBackfill([
        [{stationid: 3, measurements: [{timestamp: at("08:00")}]}],
        [{stationid: 3, measurements: [{timestamp: at("12:00")}]}, {stationid: 9, measurements: []}],
    ]);
    assert.equal(index.get(3), Date.UTC(2026, 10, 17, 12));
    assert.equal(index.has(9), false);
});
