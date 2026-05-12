import PropTypes from 'prop-types';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from 'recharts';

export default function RegionChart({ regionHistoryData, dataView, setDataView, showMin, showMax, showGem, handleRegionLegendChange, formatTimestamp }) {
    return (
        <div className="region-chart">
            <div className="chart-toggle">
                <button
                    className={`toggle-btn ${dataView === 'temperature' ? 'active' : ''}`}
                    onClick={() => setDataView('temperature')}>
                    Temperatuur
                </button>
                <button
                    className={`toggle-btn ${dataView === 'pm' ? 'active' : ''}`}
                    onClick={() => setDataView('pm')}>
                    Fijnstof
                </button>
                <button
                    className={`toggle-btn ${dataView === 'both' ? 'active' : ''}`}
                    onClick={() => setDataView('both')}>
                    Beide
                </button>
            </div>
            <ResponsiveContainer width="100%" height={160}>
                <LineChart data={regionHistoryData}>
                    <XAxis
                        dataKey="timestamp"
                        tick={{ fontSize: 9 }}
                        tickFormatter={formatTimestamp}
                    />
                    <YAxis
                        yAxisId="temp"
                        width={dataView === 'pm' ? 0 : 28}
                        tick={{ fontSize: 9 }}
                        tickLine={dataView !== 'pm'}
                        axisLine={dataView !== 'pm'}
                    />
                    <YAxis
                        yAxisId="pm"
                        orientation="right"
                        width={dataView === 'temperature' ? 0 : 36}
                        tick={{ fontSize: 9 }}
                        tickLine={dataView !== 'temperature'}
                        axisLine={dataView !== 'temperature'}
                    />
                    <CartesianGrid stroke="#ccc" />
                    <Legend onClick={handleRegionLegendChange} wrapperStyle={{ fontSize: '11px' }} />

                    <Line yAxisId="temp" type="monotone" dataKey="min" name="Min temp" stroke="#0000ff" hide={showMin || dataView === 'pm'} dot={false} />
                    <Line yAxisId="temp" type="monotone" dataKey="max" name="Max temp" stroke="#ff0000" hide={showMax || dataView === 'pm'} dot={false} />
                    <Line yAxisId="temp" type="monotone" dataKey="avg" name="Gem temp" stroke="#00cc00" hide={showGem || dataView === 'pm'} dot={false} />
                    <Line yAxisId="pm" type="monotone" dataKey="pm25" name="PM2.5" stroke="#ff8800" hide={dataView === 'temperature'} dot={false} />
                    <Line yAxisId="pm" type="monotone" dataKey="pm10" name="PM10" stroke="#aa00ff" hide={dataView === 'temperature'} dot={false} />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}

RegionChart.propTypes = {
    regionHistoryData: PropTypes.array.isRequired,
    dataView: PropTypes.string.isRequired,
    setDataView: PropTypes.func.isRequired,
    showMin: PropTypes.bool.isRequired,
    showMax: PropTypes.bool.isRequired,
    showGem: PropTypes.bool.isRequired,
    handleRegionLegendChange: PropTypes.func.isRequired,
    formatTimestamp: PropTypes.func.isRequired
};