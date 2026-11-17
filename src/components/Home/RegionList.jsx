import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Skeleton } from '../ui/Skeleton.jsx';
import { NO_RECENT_DATA_LABEL } from '../../utils/region-status.js';

export default function RegionList({
    regionData,
    parseTemp,
    onRegionClick,
    selectedId = null,
    loading = false
}) {
    const itemRefs = useRef(new Map());

    // Een klik op de kaart selecteert een wijk die buiten beeld kan staan.
    useEffect(() => {
        if (selectedId === null) return;
        itemRefs.current.get(selectedId)?.scrollIntoView({ block: 'nearest' });
    }, [selectedId]);

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
                <button
                    type="button"
                    className={`wijken-list-item${region.id === selectedId ? ' is-selected' : ''}`}
                    key={region.id || idx}
                    ref={(el) => {
                        if (el) itemRefs.current.set(region.id, el);
                        else itemRefs.current.delete(region.id);
                    }}
                    aria-pressed={region.id === selectedId}
                    onClick={() => onRegionClick(region)}
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
                </button>
            ))}
        </div>
    );
}

RegionList.propTypes = {
    regionData: PropTypes.array.isRequired,
    parseTemp: PropTypes.func.isRequired,
    onRegionClick: PropTypes.func.isRequired,
    selectedId: PropTypes.number,
    loading: PropTypes.bool
};