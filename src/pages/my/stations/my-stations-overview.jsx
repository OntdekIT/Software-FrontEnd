import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {backendApi} from "../../../utils/backend-api.jsx";
import {SkeletonCard} from "../../../components/ui/Skeleton.jsx";
import StationCard from "../../../components/stations/station-card.jsx";

export default function MyStationsOverview() {
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState(null);
    const [name, setName] = useState(null);
    const [stations, setStations] = useState([]);

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await backendApi.get('/my-account?includeStations=true');
                setStations(response.data.stations);
                console.log(response.data.stations);  
                setName(response.data.firstName);
                setErrMsg(null);
            } catch (err) {
                setErrMsg(err.message);
            } finally {
                setLoading(false);
            }
        };
        getData();
    }, []);

    return (
        <>
            <div className="toolbar fixed-top flex items-center justify-between">
                <span>Welkom {name}</span>
                <Link
                    to={"./claim"}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-brand-500 px-3 py-1.5 text-sm font-medium text-white transition-colors hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 focus-visible:ring-offset-2"
                >
                    Nieuw station toevoegen
                </Link>
            </div>
            <div className="mx-auto max-w-6xl px-4">
                <div className="nav-size"></div>
                <h1 className="text-2xl font-bold text-gray-800">Mijn stations</h1>
                {errMsg && <div className="error-msg">{errMsg}</div>}
                {loading ? (
                    <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {Array.from({length: 6}).map((_, i) => (
                            <SkeletonCard key={i}/>
                        ))}
                    </div>
                ) : (
                    <div className="mt-4 grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {stations
                            .sort((a, b) => a.stationid - b.stationid)
                            .map((station) => (
                                <div key={station.stationid}>
                                    <StationCard station={station}></StationCard>
                                </div>
                            ))}
                    </div>
                )}
            </div>
        </>
    )
}