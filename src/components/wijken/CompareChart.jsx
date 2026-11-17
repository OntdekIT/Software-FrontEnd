import PropTypes from 'prop-types';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { COMPARE_COLORS } from './compare-colors.js';
import { formatFrameTime } from '../../utils/timeline.js';

const CITY_COLOR = '#6b7280';

// Lijngrafiek van de gekozen wijken over 24 uur met het stadsgemiddelde als stippellijn.
export default function CompareChart({ data, selected, unit, decimals = 1 }) {
    const fmt = v => (typeof v === 'number' ? `${v.toFixed(decimals)} ${unit}` : 'Geen meting');
    return (
        <div className="h-72 w-full" data-testid="compare-chart">
            <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data} margin={{ top: 8, right: 12, bottom: 4, left: 0 }}>
                    <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" tickFormatter={t => formatFrameTime(t)} tick={{ fontSize: 12 }}
                        minTickGap={32} stroke="#4b5563" />
                    <YAxis tick={{ fontSize: 12 }} stroke="#4b5563" width={40} domain={['auto', 'auto']}
                        tickFormatter={v => v.toFixed(decimals === 0 ? 0 : 1)} />
                    <Tooltip labelFormatter={t => formatFrameTime(t)} formatter={fmt} />
                    <Legend />
                    <Line type="monotone" dataKey="city" name="Stadsgemiddelde" stroke={CITY_COLOR}
                        strokeDasharray="6 4" strokeWidth={2} dot={false} connectNulls />
                    {selected.map((region, i) => (
                        <Line key={region.id} type="monotone" dataKey={`r${region.id}`} name={region.name}
                            stroke={COMPARE_COLORS[i % COMPARE_COLORS.length]} strokeWidth={2.5}
                            dot={{ r: 2 }} activeDot={{ r: 4 }} />
                    ))}
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

CompareChart.propTypes = {
    data: PropTypes.array.isRequired,
    selected: PropTypes.array.isRequired,
    unit: PropTypes.string.isRequired,
    decimals: PropTypes.number,
};
