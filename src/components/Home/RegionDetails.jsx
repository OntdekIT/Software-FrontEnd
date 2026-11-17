import PropTypes from 'prop-types';
import RegionChart from './RegionChart.jsx';
import RegionMiniChart from './RegionMiniChart.jsx';
import RegionMeasurementList from './RegionMeasurementList.jsx';
import { useState } from 'react';
import { Skeleton } from '../ui/Skeleton.jsx';
import { NO_RECENT_DATA_LABEL, lastMeasurementTimestamp } from '../../utils/region-status.js';
import { METRICS, METRIC_IDS, formatMetricValue } from '../../utils/map-metrics.js';

function formatTimestamp(ts) {
    const date = new Date(ts);
    return isNaN(date) ? ts : date.toLocaleString('nl-NL', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    });
}

const CLOSE_BUTTON = 'inline-flex shrink-0 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900';

// Detail van een wijk in het zijpaneel of de bottom sheet: huidige waarde,
// grafiek van de laatste 24 uur en de uitklapbare volledige grafiek.
export default function RegionDetails({ region, onClose, loading, history, metric = 'temperature' }) {
    const [dataView, setDataView] = useState('temperature');
    const [showMin, setShowMin] = useState(false);
    const [showMax, setShowMax] = useState(false);
    const [showGem, setShowGem] = useState(false);

    const handleLegendChange = (e) => {
        if (e.dataKey === 'min') setShowMin(prev => !prev);
        if (e.dataKey === 'max') setShowMax(prev => !prev);
        if (e.dataKey === 'avg') setShowGem(prev => !prev);
    };

    const metricConfig = METRICS[metric];
    const currentValue = formatMetricValue(metric, region[metricConfig.key]);
    const lastMeasurement = lastMeasurementTimestamp(history, metricConfig.historyKey);

    return (
        <section className="region-sheet flex flex-col gap-3" aria-label={`Details van ${region.name}`}>
            <div className="flex items-start justify-between gap-2">
                <h2 className="m-0 text-lg font-bold text-gray-900">{region.name}</h2>
                <button type="button" onClick={onClose} aria-label="Sluit details" className={CLOSE_BUTTON}>
                    <i className="bi bi-x-lg" aria-hidden="true"></i> Sluiten
                </button>
            </div>

            {currentValue !== null ? (
                <p className="m-0 text-sm text-gray-700">
                    {metricConfig.nowLabel}: <strong className="text-lg text-gray-900">{currentValue}</strong>
                </p>
            ) : (
                <p className="m-0 flex flex-wrap items-center gap-x-3 text-sm font-medium text-gray-700">
                    <span className="inline-flex items-center gap-1.5">
                        <i className="bi bi-clock-history" aria-hidden="true"></i>
                        {NO_RECENT_DATA_LABEL}
                    </span>
                    {!loading && (
                        <span className="font-normal">
                            {lastMeasurement
                                ? `Laatste meting: ${formatTimestamp(lastMeasurement)}`
                                : 'Geen meting in de afgelopen 24 uur.'}
                        </span>
                    )}
                </p>
            )}

            {loading ? (
                <div aria-busy="true" aria-label="Historische data ophalen">
                    <Skeleton className="h-32 w-full" rounded="rounded-xl" />
                </div>
            ) : history.length > 0 ? (
                <>
                    <RegionMiniChart regionHistoryData={history} formatTimestamp={formatTimestamp} metric={metric} />
                    <details className="region-more">
                        <summary>Alle metingen en grafiek</summary>
                        <div className="region-data-layout">
                            <RegionChart
                                regionHistoryData={history}
                                dataView={dataView}
                                setDataView={setDataView}
                                showMin={showMin}
                                showMax={showMax}
                                showGem={showGem}
                                handleRegionLegendChange={handleLegendChange}
                                formatTimestamp={formatTimestamp}
                            />
                            <RegionMeasurementList
                                regionHistoryData={history}
                                dataView={dataView}
                                formatTimestamp={formatTimestamp}
                            />
                        </div>
                    </details>
                </>
            ) : (
                <p className="m-0 text-sm text-gray-700">Geen historische data beschikbaar.</p>
            )}
        </section>
    );
}

RegionDetails.propTypes = {
    region: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    history: PropTypes.array.isRequired,
    metric: PropTypes.oneOf(METRIC_IDS),
};
