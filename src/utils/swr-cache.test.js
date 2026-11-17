import test from 'node:test';
import assert from 'node:assert/strict';
import { createSwrCache, DEFAULT_TTL_MS } from './swr-cache.js';

function fakeStorage({ quota = Infinity, throwOnGet = false, throwOnSet = false } = {}) {
    const map = new Map();
    return {
        map,
        get length() { return map.size; },
        key: (i) => [...map.keys()][i] ?? null,
        getItem(k) {
            if (throwOnGet) throw new Error('blocked');
            return map.has(k) ? map.get(k) : null;
        },
        setItem(k, v) {
            if (throwOnSet) throw new Error('blocked');
            if (!map.has(k) && map.size >= quota) throw new Error('QuotaExceededError');
            map.set(k, v);
        },
        removeItem: (k) => { map.delete(k); },
    };
}

const T0 = 1_000_000;

test('schrijft en leest terug met het bewaarde moment', () => {
    const cache = createSwrCache({ storage: fakeStorage(), now: () => T0 });
    assert.equal(cache.write('/a', [{ id: 1 }]), true);
    const hit = cache.read('/a');
    assert.deepEqual(hit.data, [{ id: 1 }]);
    assert.equal(hit.savedAt, T0);
    assert.equal(hit.fromCache, true);
});

test('de ouderdom loopt mee met de klok', () => {
    let t = T0;
    const cache = createSwrCache({ storage: fakeStorage(), now: () => t });
    cache.write('/a', [1]);
    t = T0 + 5 * 60 * 1000;
    const hit = cache.read('/a');
    assert.equal(hit.ageMs, 5 * 60 * 1000);
    assert.equal(hit.savedAt, T0);
});

test('keys zijn per endpoint gescheiden', () => {
    const cache = createSwrCache({ storage: fakeStorage(), now: () => T0 });
    cache.write('/a', [1]);
    cache.write('/b', [2]);
    assert.deepEqual(cache.read('/a').data, [1]);
    assert.deepEqual(cache.read('/b').data, [2]);
    assert.equal(cache.read('/c'), null);
});

test('een entry ouder dan de TTL wordt niet getoond en opgeruimd', () => {
    let t = T0;
    const storage = fakeStorage();
    const cache = createSwrCache({ storage, now: () => t, ttlMs: 1000 });
    cache.write('/a', [1]);
    t = T0 + 1000;
    assert.notEqual(cache.read('/a'), null);
    t = T0 + 1001;
    assert.equal(cache.read('/a'), null);
    assert.equal(storage.map.size, 0);
});

test('een tijdstip in de toekomst wordt niet vertrouwd', () => {
    let t = T0;
    const cache = createSwrCache({ storage: fakeStorage(), now: () => t });
    cache.write('/a', [1]);
    t = T0 - 10;
    assert.equal(cache.read('/a'), null);
});

test('een andere versie telt als leeg', () => {
    const storage = fakeStorage();
    createSwrCache({ storage, now: () => T0, version: 1 }).write('/a', [1]);
    assert.equal(createSwrCache({ storage, now: () => T0, version: 2 }).read('/a'), null);
    assert.notEqual(createSwrCache({ storage, now: () => T0, version: 1 }).read('/a'), null);
});

test('kapotte JSON of een vreemde vorm geeft null en wordt opgeruimd', () => {
    const storage = fakeStorage();
    const cache = createSwrCache({ storage, now: () => T0 });
    storage.setItem('swr:v1:/a', '{niet json');
    assert.equal(cache.read('/a'), null);
    assert.equal(storage.map.size, 0);
    storage.setItem('swr:v1:/b', JSON.stringify({ v: 1, data: [1] }));
    assert.equal(cache.read('/b'), null);
});

test('zonder opslag of met opslag die gooit blijft alles veilig', () => {
    const none = createSwrCache({ storage: null });
    assert.equal(none.write('/a', [1]), false);
    assert.equal(none.read('/a'), null);
    none.remove('/a');

    const broken = createSwrCache({ storage: fakeStorage({ throwOnGet: true, throwOnSet: true }) });
    assert.equal(broken.write('/a', [1]), false);
    assert.equal(broken.read('/a'), null);
});

test('bij een volle opslag worden eigen entries opgeruimd en wordt opnieuw geprobeerd', () => {
    const storage = fakeStorage({ quota: 1 });
    const cache = createSwrCache({ storage, now: () => T0 });
    assert.equal(cache.write('/a', [1]), true);
    assert.equal(cache.write('/b', [2]), true);
    assert.equal(cache.read('/a'), null);
    assert.deepEqual(cache.read('/b').data, [2]);
});

test('een volle opslag die ook na opruimen weigert geeft false zonder fout', () => {
    const storage = fakeStorage({ quota: 0 });
    const cache = createSwrCache({ storage, now: () => T0 });
    assert.equal(cache.write('/a', [1]), false);
});

test('data die niet te serialiseren is wordt niet bewaard', () => {
    const cache = createSwrCache({ storage: fakeStorage(), now: () => T0 });
    const circular = {};
    circular.self = circular;
    assert.equal(cache.write('/a', circular), false);
    assert.equal(cache.write('/a', undefined), false);
});

test('de standaard TTL is een redelijke, eindige waarde', () => {
    assert.ok(DEFAULT_TTL_MS > 60 * 1000 && DEFAULT_TTL_MS <= 24 * 60 * 60 * 1000);
});
