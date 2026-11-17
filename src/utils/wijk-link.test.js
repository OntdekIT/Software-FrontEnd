import test from 'node:test';
import assert from 'node:assert/strict';
import { buildShareUrl, parseWijkId, wijkPath } from './wijk-link.js';

test('wijkPath en buildShareUrl geven de deelbare link', () => {
    assert.equal(wijkPath(12), '/wijk/12');
    assert.equal(buildShareUrl('https://ontdekstation.nl', 12), 'https://ontdekstation.nl/wijk/12');
});

test('buildShareUrl verdubbelt een slash aan het eind van de origin niet', () => {
    assert.equal(buildShareUrl('https://x.nl/', 3), 'https://x.nl/wijk/3');
});

test('parseWijkId accepteert alleen positieve gehele getallen', () => {
    assert.equal(parseWijkId('42'), 42);
    for (const bad of ['0', '-1', '1.5', 'abc', '', undefined, null, '12abc']) {
        assert.equal(parseWijkId(bad), null, String(bad));
    }
});
