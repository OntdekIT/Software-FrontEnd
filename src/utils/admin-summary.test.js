import test from "node:test";
import assert from "node:assert/strict";
import {
    countStationsWithoutRecentMeasurement,
    getWorkshopExpiry,
    summarizeCoverage,
    summarizeWorkshops,
} from "./admin-summary.js";

const now = new Date("2026-05-10T12:00:00Z");
const inHours = (h) => ({code: 1, expirationDate: new Date(now.getTime() + h * 3600 * 1000).toISOString()});

test("getWorkshopExpiry distinguishes active, soon and expired", () => {
    assert.equal(getWorkshopExpiry(inHours(72), now), "actief");
    assert.equal(getWorkshopExpiry(inHours(5), now), "bijna-verlopen");
    assert.equal(getWorkshopExpiry(inHours(24), now), "bijna-verlopen");
    assert.equal(getWorkshopExpiry(inHours(-1), now), "verlopen");
});

test("getWorkshopExpiry treats a missing date as active", () => {
    assert.equal(getWorkshopExpiry({code: 1}, now), "actief");
    assert.equal(getWorkshopExpiry(undefined, now), "actief");
});

test("summarizeWorkshops counts per category", () => {
    const summary = summarizeWorkshops([inHours(72), inHours(3), inHours(-2)], [inHours(-48), inHours(-96)], now);
    assert.deepEqual(summary, {active: 2, expiringSoon: 1, expired: 3});
});

test("summarizeWorkshops handles missing lists", () => {
    assert.deepEqual(summarizeWorkshops(undefined, undefined, now), {active: 0, expiringSoon: 0, expired: 0});
});

test("countStationsWithoutRecentMeasurement counts empty measurement lists", () => {
    const stations = [
        {measurementDtoList: [{timestamp: "2026-05-10T11:50:00Z"}]},
        {measurementDtoList: []},
        {measurementDtoList: null},
    ];
    assert.equal(countStationsWithoutRecentMeasurement(stations), 2);
    assert.equal(countStationsWithoutRecentMeasurement([]), 0);
});

test("summarizeCoverage reads status counts and handles no data", () => {
    const summary = summarizeCoverage({
        networkPmCoverage: 0.82,
        networkGaps: [{}],
        stations: [{status: "OK"}, {status: "NO_DATA"}, {status: "IRREGULAR"}, {status: "NO_DATA"}],
    });
    assert.deepEqual(summary, {networkPmCoverage: 0.82, noData: 2, irregular: 1, networkGaps: 1});
    assert.equal(summarizeCoverage(null), null);
});
