import {useEffect, useRef, useState} from "react";
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis} from "recharts";
import {backendApi} from "../utils/backend-api.jsx";
import ColorLegend from "../components/map/color-legend.jsx";
import './new-home.css';
import { fetchOpenMeteo, transformDaily, wmoCodeToEmoji } from "../utils/open-meteo.jsx";
import NewMap from "../components/newmap.jsx";

export default function Home() {
    const errRef = useRef();
    const [errMsg, setErrMsg] = useState('');

    // data from API's
    const [regionData, setRegionData] = useState([]);
    const [stations, setStations] = useState([]);
    const [measurements, setMeasurements] = useState([]);
    // use states for what to show and what not to show
    const [showTemp, setShowTemp] = useState(false)
    const [showDataStations, setShowDataStations] = useState(false);
    const [showRegions, setShowRegions] = useState(true);
    const [heatmapType, setHeatmapType] = useState('temperature')
    const [dateTime, setDateTime] = useState(new Date());
    const [loggedInUser, setLoggedInUser] = useState(JSON.parse(localStorage.getItem("loggedInUser")));
    const [weatherData, setWeatherData] = useState(null);
    const [selectedRegion, setSelectedRegion] = useState(null);
    const [regionHistoryData, setRegionHistoryData] = useState([]);
    const [regionLoading, setRegionLoading] = useState(false);
    const [showMin, setShowMin] = useState(false);
    const [showMax, setShowMax] = useState(false);
    const [showGem, setShowGem] = useState(false);

    const calRef = useRef();
    const mapRef = useRef();

    function handleToggleTemp() {
        setShowRegions(false);
        setShowTemp(!showTemp);
    }

    function zoomToRegion(region) {
        console.log("testing zoom to region", mapRef.current);
        if (mapRef.current && Array.isArray(region.coordinates) && region.coordinates.length > 0) {
            const lats = region.coordinates.map(coord => coord[0]);
            const lngs = region.coordinates.map(coord => coord[1]);
            const center = [
                lats.reduce((a, b) => a + b, 0) / lats.length,
                lngs.reduce((a, b) => a + b, 0) / lngs.length
            ];
            console.log("zooming to region:", region, "center:", center);
            mapRef.current.setView(center, 14);
            setSelectedRegion(region);
            fetchRegionData(region.id);
        }
    }

    function handleToggleShowDataStations() {
        setShowDataStations(!showDataStations);
    }

    function handleToggleShowRegions() {
        setShowRegions(!showRegions);
        setShowTemp(false);
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

    function handleAxiosError(error) {
        setErrMsg('Het ophalen van de gegevens is mislukt');
    }

    useEffect(() => {
        try {
            const params = {
                latitude: 51.5555,
                longitude: 5.0913,
                daily: [
                    "temperature_2m_max",
                    "temperature_2m_min",
                    "weather_code",
                    "temperature_2m_mean",
                    "relative_humidity_2m_mean",
                ],
                timezone: "Europe/Berlin",
            };
            fetchOpenMeteo("https://api.open-meteo.com/v1/forecast", params)
                .then(json => {
                    const daily = transformDaily(json);
                    setWeatherData({ raw: json, daily });
                    console.log("Open-Meteo daily", daily);
                })
                .catch(err => {
                    console.error("Open-Meteo error", err);
                });

            // Get Stations
            backendApi.get(`/Meetstation/stationsMetMeasurements?timestamp=${dateTime.toISOString()}`)
                .then(resp => {
                    setStations(resp.data);
                })
                .catch(handleAxiosError);

            // Get timestamp measurements
            backendApi.get(`/measurement/history?timestamp=${dateTime.toISOString()}`)
                .then(resp => {
                    setMeasurements(resp.data);
                })
                .catch(function (error) {
                    handleAxiosError(error);
                });

            // Get neighbourhood data
            backendApi.get(`/neighbourhood/history?timestamp=${dateTime.toISOString()}`)
                .then((response) => {
                    setRegionData(response.data);
                    console.log(response.data);
                })
                .catch(function (error) {
                    handleAxiosError(error);
                });
        } catch (error) {
            setErrMsg('Fout bij ophalen kaart-data.');
        }
    }, [dateTime]);

    const dailyEntries = (() => {
        if (!weatherData?.daily) return [];
        const d = weatherData.daily;
        const times = Array.isArray(d.time) ? d.time : [];
        return times.map((t, i) => ({
            date: t instanceof Date ? t : new Date(t),
            temperature_2m_max: d.temperature_2m_max?.[i] ?? null,
            temperature_2m_min: d.temperature_2m_min?.[i] ?? null,
            temperature_2m_mean: d.temperature_2m_mean?.[i] ?? null,
            relative_humidity_2m_mean: d.relative_humidity_2m_mean?.[i] ?? null,
            weather_code: d.weather_code?.[i] ?? null,
        }));
    })();

    return (<div>
            <title>Home</title>

            <section className="home-section">
                <div className="mini-map">

                    {errMsg && (<div className="error-overlay">
                            <p ref={errRef} aria-live="assertive">{errMsg}</p>
                            <button className="btn btn-primary" onClick={() => window.location.reload(false)}>
                                Opnieuw proberen
                            </button>
                        </div>)}

                    <NewMap
                        centerX={5.0913}
                        centerY={51.5555}
                        zoom={12}
                        regionData={showRegions ? regionData : []}
                        onRegionClick={(region) => {
                            console.log("User clicked region:", region.name);
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
                                            <ResponsiveContainer width="100%" height={160}>
                                                <LineChart data={regionHistoryData}>
                                                    <XAxis dataKey="timestamp" tick={{ fontSize: 9 }} />
                                                    <YAxis width={28} tick={{ fontSize: 9 }} />
                                                    <CartesianGrid stroke="#ccc" />
                                                    <Legend onClick={handleRegionLegendChange} wrapperStyle={{ fontSize: '11px' }} />
                                                    <Line type="monotone" dataKey="min" name="Min" stroke="#0000ff" hide={showMin} dot={false} />
                                                    <Line type="monotone" dataKey="max" name="Max" stroke="#ff0000" hide={showMax} dot={false} />
                                                    <Line type="monotone" dataKey="avg" name="Gemiddeld" stroke="#00ee00" hide={showGem} dot={false} />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                        <div className="region-measurements-list">
                                            <p className="region-measurements-label">Laatste metingen</p>
                                            {regionHistoryData.slice(-8).reverse().map((m, i) => (
                                                <div key={i} className="region-measurement-item">
                                                    <span className="rm-time">{m.timestamp}</span>
                                                    <span className="rm-val rm-min" title="Min">▼{m.min ?? '--'}</span>
                                                    <span className="rm-val rm-avg" title="Gem">≈{m.avg ?? '--'}</span>
                                                    <span className="rm-val rm-max" title="Max">▲{m.max ?? '--'}</span>
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
                    <div className="weer-view">
                        <div className="weer-view-header">
                            <h2>Weer</h2>
                        </div>

                        <div className="weer-view-body">
                            {dailyEntries.length === 0 ? (
                                <p>No daily weather data available</p>
                            ) : (
                                <div className="daily-grid" role="list" aria-label="7 day forecast">
                                    {dailyEntries.slice(0, 7).map((entry, idx) => (
                                        <div key={idx} className="daily-card" role="listitem" aria-label={`Forecast ${idx + 1}`}>
                                            <div className="date">
                                                {entry.date.toLocaleDateString(undefined, { weekday: 'short', day: 'numeric', month: 'short' })}
                                            </div>

                                            <div className="icon" aria-hidden="true" style={{ fontSize: '1.25rem' }}>
                                                {wmoCodeToEmoji(entry.weather_code)}
                                            </div>

                                            <div className="temps">
                                                <div>Max: {entry.temperature_2m_max != null ? `${entry.temperature_2m_max.toFixed(1)}°C` : '--'}</div>
                                                <div>Min: {entry.temperature_2m_min != null ? `${entry.temperature_2m_min.toFixed(1)}°C` : '--'}</div>
                                                <div>Mean: {entry.temperature_2m_mean != null ? `${entry.temperature_2m_mean.toFixed(1)}°C` : '--'}</div>
                                            </div>

                                            <div className="rh">RH: {entry.relative_humidity_2m_mean != null ? `${entry.relative_humidity_2m_mean.toFixed(0)}%` : '--'}</div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </section>
        </div>)
}
