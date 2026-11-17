import { NO_RECENT_DATA_LABEL } from './region-status.js';
import { formatTimeAgo } from './relative-time.js';

/**
 * Kleine tweede regel onder de wijknaam in de lijst.
 * @param hasData    heeft de wijk een echte meetwaarde?
 * @param viewedTime bij het terugkijken op de tijdlijn het tijdstip van het frame ("14:00"), anders null
 * @param updatedAt  moment waarop de livegegevens zijn opgehaald
 * @param now        referentietijd in ms, voor testbaarheid
 */
export function regionSubline({ hasData, viewedTime = null, updatedAt = null, now = Date.now() }) {
    if (!hasData) return NO_RECENT_DATA_LABEL;
    if (viewedTime) return `Stand van ${viewedTime}`;
    const ago = formatTimeAgo(updatedAt, now);
    return ago ? `Bijgewerkt ${ago}` : 'Gemeten waarde';
}
