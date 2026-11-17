import test from "node:test";
import assert from "node:assert/strict";
import {
    LOGIN_ITEM,
    NAV_ITEMS,
    PROFILE_ITEM,
    TOP_BAR_MAX_ITEMS,
    getBottomBarItems,
    getExploreItems,
    getMenuItems,
    getProfileMenuItems,
    getTopBarItems,
    getVisibleNavItems,
    isNavItemActive,
} from "./nav-items.js";
import {resolveLegacyPath} from "./legacy-routes.js";

const labels = (user) => getVisibleNavItems(user).map((i) => i.label);
const item = (label) => NAV_ITEMS.find((i) => i.label === label);

test("guests only see the public items", () => {
    assert.deepEqual(labels(null), ["Kaart", "Heatmap", "Wijken", "Dashboard", "Over ons"]);
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

test("the map item is only active on / and its aliases", () => {
    assert.equal(isNavItemActive(item("Kaart"), "/"), true);
    assert.equal(isNavItemActive(item("Kaart"), "/kaart"), true);
    assert.equal(isNavItemActive(item("Kaart"), "/wijken"), false);
    assert.equal(isNavItemActive(item("Dashboard"), "/"), false);
    assert.equal(isNavItemActive(item("Heatmap"), "/newheatmap"), true);
    assert.equal(isNavItemActive(item("Heatmap"), "/wijken"), false);
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

const topLabels = (user) => getTopBarItems(user).map((i) => i.label);
const bottomLabels = (user) => getBottomBarItems(user).map((i) => i.label);
const menuLabels = (user) => getProfileMenuItems(user).map((i) => i.label);

test("the desktop top bar has at most four items: Kaart, Heatmap, Wijken, Dashboard", () => {
    assert.equal(TOP_BAR_MAX_ITEMS, 4);
    assert.ok(getTopBarItems({role: "ADMIN"}).length <= TOP_BAR_MAX_ITEMS);
    const expected = ["Kaart", "Heatmap", "Wijken", "Dashboard"];
    assert.deepEqual(topLabels({role: "USER"}), expected);
    assert.deepEqual(topLabels(null), expected);
    assert.deepEqual(topLabels({role: "ADMIN"}), expected);
});

test("top bar items point to their own paths", () => {
    const paths = Object.fromEntries(getTopBarItems(null).map((i) => [i.label, i.to]));
    assert.deepEqual(paths, {Kaart: "/", Heatmap: "/heatmap", Wijken: "/wijken", Dashboard: "/dashboard"});
});

test("Over ons is a plain guest link and sits in the profile menu when signed in", () => {
    assert.deepEqual(getMenuItems(null).map((i) => i.label), ["Over ons"]);
    assert.deepEqual(menuLabels(null), []);
    assert.deepEqual(menuLabels({role: "USER"}), ["Mijn stations", "Meldingen", "Over ons"]);
    assert.deepEqual(menuLabels({role: "ADMIN"}), ["Mijn stations", "Meldingen", "Over ons", "Beheer"]);
});

test("the profile page lists Heatmap, Wijken and Dashboard under Meer ontdekken", () => {
    assert.deepEqual(getExploreItems({role: "USER"}).map((i) => i.label), ["Heatmap", "Wijken", "Dashboard"]);
});

test("no two menu items resolve to the same page", () => {
    const all = [...NAV_ITEMS, PROFILE_ITEM, LOGIN_ITEM];
    const pages = all.map((i) => resolveLegacyPath(i.to) ?? i.to);
    assert.equal(new Set(pages).size, pages.length, pages.join(", "));
    // Aliases may never be the main path of another menu item. (PROFILE_ITEM is
    // left out on purpose: it stays highlighted under /admin, which is Beheer.)
    const mains = new Set(pages);
    for (const i of NAV_ITEMS) {
        for (const alias of i.aliases ?? []) {
            assert.ok(!mains.has(alias) || alias === i.to, `${alias} van ${i.label}`);
        }
    }
});

test("no menu item redirects away through the legacy table", () => {
    for (const i of NAV_ITEMS) {
        assert.equal(resolveLegacyPath(i.to), null, i.to);
    }
});

test("the bottom bar always has four items, with Profiel last when signed in", () => {
    assert.deepEqual(bottomLabels({role: "USER"}), ["Kaart", "Mijn stations", "Meldingen", "Profiel"]);
    assert.deepEqual(bottomLabels({role: "ADMIN"}), ["Kaart", "Mijn stations", "Meldingen", "Profiel"]);
    assert.equal(bottomLabels(null).length, 4);
});

test("guests get Inloggen in the bottom bar and the protected items stay protected", () => {
    assert.equal(bottomLabels(null).at(-1), "Inloggen");
    assert.equal(getBottomBarItems(null).find((i) => i.label === "Mijn stations").to, "/my/stations");
});

test("Kaart in the bottom bar points to the home route", () => {
    assert.equal(getBottomBarItems(null)[0].to, "/");
});

test("Beheer is in the profile menu for admins only", () => {
    assert.ok(menuLabels({role: "ADMIN"}).includes("Beheer"));
    assert.ok(menuLabels({role: "SUPER_ADMIN"}).includes("Beheer"));
    assert.ok(!menuLabels({role: "USER"}).includes("Beheer"));
    assert.ok(!menuLabels(null).includes("Beheer"));
});

test("Beheer is never a top bar or bottom bar item", () => {
    assert.ok(!topLabels({role: "ADMIN"}).includes("Beheer"));
    assert.ok(!bottomLabels({role: "ADMIN"}).includes("Beheer"));
});

test("the profile item is active on the profile page and under Beheer", () => {
    assert.equal(isNavItemActive(PROFILE_ITEM, "/my/account"), true);
    assert.equal(isNavItemActive(PROFILE_ITEM, "/admin/users"), true);
    assert.equal(isNavItemActive(PROFILE_ITEM, "/my/stations"), false);
});
