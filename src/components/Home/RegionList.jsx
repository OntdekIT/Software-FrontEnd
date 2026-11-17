import { useEffect, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Skeleton } from '../ui/Skeleton.jsx';
import { NO_DATA_COLOR, colorFor, computeValueRange } from '../../utils/color-scale.js';
import { METRICS, METRIC_IDS, formatMetricParts } from '../../utils/map-metrics.js';
import { regionSubline } from '../../utils/region-list.js';
import { DEFAULT_SORT_MODE, sortOptions, sortRegions } from '../../utils/region-sort.js';

const MINUTE_MS = 60 * 1000;

// Wijkenlijst in het zijpaneel: per rij een kleurchip met de kaartkleur voor de
// gekozen laag, de naam met een kleine regel eronder en rechts de waarde.
export default function RegionList({
    regionData,
    metric = 'temperature',
    onRegionClick,
    selectedId = null,
    loading = false,
    colorRange = null,
    updatedAt = null,
    viewedTime = null,
    filtered = false,
}) {
    const itemRefs = useRef(new Map());
    const [sortMode, setSortMode] = useState(DEFAULT_SORT_MODE);
    // "x min geleden" blijft kloppen terwijl de pagina openstaat.
    const [now, setNow] = useState(() => Date.now());

    useEffect(() => {
        const timer = setInterval(() => setNow(Date.now()), MINUTE_MS);
        return () => clearInterval(timer);
    }, []);

    const { key, palette } = METRICS[metric];
    const sorted = useMemo(() => sortRegions(regionData, sortMode, key), [regionData, sortMode, key]);
    // Zelfde schaal als de kaart, zodat een chip dezelfde kleur heeft als de wijk op de kaart.
    const range = useMemo(
        () => colorRange ?? computeValueRange(regionData, key),
        [colorRange, regionData, key]
    );

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
                        <Skeleton className="h-8 w-8 rounded-lg" />
                        <span className="wijken-list-text">
                            <Skeleton className="h-4 w-1/2" />
                            <Skeleton className="h-3 w-1/3" />
                        </span>
                        <Skeleton className="h-6 w-14" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="wijken-list-wrap">
            <div className="wijken-sort" role="group" aria-label="Sorteren">
                {sortOptions(metric).map(option => (
                    <button
                        type="button"
                        key={option.mode}
                        className={`wijken-sort-btn${option.mode === sortMode ? ' is-active' : ''}`}
                        aria-pressed={option.mode === sortMode}
                        onClick={() => setSortMode(option.mode)}
                    >
                        {option.label}
                    </button>
                ))}
            </div>

            {sorted.length === 0 && filtered && (
                <p className="wijken-empty" role="status">Geen wijken gevonden voor deze zoekterm.</p>
            )}

            <div className="wijken-list">
                {sorted.map((region, idx) => {
                    const parts = formatMetricParts(metric, region[key]);
                    const selected = region.id === selectedId;
                    const chipColor = parts ? colorFor(parseFloat(region[key]), range, palette) : NO_DATA_COLOR;
                    return (
                        <button
                            type="button"
                            className={`wijken-list-item${selected ? ' is-selected' : ''}`}
                            key={region.id || idx}
                            ref={(el) => {
                                if (el) itemRefs.current.set(region.id, el);
                                else itemRefs.current.delete(region.id);
                            }}
                            aria-pressed={selected}
                            onClick={() => onRegionClick(region)}
                        >
                            <span
                                className={`wijken-list-chip${parts ? '' : ' is-empty'}`}
                                style={parts ? { backgroundColor: chipColor } : undefined}
                                aria-hidden="true"
                            ></span>
                            <span className="wijken-list-text">
                                <span className="wijken-list-name">{region.name}</span>
                                <span className="wijken-list-sub">
                                    {regionSubline({ hasData: parts !== null, viewedTime, updatedAt, now })}
                                </span>
                            </span>
                            {parts && (
                                <span className="wijken-list-value">
                                    <span className="wijken-list-number">{parts.number}</span>
                                    <span className="wijken-list-unit">{parts.unit}</span>
                                </span>
                            )}
                        </button>
                    );
                })}
            </div>
        </div>
    );
}

RegionList.propTypes = {
    regionData: PropTypes.array.isRequired,
    metric: PropTypes.oneOf(METRIC_IDS),
    onRegionClick: PropTypes.func.isRequired,
    selectedId: PropTypes.number,
    loading: PropTypes.bool,
    colorRange: PropTypes.shape({ min: PropTypes.number, max: PropTypes.number }),
    updatedAt: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
    viewedTime: PropTypes.string,
    filtered: PropTypes.bool,
};
