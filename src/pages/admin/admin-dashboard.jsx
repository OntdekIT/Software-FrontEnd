import {useEffect, useMemo, useState} from "react";
import {Link} from "react-router-dom";
import {backendApi} from "../../utils/backend-api.jsx";
import AdminStatTile from "../../components/admin/admin-stat-tile.jsx";
import AdminWarnings from "../../components/admin/admin-warnings.jsx";
import {
    countStationsWithoutRecentMeasurement,
    summarizeCoverage,
    summarizeWorkshops,
} from "../../utils/admin-summary.js";

// Coverage is heavy on the backend (it reads raw measurements), so ask for the
// shortest useful window and give it room.
const COVERAGE_TIMEOUT_MS = 120000;
const IDLE = {state: "loading", data: null};

// Load one source independently, so a failing endpoint only affects its tile.
function useSource(load) {
    const [result, setResult] = useState(IDLE);
    useEffect(() => {
        let cancelled = false;
        const controller = new AbortController();
        load(controller.signal)
            .then((data) => !cancelled && setResult({state: "ok", data}))
            .catch(() => !cancelled && setResult({state: "error", data: null}));
        return () => {
            cancelled = true;
            controller.abort();
        };
        // `load` is a module-level function, loaded once per mount.
    }, [load]);
    return result;
}

const loadUserCount = (signal) =>
    backendApi.get("/users?page=0&pageSize=1", {signal}).then((r) => r.data.totalElements ?? 0);

const loadStations = (signal) =>
    backendApi.get(`/Meetstation/stationsMetMeasurements?timestamp=${new Date().toISOString()}`, {signal})
        .then((r) => (Array.isArray(r.data) ? r.data : []));

const loadWorkshops = (signal) =>
    Promise.all([
        backendApi.get("/workshops", {signal}),
        backendApi.get("/workshops?isExpired=true", {signal}),
    ]).then(([active, expired]) => summarizeWorkshops(active.data, expired.data));

const loadCoverage = (signal) => {
    const to = new Date();
    to.setMinutes(0, 0, 0);
    const from = new Date(to.getTime() - 24 * 60 * 60 * 1000);
    const params = new URLSearchParams({from: from.toISOString(), to: to.toISOString(), granularity: "hour"});
    return backendApi.get(`/measurement/coverage?${params.toString()}`, {timeout: COVERAGE_TIMEOUT_MS, signal})
        .then((r) => summarizeCoverage(r.data));
};

// The other parts of Beheer are tabs now; only data coverage has no tab of its own.
const ACTIONS = [
    {
        link: "/admin/data-coverage",
        title: "Datadekking",
        description: "Zie waar en wanneer fijnstofdata ontbreekt.",
        icon: "bi bi-reception-2",
    },
];

function plural(count, one, many) {
    return `${count} ${count === 1 ? one : many}`;
}

export default function AdminDashboard() {
    const users = useSource(loadUserCount);
    const stations = useSource(loadStations);
    const workshops = useSource(loadWorkshops);
    const coverage = useSource(loadCoverage);

    const withoutMeasurement = stations.state === "ok" ? countStationsWithoutRecentMeasurement(stations.data) : null;

    const warnings = useMemo(() => {
        const list = [];
        const ws = workshops.data;
        if (ws?.expiringSoon > 0) {
            list.push({key: "ws-soon", to: "/admin/workshop-codes", severity: "warning",
                text: `${plural(ws.expiringSoon, "workshopcode verloopt", "workshopcodes verlopen")} binnen 24 uur`});
        }
        if (ws?.expired > 0) {
            list.push({key: "ws-expired", to: "/admin/workshop-codes?verlopen=1", severity: "warning",
                text: `${plural(ws.expired, "verlopen workshopcode", "verlopen workshopcodes")}`});
        }
        if (withoutMeasurement > 0) {
            list.push({key: "no-measurement", to: "/admin/stations", severity: "danger",
                text: `${plural(withoutMeasurement, "station", "stations")} zonder recente meting`});
        }
        const cov = coverage.data;
        if (cov?.noData > 0 || cov?.irregular > 0) {
            list.push({key: "coverage", to: "/admin/data-coverage", severity: "warning",
                text: `Datadekking: ${plural(cov.noData, "station zonder data", "stations zonder data")}, ${plural(cov.irregular, "onregelmatig", "onregelmatig")}`});
        }
        return list;
    }, [workshops.data, withoutMeasurement, coverage.data]);

    const warningsLoading = [users, stations, workshops].some((s) => s.state === "loading");
    const failedSources = [users, stations, workshops].filter((s) => s.state === "error").length;

    return (
        <div className="mx-auto max-w-5xl px-4 py-6">
            <header className="mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                    <i className="bi bi-speedometer2 text-brand-500" aria-hidden="true"></i>
                    Overzicht
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Kerncijfers en waarschuwingen. Gebruikers, stations en workshopcodes beheer je via de tabs.
                </p>
            </header>

            <section aria-label="Kerncijfers" className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                <AdminStatTile to="/admin/users" icon="bi-person" label="Gebruikers"
                               state={users.state} value={users.data}/>
                <AdminStatTile to="/admin/stations" icon="bi-broadcast" label="Stations"
                               state={stations.state} value={stations.data?.length}/>
                <AdminStatTile to="/admin/stations" icon="bi-exclamation-triangle" label="Stations zonder recente meting"
                               state={stations.state} value={withoutMeasurement}
                               tone={withoutMeasurement > 0 ? "warning" : "neutral"}/>
                <AdminStatTile to="/admin/workshop-codes" icon="bi-123" label="Actieve workshopcodes"
                               state={workshops.state} value={workshops.data?.active}
                               hint={workshops.data?.expiringSoon > 0 ? `${workshops.data.expiringSoon} verloopt binnen 24 uur` : undefined}
                               tone={workshops.data?.expiringSoon > 0 ? "warning" : "neutral"}/>
                <AdminStatTile to="/admin/workshop-codes?verlopen=1" icon="bi-clock-history" label="Verlopen workshopcodes"
                               state={workshops.state} value={workshops.data?.expired}/>
                <AdminStatTile to="/admin/data-coverage" icon="bi-reception-2" label="Fijnstofdekking (24 uur)"
                               state={coverage.state}
                               value={coverage.data?.networkPmCoverage != null ? `${Math.round(coverage.data.networkPmCoverage * 100)}%` : "Geen data"}
                               hint={coverage.data?.networkGaps > 0 ? plural(coverage.data.networkGaps, "gat in het netwerk", "gaten in het netwerk") : undefined}
                               tone={coverage.data?.networkGaps > 0 ? "warning" : "neutral"}/>
            </section>

            <AdminWarnings warnings={warnings} loading={warningsLoading}/>
            {failedSources > 0 && (
                <p className="-mt-3 mb-6 text-sm text-gray-600" role="status">
                    Een deel van de kerncijfers kon niet worden opgehaald. De waarschuwingen hierboven zijn daardoor mogelijk niet compleet.
                </p>
            )}

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ACTIONS.map((action) => (
                    <Link
                        key={action.link}
                        to={action.link}
                        className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-2xl text-brand-500 transition-colors group-hover:bg-brand-500 group-hover:text-dark">
                            <i className={action.icon}></i>
                        </span>
                        <h2 className="flex items-center justify-between text-lg font-semibold text-gray-900">
                            {action.title}
                            <i className="bi bi-arrow-right text-base text-gray-300 transition-colors group-hover:text-brand-500"></i>
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">{action.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
