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
                        width={28}
                        tick={{ fontSize: 9 }}
                        hide={dataView === 'pm'}
                    />
                    <YAxis
                        yAxisId="pm"
                        orientation="right"
                        width={36}
                        tick={{ fontSize: 9 }}
                        hide={dataView === 'temperature'}
                    />
                    <CartesianGrid stroke="#ccc" />
                    <Legend onClick={handleRegionLegendChange} wrapperStyle={{ fontSize: '11px' }} />

                    {(dataView === 'temperature' || dataView === 'both') && (<>
                        <Line yAxisId="temp" type="monotone" dataKey="min" name="Min temp" stroke="#0000ff" hide={showMin} dot={false} />
                        <Line yAxisId="temp" type="monotone" dataKey="max" name="Max temp" stroke="#ff0000" hide={showMax} dot={false} />
                        <Line yAxisId="temp" type="monotone" dataKey="avg" name="Gem temp" stroke="#00cc00" hide={showGem} dot={false} />
                    </>)}

                    {(dataView === 'pm' || dataView === 'both') && (<>
                        <Line yAxisId="pm" type="monotone" dataKey="pm25" name="PM2.5" stroke="#ff8800" dot={false} />
                        <Line yAxisId="pm" type="monotone" dataKey="pm10" name="PM10" stroke="#aa00ff" dot={false} />
                    </>)}
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