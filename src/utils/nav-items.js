// Navigation items of the main navbar, plus the rules for who sees what and
// which one is the current page. Pure so it can be unit tested.

export const ACCESS = {
    PUBLIC: "public",
    USER: "user",
    ADMIN: "admin",
};

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];

// Where an item lives. PRIMARY items are the few main destinations: the top
// bar on desktop and (together with the profile item) the bottom bar on
// mobile. MENU items live in the profile menu (desktop) or on the profile page
// (mobile), so the bars stay short.
export const AREA = {
    PRIMARY: "primary",
    MENU: "menu",
};

// Desktop top bar: at most this many items, next to the profile menu.
export const TOP_BAR_MAX_ITEMS = 3;

// The bottom bar replaces the top bar items below this width (Tailwind `lg`).
// The navbar uses `lg:` classes for it, this constant documents the same value.
export const DESKTOP_BREAKPOINT_PX = 1024;

export const NAV_ITEMS = [
    {to: "/", label: "Kaart", icon: "bi-map", area: AREA.PRIMARY, access: ACCESS.PUBLIC, end: true, aliases: ["/kaart", "/newhome"]},
    {to: "/my/stations", label: "Mijn stations", icon: "bi-broadcast", area: AREA.PRIMARY, access: ACCESS.USER},
    {to: "/meldingen", label: "Meldingen", icon: "bi-bell", area: AREA.PRIMARY, access: ACCESS.USER},
    {to: "/dashboard", label: "Dashboard", icon: "bi-speedometer2", area: AREA.MENU, access: ACCESS.PUBLIC},
    {to: "/newheatmap", label: "Heatmap", icon: "bi-thermometer-half", area: AREA.MENU, access: ACCESS.PUBLIC},
    {to: "/wijken", label: "Wijken", icon: "bi-geo-alt", area: AREA.MENU, access: ACCESS.PUBLIC},
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

// Desktop top bar: the visible primary items (guests do not see the ones that
// need an account), never more than TOP_BAR_MAX_ITEMS.
export function getTopBarItems(user, items = NAV_ITEMS) {
    return getVisibleNavItems(user, items)
        .filter((item) => item.area === AREA.PRIMARY)
        .slice(0, TOP_BAR_MAX_ITEMS);
}

// Mobile bottom bar: always four items. Guests keep the two account items; they
// lead to the login page through the protected routes, so the bar does not
// change shape when someone signs in.
export function getBottomBarItems(user, items = NAV_ITEMS) {
    const primary = items.filter((item) => item.area === AREA.PRIMARY);
    return [...primary, user ? PROFILE_ITEM : LOGIN_ITEM];
}

// Links in the profile menu (desktop) and on the profile page (mobile): the
// secondary pages the user may see, Beheer only for admins.
export function getProfileMenuItems(user, items = NAV_ITEMS) {
    return getVisibleNavItems(user, items).filter((item) => item.area === AREA.MENU);
}
