import { useCallback, useEffect, useRef, useState } from "react";
import { backendApi } from "../utils/backend-api.jsx";
import './new-home.css';
import NewMap from "../components/newmap.jsx";
import RegionList from "../components/Home/RegionList.jsx";
import RegionDetails from "../components/Home/RegionDetails.jsx";
import Button from "../components/ui/Button.jsx";

export default function Home() {
    const errRef = useRef();
    const [errMsg, setErrMsg] = useState('');

    const [regionData, setRegionData] = useState([]);
    const [regionsLoading, setRegionsLoading] = useState(true);
    const [stations, setStations] = useState([]);
    const [showRegions] = useState(true);
    const [dateTime] = useState(new Date());
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [regionHistoryData, setRegionHistoryData] = useState([]);
    const [regionLoading, setRegionLoading] = useState(false);
    const [showMin, setShowMin] = useState(false);
    const [showMax, setShowMax] = useState(false);
    const [showGem, setShowGem] = useState(false);
    const [dataView, setDataView] = useState('temperature');
    const [metric, setMetric] = useState('temperature');

    const mapRef = useRef();

    // Teller om te voorkomen dat een trage vorige respons de grafiek van een
    // nieuwere selectie overschrijft.
    const historyRequestId = useRef(0);

    // Eén plek voor selecteren: lijst en kaart roepen dezelfde functie aan.
    // Alleen een klik in de lijst laat de kaart inzoomen; bij een klik op de
    // kaart staat de wijk al in beeld.
    function selectRegion(region, { zoom = false } = {}) {
        setSelectedRegion(region);
        fetchRegionData(region.id);
        if (zoom) mapRef.current?.focusRegion(region);
    }

    function selectRegionFromMap(properties) {
        const region = regionData.find(r => String(r.id) === String(properties.id)) ?? properties;
        selectRegion(region);
    }

    const fetchRegionData = (regionId) => {
        const requestId = ++historyRequestId.current;
        setRegionLoading(true);
        setRegionHistoryData([]);
        backendApi.get(`/measurement/history/average/region/${regionId}?granularity=half-hour`)
            .then(response => {
                if (requestId !== historyRequestId.current) return;
                setRegionHistoryData(response.data);
                setRegionLoading(false);
            })
            .catch(() => {
                if (requestId !== historyRequestId.current) return;
                console.error("Failed to fetch region data");
                setRegionHistoryData([]);
                setRegionLoading(false);
            });
    };

    const closeRegion = useCallback(() => {
        historyRequestId.current++;
        setSelectedRegion(null);
    }, []);

    // Escape sluit het detailsheet.
    useEffect(() => {
        if (!selectedRegion) return undefined;
        const onKeyDown = (e) => { if (e.key === 'Escape') closeRegion(); };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [selectedRegion, closeRegion]);

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
        setErrMsg('Het ophalen van de gegevens is mislukt');
    }

    useEffect(() => {
        try {
            backendApi.get(`/Meetstation/stationsMetMeasurements?timestamp=${dateTime.toISOString()}`)
                .then(resp => setStations(resp.data))
                .catch(handleAxiosError);

            backendApi.get(`/neighbourhood/history?timestamp=${dateTime.toISOString()}`)
                .then(response => setRegionData(response.data))
                .catch(handleAxiosError)
                .finally(() => setRegionsLoading(false));
        } catch {
            setErrMsg('Fout bij ophalen kaart-data.');
            setRegionsLoading(false);
        }
    }, [dateTime]);

    return (
        <div>
            <title>Home</title>
            <section className="home-section">
                <div className="mini-map">
                    {errMsg && (
                        <div className="error-overlay">
                            <i className="bi bi-exclamation-triangle text-2xl text-danger" aria-hidden="true"></i>
                            <p ref={errRef} aria-live="assertive">{errMsg}</p>
                            <Button variant="primary" onClick={() => window.location.reload(false)}>
                                <i className="bi bi-arrow-clockwise" aria-hidden="true"></i>
                                Opnieuw proberen
                            </Button>
                        </div>
                    )}
                    <NewMap
                        ref={mapRef}
                        centerX={5.0913}
                        centerY={51.5555}
                        zoom={12}
                        regionData={showRegions ? regionData : []}
                        stations={stations}
                        metric={metric}
                        onMetricChange={setMetric}
                        selectedRegionId={selectedRegion?.id ?? null}
                        onRegionClick={selectRegionFromMap}
                    />
                </div>
                <div className="sidebar-container">
                    <div className="wijken-view">
                        <div className="wijken-view-header">
                            <h2 className="flex items-center gap-2">
                                <i className="bi bi-geo-alt" aria-hidden="true"></i>
                                Wijken
                            </h2>
                        </div>
                        <RegionList
                            regionData={regionData}
                            loading={regionsLoading}
                            metric={metric}
                            selectedId={selectedRegion?.id ?? null}
                            onRegionClick={(region) => selectRegion(region, { zoom: true })}
                        />
                        {selectedRegion && (
                            <RegionDetails
                                selectedRegion={selectedRegion}
                                setSelectedRegion={closeRegion}
                                regionLoading={regionLoading}
                                regionHistoryData={regionHistoryData}
                                dataView={dataView}
                                setDataView={setDataView}
                                showMin={showMin}
                                showMax={showMax}
                                showGem={showGem}
                                handleRegionLegendChange={handleRegionLegendChange}
                                formatTimestamp={formatTimestamp}
                                metric={metric}
                            />
                        )}
                    </div>

                </div>
            </section>
        </div>
    );
}