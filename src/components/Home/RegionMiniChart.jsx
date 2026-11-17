import PropTypes from 'prop-types';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { parseMeasurement } from '../../utils/region-status.js';
import { METRICS, METRIC_IDS } from '../../utils/map-metrics.js';

// Compacte grafiek van het gemiddelde van de laatste 24 uur voor in het
// detailsheet. De volledige grafiek met min/max en fijnstof staat eronder.
export default function RegionMiniChart({ regionHistoryData, formatTimestamp, metric = 'temperature' }) {
    const { label, unit, historyKey } = METRICS[metric];
    const points = regionHistoryData
        .map(m => ({ timestamp: m.timestamp, value: parseMeasurement(m[historyKey]) }))
        .filter(m => m.value !== null);

    if (points.length === 0) return null;

    const values = points.map(p => p.value);
    const summary = `${label} laatste 24 uur: laagste ${Math.min(...values).toFixed(1)} ${unit}, `
        + `hoogste ${Math.max(...values).toFixed(1)} ${unit}.`;

    return (
        <figure className="region-mini-chart" aria-label={summary}>
            <figcaption className="region-mini-chart-caption">Laatste 24 uur ({label}, {unit})</figcaption>
            <ResponsiveContainer width="100%" height={96}>
                <LineChart data={points} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} tickFormatter={formatTimestamp} minTickGap={48} />
                    <YAxis domain={['auto', 'auto']} width={28} tick={{ fontSize: 10 }} />
                    <Tooltip
                        labelFormatter={formatTimestamp}
                        formatter={(value) => [`${Number(value).toFixed(1)} ${unit}`, label]}
                    />
                    <Line type="monotone" dataKey="value" stroke="#111827" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </figure>
    );
}

RegionMiniChart.propTypes = {
    regionHistoryData: PropTypes.array.isRequired,
    formatTimestamp: PropTypes.func.isRequired,
    metric: PropTypes.oneOf(METRIC_IDS)
};
