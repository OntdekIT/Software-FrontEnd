import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { backendApi } from "../../utils/backend-api.jsx";
import { useToast } from "../../components/ui/toast.jsx";
import Button from "../../components/ui/Button.jsx";
import { SkeletonCard } from "../../components/ui/Skeleton.jsx";

// Public total overview of all measurement stations: a searchable grid of cards.
// Previously /stations had no index route, so this page did not exist.
export default function StationsList() {
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [query, setQuery] = useState("");
    const [dateTime] = useState(new Date());
    const toast = useToast();

    useEffect(() => {
        let active = true;
        setLoading(true);
        backendApi
            .get(`/Meetstation/stationsMetMeasurements?timestamp=${dateTime.toISOString()}`)
            .then((res) => { if (active) setStations(res.data ?? []); })
            .catch(() => { if (active) toast.error("Kon de stations niet ophalen."); })
            .finally(() => { if (active) setLoading(false); });
        return () => { active = false; };
    }, [dateTime, toast]);

    const filtered = useMemo(() => {
        const q = query.trim().toLowerCase();
        if (!q) return stations;
        return stations.filter((s) =>
            String(s.name ?? "").toLowerCase().includes(q) ||
            String(s.stationid ?? "").includes(q)
        );
    }, [stations, query]);

    return (
        <div className="mx-auto max-w-6xl px-4 py-6">
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                    <i className="bi bi-broadcast text-brand-500" aria-hidden="true"></i>
                    Meetstations
                </h1>
                <div className="relative w-full sm:w-72">
                    <i className="bi bi-search pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true"></i>
                    <input
                        type="search"
                        value={query}
                        onChange={(e) => setQuery(e.target.value)}
                        placeholder="Zoek op naam of nummer…"
                        className="w-full rounded-lg border border-gray-300 py-2 pl-9 pr-3 focus:outline-none focus:ring-2 focus:ring-brand-500"
                        aria-label="Zoek stations"
                    />
                </div>
            </div>

            {loading ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {Array.from({ length: 6 }).map((_, i) => <SkeletonCard key={i} />)}
                </div>
            ) : filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-16 text-gray-400">
                    <i className="bi bi-inbox text-4xl" aria-hidden="true"></i>
                    <p>Geen meetstations gevonden.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {filtered
                        .slice()
                        .sort((a, b) => (a.stationid ?? 0) - (b.stationid ?? 0))
                        .map((station) => {
                            const active = station.isActive !== false && station.locError !== true;
                            return (
                                <div
                                    key={station.stationid}
                                    className="flex flex-col rounded-xl border border-gray-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md"
                                >
                                    <div className="mb-2 flex items-start justify-between gap-2">
                                        <h2 className="flex items-center gap-2 font-semibold text-gray-800">
                                            <i className="bi bi-geo-alt text-brand-500" aria-hidden="true"></i>
                                            {station.name || `Station ${station.stationid}`}
                                        </h2>
                                        <span
                                            className={`inline-flex shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${active ? "bg-success/10 text-success" : "bg-gray-100 text-gray-500"}`}
                                        >
                                            <span className={`h-1.5 w-1.5 rounded-full ${active ? "bg-success" : "bg-gray-400"}`}></span>
                                            {active ? "Actief" : "Inactief"}
                                        </span>
                                    </div>
                                    <p className="mb-4 text-sm text-gray-500">Stationnummer: {station.stationid}</p>
                                    {station.locError === true && (
                                        <p className="mb-3 text-sm text-warning">⚠️ Locatie wordt niet meer gemeten.</p>
                                    )}
                                    <div className="mt-auto">
                                        <Link to={`/stations/${station.stationid}`}>
                                            <Button variant="primary" size="sm" className="w-full">
                                                <i className="bi bi-graph-up" aria-hidden="true"></i>
                                                Bekijk metingen
                                            </Button>
                                        </Link>
                                    </div>
                                </div>
                            );
                        })}
                </div>
            )}
        </div>
    );
}
