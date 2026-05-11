import {useEffect, useRef, useState} from "react";
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis} from "recharts";
import {backendApi} from "../utils/backend-api.jsx";
import ColorLegend from "../components/map/color-legend.jsx";
import './new-home.css';
import NewMap from "../components/newmap.jsx";

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
        setErrMsg('Het ophalen van de gegevens is mislukt');
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
                        className={`toggle-btn ${showPmRegions ? 'active' : ''}`}
                        onClick={() => setShowPmRegions(v => !v)}
                        style={{ position: 'absolute', top: 10, right: 10, zIndex: 1000 }}>
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
                        <ColorLegend temperatures={measurements}/>
                    </div>
                </div>
                <div className="sidebar-container">
                    <div className="wijken-view">
                        <div className="wijken-view-header">
                            <h2>Wijken</h2>
                        </div>
                        {selectedRegion ? (
                            <div className="region-details-card">
                                <div className="region-details-header">
                                    <h3 className="region-details-title">{selectedRegion.name}</h3>
                                    <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedRegion(null)}>← Terug</button>
                                </div>
                                <div className="region-current-temp">
                                    <span className="rct-label">Gem. temperatuur nu:</span>
                                    <span className="rct-value">
                                        {parseTemp(selectedRegion.avgTemp) !== null
                                            ? `${parseTemp(selectedRegion.avgTemp).toFixed(1)}°C`
                                            : '--'}
                                    </span>
                                </div>
                                {regionLoading ? (
                                    <p className="region-loading">Historische data ophalen...</p>
                                ) : regionHistoryData.length > 0 ? (
                                    <div className="region-data-layout">
                                        <div className="region-chart">
                                            <div className="chart-toggle">
                                                <button
                                                    className={`toggle-btn ${dataView === 'temperature' ? 'active' : ''}`}
                                                    onClick={() => setDataView('temperature')}>
                                                    Temperatuur
                                                </button>
                                                <button
                                                    className={`toggle-btn ${dataView === 'pm' ? 'active' : ''}`}
                                                    onClick={() => setDataView('pm')}>
                                                    Fijnstof
                                                </button>
                                                <button
                                                    className={`toggle-btn ${dataView === 'both' ? 'active' : ''}`}
                                                    onClick={() => setDataView('both')}>
                                                    Beide
                                                </button>
                                            </div>
                                            <ResponsiveContainer width="100%" height={160}>
                                                <LineChart data={regionHistoryData}>
                                                    <XAxis
                                                        dataKey="timestamp"
                                                        tick={{ fontSize: 9 }}
                                                        tickFormatter={formatTimestamp}
                                                    />
                                                    <YAxis
                                                        yAxisId="temp"
                                                        width={28}
                                                        tick={{ fontSize: 9 }}
                                                        hide={dataView === 'pm'}
                                                    />
                                                    <YAxis
                                                        yAxisId="pm"
                                                        orientation="right"
                                                        width={36}
                                                        tick={{ fontSize: 9 }}
                                                        hide={dataView === 'temperature'}
                                                    />
                                                    <CartesianGrid stroke="#ccc" />
                                                    <Legend onClick={handleRegionLegendChange} wrapperStyle={{ fontSize: '11px' }} />

                                                    {(dataView === 'temperature' || dataView === 'both') && (<>
                                                        <Line yAxisId="temp" type="monotone" dataKey="min" name="Min temp" stroke="#0000ff" hide={showMin} dot={false} />
                                                        <Line yAxisId="temp" type="monotone" dataKey="max" name="Max temp" stroke="#ff0000" hide={showMax} dot={false} />
                                                        <Line yAxisId="temp" type="monotone" dataKey="avg" name="Gem temp" stroke="#00cc00" hide={showGem} dot={false} />
                                                    </>)}

                                                    {(dataView === 'pm' || dataView === 'both') && (<>
                                                        <Line yAxisId="pm" type="monotone" dataKey="pm25" name="PM2.5" stroke="#ff8800" dot={false} />
                                                        <Line yAxisId="pm" type="monotone" dataKey="pm10" name="PM10" stroke="#aa00ff" dot={false} />
                                                    </>)}
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="region-measurements-list">
                                            <p className="region-measurements-label">Laatste metingen</p>
                                            {regionHistoryData.slice(-8).reverse().map((m, i) => (
                                                <div key={i} className="region-measurement-item">
                                                    <span className="rm-time">
                                                        {m.timestamp ? formatTimestamp(m.timestamp) : '--'}
                                                    </span>
                                                    <div className="rm-stats">
                                                        {(dataView === 'temperature' || dataView === 'both') && (<>
                                                            <span className="rm-val rm-min" title="Minimum">
                                                                <span className="rm-label">Min</span>
                                                                {m.min != null ? `${parseFloat(m.min).toFixed(1)}°` : '--'}
                                                            </span>
                                                            <span className="rm-val rm-avg" title="Gemiddeld">
                                                                <span className="rm-label">Gem</span>
                                                                {m.avg != null ? `${parseFloat(m.avg).toFixed(1)}°` : '--'}
                                                            </span>
                                                            <span className="rm-val rm-max" title="Maximum">
                                                                <span className="rm-label">Max</span>
                                                                {m.max != null ? `${parseFloat(m.max).toFixed(1)}°` : '--'}
                                                            </span>
                                                        </>)}
                                                        {(dataView === 'pm' || dataView === 'both') && (<>
                                                            <span className="rm-val rm-pm25" title="PM2.5">
                                                                <span className="rm-label">PM2.5</span>
                                                                {m.pm25 != null ? `${parseFloat(m.pm25).toFixed(1)}` : '--'}
                                                            </span>
                                                            <span className="rm-val rm-pm10" title="PM10">
                                                                <span className="rm-label">PM10</span>
                                                                {m.pm10 != null ? `${parseFloat(m.pm10).toFixed(1)}` : '--'}
                                                            </span>
                                                        </>)}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ) : (
                                    <p className="text-muted region-no-data">Geen historische data beschikbaar.</p>
                                )}
                            </div>
                        ) : (
                            <div className="wijken-list">
                                {regionData.map((region, idx) => (
                                    <div
                                        className="wijken-list-item"
                                        key={region.id || idx}
                                        onClick={() => zoomToRegion(region)}
                                        style={{ cursor: 'pointer' }}
                                    >
                                        <span className="wijken-list-name">{region.name}</span>
                                        <span className="wijken-list-temp">
                                            {parseTemp(region.avgTemp) !== null ? `${parseTemp(region.avgTemp).toFixed(1)}°C` : '--'}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
}