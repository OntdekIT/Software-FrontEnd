import PropTypes from 'prop-types';
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { parseMeasurement } from '../../utils/region-status.js';

// Compacte grafiek van het gemiddelde van de laatste 24 uur voor in het
// detailsheet. De volledige grafiek met min/max en fijnstof staat eronder.
export default function RegionMiniChart({ regionHistoryData, formatTimestamp }) {
    const points = regionHistoryData
        .map(m => ({ timestamp: m.timestamp, avg: parseMeasurement(m.avg) }))
        .filter(m => m.avg !== null);

    if (points.length === 0) return null;

    const values = points.map(p => p.avg);
    const summary = `Gemiddelde temperatuur laatste 24 uur: laagste ${Math.min(...values).toFixed(1)} graden, `
        + `hoogste ${Math.max(...values).toFixed(1)} graden.`;

    return (
        <figure className="region-mini-chart" aria-label={summary}>
            <figcaption className="region-mini-chart-caption">Laatste 24 uur (gemiddelde, °C)</figcaption>
            <ResponsiveContainer width="100%" height={96}>
                <LineChart data={points} margin={{ top: 4, right: 8, bottom: 0, left: 0 }}>
                    <XAxis dataKey="timestamp" tick={{ fontSize: 10 }} tickFormatter={formatTimestamp} minTickGap={48} />
                    <YAxis domain={['auto', 'auto']} width={28} tick={{ fontSize: 10 }} />
                    <Tooltip
                        labelFormatter={formatTimestamp}
                        formatter={(value) => [`${Number(value).toFixed(1)}°C`, 'Gemiddeld']}
                    />
                    <Line type="monotone" dataKey="avg" stroke="#111827" strokeWidth={2} dot={false} isAnimationActive={false} />
                </LineChart>
            </ResponsiveContainer>
        </figure>
    );
}

RegionMiniChart.propTypes = {
    regionHistoryData: PropTypes.array.isRequired,
    formatTimestamp: PropTypes.func.isRequired
};
