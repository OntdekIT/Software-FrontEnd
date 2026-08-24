import PropTypes from 'prop-types';

export default function RegionList({ regionData, zoomToRegion, parseTemp }) {
    return (
       <div className="wijken-list">
            <input type="text" placeholder="test" />

            {regionData.map((region, idx) => (
                <div
                    className="wijken-list-item"
                    key={region.id || idx}
                    onClick={() => zoomToRegion(region)}
                    style={{ cursor: 'pointer' }}
                >
                    <span className="wijken-list-name">{region.name}</span>
                    <span className="wijken-list-temp">
                        {parseTemp(region.avgTemp) !== null
                            ? `${parseTemp(region.avgTemp).toFixed(1)}°C`
                            : '--'}
                    </span>
                </div>
            ))}
        </div>
    );  
}

RegionList.propTypes = {
    regionData: PropTypes.array.isRequired,
    zoomToRegion: PropTypes.func.isRequired,
    parseTemp: PropTypes.func.isRequired
};