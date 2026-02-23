import {useEffect, useRef, useState} from "react";
import {backendApi} from "../utils/backend-api.jsx";
import {MapContainer, TileLayer} from "react-leaflet";
import RegionLayer from "../components/map/region-layer.jsx";
import MeetStationLayer from "../components/map/meetstation-layer.jsx";
import RadioButtonGroup from "../components/map/radio-button-group.jsx";
import RadioButton from "../components/map/radio-button.jsx";
import Checkbox from "../components/map/checkbox.jsx";
import ColorLegend from "../components/map/color-legend.jsx";
import nl from 'date-fns/locale/nl';
import ReactDatePicker from "react-datepicker";
import HeatmapLayer from "react-leaflet-heat-layer";
import {gradient} from "../utils/map-utils.jsx";
import './new-home.css';
import { fetchOpenMeteo, transformDaily, wmoCodeToEmoji } from "../utils/open-meteo.jsx";

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

    const calRef = useRef();
    const mapRef = useRef();

    function handleToggleTemp() {
        setShowRegions(false);
        setShowTemp(!showTemp);
    }

    function zoomToRegion(region) {
        console.log("testing zoom to region", mapRef.current);
        if (mapRef.current && Array.isArray(region.coordinates) && region.coordinates.length > 0) {
            // Calculate center
            const lats = region.coordinates.map(coord => coord[0]);
            const lngs = region.coordinates.map(coord => coord[1]);
            const center = [
                lats.reduce((a, b) => a + b, 0) / lats.length,
                lngs.reduce((a, b) => a + b, 0) / lngs.length
            ];
            console.log("zooming to region:", region, "center:", center);
            mapRef.current.setView(center, 13.5);
        }
    }


    function handleToggleShowDataStations() {
        setShowDataStations(!showDataStations);
    }

    function handleToggleShowRegions() {
        setShowRegions(!showRegions);
        setShowTemp(false);
    }

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

                    <MapContainer
                        center={[51.57898, 5.08772]}
                        zoom={12}
                        maxZoom={15}
                        minZoom={11}
                        closePopupOnClick={false}
                        ref={mapRef}
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {showRegions && <RegionLayer data={regionData}></RegionLayer>}
                        <MeetStationLayer
                            stations={stations}
                            visible={showDataStations}
                            selectedDate={dateTime}
                            userId={loggedInUser?.id ? loggedInUser.id.toString() : ''}
                        />
                        {showTemp && measurements.length > 0 && <HeatmapLayer
                            fitBoundsOnLoad
                            fitBoundsOnUpdate
                            latlngs={measurements
                                .filter(m => m.latitude && m.longitude)
                                .map(m => ([m.latitude, m.longitude, m[heatmapType] || 0]))}
                            longitudeExtractor={m => m[1]}
                            latitudeExtractor={m => m[0]}
                            intensityExtractor={m => m[2]}
                            max={Math.max(...measurements.map(m => m[heatmapType] || 0))}
                            min={Math.min(...measurements.map(m => m[heatmapType] || 0))}
                            gradient={gradient}
                            radius={30}
                            blur={15}
                            maxZoom={13}
                        />}
                    </MapContainer>
                    <div className="map-legend">
                        <ColorLegend temperatures={measurements}/>
                    </div>
                </div>
                <div className="sidebar-container">
                    <div className="wijken-view">
                        <div className="wijken-view-header">
                            <h2>Wijken</h2>
                        </div>
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
                {typeof region.avgTemp === 'number' && !isNaN(region.avgTemp) ? `${region.avgTemp.toFixed(1)}°C` : '--'}
            </span>
                                </div>
                            ))}
                        </div>
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

                                            {/* optional icon placeholder (you can replace with actual icons later) */}
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
