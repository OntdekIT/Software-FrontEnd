import { Marker, Popup } from "react-leaflet";
import { RoundToOneDecimal } from "../Lib/Utility";
import { api } from "../App";
import { useEffect, useRef, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import ReactDatePicker from "react-datepicker";

import "react-datepicker/dist/react-datepicker.css";
import "../index.css";
import Loading from "./Loading";

const MeetStationLayer = ({ data, visible, selectedDate }) => {
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
            const year = date.getFullYear();
            const month = padZero(date.getMonth() + 1);
            const day = padZero(date.getDate());
            const hours = padZero(date.getHours());
            const minutes = padZero(date.getMinutes());

            return `${day}-${month}-${year} ${hours}:${minutes}`;
        }

        api.get("/measurement/history/average/" + selectedStation, {
            params: {
                startDate: formatDate(startDate),
                endDate: formatDate(endDate)
            }
        }).then((response) => {
            const tempData = response.data.map((meting) => ({
                timestamp: meting.timestamp,
                avg: meting.avgTemp,
                min: meting.minTemp,
                max: meting.maxTemp
            }));
            setTempGraphData(tempData);
            const humData = response.data.map((meting) => ({
                timestamp: meting.timestamp,
                avg: meting.avgHum,
                min: meting.minHum,
                max: meting.maxHum
            }));
            setHumGraphData(humData);
            const stofData = response.data.map((meting) => ({
                timestamp: meting.timestamp,
                avg: meting.avgStof,
                min: meting.minStof,
                max: meting.maxStof
            }))
            setStofGraphData(stofData);
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
    }

    const handleLegendChange = (e) => {
        if (e.dataKey === "minTemp")
            setShowMinTemp(!showMinTemp);
        if (e.dataKey === "maxTemp")
            setShowMaxTemp(!showMaxTemp);
        if (e.dataKey === "avgTemp")
            setShowGemTemp(!showGemTemp);
    }

    const handleStartDateChange = (date) => {
        if (date.getDate() === endDate.getDate()) {
            date.setDate(date.getDate() - 1)
        }
        setStartDate(date);
    }

    const handleEndDateChange = (date) => {
        if (date.getDate() === startDate.getDate()) {
            date.setDate(date.getDate() + 1)
        }
        setEndDate(date);
    }

    const handleGraphChange = (event) => {
        setSelectedGraph(event.target.value);
    };

    const graphData = selectedGraph === 'tempGraph' ? tempGraphData : selectedGraph === 'humGraph' ? humGraphData : stofGraphData;

    if (!visible) return (<></>);

    return (
        <>
            {data.map((meting) => (
                <Marker key={meting.id} id={meting.id} position={[meting.latitude, meting.longitude]} eventHandlers={{ click: handleClick }}>
                    <Popup closeOnClick={false}>
                        <label className="bold d-block fs-6">Station ID: {meting.id}</label>

                        <div key={meting.id}>
                            <label>{meting.temperature ? "Temperatuur: " + RoundToOneDecimal(meting.temperature) + " °C" : ''}</label>
                            <br/>
                            <label>{meting.humidity ? "Luchtvochtigheid: " + RoundToOneDecimal(meting.humidity) + " %" : ''}</label>
                        </div>

                        <label className="fst-italic mt-1">Meting van: {selectedDate.toLocaleString('nl-NL')}</label>

                        <hr></hr>

                        <label className="bold mt-2">Historische data</label>

                        {
                            errorMessage && (
                                <div>
                                    <p className={'text-danger'} ref={errRef} aria-live="assertive">{errorMessage}</p>
                                </div>
                            )
                        }

                        {/* Dropdown for graph selection */}
                        <div className="mb-3">
                            <label htmlFor={`graphType-${meting.id}`} className="form-label">Kies het type
                                grafiek</label>
                            <select id={`graphType-${meting.id}`} className="form-select" value={selectedGraph}
                                    onChange={handleGraphChange}>
                                <option value="tempGraph">Temperatuur</option>
                                <option value="humGraph">Vochtigheid</option>
                                <option value="stofGraph">Fijnstof</option>
                            </select>
                        </div>
                        <div className="position-relative">
                            {loading && (
                                <Loading></Loading>
                            )}
                        </div>
                        <ResponsiveContainer minWidth={250} minHeight={250}>
                            <LineChart data={graphData}>
                                <XAxis dataKey="timestamp"/>
                                <YAxis width={30}/>
                                <CartesianGrid stroke="#ccc"/>
                                <Legend onClick={handleLegendChange}/>
                                <Line type="monotone" dataKey="min" name="Min" stroke="#0000ff" hide={showMinTemp}
                                      dot={false}/>
                                <Line type="monotone" dataKey="max" name="Max" stroke="#ff0000" hide={showMaxTemp}
                                      dot={false}/>
                                <Line type="monotone" dataKey="avg" name="Gemiddeld" stroke="#00ee00" hide={showGemTemp}
                                      dot={false}/>
                            </LineChart>
                        </ResponsiveContainer>

                        <div className="container text-center">
                            <div className="row gy-2">
                                <div className="col">
                                    <label className="me-2">Start datum</label>
                                    <ReactDatePicker
                                        className="border border-secondary"
                                        dateFormat="dd-MM-yyyy"
                                        selected={startDate}
                                        onChange={handleStartDateChange}
                                        maxDate={endDate}
                                    />
                                </div>
                                <div className="col">
                                    <label className="me-2">Eind datum</label>
                                    <ReactDatePicker
                                        className="border border-secondary"
                                        dateFormat="dd-MM-yyyy"
                                        selected={endDate}
                                        onChange={handleEndDateChange}
                                        minDate={startDate}
                                        maxDate={new Date()}
                                    />
                                </div>
                            </div>
                        </div>
                    </Popup>
                </Marker>
            ))}
        </>
    );
}

export default MeetStationLayer;
