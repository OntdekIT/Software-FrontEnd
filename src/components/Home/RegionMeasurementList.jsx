import PropTypes from 'prop-types';

export default function RegionMeasurementList({ regionHistoryData, dataView, formatTimestamp }) {
    return (
        <div className="region-measurements-list">
            <p className="region-measurements-label">Laatste metingen</p>
            {regionHistoryData.slice(-8).reverse().map((m, i) => (
                <div key={i} className="region-measurement-item">
                    <span className="rm-time">
                        {m.timestamp ? formatTimestamp(m.timestamp) : '--'}
                    </span>
                    <div className="rm-stats">
                        {(dataView === 'temperature' || dataView === 'both') && (<>
                            <span className="rm-val rm-min" title="Minimum">
                                <span className="rm-label">Min</span>
                                {m.min != null ? `${parseFloat(m.min).toFixed(1)}°` : '--'}
                            </span>
                            <span className="rm-val rm-avg" title="Gemiddeld">
                                <span className="rm-label">Gem</span>
                                {m.avg != null ? `${parseFloat(m.avg).toFixed(1)}°` : '--'}
                            </span>
                            <span className="rm-val rm-max" title="Maximum">
                                <span className="rm-label">Max</span>
                                {m.max != null ? `${parseFloat(m.max).toFixed(1)}°` : '--'}
                            </span>
                        </>)}
                        {(dataView === 'pm' || dataView === 'both') && (<>
                            <span className="rm-val rm-pm25" title="PM2.5">
                                <span className="rm-label">PM2.5</span>
                                {m.pm25 != null ? `${parseFloat(m.pm25).toFixed(1)}` : '--'}
                            </span>
                            <span className="rm-val rm-pm10" title="PM10">
                                <span className="rm-label">PM10</span>
                                {m.pm10 != null ? `${parseFloat(m.pm10).toFixed(1)}` : '--'}
                            </span>
                        </>)}
                    </div>
                </div>
            ))}
        </div>
    );
}

RegionMeasurementList.propTypes = {
    regionHistoryData: PropTypes.array.isRequired,
    dataView: PropTypes.string.isRequired,
    formatTimestamp: PropTypes.func.isRequired
};