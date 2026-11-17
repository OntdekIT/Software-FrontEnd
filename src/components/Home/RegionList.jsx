import PropTypes from 'prop-types';
import { Skeleton } from '../ui/Skeleton.jsx';
import { NO_RECENT_DATA_LABEL } from '../../utils/region-status.js';

export default function RegionList({
    regionData,
    zoomToRegion,
    parseTemp,
    onRegionClick,
    loading = false
}) {
    if (loading) {
        return (
            <div className="wijken-list" aria-busy="true" aria-label="Wijken laden">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div className="wijken-list-item" key={i}>
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-12" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="wijken-list">
            {regionData.map((region, idx) => (
                <div
                    className="wijken-list-item"
                    key={region.id || idx}
                    onClick={() => {
                        zoomToRegion(region);
                        onRegionClick(region);
                    }}
                    style={{ cursor: 'pointer' }}
                >
                    <span className="wijken-list-name">
                        {region.name}
                    </span>
                    {parseTemp(region.avgTemp) !== null ? (
                        <span className="wijken-list-temp">
                            {`${parseTemp(region.avgTemp).toFixed(1)}°C`}
                        </span>
                    ) : (
                        <span className="wijken-list-nodata">
                            <i className="bi bi-clock-history" aria-hidden="true"></i>
                            {NO_RECENT_DATA_LABEL}
                        </span>
                    )}
                </div>
            ))}
        </div>
    );
}

RegionList.propTypes = {
    regionData: PropTypes.array.isRequired,
    zoomToRegion: PropTypes.func.isRequired,
    parseTemp: PropTypes.func.isRequired,
    onRegionClick: PropTypes.func.isRequired,
    loading: PropTypes.bool
};