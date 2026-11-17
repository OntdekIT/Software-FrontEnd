import PropTypes from 'prop-types';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { backendApi } from '../utils/backend-api.jsx';
import HeatmapMap from '../components/heatmap/HeatmapMap.jsx';
import HeatmapLegend from '../components/heatmap/HeatmapLegend.jsx';
import MapPanel from '../components/kaart/MapPanel.jsx';
import Button from '../components/ui/Button.jsx';
import { METRICS, METRIC_IDS, formatMetricValue } from '../utils/map-metrics.js';
import { heatRange, toHeatPoints } from '../utils/heatmap-data.js';
import { MAX_COVERAGE_KM, estimateAt, findExtremes, nearestPoints } from '../utils/interpolation.js';
import { colorFor } from '../utils/color-scale.js';
import { formatLastMeasurement } from '../utils/station-status.js';
import { STATIONS_ENDPOINT, swrRequest } from '../utils/swr-cache.js';
import './kaart.css';
import './heatmap.css';

const NEAREST_COUNT = 3;
// Korte naam en uitersten per laag, voor in lopende tekst en op de labels.
const COPY = {
    temperature: { noun: 'temperatuur', hot: 'Warmste plek', cold: 'Koudste plek' },
    pm25: { noun: 'fijnstof', hot: 'Meeste fijnstof', cold: 'Schoonste plek' },
};

function stationLabel(point) {
    return point.name ?? `Station ${point.id}`;
}

