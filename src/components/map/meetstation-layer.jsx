import { Marker, Popup, Tooltip } from "react-leaflet";
import { roundToOneDecimal } from "../../utils/map-utils.jsx";
import { useEffect, useRef, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import ReactDatePicker from "react-datepicker";
import L from 'leaflet';
import LoadingComponent from "../loading-component.jsx";
import { backendApi } from "../../utils/backend-api.jsx";
import "react-datepicker/dist/react-datepicker.css";
import PropTypes from "prop-types";

const MeetStationLayer = ({ stations, visible, selectedDate, userId }) => {
    const [endDate, setEndDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date());
    const [selectedStation, setSelectedStation] = useState(null);
    const [showMinTemp, setShowMinTemp] = useState(false);
    const [showMaxTemp, setShowMaxTemp] = useState(false);
    const [showGemTemp, setShowGemTemp] = useState(false);
    const errRef = useRef();
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [tempGraphData, setTempGraphData] = useState([]);
    const [humGraphData, setHumGraphData] = useState([]);
    const [stofGraphData, setStofGraphData] = useState([]);
    const [selectedGraph, setSelectedGraph] = useState('tempGraph');

    useEffect(() => {
        if (selectedStation === null) return;

        setLoading(true);

        function formatDate(date) {
            const padZero = (num) => num.toString().padStart(2, '0');
            return `${padZero(date.getDate())}-${padZero(date.getMonth() + 1)}-${date.getFullYear()} ${padZero(date.getHours())}:${padZero(date.getMinutes())}`;
        }

        backendApi.get(`/measurement/history/average/${selectedStation}`, {
            params: {
                startDate: formatDate(startDate),
                endDate: formatDate(endDate)
            }
        }).then((response) => {
            setTempGraphData(response.data.map(m => ({ timestamp: m.timestamp, avg: m.avgTemp, min: m.minTemp, max: m.maxTemp })));
            setHumGraphData(response.data.map(m => ({ timestamp: m.timestamp, avg: m.avgHum, min: m.minHum, max: m.maxHum })));
            setStofGraphData(response.data.map(m => ({ timestamp: m.timestamp, avg: m.avgStof, min: m.minStof, max: m.maxStof })));
            setLoading(false);
        }).catch(handleError);
    }, [selectedStation, startDate, endDate]);

    function handleError() {
        setErrorMessage('Het ophalen van de gegevens is mislukt');
        setLoading(false);
    }

    const handleClick = (e) => {
        if (startDate.getTime() === endDate.getTime()) {
            let date = startDate;
            date.setMonth(date.getMonth() - 1);
            setStartDate(date);
        }
        setSelectedStation(e.target.options.id);
    };

    const handleGraphChange = (event) => {
        setSelectedGraph(event.target.value);
    };

    const [hoveredStationId, setHoveredStationId] = useState(null);

    // Marker Icons
    const blueMarkerIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [0, -45],
        shadowUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
        shadowSize: [60, 60],
        shadowAnchor: [20, 60]
    });

    const greenMarkerIcon = new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        tooltipAnchor: [0, -45],
        shadowUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-shadow.png',
        shadowSize: [60, 60],
        shadowAnchor: [20, 60]
    });

    const graphData = selectedGraph === 'tempGraph' ? tempGraphData : selectedGraph === 'humGraph' ? humGraphData : stofGraphData;

    if (!visible) return null;

    return (
        <>
            {stations.map(station => (
                <Marker 
                    key={station.stationid} 
                    id={station.stationid} 
                    position={[station.latitude, station.longitude]} 
                    icon={String(station.userid) === String(userId) ? greenMarkerIcon : blueMarkerIcon}
                    eventHandlers={{ 
                        click: handleClick,
                        mouseover: () => setHoveredStationId(station.stationid),
                        mouseout: () => setHoveredStationId(null),
                    }}
                >
                    {hoveredStationId === station.stationid && (
                        <Tooltip direction="top" opacity={1} permanent className="custom-tooltip">
                            <span>📍 {station.name && station.name.trim() !== "" ? station.name : `Station ${station.stationid}`}</span>
                        </Tooltip>
                    )}

                    <Popup closeOnClick={false}>
                        <h4>{station.name || `Station ${station.stationid}`}</h4>

                        {station.measurementDtoList && station.measurementDtoList.length > 0 ? (

                            <ul>
                                {station.measurementDtoList.map((measurement, index) => (
                                    <li key={index}>
                                        Temp: {roundToOneDecimal(measurement.temperature)}°C | 
                                        Humidity: {roundToOneDecimal(measurement.humidity)}%
                                    </li>
                                ))}
                            </ul>
                        ) : (
                            <p>Geen metingen beschikbaar</p>
                        )}

                        <label className="fst-italic mt-1">Meting van: {selectedDate.toLocaleString('nl-NL')}</label>

                        <hr />

                        <label className="bold mt-2">Historische data</label>

                        {errorMessage && <p className={'text-danger'} ref={errRef} aria-live="assertive">{errorMessage}</p>}

                        {/* Dropdown for graph selection */}
                        <select className="form-select mb-2" value={selectedGraph} onChange={handleGraphChange}>
                            <option value="tempGraph">Temperatuur</option>
                            <option value="humGraph">Vochtigheid</option>
                            <option value="stofGraph">Fijnstof</option>
                        </select>

                        <div className="position-relative">
                            {loading && <LoadingComponent message="Data aan het ophalen..." isFullScreen={false} />}
                        </div>

                        <ResponsiveContainer minWidth={250} minHeight={250}>
                            <LineChart data={graphData}>
                                <XAxis dataKey="timestamp" />
                                <YAxis width={30} />
                                <CartesianGrid stroke="#ccc" />
                                <Legend />
                                <Line type="monotone" dataKey="min" name="Min" stroke="#0000ff" hide={showMinTemp} dot={false} />
                                <Line type="monotone" dataKey="max" name="Max" stroke="#ff0000" hide={showMaxTemp} dot={false} />
                                <Line type="monotone" dataKey="avg" name="Gemiddeld" stroke="#00ee00" hide={showGemTemp} dot={false} />
                            </LineChart>
                        </ResponsiveContainer>
                    </Popup>
                </Marker>
            ))}
        </>
    );
}

MeetStationLayer.propTypes = {
    stations: PropTypes.array.isRequired,
    visible: PropTypes.bool.isRequired,
    selectedDate: PropTypes.instanceOf(Date).isRequired,
    userId: PropTypes.string.isRequired,
};

export default MeetStationLayer;
