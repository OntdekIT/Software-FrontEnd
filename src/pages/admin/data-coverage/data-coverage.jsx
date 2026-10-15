import {useEffect, useMemo, useState} from "react";
import PropTypes from "prop-types";
import {Link} from "react-router-dom";
import {
    Area,
    AreaChart,
    CartesianGrid,
    ReferenceLine,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import {backendApi} from "../../../utils/backend-api.jsx";
import {SkeletonCard, SkeletonTable} from "../../../components/ui/Skeleton.jsx";
import {Spinner} from "../../../components/ui/Preloader.jsx";
import CoverageStrip from "../../../components/data-coverage/coverage-strip.jsx";
import {
    STATUS,
    formatBucket,
    formatBuckets,
    formatMinutes,
    formatPercent,
} from "../../../components/data-coverage/coverage-format.js";

const PERIODS = [
    {value: 1, label: "Laatste 24 uur"},
    {value: 7, label: "Laatste 7 dagen"},
    {value: 14, label: "Laatste 14 dagen"},
    {value: 30, label: "Laatste 30 dagen"},
];

const GRANULARITIES = [
    {value: "hour", label: "Per uur"},
    {value: "day", label: "Per dag"},
];

function SummaryTile({label, value, hint}) {
    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <p className="text-sm text-gray-500">{label}</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">{value}</p>
            {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
        </div>
    );
}

SummaryTile.propTypes = {
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    hint: PropTypes.string,
};

export default function DataCoverage() {
    const [days, setDays] = useState(7);
    const [granularity, setGranularity] = useState("hour");
    const [showWithoutPm, setShowWithoutPm] = useState(false);
    const [coverage, setCoverage] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState(null);

    useEffect(() => {
        let cancelled = false;
        const load = async () => {
            setLoading(true);
            setErrMsg(null);
            try {
                // End at the start of the current hour so the last bucket is complete.
                const to = new Date();
                to.setMinutes(0, 0, 0);
                const from = new Date(to.getTime() - days * 24 * 60 * 60 * 1000);
                const params = new URLSearchParams({
                    from: from.toISOString(),
                    to: to.toISOString(),
                    granularity,
                });
                // Weeks of raw data from MeetJeStad can take a while; allow more
                // than the default 15s timeout.
                const response = await backendApi.get(`/measurement/coverage?${params.toString()}`, {timeout: 60000});
                if (!cancelled) setCoverage(response.data);
            } catch (err) {
                if (!cancelled) {
                    setErrMsg(err.response?.data?.message || err.message || "Fout bij het ophalen van de datadekking.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };
        load();
        return () => {
            cancelled = true;
        };
    }, [days, granularity]);

    const statusCounts = useMemo(() => {
        const counts = {OK: 0, IRREGULAR: 0, NO_PM: 0, NO_DATA: 0};
        coverage?.stations.forEach(s => counts[s.status]++);
        return counts;
    }, [coverage]);

    // Worst stations first: irregular before silent ones, then lowest coverage.
    const stations = useMemo(() => {
        if (!coverage) return [];
        return coverage.stations
            .filter(s => showWithoutPm || s.status === "OK" || s.status === "IRREGULAR")
            .slice()
            .sort((a, b) => STATUS[a.status].order - STATUS[b.status].order || a.pmCoverage - b.pmCoverage);
    }, [coverage, showWithoutPm]);

    const networkData = useMemo(() => {
        if (!coverage) return [];
        return coverage.networkTimeline.map((share, i) => ({
            label: formatBucket(coverage.buckets[i], coverage.granularity),
            percentage: Math.round(share * 100),
        }));
    }, [coverage]);

    const firstLoad = loading && !coverage;

    return (
        <div className="mx-auto max-w-7xl px-4 py-6">
            <header className="mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                    <i className="bi bi-reception-2 text-brand-500"></i>
                    Datadekking fijnstof
                </h1>
                <p className="mt-1 max-w-3xl text-sm text-gray-500">
                    Laat per meetstation zien in welke perioden er wel en geen fijnstofdata (PM2.5/PM10) binnenkwam.
                    Een periode telt als gedekt als het station er minstens één fijnstofmeting in stuurde.
                </p>
            </header>

            <div className="mb-6 flex flex-wrap items-end gap-4">
                <label className="flex flex-col text-sm text-gray-700">
                    Periode
                    <select
                        className="mt-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        value={days}
                        onChange={e => setDays(Number(e.target.value))}
                    >
                        {PERIODS.map(p => <option key={p.value} value={p.value}>{p.label}</option>)}
                    </select>
                </label>
                <label className="flex flex-col text-sm text-gray-700">
                    Indeling
                    <select
                        className="mt-1 rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
                        value={granularity}
                        onChange={e => setGranularity(e.target.value)}
                    >
                        {GRANULARITIES.map(g => <option key={g.value} value={g.value}>{g.label}</option>)}
                    </select>
                </label>
                <label className="flex items-center gap-2 pb-2 text-sm text-gray-700">
                    <input
                        type="checkbox"
                        className="h-4 w-4 accent-brand-500"
                        checked={showWithoutPm}
                        onChange={e => setShowWithoutPm(e.target.checked)}
                    />
                    Toon ook stations zonder fijnstofdata
                </label>
                {loading && coverage && (
                    <span className="flex items-center gap-2 pb-2 text-sm text-gray-500">
                        <Spinner className="h-4 w-4"/> bijwerken…
                    </span>
                )}
            </div>

            {errMsg && (
                <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-red-700">{errMsg}</div>
            )}

            {firstLoad ? (
                <>
                    <div className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
                        {Array.from({length: 5}).map((_, i) => <SkeletonCard key={i}/>)}
                    </div>
                    <SkeletonTable rows={8} columns={6}/>
                </>
            ) : coverage && (
                <>
                    <section className="mb-6 grid grid-cols-2 gap-4 lg:grid-cols-5">
                        <SummaryTile
                            label="Dekking meetnet"
                            value={formatPercent(coverage.networkPmCoverage)}
                            hint={`gemiddeld over ${coverage.pmCapableStationCount} station(s) met fijnstof`}
                        />
                        <SummaryTile
                            label={STATUS.OK.label}
                            value={statusCounts.OK}
                            hint={`≥ ${formatPercent(coverage.okThreshold)} van de perioden gedekt`}
                        />
                        <SummaryTile label={STATUS.IRREGULAR.label} value={statusCounts.IRREGULAR}
                                     hint="stuurt fijnstof, maar met gaten"/>
                        <SummaryTile label={STATUS.NO_PM.label} value={statusCounts.NO_PM}
                                     hint="wel metingen, nooit fijnstof"/>
                        <SummaryTile label={STATUS.NO_DATA.label} value={statusCounts.NO_DATA}
                                     hint="niets ontvangen in deze periode"/>
                    </section>

                    <section className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <h2 className="text-lg font-semibold text-gray-900">Meetnet over tijd</h2>
                        <p className="mb-3 text-sm text-gray-500">
                            Aandeel van de stations met fijnstof dat per periode data stuurde. Een dip bij veel
                            stations tegelijk wijst op een gedeelde oorzaak (databron, netwerk of synchronisatie)
                            in plaats van één kapotte sensor.
                        </p>
                        {networkData.length > 0 ? (
                            <ResponsiveContainer width="100%" height={240}>
                                <AreaChart data={networkData} margin={{top: 8, right: 16, left: 0, bottom: 0}}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false}/>
                                    <XAxis dataKey="label" minTickGap={40} tick={{fontSize: 12}}/>
                                    <YAxis domain={[0, 100]} unit="%" tick={{fontSize: 12}} width={48}/>
                                    <Tooltip formatter={value => [`${value}%`, "Stations met data"]}/>
                                    <ReferenceLine y={coverage.networkGapThreshold * 100} stroke="var(--color-danger)"
                                                   strokeDasharray="4 4"/>
                                    <Area type="stepAfter" dataKey="percentage" stroke="var(--color-secondary)"
                                          fill="var(--color-secondary)" fillOpacity={0.15} isAnimationActive={false}/>
                                </AreaChart>
                            </ResponsiveContainer>
                        ) : (
                            <p className="text-sm text-gray-500">Geen fijnstofdata ontvangen in deze periode.</p>
                        )}

                        {coverage.networkGaps.length > 0 && (
                            <div className="mt-4">
                                <h3 className="text-sm font-semibold text-gray-900">
                                    Gelijktijdige uitval (minder dan {formatPercent(coverage.networkGapThreshold)} van de stations)
                                </h3>
                                <ul className="mt-2 space-y-1 text-sm text-gray-700">
                                    {coverage.networkGaps.map(gap => (
                                        <li key={gap.start}>
                                            {formatBucket(gap.start, coverage.granularity)} – {formatBucket(gap.end, coverage.granularity)}
                                            <span className="text-gray-500">
                                                {" "}({formatBuckets(gap.bucketCount, coverage.granularity)}, laagste dekking {formatPercent(gap.lowestShare)})
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        )}
                    </section>

                    <section className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 text-gray-600">
                            <tr>
                                <th className="px-4 py-3 font-semibold">Station</th>
                                <th className="px-4 py-3 font-semibold">Status</th>
                                <th className="px-4 py-3 font-semibold">Dekking</th>
                                <th className="px-4 py-3 font-semibold">Langste gat</th>
                                <th className="px-4 py-3 font-semibold" title="Mediane tijd tussen twee fijnstofmetingen">Interval</th>
                                <th className="w-1/2 px-4 py-3 font-semibold">Verloop</th>
                            </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                            {stations.map(station => (
                                <tr key={station.stationId}>
                                    <td className="px-4 py-3">
                                        <Link to={`/admin/stations/${station.stationId}`} className="font-medium text-gray-900 hover:text-brand-700">
                                            {station.name || `Station ${station.stationId}`}
                                        </Link>
                                        <div className="text-xs text-gray-500">#{station.stationId}</div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`whitespace-nowrap rounded-full px-2 py-0.5 text-xs font-medium ${STATUS[station.status].className}`}>
                                            {STATUS[station.status].label}
                                        </span>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {formatPercent(station.pmCoverage)}
                                        <div className="text-xs text-gray-500">{station.pmReadings} metingen</div>
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">
                                        {formatBuckets(station.longestPmGapBuckets, coverage.granularity)}
                                    </td>
                                    <td className="px-4 py-3 whitespace-nowrap">{formatMinutes(station.medianPmIntervalMinutes)}</td>
                                    <td className="px-4 py-3">
                                        <CoverageStrip buckets={coverage.buckets} timeline={station.pmTimeline}
                                                       granularity={coverage.granularity}/>
                                    </td>
                                </tr>
                            ))}
                            {stations.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                                        Geen stations met fijnstofdata in deze periode.
                                    </td>
                                </tr>
                            )}
                            </tbody>
                        </table>
                    </section>
                </>
            )}
        </div>
    );
}
