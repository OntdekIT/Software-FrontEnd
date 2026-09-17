import { useEffect, useState } from "react";
import { backendApi } from "../utils/backend-api.jsx";
import { useToast } from "../components/ui/toast.jsx";
import Preloader from "../components/ui/Preloader.jsx";
import NewMap from "../components/newmap.jsx";
import './new-heatmap.css';

export default function Heatmap() {
    const [regionData, setRegionData] = useState([]);
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dateTime] = useState(new Date());
    const toast = useToast();

    useEffect(() => {
        let active = true;
        setLoading(true);
        // Fetch map data first (data-topmost): regions colour the heatmap,
        // stations become markers. The empty map before was caused by rendering
        // <NewMap> without any data.
        Promise.allSettled([
            backendApi.get(`/neighbourhood/history?timestamp=${dateTime.toISOString()}`),
            backendApi.get(`/Meetstation/stationsMetMeasurements?timestamp=${dateTime.toISOString()}`),
        ]).then(([regionsRes, stationsRes]) => {
            if (!active) return;
            if (regionsRes.status === 'fulfilled') setRegionData(regionsRes.value.data);
            else toast.error('Kon de wijkdata niet ophalen.');
            if (stationsRes.status === 'fulfilled') setStations(stationsRes.value.data);
            setLoading(false);
        });
        return () => { active = false; };
    }, [dateTime, toast]);

    return (
        <>
            <title>Heatmap</title>
            <div className="heatmap-container relative">
                {loading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70">
                        <Preloader message="Kaartdata laden…" />
                    </div>
                )}
                <NewMap
                    centerX={5.0913}
                    centerY={51.5555}
                    zoom={12}
                    regionData={regionData}
                    stations={stations}
                />
            </div>
        </>
    );
}