function formatKm(km) {
    return km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`;
}

function Swatch({ metric, range, value }) {
    return (
        <span
            className="wijken-list-chip"
            style={{ backgroundColor: colorFor(value, range, METRICS[metric].palette) }}
            aria-hidden="true"
        />
    );
}

function SpotCard({ title, spot, metric, range }) {
    return (
        <li className="wijken-list-item" style={{ cursor: 'default' }}>
            <Swatch metric={metric} range={range} value={spot.value} />
            <span className="wijken-list-text">
                <span className="wijken-list-name">{title}</span>
                <span className="wijken-list-sub">{stationLabel(spot)}</span>
            </span>
            <span className="wijken-list-value">
                <span className="wijken-list-number">{formatMetricValue(metric, spot.value)}</span>
            </span>
        </li>
    );
}

const rangeShape = PropTypes.shape({ min: PropTypes.number, max: PropTypes.number });
const spotShape = PropTypes.shape({ id: PropTypes.oneOfType([PropTypes.number, PropTypes.string]), name: PropTypes.string, value: PropTypes.number });
Swatch.propTypes = { metric: PropTypes.string.isRequired, range: rangeShape, value: PropTypes.number };
SpotCard.propTypes = { title: PropTypes.string.isRequired, spot: spotShape.isRequired, metric: PropTypes.string.isRequired, range: rangeShape };

// Heatmap: het patroon van warm en koud over de stad, los van wijkgrenzen. De
// waarde tussen de stations is een schatting (IDW); ver van een station blijft
// het vlak leeg in plaats van iets te verzinnen.
export default function Heatmap() {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [metric, setMetric] = useState('temperature');
    const [picked, setPicked] = useState(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [loadedAt, setLoadedAt] = useState(null);

    useEffect(() => {
        document.title = 'Heatmap';
    }, []);

    const load = useCallback(() => {
        setLoading(true);
        setFailed(false);
        swrRequest(
            STATIONS_ENDPOINT,
            () => backendApi.get(`/Meetstation/stationsMetMeasurements?timestamp=${new Date().toISOString()}`).then((resp) => resp.data),
            (cached) => {
                setStations(cached.data);
                // Het bewaarde moment, zodat de leeftijd van de metingen eerlijk blijft.
                setLoadedAt(cached.savedAt);
                setLoading(false);
            }
        )
            .then((data) => {
                setStations(data);
                setLoadedAt(Date.now());
            })
            .catch(() => setFailed(true))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const { points, total, excluded } = useMemo(
        () => toHeatPoints(stations, metric, loadedAt ?? Date.now()),
        [stations, metric, loadedAt]
    );
    const range = useMemo(() => heatRange(points, metric), [points, metric]);
    const { hot, cold } = useMemo(() => findExtremes(points), [points]);

    const estimate = useMemo(
        () => (picked ? estimateAt(points, picked.lat, picked.lng) : null),
        [picked, points]
    );
    const nearest = useMemo(
        () => (picked ? nearestPoints(points, picked.lat, picked.lng, NEAREST_COUNT) : []),
        [picked, points]
    );

    const active = METRICS[metric];
    const copy = COPY[metric];
    const empty = !loading && !failed && points.length === 0;

    function pick(position) {
        setPicked(position);
        setSheetOpen(true);
    }

    let panelTitle = 'Patroon over de stad';
    if (picked) panelTitle = 'Gekozen plek';

    return (
        <div className="kaart heatmap-page">
            <HeatmapMap points={points} metric={metric} range={range} hot={hot} cold={cold} labels={copy} picked={picked} onPick={pick} />

            <div className="pointer-events-none absolute left-3 top-3 z-10">
                <div
                    role="radiogroup"
                    aria-label="Kaartlaag"
                    className="heatmap-layer-switch pointer-events-auto flex overflow-hidden rounded-lg border border-gray-300 bg-white shadow-md"
                >
                    {METRIC_IDS.map((id) => {
                        const isActive = metric === id;
                        return (
                            <button
                                key={id}
                                type="button"
                                role="radio"
                                aria-checked={isActive}
                                onClick={() => { setMetric(id); setPicked(null); }}
                                className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                                    isActive ? 'bg-brand-500 font-semibold text-gray-900' : 'bg-white text-gray-800 hover:bg-brand-50'
                                }`}
                            >
                                {METRICS[id].label}
                            </button>
                        );
                    })}
                </div>
            </div>

            <div className="pointer-events-none absolute bottom-[calc(var(--sheet-peek)+0.75rem)] left-3 z-10 flex lg:bottom-3">
                <HeatmapLegend metric={metric} range={range} />
            </div>

            {(loading || empty) && (
                <div className="pointer-events-none absolute inset-x-0 top-16 z-10 flex justify-center px-3">
                    <p className="pointer-events-auto m-0 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 shadow-md" role="status">
                        {loading ? 'Metingen laden...' : `Geen recente ${copy.noun}-metingen om een kleurvlak van te maken.`}
                    </p>
                </div>
            )}

            <MapPanel title={panelTitle} showTitleOnDesktop expanded={sheetOpen} onToggle={() => setSheetOpen((open) => !open)}>
                <div className="flex flex-col gap-4">
                    {failed && (
                        <div role="alert" className="flex flex-col items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                            <p className="m-0">Het ophalen van de metingen is mislukt.</p>
                            <Button variant="primary" onClick={load}>Opnieuw proberen</Button>
                        </div>
                    )}

                    {picked && estimate && (
                        <section aria-label="Gekozen plek" className="flex flex-col gap-2">
                            {estimate.value !== null ? (
                                <div className="wijken-list-item" style={{ cursor: 'default' }}>
                                    <Swatch metric={metric} range={range} value={estimate.value} />
                                    <span className="wijken-list-text">
                                        <span className="wijken-list-name">Geschatte waarde</span>
                                        <span className="wijken-list-sub">
                                            {estimate.alpha >= 1 ? 'Station vlakbij' : 'Minder zeker: station op afstand'}
                                        </span>
                                    </span>
                                    <span className="wijken-list-value">
                                        <span className="wijken-list-number">{formatMetricValue(metric, estimate.value)}</span>
                                    </span>
                                </div>
                            ) : (
                                <p className="m-0 rounded-xl border border-gray-300 bg-white p-3 text-sm text-gray-800">
                                    Geen schatting: het dichtstbijzijnde station ligt{' '}
                                    {estimate.nearestKm === null ? 'nergens' : `op ${formatKm(estimate.nearestKm)}`}{' '}
                                    (maximaal {formatKm(MAX_COVERAGE_KM)}).
                                </p>
                            )}
                            {nearest.length > 0 && (
                                <>
                                    <h3 className="m-0 text-xs font-semibold uppercase tracking-wide text-gray-600">Dichtstbijzijnde stations</h3>
                                    <ul className="wijken-list m-0 list-none p-0">
                                        {nearest.map(({ point, distanceKm }) => (
                                            <li key={point.id}>
                                                <Link to={`/stations/${point.id}`} className="wijken-list-item no-underline">
                                                    <Swatch metric={metric} range={range} value={point.value} />
                                                    <span className="wijken-list-text">
                                                        <span className="wijken-list-name">{stationLabel(point)}</span>
                                                        <span className="wijken-list-sub">
                                                            {formatKm(distanceKm)} ver, gemeten {formatLastMeasurement(point.time)}
                                                        </span>
                                                    </span>
                                                    <span className="wijken-list-value">
                                                        <span className="wijken-list-number">{formatMetricValue(metric, point.value)}</span>
                                                    </span>
                                                </Link>
                                            </li>
                                        ))}
                                    </ul>
                                </>
                            )}
                            <Button variant="secondary" onClick={() => setPicked(null)}>Selectie wissen</Button>
                        </section>
                    )}

                    {!picked && (
                        <p className="m-0 text-sm text-gray-800">
                            Tik op de kaart voor de geschatte {copy.noun} op die plek en de stations eromheen.
                        </p>
                    )}

                    {(hot || cold) && (
                        <section aria-label="Warmste en koudste plek" className="flex flex-col gap-2">
                            <h3 className="m-0 text-xs font-semibold uppercase tracking-wide text-gray-600">Uitersten nu</h3>
                            <ul className="wijken-list m-0 list-none p-0">
                                {hot && <SpotCard title={copy.hot} spot={hot} metric={metric} range={range} />}
                                {cold && <SpotCard title={copy.cold} spot={cold} metric={metric} range={range} />}
                            </ul>
                        </section>
                    )}

                    <section aria-label="Over deze kaart" className="flex flex-col gap-1 text-sm text-gray-800">
                        <p className="m-0">
                            <strong>{points.length}</strong> van {total} stations doen mee
                            {excluded > 0 && ` (${excluded} zonder recente ${copy.noun}-meting)`}.
                        </p>
                        <p className="m-0 text-gray-600">
                            Het kleurvlak is een schatting tussen de stations (IDW) en vervaagt tot leeg waar geen
                            station binnen {formatKm(MAX_COVERAGE_KM)} ligt. De kleurschaal loopt van {range ? range.min.toFixed(1) : '-'} tot{' '}
                            {range ? range.max.toFixed(1) : '-'} {active.unit}, met een minimale breedte zodat kleine
                            verschillen niet groter lijken dan ze zijn.
                        </p>
                    </section>
                </div>
            </MapPanel>
        </div>
    );
}
