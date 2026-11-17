import test from 'node:test';
import assert from 'node:assert/strict';
import { regionSubline } from './region-list.js';

const now = Date.parse('2026-11-17T12:00:00Z');

test('zonder meting staat er Geen recente data', () => {
    assert.equal(regionSubline({ hasData: false, updatedAt: now - 1000, now }), 'Geen recente data');
});

test('live toont hoe lang geleden de gegevens zijn opgehaald', () => {
    assert.equal(regionSubline({ hasData: true, updatedAt: now - 12 * 60 * 1000, now }), 'Bijgewerkt 12 min geleden');
    assert.equal(regionSubline({ hasData: true, updatedAt: now - 5000, now }), 'Bijgewerkt zojuist');
});

test('bij terugkijken staat het tijdstip van het frame', () => {
    assert.equal(regionSubline({ hasData: true, viewedTime: 'ma 14:00', updatedAt: now, now }), 'Stand van ma 14:00');
});

test('zonder bekend tijdstip valt de tekst terug op een neutrale regel', () => {
    assert.equal(regionSubline({ hasData: true, updatedAt: null, now }), 'Gemeten waarde');
});
