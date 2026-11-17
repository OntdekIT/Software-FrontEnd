import test from "node:test";
import assert from "node:assert/strict";
import {NAV_ITEMS, getVisibleNavItems, isNavItemActive} from "./nav-items.js";

const labels = (user) => getVisibleNavItems(user).map((i) => i.label);
const item = (label) => NAV_ITEMS.find((i) => i.label === label);

test("guests only see the public items", () => {
    assert.deepEqual(labels(null), ["Dashboard", "Kaart", "Heatmap", "Wijken", "Over ons"]);
});

test("a normal user also sees Mijn stations but not Beheer", () => {
    const result = labels({role: "USER"});
    assert.ok(result.includes("Mijn stations"));
    assert.ok(!result.includes("Beheer"));
});

test("admins and super admins see Beheer", () => {
    assert.ok(labels({role: "ADMIN"}).includes("Beheer"));
    assert.ok(labels({role: "SUPER_ADMIN"}).includes("Beheer"));
});

test("the home item is only active on / and its alias", () => {
    assert.equal(isNavItemActive(item("Dashboard"), "/"), true);
    assert.equal(isNavItemActive(item("Dashboard"), "/dashboard"), true);
    assert.equal(isNavItemActive(item("Dashboard"), "/wijken"), false);
});

test("sub pages keep their parent item active", () => {
    assert.equal(isNavItemActive(item("Wijken"), "/wijken/12"), true);
    assert.equal(isNavItemActive(item("Beheer"), "/admin/users"), true);
    assert.equal(isNavItemActive(item("Mijn stations"), "/my/stations/claim"), true);
});

test("a path that only shares a prefix does not match", () => {
    assert.equal(isNavItemActive(item("Kaart"), "/kaartje"), false);
    assert.equal(isNavItemActive(item("Kaart"), "/newhome"), true);
});
