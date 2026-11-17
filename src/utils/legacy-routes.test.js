import test from 'node:test';
import assert from 'node:assert/strict';
import { LEGACY_REDIRECTS, fillPath, resolveLegacyPath } from './legacy-routes.js';

test('alle oude hoofdroutes sturen naar de kaart', () => {
    for (const path of ['/heatmap', '/wijken', '/stations', '/kaart', '/newhome', '/dashboard', '/newheatmap']) {
        assert.equal(resolveLegacyPath(path), '/', path);
    }
});

test('de tabel bevat alle routes uit de user story', () => {
    for (const path of ['/heatmap', '/wijken', '/stations', '/kaart']) {
        assert.ok(Object.hasOwn(LEGACY_REDIRECTS, path), path);
    }
});

test('een oude wijkdetail-link stuurt ook naar de kaart', () => {
    assert.equal(resolveLegacyPath('/wijken/12'), '/');
});

test('afsluitende slash en hoofdletters worden genegeerd', () => {
    assert.equal(resolveLegacyPath('/Wijken/'), '/');
    assert.equal(resolveLegacyPath('/wijken/7/'), '/');
});

test('stationdetails en andere routes worden niet doorgestuurd', () => {
    assert.equal(resolveLegacyPath('/stations/5'), null);
    assert.equal(resolveLegacyPath('/about'), null);
    assert.equal(resolveLegacyPath('/'), null);
});

test('fillPath codeert parameters', () => {
    assert.equal(fillPath('/wijk/:id', { id: 'a b' }), '/wijk/a%20b');
});
