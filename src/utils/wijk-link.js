// Deelbare link naar een wijk op de kaart: /wijk/:id.

/** Pad van een wijk. */
export function wijkPath(id) {
    return `/wijk/${encodeURIComponent(id)}`;
}

/** Volledige, deelbare URL van een wijk. */
export function buildShareUrl(origin, id) {
    return `${origin.replace(/\/+$/, '')}${wijkPath(id)}`;
}

/** Wijk-id uit de route als positief geheel getal, anders null. */
export function parseWijkId(param) {
    if (typeof param !== 'string' || !/^\d+$/.test(param)) return null;
    const n = Number(param);
    return Number.isSafeInteger(n) && n > 0 ? n : null;
}
