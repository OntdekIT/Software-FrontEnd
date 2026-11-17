import {useCallback, useEffect} from "react";
import {backendApi} from "../utils/backend-api.jsx";
import {useAuth} from "../providers/auth-provider.jsx";
import UserRole from "../domain/user-role.jsx";
import useSource from "../hooks/use-source.js";
import {buildBackfill} from "../utils/network-health.js";
import KeyNumbers from "../components/dashboard/health/KeyNumbers.jsx";
import CityChart from "../components/dashboard/health/CityChart.jsx";
import StaleStations from "../components/dashboard/health/StaleStations.jsx";
import ExtremeWijken from "../components/dashboard/health/ExtremeWijken.jsx";
import MissingDataExplainer from "../components/dashboard/health/MissingDataExplainer.jsx";

const HOUR = 60 * 60 * 1000;
// Oudere momenten om te zoeken naar de laatste meting van uitgevallen stations.
const BACKFILL_OFFSETS_MS = [6 * HOUR, 24 * HOUR, 72 * HOUR, 168 * HOUR];
// Coverage reads raw measurements on the backend: give it room, and only admins may call it.
const COVERAGE_TIMEOUT_MS = 120000;

const snapshotAt = (time, signal) =>
    backendApi.get(`/Meetstation/stationsMetMeasurements?timestamp=${new Date(time).toISOString()}`, {signal})
        .then((r) => (Array.isArray(r.data) ? r.data : []));

const loadStations = (signal) => snapshotAt(Date.now(), signal);

const loadRegions = (signal) =>
    backendApi.get(`/neighbourhood/history?timestamp=${new Date().toISOString()}`, {signal})
        .then((r) => (Array.isArray(r.data) ? r.data : []));

const loadTimelapse = (signal) => {
    const to = new Date();
    const from = new Date(to.getTime() - 24 * HOUR);
    const params = new URLSearchParams({from: from.toISOString(), to: to.toISOString(), steps: "24"});
    return backendApi.get(`/neighbourhood/history/timelapse?${params.toString()}`, {signal}).then((r) => r.data);
};

const loadPmCoverage = (signal) => {
    const to = new Date();
    to.setMinutes(0, 0, 0);
    const from = new Date(to.getTime() - 24 * HOUR);
    const params = new URLSearchParams({from: from.toISOString(), to: to.toISOString(), granularity: "hour"});
    return backendApi.get(`/measurement/coverage?${params.toString()}`, {timeout: COVERAGE_TIMEOUT_MS, signal})
        .then((r) => r.data?.networkPmCoverage ?? null);
};

export default function NetworkDashboard() {
    const {loggedInUser} = useAuth();
    const isAdmin = [UserRole.ADMIN, UserRole.SUPER_ADMIN].includes(loggedInUser?.role);

    useEffect(() => {
        document.title = "Dashboard";
    }, []);

    const stations = useSource(loadStations);
    const regions = useSource(loadRegions);
    const timelapse = useSource(loadTimelapse);
    // Heavy and admin-only: failing here never affects the rest of the page.
    const pmCoverage = useSource(loadPmCoverage, isAdmin);

    // Lazy: only once the station list is in, and only if some station lacks a measurement.
    const needsBackfill = stations.state === "ok" && stations.data.some((s) => (s.measurements ?? []).length === 0);
    const loadBackfill = useCallback(
        (signal) => Promise.all(BACKFILL_OFFSETS_MS.map((offset) => snapshotAt(Date.now() - offset, signal)))
            .then(buildBackfill),
        [],
    );
    const backfill = useSource(loadBackfill, needsBackfill);
    const backfillState = needsBackfill ? backfill : {state: "ok", data: undefined};

    return (
        <div className="mx-auto w-full max-w-6xl px-4 py-6">
            <header className="mb-5">
                <h1 className="text-3xl font-bold text-ink">Dashboard</h1>
                <p className="text-sm text-muted">De gezondheid van het meetnet: werken de stations en is de data betrouwbaar?</p>
            </header>

            <div className="space-y-4">
                <KeyNumbers stations={stations} regions={regions} timelapse={timelapse} pmCoverage={isAdmin ? pmCoverage : undefined} />
                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2"><CityChart timelapse={timelapse} /></div>
                    <ExtremeWijken regions={regions} />
                </div>
                <div className="grid gap-4 lg:grid-cols-3">
                    <div className="lg:col-span-2"><StaleStations stations={stations} backfill={backfillState} /></div>
                    <MissingDataExplainer stations={stations} />
                </div>
            </div>
        </div>
    );
}
