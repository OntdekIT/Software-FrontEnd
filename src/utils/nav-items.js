// Navigation items of the main navbar, plus the rules for who sees what and
// which one is the current page. Pure so it can be unit tested.

export const ACCESS = {
    PUBLIC: "public",
    USER: "user",
    ADMIN: "admin",
};

const ADMIN_ROLES = ["ADMIN", "SUPER_ADMIN"];

export const NAV_ITEMS = [
    {to: "/", label: "Dashboard", icon: "bi-speedometer2", access: ACCESS.PUBLIC, end: true, aliases: ["/dashboard"]},
    {to: "/kaart", label: "Kaart", icon: "bi-geo", access: ACCESS.PUBLIC, aliases: ["/newhome"]},
    {to: "/newheatmap", label: "Heatmap", icon: "bi-map", access: ACCESS.PUBLIC},
    {to: "/wijken", label: "Wijken", icon: "bi-geo-alt", access: ACCESS.PUBLIC},
    {to: "/about", label: "Over ons", icon: "bi-info-circle", access: ACCESS.PUBLIC},
    {to: "/my/stations", label: "Mijn stations", icon: "bi-broadcast", access: ACCESS.USER},
    {to: "/admin", label: "Beheer", icon: "bi-gear", access: ACCESS.ADMIN},
];

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
