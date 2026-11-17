import test from 'node:test';
import assert from 'node:assert/strict';
import { LEGACY_REDIRECTS, fillPath, resolveLegacyPath } from './legacy-routes.js';

test('oude hoofdroutes sturen naar hun nieuwe pagina', () => {
    for (const path of ['/stations', '/kaart', '/newhome']) {
        assert.equal(resolveLegacyPath(path), '/', path);
    }
    assert.equal(resolveLegacyPath('/newheatmap'), '/heatmap');
});

test('/heatmap, /wijken en /dashboard zijn eigen pagina\'s en worden niet doorgestuurd', () => {
    for (const path of ['/heatmap', '/wijken', '/dashboard']) {
        assert.ok(!Object.hasOwn(LEGACY_REDIRECTS, path), path);
        assert.equal(resolveLegacyPath(path), null, path);
    }
});

test('de tabel bevat de blijvende routes uit de user story', () => {
    for (const path of ['/stations', '/kaart', '/newhome', '/newheatmap']) {
        assert.ok(Object.hasOwn(LEGACY_REDIRECTS, path), path);
    }
});

test('een oude wijkdetail-link wordt een /wijk/:id-link', () => {
    assert.equal(resolveLegacyPath('/wijken/12'), '/wijk/12');
});

test('afsluitende slash en hoofdletters worden genegeerd', () => {
    assert.equal(resolveLegacyPath('/Kaart/'), '/');
    assert.equal(resolveLegacyPath('/wijken/7/'), '/wijk/7');
});

test('stationdetails en andere routes worden niet doorgestuurd', () => {
    assert.equal(resolveLegacyPath('/stations/5'), null);
    assert.equal(resolveLegacyPath('/about'), null);
    assert.equal(resolveLegacyPath('/'), null);
    assert.equal(resolveLegacyPath('/wijk/3'), null);
});

test('fillPath codeert parameters', () => {
    assert.equal(fillPath('/wijk/:id', { id: 'a b' }), '/wijk/a%20b');
});
