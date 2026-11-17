// The tabs of the Beheer screen and how they map to routes. Pure so it can be
// unit tested. The old routes (/admin/users and so on) stay valid: they open
// the matching tab, and sub pages (a user, adding a station) keep it active.

export const ADMIN_TABS = [
    {key: "overzicht", label: "Overzicht", icon: "bi-speedometer2", to: "/admin", end: true, aliases: ["/admin/data-coverage"]},
    {key: "gebruikers", label: "Gebruikers", icon: "bi-person", to: "/admin/users"},
    {key: "stations", label: "Stations", icon: "bi-broadcast", to: "/admin/stations"},
    {key: "workshopcodes", label: "Workshopcodes", icon: "bi-123", to: "/admin/workshop-codes"},
];

function matches(path, pathname, end) {
    if (pathname === path) return true;
    return !end && pathname.startsWith(`${path}/`);
}

// The tab for a pathname, or null outside Beheer.
export function getActiveAdminTab(pathname, tabs = ADMIN_TABS) {
    const normalized = pathname.length > 1 ? pathname.replace(/\/+$/, "") : pathname;
    return tabs.find((tab) => [tab.to, ...(tab.aliases ?? [])].some((path) => matches(path, normalized, tab.end === true))) ?? null;
}

// The route that opens a tab, or null for an unknown key.
export function getAdminTabRoute(key, tabs = ADMIN_TABS) {
    return tabs.find((tab) => tab.key === key)?.to ?? null;
}
