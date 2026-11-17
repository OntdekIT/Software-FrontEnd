import test from "node:test";
import assert from "node:assert/strict";
import {
    formatLastMeasurement,
    getStationStatus,
    indexLastMeasurements,
    lastMeasurementTime,
} from "./station-status.js";

test("getStationStatus maps isActive to online/offline", () => {
    assert.equal(getStationStatus({isActive: true}).label, "Online");
    assert.equal(getStationStatus({isActive: false}).label, "Offline");
    assert.equal(getStationStatus({}).online, true);
});

test("getStationStatus lists failing sensors", () => {
    const status = getStationStatus({isActive: true, tempError: true, stofError: true, humError: false});
    assert.deepEqual(status.faults, ["temperatuur", "fijnstof"]);
});

test("lastMeasurementTime takes the newest valid timestamp", () => {
    const station = {measurementDtoList: [{timestamp: "2026-05-10T10:00:00Z"}, {timestamp: "2026-05-10T10:30:00Z"}, {timestamp: "x"}]};
    assert.equal(lastMeasurementTime(station), new Date("2026-05-10T10:30:00Z").getTime());
    assert.equal(lastMeasurementTime({measurementDtoList: []}), null);
    assert.equal(lastMeasurementTime(undefined), null);
});

test("indexLastMeasurements skips stations without measurements", () => {
    const index = indexLastMeasurements([
        {stationid: 1, measurementDtoList: [{timestamp: "2026-05-10T10:00:00Z"}]},
        {stationid: 2, measurementDtoList: []},
    ]);
    assert.equal(index.size, 1);
    assert.ok(index.has(1));
});

test("formatLastMeasurement falls back for a missing time", () => {
    assert.equal(formatLastMeasurement(null), "Geen recente meting");
    assert.match(formatLastMeasurement(Date.UTC(2026, 4, 10, 10, 0)), /10/);
});
