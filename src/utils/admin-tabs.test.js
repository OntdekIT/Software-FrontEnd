import test from "node:test";
import assert from "node:assert/strict";
import {ADMIN_TABS, getActiveAdminTab, getAdminTabRoute} from "./admin-tabs.js";

const activeKey = (pathname) => getActiveAdminTab(pathname)?.key ?? null;

test("there are four tabs in the agreed order", () => {
    assert.deepEqual(ADMIN_TABS.map((tab) => tab.label), ["Overzicht", "Gebruikers", "Stations", "Workshopcodes"]);
});

test("each existing admin route opens the right tab", () => {
    assert.equal(activeKey("/admin"), "overzicht");
    assert.equal(activeKey("/admin/users"), "gebruikers");
    assert.equal(activeKey("/admin/stations"), "stations");
    assert.equal(activeKey("/admin/workshop-codes"), "workshopcodes");
});

test("sub pages keep their tab active", () => {
    assert.equal(activeKey("/admin/users/42"), "gebruikers");
    assert.equal(activeKey("/admin/stations/toevoegen"), "stations");
    assert.equal(activeKey("/admin/stations/7"), "stations");
    assert.equal(activeKey("/admin/workshop-codes/create"), "workshopcodes");
});

test("data coverage belongs to the overview", () => {
    assert.equal(activeKey("/admin/data-coverage"), "overzicht");
});

test("a trailing slash does not matter", () => {
    assert.equal(activeKey("/admin/users/"), "gebruikers");
    assert.equal(activeKey("/admin/"), "overzicht");
});

test("paths outside Beheer or that only share a prefix match no tab", () => {
    assert.equal(activeKey("/"), null);
    assert.equal(activeKey("/administratie"), null);
    assert.equal(activeKey("/my/account"), null);
});

test("every tab key maps to its route and back", () => {
    for (const tab of ADMIN_TABS) {
        assert.equal(getAdminTabRoute(tab.key), tab.to);
        assert.equal(getActiveAdminTab(tab.to).key, tab.key);
    }
    assert.equal(getAdminTabRoute("onbekend"), null);
});
