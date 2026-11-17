// Navigation items of the main navbar, plus the rules for who sees what and
// which one is the current page. Pure so it can be unit tested.

export const ACCESS = {
    PUBLIC: "public",
    USER: "user",
    ADMIN: "admin",
};

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];

// Where an item lives. PRIMARY items are the main destinations of the bottom
// bar on mobile. EXPLORE items are the other pages that show the data
// (Heatmap, Wijken, Dashboard): top bar on desktop, "Meer ontdekken" on the
// profile page on mobile. MENU items are the rest (Over ons, Beheer): profile
// menu on desktop, profile page on mobile, a plain link for guests.
// `topBar: true` puts an item in the desktop top bar.
export const AREA = {
    PRIMARY: "primary",
    EXPLORE: "explore",
    MENU: "menu",
};

// Desktop top bar: at most this many items, next to the profile menu.
export const TOP_BAR_MAX_ITEMS = 4;

// The bottom bar replaces the top bar items below this width (Tailwind `lg`).
// The navbar uses `lg:` classes for it, this constant documents the same value.
export const DESKTOP_BREAKPOINT_PX = 1024;

export const NAV_ITEMS = [
    {to: "/", label: "Kaart", icon: "bi-map", area: AREA.PRIMARY, access: ACCESS.PUBLIC, topBar: true, end: true, aliases: ["/kaart", "/newhome"]},
    {to: "/my/stations", label: "Mijn stations", icon: "bi-broadcast", area: AREA.PRIMARY, access: ACCESS.USER},
    {to: "/meldingen", label: "Meldingen", icon: "bi-bell", area: AREA.PRIMARY, access: ACCESS.USER},
    {to: "/heatmap", label: "Heatmap", icon: "bi-thermometer-half", area: AREA.EXPLORE, access: ACCESS.PUBLIC, topBar: true, aliases: ["/newheatmap"]},
    {to: "/wijken", label: "Wijken", icon: "bi-geo-alt", area: AREA.EXPLORE, access: ACCESS.PUBLIC, topBar: true},
    {to: "/dashboard", label: "Dashboard", icon: "bi-speedometer2", area: AREA.EXPLORE, access: ACCESS.PUBLIC, topBar: true},
    {to: "/about", label: "Over ons", icon: "bi-info-circle", area: AREA.MENU, access: ACCESS.PUBLIC},
    {to: "/admin", label: "Beheer", icon: "bi-gear", area: AREA.MENU, access: ACCESS.ADMIN},
];

// The fourth item of the bottom bar. Signed in it opens the profile page, signed
// out it leads to the login page.
export const PROFILE_ITEM = {to: "/my/account", label: "Profiel", icon: "bi-person-circle", aliases: ["/admin"]};
export const LOGIN_ITEM = {to: "/auth/login", label: "Inloggen", icon: "bi-box-arrow-in-right"};

export function canSee(item, user) {
    if (item.access === ACCESS.PUBLIC) return true;
    if (!user) return false;
    if (item.access === ACCESS.USER) return true;
    return ADMIN_ROLES.includes(user.role);
}

export function getVisibleNavItems(user, items = NAV_ITEMS) {
    return items.filter((item) => canSee(item, user));
}

function matches(path, pathname, end) {
    if (pathname === path) return true;
    return !end && pathname.startsWith(`${path}/`);
}

// The item for the current page: an exact match, or a sub page of it (so
// /wijken/12 keeps "Wijken" active). "/" only matches itself.
export function isNavItemActive(item, pathname) {
    return [item.to, ...(item.aliases ?? [])].some((path) => matches(path, pathname, item.end === true));
}

// Desktop top bar: the visible items flagged `topBar`, never more than
// TOP_BAR_MAX_ITEMS.
export function getTopBarItems(user, items = NAV_ITEMS) {
    return getVisibleNavItems(user, items)
        .filter((item) => item.topBar)
        .slice(0, TOP_BAR_MAX_ITEMS);
}

// Mobile bottom bar: always four items. Guests keep the two account items; they
// lead to the login page through the protected routes, so the bar does not
// change shape when someone signs in.
export function getBottomBarItems(user, items = NAV_ITEMS) {
    const primary = items.filter((item) => item.area === AREA.PRIMARY);
    return [...primary, user ? PROFILE_ITEM : LOGIN_ITEM];
}

// "Meer ontdekken" on the profile page (mobile): the data pages that are not
// in the bottom bar.
export function getExploreItems(user, items = NAV_ITEMS) {
    return getVisibleNavItems(user, items).filter((item) => item.area === AREA.EXPLORE);
}

// Other links on the profile page (mobile) and the plain link for guests in
// the top bar: Over ons, and Beheer for admins.
export function getMenuItems(user, items = NAV_ITEMS) {
    return getVisibleNavItems(user, items).filter((item) => item.area === AREA.MENU);
}

// Profile menu (desktop, signed in only): the account pages that are not in
// the top bar (Mijn stations, Meldingen), then Over ons and Beheer.
export function getProfileMenuItems(user, items = NAV_ITEMS) {
    if (!user) return [];
    const account = getVisibleNavItems(user, items).filter((item) => item.area === AREA.PRIMARY && !item.topBar);
    return [...account, ...getMenuItems(user, items)];
}
