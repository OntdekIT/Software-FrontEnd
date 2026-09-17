import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {backendApi} from "../../../utils/backend-api.jsx";
import {SkeletonCard} from "../../../components/ui/Skeleton.jsx";
import {Spinner} from "../../../components/ui/Preloader.jsx";
import Button from "../../../components/ui/Button.jsx";
import StationCard from "../../../components/stations/station-card.jsx";

export default function MyStationsOverview() {
    const [loading, setLoading] = useState(true); // true while any fetch is in flight
    const [ready, setReady] = useState(false); // becomes true after the first successful load
    const [errMsg, setErrMsg] = useState(null);
    const [name, setName] = useState(null);
    const [stations, setStations] = useState([]);

    useEffect(() => {
        const getData = async () => {
            setLoading(true);
            try {
                const response = await backendApi.get('/my-account?includeStations=true');
                setStations(response.data.stations);
                setName(response.data.firstName);
                setErrMsg(null);
            } catch (err) {
                setErrMsg(err.message);
            } finally {
                setLoading(false);
                setReady(true);
            }
        };
        getData();
    }, []);

    const sortedStations = [...stations].sort((a, b) => a.stationid - b.stationid);

    return (
        <div className="mx-auto max-w-6xl px-4 py-6">
            {/* Page header */}
            <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                        <i className="bi bi-broadcast text-xl" aria-hidden="true"></i>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Mijn stations</h1>
                        <p className="mt-0.5 text-sm text-gray-500">
                            {name ? `Welkom ${name}` : "Beheer en bekijk jouw meetstations"}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    {ready && loading && (
                        <span className="inline-flex items-center gap-1.5 text-xs text-gray-400">
                            <Spinner className="h-3 w-3" /> bijwerken…
                        </span>
                    )}
                    <Link to={"./claim"} aria-label="Nieuw station toevoegen">
                        <Button variant="primary" size="sm">
                            <i className="bi bi-plus-lg" aria-hidden="true"></i> Nieuw station toevoegen
                        </Button>
                    </Link>
                </div>
            </div>

            {errMsg && (
                <div className="mb-6 flex items-center gap-2 rounded-lg border border-danger/20 bg-danger/5 px-4 py-3 text-sm text-danger">
                    <i className="bi bi-exclamation-triangle" aria-hidden="true"></i> {errMsg}
                </div>
            )}

            {/* First load only: skeleton grid. Later refetches keep the page visible. */}
            {!ready ? (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({length: 6}).map((_, i) => (
                        <SkeletonCard key={i}/>
                    ))}
                </div>
            ) : sortedStations.length === 0 ? (
                <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-gray-300 bg-white px-6 py-16 text-center">
                    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100 text-gray-400">
                        <i className="bi bi-broadcast text-2xl" aria-hidden="true"></i>
                    </div>
                    <h2 className="text-lg font-semibold text-gray-800">Nog geen stations</h2>
                    <p className="mt-1 max-w-md text-sm text-gray-500">
                        Je hebt nog geen meetstations geclaimd. Voeg je eerste station toe om metingen te bekijken.
                    </p>
                    <Link to={"./claim"} className="mt-5" aria-label="Nieuw station toevoegen">
                        <Button variant="primary" size="sm">
                            <i className="bi bi-plus-lg" aria-hidden="true"></i> Nieuw station toevoegen
                        </Button>
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {sortedStations.map((station) => (
                        <StationCard key={station.stationid} station={station}></StationCard>
                    ))}
                </div>
            )}
        </div>
    )
}
