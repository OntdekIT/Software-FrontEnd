// Stale-while-revalidate cache in sessionStorage voor de trage "laatste stand"
// endpoints (wijken en stations). Een pagina toont het bewaarde antwoord meteen
// en ververst op de achtergrond. Het bewaarde moment (`savedAt`) blijft bij het
// antwoord, zodat een tekst als "Bijgewerkt 3 min geleden" eerlijk blijft.
//
// Alles hier is veilig als opslag ontbreekt, vol zit of een fout gooit: dan
// gedraagt het zich als een lege cache en werkt de pagina gewoon met het netwerk.

export const WIJKEN_ENDPOINT = '/neighbourhood/history';
export const STATIONS_ENDPOINT = '/Meetstation/stationsMetMeasurements';

// Verhoog bij een wijziging in de vorm van de bewaarde data: oude entries worden dan genegeerd.
export const CACHE_VERSION = 1;
export const DEFAULT_TTL_MS = 30 * 60 * 1000;
const PREFIX = 'swr';

/**
 * @param storage  Storage-achtig object ({getItem, setItem, removeItem, key, length}) of null
 * @param now      functie die de huidige tijd in ms geeft, voor testbaarheid
 * @param ttlMs    ouder dan dit wordt niet getoond en wordt opgeruimd
 * @param version  cacheversie; een andere versie telt als leeg
 */
export function createSwrCache({ storage = null, now = Date.now, ttlMs = DEFAULT_TTL_MS, version = CACHE_VERSION } = {}) {
    const keyFor = (endpoint) => `${PREFIX}:v${version}:${endpoint}`;

    function removeOwnEntries() {
        try {
            const keys = [];
            for (let i = 0; i < storage.length; i += 1) {
                const name = storage.key(i);
                if (name && name.startsWith(`${PREFIX}:`)) keys.push(name);
            }
            keys.forEach((name) => storage.removeItem(name));
        } catch {
            // Opruimen is best effort.
        }
    }

    function remove(endpoint) {
        if (!storage) return;
        try {
            storage.removeItem(keyFor(endpoint));
        } catch {
            // Niets aan te doen, de entry blijft hooguit staan tot de TTL.
        }
    }

    /** @returns {{data: *, savedAt: number, ageMs: number, fromCache: true} | null} */
    function read(endpoint) {
        if (!storage) return null;
        try {
            const raw = storage.getItem(keyFor(endpoint));
            if (raw === null || raw === undefined) return null;
            const entry = JSON.parse(raw);
            const valid = entry && entry.v === version && Number.isFinite(entry.savedAt) && 'data' in entry;
            if (!valid) {
                remove(endpoint);
                return null;
            }
            const ageMs = now() - entry.savedAt;
            // Een tijdstip in de toekomst (klok verzet) is onbetrouwbaar: niet tonen.
            if (ageMs < 0 || ageMs > ttlMs) {
                remove(endpoint);
                return null;
            }
            return { data: entry.data, savedAt: entry.savedAt, ageMs, fromCache: true };
        } catch {
            remove(endpoint);
            return null;
        }
    }

    /** @returns {boolean} of het bewaren gelukt is */
    function write(endpoint, data) {
        if (!storage || data === undefined) return false;
        let payload;
        try {
            payload = JSON.stringify({ v: version, savedAt: now(), data });
        } catch {
            return false;
        }
        try {
            storage.setItem(keyFor(endpoint), payload);
            return true;
        } catch {
            // Vol: ruim onze eigen entries op en probeer een keer opnieuw.
            removeOwnEntries();
            try {
                storage.setItem(keyFor(endpoint), payload);
                return true;
            } catch {
                return false;
            }
        }
    }

    return { read, write, remove };
}

// Toegang tot sessionStorage kan zelf een fout gooien (geblokkeerde site data).
function defaultStorage() {
    try {
        return typeof sessionStorage === 'undefined' ? null : sessionStorage;
    } catch {
        return null;
    }
}

let defaultCache = null;
function getDefaultCache() {
    if (!defaultCache) defaultCache = createSwrCache({ storage: defaultStorage() });
    return defaultCache;
}

/** Bewaarde stand van een endpoint, of null. */
export function peekCached(endpoint) {
    return getDefaultCache().read(endpoint);
}

/** Bewaart een antwoord (alleen een lijst) en geeft het ongewijzigd terug. */
export function rememberCached(endpoint, data) {
    if (Array.isArray(data)) getDefaultCache().write(endpoint, data);
    return data;
}

/**
 * Toont eerst de bewaarde stand (via `onCached`) en haalt daarna vers op.
 * `fetcher` geeft een promise met de lijst; het verse antwoord wordt bewaard en teruggegeven.
 * `onCached` krijgt {data, savedAt, ageMs, fromCache: true}.
 */
export function swrRequest(endpoint, fetcher, onCached) {
    const cached = peekCached(endpoint);
    if (cached && onCached) onCached(cached);
    return fetcher().then((data) => rememberCached(endpoint, data));
}
