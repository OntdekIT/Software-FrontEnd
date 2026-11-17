import test from 'node:test';
import assert from 'node:assert/strict';
import { formatTimeAgo, parseBackendTimestamp } from './relative-time.js';

const NOW = Date.parse('2026-11-17T12:00:00Z');

test('formatTimeAgo kiest minuten, uren of dagen', () => {
    assert.equal(formatTimeAgo('2026-11-17T11:59:40Z', NOW), 'zojuist');
    assert.equal(formatTimeAgo('2026-11-17T11:55:00Z', NOW), '5 min geleden');
    assert.equal(formatTimeAgo('2026-11-17T09:30:00Z', NOW), '2 uur geleden');
    assert.equal(formatTimeAgo('2026-11-16T09:00:00Z', NOW), '1 dag geleden');
    assert.equal(formatTimeAgo('2026-11-14T09:00:00Z', NOW), '3 dagen geleden');
});

test('formatTimeAgo geeft null bij een ongeldig tijdstip en zojuist bij de toekomst', () => {
    assert.equal(formatTimeAgo('geen datum', NOW), null);
    assert.equal(formatTimeAgo(null, NOW), null);
    assert.equal(formatTimeAgo('2026-11-17T12:05:00Z', NOW), 'zojuist');
});

test('een tijdstip zonder tijdzone wordt als UTC gelezen', () => {
    assert.equal(parseBackendTimestamp('2026-11-17T11:00:00').toISOString(), '2026-11-17T11:00:00.000Z');
    assert.equal(formatTimeAgo('2026-11-17T11:30:00', NOW), '30 min geleden');
    // met tijdzone blijft het zoals het is
    assert.equal(parseBackendTimestamp('2026-11-17T12:00:00+01:00').toISOString(), '2026-11-17T11:00:00.000Z');
    assert.equal(parseBackendTimestamp(''), null);
});
