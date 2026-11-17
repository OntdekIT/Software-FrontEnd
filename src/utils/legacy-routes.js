// Oude routes die naar de kaart (het hoofdscherm) doorsturen, zodat bestaande
// links, bladwijzers en de huidige navigatie blijven werken. Puur, zodat de
// tabel met `node --test` te controleren is.

export const KAART_PATH = '/';

// Statische doorverwijzingen: oud pad -> nieuw pad.
export const LEGACY_REDIRECTS = {
    '/heatmap': KAART_PATH,
    '/newheatmap': KAART_PATH,
    '/wijken': KAART_PATH,
    '/kaart': KAART_PATH,
    '/newhome': KAART_PATH,
    '/dashboard': KAART_PATH,
    '/stations': KAART_PATH,
};

// Doorverwijzingen met een parameter. `:id` wordt in het doelpad ingevuld.
export const LEGACY_PARAM_REDIRECTS = {
    '/wijken/:id': KAART_PATH,
};

/** Vult `:param`-plekken in een pad in. */
export function fillPath(pattern, params) {
    return pattern.replace(/:(\w+)/g, (_, name) => encodeURIComponent(params[name] ?? ''));
}

/**
 * Nieuw pad voor een oud pad, of null als het pad niet verouderd is.
 * Een afsluitende slash en hoofdletters in het oude pad maken niet uit.
 */
export function resolveLegacyPath(pathname) {
    const clean = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
    const lower = clean.toLowerCase();

    if (Object.hasOwn(LEGACY_REDIRECTS, lower)) return LEGACY_REDIRECTS[lower];

    for (const [pattern, target] of Object.entries(LEGACY_PARAM_REDIRECTS)) {
        const names = [];
        const regex = new RegExp(`^${pattern.replace(/:(\w+)/g, (_, name) => {
            names.push(name);
            return '([^/]+)';
        })}$`, 'i');
        const match = clean.match(regex);
        if (match) {
            const params = Object.fromEntries(names.map((name, i) => [name, decodeURIComponent(match[i + 1])]));
            return fillPath(target, params);
        }
    }
    return null;
}
