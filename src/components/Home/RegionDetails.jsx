import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import RegionChart from './RegionChart.jsx';
import RegionMiniChart from './RegionMiniChart.jsx';
import RegionMeasurementList from './RegionMeasurementList.jsx';
import { Skeleton } from '../ui/Skeleton.jsx';
import { NO_RECENT_DATA_LABEL, lastMeasurementTimestamp } from '../../utils/region-status.js';
import { METRICS, METRIC_IDS, formatMetricValue } from '../../utils/map-metrics.js';
import { formatTimeAgo, parseBackendTimestamp } from '../../utils/relative-time.js';

// De history-endpoints sturen UTC zonder tijdzone; parseBackendTimestamp leest dat goed.
function formatTimestamp(ts) {
    const date = parseBackendTimestamp(ts);
    return date ? date.toLocaleString('nl-NL', {
        month: 'short', day: 'numeric',
        hour: '2-digit', minute: '2-digit'
    }) : ts;
}

const ACTION_BUTTON = 'inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-900 hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:cursor-not-allowed disabled:text-gray-600 disabled:hover:bg-white';

// Eén kerngetal (temperatuur of PM2.5) als grote tegel.
function KeyNumber({ metricId, region }) {
    const { label, key } = METRICS[metricId];
    const value = formatMetricValue(metricId, region[key]);
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-3">
            <div className="text-xs font-medium text-gray-700">{label}</div>
            {value !== null ? (
                <div className="mt-1 text-2xl font-bold text-gray-900">{value}</div>
            ) : (
                <div className="mt-1 flex items-center gap-1.5 text-sm font-medium text-gray-700">
                    <i className="bi bi-clock-history" aria-hidden="true"></i>
                    {NO_RECENT_DATA_LABEL}
                </div>
            )}
        </div>
    );
}

KeyNumber.propTypes = {
    metricId: PropTypes.oneOf(METRIC_IDS).isRequired,
    region: PropTypes.object.isRequired,
};

// Detailsheet van een wijk: twee kerngetallen, wanneer er voor het laatst
// gemeten is en de grafiek van de laatste 24 uur. Staat in het zijpaneel
// (desktop) of de bottom sheet (mobiel).
export default function RegionDetails({
    region,
    onClose,
    onShare,
    loading,
    history,
    metric = 'temperature',
    // Tijdstip van het getoonde frame als de tijdlijn niet op LIVE staat.
    viewedTime = null,
}) {
    const headingRef = useRef(null);
    const [dataView, setDataView] = useState('temperature');
    const [showMin, setShowMin] = useState(false);
    const [showMax, setShowMax] = useState(false);
    const [showGem, setShowGem] = useState(false);

    // Focus naar de sheet bij openen en bij een andere wijk, zodat toetsenbord-
    // en schermlezergebruikers meteen in de details zitten.
    useEffect(() => {
        headingRef.current?.focus();
    }, [region.id]);

    const handleLegendChange = (e) => {
        if (e.dataKey === 'min') setShowMin(prev => !prev);
        if (e.dataKey === 'max') setShowMax(prev => !prev);
        if (e.dataKey === 'avg') setShowGem(prev => !prev);
    };

    const lastMeasurement = lastMeasurementTimestamp(history, 'avg') ?? lastMeasurementTimestamp(history, 'pm25');
    const ago = formatTimeAgo(lastMeasurement);

    let updatedText;
    if (viewedTime) updatedText = `Toont de situatie van ${viewedTime}`;
    else if (loading) updatedText = 'Bijgewerkt: laden';
    else if (ago) updatedText = `Bijgewerkt ${ago}`;
    else updatedText = 'Geen meting in de afgelopen 24 uur.';

    return (
        <section className="region-sheet flex flex-col gap-3" aria-label={`Details van ${region.name}`}>
            <div className="flex items-start justify-between gap-2">
                <h2 ref={headingRef} tabIndex={-1} className="m-0 text-lg font-bold text-gray-900 outline-none">
                    {region.name}
                </h2>
                <button type="button" onClick={onClose} aria-label="Sluit details" className={`${ACTION_BUTTON} shrink-0`}>
                    <i className="bi bi-x-lg" aria-hidden="true"></i> Sluiten
                </button>
            </div>

            <div className="grid grid-cols-2 gap-2">
                <KeyNumber metricId="temperature" region={region} />
                <KeyNumber metricId="pm25" region={region} />
            </div>

            <p className="m-0 flex items-center gap-1.5 text-sm text-gray-700" role="status">
                <i className="bi bi-clock-history" aria-hidden="true"></i>
                {updatedText}
            </p>

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

            <div className="flex flex-wrap gap-2">
                <button type="button" onClick={onShare} className={ACTION_BUTTON}>
                    <i className="bi bi-share" aria-hidden="true"></i> Deel
                </button>
                {/* Meldingsvoorkeuren (FrontEnd #148) bestaan nog niet: de knop staat klaar maar is uitgeschakeld. */}
                <button
                    type="button"
                    disabled
                    title="Meldingen zijn nog niet beschikbaar"
                    aria-describedby="meld-mij-uitleg"
                    className={ACTION_BUTTON}
                >
                    <i className="bi bi-bell" aria-hidden="true"></i> Meld mij
                </button>
                <span id="meld-mij-uitleg" className="sr-only">Meldingsvoorkeuren zijn nog niet beschikbaar.</span>
            </div>
        </section>
    );
}

RegionDetails.propTypes = {
    region: PropTypes.object.isRequired,
    onClose: PropTypes.func.isRequired,
    onShare: PropTypes.func.isRequired,
    loading: PropTypes.bool.isRequired,
    history: PropTypes.array.isRequired,
    metric: PropTypes.oneOf(METRIC_IDS),
    viewedTime: PropTypes.string,
};
