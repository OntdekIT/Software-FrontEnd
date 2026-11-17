// "bijgewerkt x geleden": een leesbare, korte tijdsafstand in het Nederlands.

const MINUTE = 60 * 1000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

/**
 * Tijdstip uit de backend als Date. De history-endpoints sturen UTC zonder
 * tijdzone-aanduiding ("2026-11-17T21:00:00"); `new Date()` leest dat als lokale
 * tijd en zou een uur (winter) of twee (zomer) ernaast zitten.
 * @returns {Date|null} null bij een leeg of ongeldig tijdstip
 */
export function parseBackendTimestamp(timestamp) {
    if (timestamp === null || timestamp === undefined || timestamp === '') return null;
    const text = typeof timestamp === 'string' && /T\d{2}:\d{2}(:\d{2}(\.\d+)?)?$/.test(timestamp)
        ? `${timestamp}Z`
        : timestamp;
    const date = new Date(text);
    return Number.isNaN(date.getTime()) ? null : date;
}

/**
 * @param timestamp tijdstip (ISO-string, Date of ms)
 * @param now       referentietijd in ms, voor testbaarheid
 * @returns {string|null} bijvoorbeeld "zojuist", "5 min geleden", "2 uur geleden"; null bij een ongeldig tijdstip
 */
export function formatTimeAgo(timestamp, now = Date.now()) {
    const date = parseBackendTimestamp(timestamp);
    if (!date) return null;

    const diff = Math.max(now - date.getTime(), 0);
    if (diff < MINUTE) return 'zojuist';
    if (diff < HOUR) return `${Math.floor(diff / MINUTE)} min geleden`;
    if (diff < DAY) return `${Math.floor(diff / HOUR)} uur geleden`;
    const days = Math.floor(diff / DAY);
    return days === 1 ? '1 dag geleden' : `${days} dagen geleden`;
}
