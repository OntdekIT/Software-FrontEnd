import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {backendApi} from "../../../utils/backend-api.jsx";
import {SkeletonCard} from "../../../components/ui/Skeleton.jsx";
import Button from "../../../components/ui/Button.jsx";
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
                <Link to={"./claim"} aria-label="Nieuw station toevoegen">
                    <Button variant="primary" size="sm">
                        <i className="bi bi-plus-lg"></i> Nieuw station toevoegen
                    </Button>
                </Link>
            </div>
            <div className="mx-auto max-w-6xl px-4 py-6">
                <div className="nav-size"></div>
                <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-800">
                    <i className="bi bi-broadcast text-brand-500"></i> Mijn stations
                </h1>
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