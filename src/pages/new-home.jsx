import { useEffect, useRef, useState } from "react";
import { backendApi } from "../utils/backend-api.jsx";
import ColorLegend from "../components/map/color-legend.jsx";
import './new-home.css';
import NewMap from "../components/newmap.jsx";
import RegionList from "../components/home/RegionList.jsx";
import RegionDetails from "../components/home/RegionDetails.jsx";

export default function Home() {
    const errRef = useRef();
    const [errMsg, setErrMsg] = useState('');

    const [regionData, setRegionData] = useState([]);
    const [stations, setStations] = useState([]);
    const [measurements, setMeasurements] = useState([]);
    const [showRegions, setShowRegions] = useState(true);
    const [dateTime, setDateTime] = useState(new Date());
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [regionHistoryData, setRegionHistoryData] = useState([]);
    const [regionLoading, setRegionLoading] = useState(false);
    const [showMin, setShowMin] = useState(false);
    const [showMax, setShowMax] = useState(false);
    const [showGem, setShowGem] = useState(false);
    const [dataView, setDataView] = useState('temperature');
    const [showPmRegions, setShowPmRegions] = useState(false);

    const mapRef = useRef();

    function zoomToRegion(region) {
        if (mapRef.current && Array.isArray(region.coordinates) && region.coordinates.length > 0) {
            const lats = region.coordinates.map(coord => coord[0]);
            const lngs = region.coordinates.map(coord => coord[1]);
            const center = [
                lats.reduce((a, b) => a + b, 0) / lats.length,
                lngs.reduce((a, b) => a + b, 0) / lngs.length
            ];
            mapRef.current.setView(center, 14);
            setSelectedRegion(region);
            fetchRegionData(region.id);
        }
    }

    const fetchRegionData = (regionId) => {
        setRegionLoading(true);
        setRegionHistoryData([]);
        backendApi.get(`/measurement/history/average/region/${regionId}`)
            .then(response => {
                setRegionHistoryData(response.data);
                setRegionLoading(false);
            })
            .catch(() => {
                console.error("Failed to fetch region data");
                setRegionHistoryData([]);
                setRegionLoading(false);
            });
    };

    const parseTemp = (val) => {
        const n = parseFloat(val);
        return isFinite(n) ? n : null;
    };

    const handleRegionLegendChange = (e) => {
        if (e.dataKey === "min") setShowMin(prev => !prev);
        if (e.dataKey === "max") setShowMax(prev => !prev);
        if (e.dataKey === "avg") setShowGem(prev => !prev);
    };

    const formatTimestamp = (ts) => {
        const date = new Date(ts);
        return isNaN(date) ? ts : date.toLocaleString('nl-NL', {
            month: 'short', day: 'numeric',
            hour: '2-digit', minute: '2-digit'
        });
    };

    function handleAxiosError() {
        setErrMsg('Het ophalen van de gegevens is mislukt, en je bent gay');
    }

    useEffect(() => {
        try {
            backendApi.get(`/Meetstation/stationsMetMeasurements?timestamp=${dateTime.toISOString()}`)
                .then(resp => setStations(resp.data))
                .catch(handleAxiosError);

            backendApi.get(`/measurement/history?timestamp=${dateTime.toISOString()}`)
                .then(resp => setMeasurements(resp.data))
                .catch(handleAxiosError);

            backendApi.get(`/neighbourhood/history?timestamp=${dateTime.toISOString()}`)
                .then(response => setRegionData(response.data))
                .catch(handleAxiosError);
        } catch (error) {
            setErrMsg('Fout bij ophalen kaart-data.');
        }
    }, [dateTime]);

    return (
        <div>
            <title>Home</title>
            <section className="home-section">
                <div className="mini-map">
                    {errMsg && (
                        <div className="error-overlay">
                            <p ref={errRef} aria-live="assertive">{errMsg}</p>
                            <button className="btn btn-primary" onClick={() => window.location.reload(false)}>
                                Opnieuw proberen
                            </button>
                        </div>
                    )}
                    <button
                        className={`toggle-btn pm-toggle ${showPmRegions ? 'active' : ''}`}
                        onClick={() => setShowPmRegions(v => !v)}
                    >
                        Fijnstof regio's
                    </button>
                    <NewMap
                        centerX={5.0913}
                        centerY={51.5555}
                        zoom={12}
                        regionData={showRegions ? regionData : []}
                        pmRegionIds={showPmRegions
                            ? regionData.filter(r => r.avgPm25 != null).map(r => r.id)
                            : []
                        }
                        onRegionClick={(region) => {
                            setSelectedRegion(region);
                            fetchRegionData(region.id);
                        }}
                    />
                    <div className="map-legend">
                        <ColorLegend temperatures={measurements} />
                    </div>
                </div>
                <div className="sidebar-container">
                    <div className="wijken-view">
                        <div className="wijken-view-header">
                            <h2>Wijken</h2>
                        </div>
                        {selectedRegion ? (
                            <RegionDetails
                                selectedRegion={selectedRegion}
                                setSelectedRegion={setSelectedRegion}
                                regionLoading={regionLoading}
                                regionHistoryData={regionHistoryData}
                                dataView={dataView}
                                setDataView={setDataView}
                                showMin={showMin}
                                showMax={showMax}
                                showGem={showGem}
                                handleRegionLegendChange={handleRegionLegendChange}
                                formatTimestamp={formatTimestamp}
                                parseTemp={parseTemp}
                            />
                        ) : (
                           <RegionList
                               regionData={regionData}
                               zoomToRegion={zoomToRegion}
                               parseTemp={parseTemp}
                               onRegionClick={(region) => {
                                   setSelectedRegion(region);
                                   fetchRegionData(region.id);
                               }}
                           />
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}