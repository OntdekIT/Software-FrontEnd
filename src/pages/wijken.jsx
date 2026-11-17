import { useCallback, useEffect, useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { backendApi } from '../utils/backend-api.jsx';
import Button from '../components/ui/Button.jsx';
import { Skeleton } from '../components/ui/Skeleton.jsx';
import Sparkline from '../components/wijken/Sparkline.jsx';
import CompareChart from '../components/wijken/CompareChart.jsx';
import { COMPARE_COLORS } from '../components/wijken/compare-colors.js';
import { METRICS, formatMetricParts } from '../utils/map-metrics.js';
import { NO_RECENT_DATA_LABEL } from '../utils/region-status.js';
import { filterRegions } from '../utils/region-search.js';
import { DEFAULT_SORT_MODE, sortOptions, sortRegions } from '../utils/region-sort.js';
import { TIMELINE_HOURS, TIMELINE_STEPS, parseTimelapse } from '../utils/timeline.js';
import { wijkPath } from '../utils/wijk-link.js';
import {
    MAX_COMPARE, TREND, buildCompareData, buildRows, buildSeriesByRegion, countActiveStations,
    summarizeRanking, toggleCompare,
} from '../utils/wijken-compare.js';

const MS_PER_HOUR = 3600 * 1000;
const TIMELAPSE_TIMEOUT_MS = 60000;

const TREND_VIEW = {
    [TREND.up]: { icon: 'bi-arrow-up-right', label: 'Stijgend' },
    [TREND.down]: { icon: 'bi-arrow-down-right', label: 'Dalend' },
    [TREND.flat]: { icon: 'bi-arrow-right', label: 'Stabiel' },
};

function formatDelta(delta, metricId) {
    const sign = delta > 0 ? '+' : delta < 0 ? '-' : '';
    const unit = METRICS[metricId].unit;
    return `${sign}${Math.abs(delta).toFixed(1)} ${unit}`;
}

function TrendCell({ trend, metricId }) {
    if (!trend) return <span className="text-xs text-muted">Geen trend</span>;
    const view = TREND_VIEW[trend.direction];
    return (
        <span className="inline-flex items-center gap-1 text-sm text-ink" title={`${view.label} over 24 uur`}>
            <i className={`bi ${view.icon}`} aria-hidden="true"></i>
            <span>{formatDelta(trend.delta, metricId)}</span>
            <span className="sr-only">{view.label} over 24 uur</span>
        </span>
    );
}

function StatusChip({ hasData }) {
    return hasData
        ? <span className="inline-flex items-center gap-1 rounded-full bg-sunken px-2 py-0.5 text-xs font-medium text-ink">
            <span className="h-1.5 w-1.5 rounded-full bg-success" aria-hidden="true"></span>Meting
        </span>
        : <span className="inline-flex items-center gap-1 rounded-full bg-sunken px-2 py-0.5 text-xs font-medium text-muted">
            <span className="h-1.5 w-1.5 rounded-full bg-gray-400" aria-hidden="true"></span>{NO_RECENT_DATA_LABEL}
        </span>;
}

function SummaryCard({ icon, label, row, metricId, detail }) {
    const parts = row ? formatMetricParts(metricId, row.value) : null;
    return (
        <div className="rounded-xl border border-line bg-surface p-4 shadow-sm">
            <p className="text-sm text-muted"><i className={`bi ${icon} mr-1`} aria-hidden="true"></i>{label}</p>
            {row ? (
                <>
                    <Link to={wijkPath(row.id)} className="mt-1 block truncate text-lg font-semibold text-ink hover:underline">{row.name}</Link>
                    <p className="text-sm text-ink-soft">{detail(row, parts)}</p>
                </>
            ) : <p className="mt-1 text-sm text-muted">Nog geen data</p>}
        </div>
    );
}

TrendCell.propTypes = { trend: PropTypes.object, metricId: PropTypes.string.isRequired };
StatusChip.propTypes = { hasData: PropTypes.bool.isRequired };
SummaryCard.propTypes = {
    icon: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    row: PropTypes.object,
    metricId: PropTypes.string.isRequired,
    detail: PropTypes.func.isRequired,
};

export default function Wijken() {
    const [regions, setRegions] = useState([]);
    const [timeline, setTimeline] = useState(null);
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [failed, setFailed] = useState(false);
    const [metric, setMetric] = useState('temperature');
    const [query, setQuery] = useState('');
    const [onlyData, setOnlyData] = useState(false);
    const [sortMode, setSortMode] = useState(DEFAULT_SORT_MODE);
    const [selectedIds, setSelectedIds] = useState([]);

    useEffect(() => {
        document.title = 'Wijken';
    }, []);

    const load = useCallback(() => {
        const to = new Date();
        const from = new Date(to.getTime() - TIMELINE_HOURS * MS_PER_HOUR);
        setLoading(true);
        setFailed(false);
        // De tijdlijn is een bonus: zonder blijft de lijst werken, alleen zonder verloop.
        const timelapse = backendApi.get('/neighbourhood/history/timelapse', {
            params: { from: from.toISOString(), to: to.toISOString(), steps: TIMELINE_STEPS },
            timeout: TIMELAPSE_TIMEOUT_MS,
        }).then(r => parseTimelapse(r.data)).catch(() => null);
        const stationsCall = backendApi.get(`/Meetstation/stationsMetMeasurements?timestamp=${to.toISOString()}`)
            .then(r => (Array.isArray(r.data) ? r.data : [])).catch(() => []);
        const current = backendApi.get(`/neighbourhood/history?timestamp=${to.toISOString()}`)
            .then(r => (Array.isArray(r.data) ? r.data : []));

        Promise.all([current, timelapse, stationsCall])
            .then(([cur, tl, st]) => {
                setRegions(cur);
                setTimeline(tl);
                setStations(st);
            })
            .catch(() => setFailed(true))
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        load();
    }, [load]);

    const metricDef = METRICS[metric];
    const key = metricDef.key;
    const frames = useMemo(() => timeline?.frames ?? [], [timeline]);

    const stationCounts = useMemo(
        () => countActiveStations(stations, timeline?.neighbourhoods ?? regions),
        [stations, timeline, regions]
    );
    const rows = useMemo(
        () => buildRows(regions, buildSeriesByRegion(frames, key), stationCounts, key),
        [regions, frames, key, stationCounts]
    );
    const summary = useMemo(() => summarizeRanking(rows), [rows]);

    const visible = useMemo(() => {
        const base = onlyData ? rows.filter(r => r.hasData) : rows;
        return sortRegions(filterRegions(base, query), sortMode, key);
    }, [rows, onlyData, query, sortMode, key]);

    // Selectie die bij een andere laag of herlaad niet meer bestaat valt vanzelf weg.
    const selected = useMemo(
        () => selectedIds.map(id => rows.find(r => r.id === id)).filter(Boolean),
        [selectedIds, rows]
    );
    const compareData = useMemo(
        () => buildCompareData(frames, selected.map(r => r.id), key),
        [frames, selected, key]
    );

    const full = selectedIds.length >= MAX_COMPARE;
    const withData = rows.filter(r => r.hasData).length;
    const decimals = 1;

    return (
        <main className="mx-auto w-full max-w-6xl px-4 py-5 text-ink">
            <header className="mb-4 flex flex-wrap items-end justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-bold">Wijken vergelijken</h1>
                    <p className="text-sm text-muted">
                        Rangschik alle wijken en zet er tot {MAX_COMPARE} naast elkaar. Verloop over de afgelopen {TIMELINE_HOURS} uur.
                    </p>
                </div>
                <div className="inline-flex rounded-lg border border-line bg-surface p-0.5" role="group" aria-label="Laag">
                    {Object.values(METRICS).map(m => (
                        <button type="button" key={m.id} aria-pressed={m.id === metric}
                            onClick={() => { setMetric(m.id); setSortMode(DEFAULT_SORT_MODE); }}
                            className={`rounded-md px-3 py-1.5 text-sm font-medium ${m.id === metric ? 'bg-brand-500 text-ink' : 'text-ink-soft hover:bg-sunken'}`}>
                            {m.label}
                        </button>
                    ))}
                </div>
            </header>

            {failed && (
                <div className="mb-4 flex flex-wrap items-center gap-3 rounded-xl border border-danger bg-surface p-4" role="alert">
                    <i className="bi bi-exclamation-triangle text-danger" aria-hidden="true"></i>
                    <span className="flex-1">De wijken konden niet worden opgehaald. Probeer het zo opnieuw.</span>
                    <Button variant="secondary" size="sm" onClick={load}>Opnieuw proberen</Button>
                </div>
            )}

            {!failed && !loading && regions.length > 0 && (
                <section className="mb-5 grid gap-3 sm:grid-cols-3" aria-label="Rangschikking in het kort">
                    <SummaryCard icon="bi-thermometer-high" label={metric === 'temperature' ? 'Warmste wijk' : 'Hoogste waarde'}
                        row={summary.highest} metricId={metric}
                        detail={(_, p) => `${p.number} ${p.unit}`} />
                    <SummaryCard icon="bi-thermometer-low" label={metric === 'temperature' ? 'Koudste wijk' : 'Laagste waarde'}
                        row={summary.lowest} metricId={metric}
                        detail={(_, p) => `${p.number} ${p.unit}`} />
                    <SummaryCard icon="bi-activity" label="Grootste verandering in 24 uur"
                        row={summary.biggestChange} metricId={metric}
                        detail={r => `${formatDelta(r.trend.delta, metric)} (${TREND_VIEW[r.trend.direction].label.toLowerCase()})`} />
                </section>
            )}

            {!failed && !loading && regions.length > 0 && (
                <section className="mb-5 rounded-xl border border-line bg-surface p-4 shadow-sm" aria-label="Vergelijking">
                    <h2 className="text-lg font-semibold">Vergelijking</h2>
                    {selected.length === 0 ? (
                        <p className="mt-1 text-sm text-muted">
                            Kies hieronder tot {MAX_COMPARE} wijken met het vinkje om ze te vergelijken met het stadsgemiddelde.
                        </p>
                    ) : (
                        <>
                            <ul className="mt-2 flex flex-wrap gap-2">
                                {selected.map((r, i) => (
                                    <li key={r.id}>
                                        <button type="button" onClick={() => setSelectedIds(ids => toggleCompare(ids, r.id))}
                                            className="inline-flex items-center gap-2 rounded-full border border-line bg-sunken px-3 py-1 text-sm"
                                            aria-label={`${r.name} uit de vergelijking halen`}>
                                            <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: COMPARE_COLORS[i] }} aria-hidden="true"></span>
                                            {r.name}
                                            <i className="bi bi-x" aria-hidden="true"></i>
                                        </button>
                                    </li>
                                ))}
                            </ul>
                            {frames.length > 0
                                ? <CompareChart data={compareData} selected={selected} unit={metricDef.unit} decimals={decimals} />
                                : <p className="mt-3 text-sm text-muted" role="status">Het verloop over 24 uur is nu niet beschikbaar.</p>}
                        </>
                    )}
                </section>
            )}

            <section aria-label="Alle wijken">
                <div className="mb-3 flex flex-wrap items-center gap-3">
                    <label className="relative min-w-0 flex-1 basis-56">
                        <span className="sr-only">Zoek een wijk</span>
                        <i className="bi bi-search absolute left-3 top-1/2 -translate-y-1/2 text-muted" aria-hidden="true"></i>
                        <input type="search" value={query} onChange={e => setQuery(e.target.value)} placeholder="Zoek een wijk"
                            className="w-full rounded-lg border border-line bg-surface py-2 pl-9 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500" />
                    </label>
                    <div className="inline-flex rounded-lg border border-line bg-surface p-0.5" role="group" aria-label="Sorteren">
                        {sortOptions(metric).map(o => (
                            <button type="button" key={o.mode} aria-pressed={o.mode === sortMode}
                                onClick={() => setSortMode(o.mode)}
                                className={`rounded-md px-3 py-1.5 text-sm font-medium ${o.mode === sortMode ? 'bg-brand-500 text-ink' : 'text-ink-soft hover:bg-sunken'}`}>
                                {o.label}
                            </button>
                        ))}
                    </div>
                    <label className="inline-flex items-center gap-2 text-sm">
                        <input type="checkbox" checked={onlyData} onChange={e => setOnlyData(e.target.checked)}
                            className="h-4 w-4 accent-[#e6ad12]" />
                        Alleen wijken met data
                    </label>
                </div>

                {loading && (
                    <div className="space-y-2" aria-busy="true" aria-label="Wijken laden">
                        {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-14 w-full" />)}
                    </div>
                )}

                {!loading && !failed && regions.length === 0 && (
                    <p className="rounded-xl border border-line bg-surface p-6 text-center text-muted" role="status">
                        Er zijn nog geen wijken om te tonen.
                    </p>
                )}

                {!loading && !failed && regions.length > 0 && (
                    <>
                        <p className="mb-2 text-sm text-muted" role="status">
                            {visible.length} van {rows.length} wijken, {withData} met een meting.
                        </p>
                        {visible.length === 0 ? (
                            <p className="rounded-xl border border-line bg-surface p-6 text-center text-muted" role="status">
                                Geen wijken gevonden. Pas de zoekterm of het filter aan.
                            </p>
                        ) : (
                            <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line bg-surface shadow-sm">
                                {visible.map(r => {
                                    const parts = formatMetricParts(metric, r.value);
                                    const checked = selectedIds.includes(r.id);
                                    return (
                                        <li key={r.id} className={`grid grid-cols-[auto_1fr_auto] items-center gap-x-3 gap-y-1 px-3 py-3 sm:grid-cols-[auto_minmax(0,2fr)_6rem_8rem_7rem_5rem_9rem] ${checked ? 'bg-brand-50' : ''}`}>
                                            <input type="checkbox" checked={checked} disabled={!checked && full}
                                                onChange={() => setSelectedIds(ids => toggleCompare(ids, r.id))}
                                                aria-label={`Vergelijk ${r.name}`}
                                                title={!checked && full ? `Maximaal ${MAX_COMPARE} wijken` : undefined}
                                                className="h-5 w-5 accent-[#e6ad12]" />
                                            <Link to={wijkPath(r.id)} className="min-w-0 truncate font-medium text-ink hover:underline">{r.name}</Link>
                                            <span className="text-right sm:text-left">
                                                {parts
                                                    ? <><span className="text-lg font-bold">{parts.number}</span> <span className="text-xs text-muted">{parts.unit}</span></>
                                                    : <span className="text-sm text-muted">Geen waarde</span>}
                                            </span>
                                            <span className="col-start-2 sm:col-start-auto"><Sparkline values={r.series.map(p => p.value)} /></span>
                                            <span className="col-start-2 sm:col-start-auto"><TrendCell trend={r.trend} metricId={metric} /></span>
                                            <span className="col-start-2 text-sm text-ink-soft sm:col-start-auto">
                                                <i className="bi bi-broadcast mr-1" aria-hidden="true"></i>{r.stations}
                                                <span className="sr-only"> actieve stations</span>
                                            </span>
                                            <span className="col-start-2 sm:col-start-auto"><StatusChip hasData={r.hasData} /></span>
                                        </li>
                                    );
                                })}
                            </ul>
                        )}
                    </>
                )}
            </section>
        </main>
    );
}
