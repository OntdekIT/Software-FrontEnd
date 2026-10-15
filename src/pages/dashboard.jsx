import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { backendApi } from "../utils/backend-api.jsx";
import NewMap from "../components/newmap.jsx";
import RegionChart from "../components/Home/RegionChart.jsx";
import StatCard from "../components/dashboard/StatCard.jsx";
import OutageList from "../components/dashboard/OutageList.jsx";
import Button from "../components/ui/Button.jsx";
import './dashboard.css';

// Average of the finite numbers in a list, or null when there is nothing to
// average. Keeps the KPI tiles honest instead of showing NaN.
function average(values) {
    const nums = values.map((v) => parseFloat(v)).filter((n) => Number.isFinite(n));
    if (nums.length === 0) return null;
    return nums.reduce((a, b) => a + b, 0) / nums.length;
}

export default function Dashboard() {
    const [stations, setStations] = useState([]);
    const [regionData, setRegionData] = useState([]);
    const [regionHistoryData, setRegionHistoryData] = useState([]);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState('');

    // Chart legend toggles, matching the RegionChart contract used on new-home.
    const [dataView, setDataView] = useState('temperature');
    const [showMin, setShowMin] = useState(false);
    const [showMax, setShowMax] = useState(false);
    const [showGem, setShowGem] = useState(false);

    const now = useMemo(() => new Date(), []);

    const handleRegionLegendChange = (e) => {
        if (e.dataKey === "min") setShowMin((prev) => !prev);
        if (e.dataKey === "max") setShowMax((prev) => !prev);
        if (e.dataKey === "avg") setShowGem((prev) => !prev);
    };

    const formatTimestamp = (ts) => {
        const date = new Date(ts);
        return isNaN(date) ? ts : date.toLocaleString('nl-NL', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    useEffect(() => {
        let cancelled = false;
        setLoading(true);

        const iso = now.toISOString();
        Promise.all([
            backendApi.get(`/Meetstation/stationsMetMeasurements?timestamp=${iso}`).then((r) => r.data),
            backendApi.get(`/neighbourhood/history?timestamp=${iso}`).then((r) => r.data),
        ])
            .then(async ([stationsResp, regionsResp]) => {
                if (cancelled) return;
                setStations(Array.isArray(stationsResp) ? stationsResp : []);
                setRegionData(Array.isArray(regionsResp) ? regionsResp : []);

                // Summary trend: use the first region that actually has data so
                // the chart is never empty when any region reports.
                const summaryRegion = (regionsResp || []).find((r) => r.avgTemp != null) ?? (regionsResp || [])[0];
                if (summaryRegion) {
                    try {
                        const history = await backendApi
                            .get(`/measurement/history/average/region/${summaryRegion.id}`)
                            .then((r) => r.data);
                        if (!cancelled) setRegionHistoryData(Array.isArray(history) ? history : []);
                    } catch {
                        if (!cancelled) setRegionHistoryData([]);
                    }
                }
            })
            .catch(() => {
                if (!cancelled) setErrMsg('Het ophalen van de dashboardgegevens is mislukt.');
            })
            .finally(() => {
                if (!cancelled) setLoading(false);
            });

        return () => { cancelled = true; };
    }, [now]);

    const activeCount = stations.filter((s) => s.isActive !== false).length;
    const failingCount = stations.filter(
        (s) => s.isActive === false || s.tempError || s.humError || s.stofError || s.locError
    ).length;
    const avgTemp = average(regionData.map((r) => r.avgTemp));
    const avgPm25 = average(regionData.map((r) => r.avgPm25));

    return (
        <div className="dashboard-page">
            <title>Dashboard</title>

            <header className="dashboard-header">
                <div>
                    <h1 className="text-xl font-bold text-dark">Meetnet in één oogopslag</h1>
                    <p className="text-sm text-gray-500">
                        Laatst bijgewerkt: {now.toLocaleString('nl-NL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
                <div className="dashboard-header-links">
                    <Link to="/newheatmap">
                        <Button variant="outline" size="sm">
                            <i className="bi bi-map" aria-hidden="true"></i> Kaart
                        </Button>
                    </Link>
                    <Link to="/wijken">
                        <Button variant="secondary" size="sm">
                            <i className="bi bi-graph-up" aria-hidden="true"></i> Grafieken
                        </Button>
                    </Link>
                </div>
            </header>

            {errMsg && (
                <div className="dashboard-error" role="alert">
                    <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
                    <span>{errMsg}</span>
                    <Button variant="primary" size="sm" onClick={() => window.location.reload(false)}>
                        <i className="bi bi-arrow-clockwise" aria-hidden="true"></i> Opnieuw proberen
                    </Button>
                </div>
            )}

            <section className="dashboard-kpis" aria-label="Kerncijfers meetnet">
                <StatCard
                    icon="bi-broadcast"
                    accent="success"
                    value={loading ? '' : activeCount}
                    label="Actieve stations"
                    loading={loading}
                />
                <StatCard
                    icon="bi-exclamation-triangle"
                    accent="danger"
                    value={loading ? '' : failingCount}
                    label="Uitgevallen / storing"
                    loading={loading}
                />
                <StatCard
                    icon="bi-thermometer-half"
                    accent="warning"
                    value={avgTemp != null ? avgTemp.toFixed(1) : '--'}
                    unit="°C"
                    label="Gem. temperatuur"
                    loading={loading}
                />
                <StatCard
                    icon="bi-cloud-haze2"
                    accent="secondary"
                    value={avgPm25 != null ? avgPm25.toFixed(1) : '--'}
                    unit="µg/m³"
                    label="Gem. fijnstof (PM2.5)"
                    loading={loading}
                />
            </section>

            <section className="dashboard-body">
                <div className="dashboard-map-card">
                    <NewMap
                        centerX={5.0913}
                        centerY={51.5555}
                        zoom={11}
                        regionData={regionData}
                        stations={stations}
                        pmRegionIds={[]}
                        onRegionClick={() => {}}
                    />
                </div>

                <div className="dashboard-side">
                    <div className="dashboard-card">
                        <h2 className="dashboard-card-title">
                            <i className="bi bi-graph-up" aria-hidden="true"></i> Regio-trend
                        </h2>
                        <RegionChart
                            regionHistoryData={regionHistoryData}
                            dataView={dataView}
                            setDataView={setDataView}
                            showMin={showMin}
                            showMax={showMax}
                            showGem={showGem}
                            handleRegionLegendChange={handleRegionLegendChange}
                            formatTimestamp={formatTimestamp}
                        />
                    </div>

                    <div className="dashboard-card">
                        <h2 className="dashboard-card-title">
                            <i className="bi bi-list-check" aria-hidden="true"></i> Stations met aandacht nodig
                        </h2>
                        <OutageList stations={stations} loading={loading} />
                    </div>
                </div>
            </section>
        </div>
    );
}
