import { Polygon, Popup } from "react-leaflet";
import { RoundToOneDecimal } from "../Lib/Utility";
import { useEffect, useRef, useState } from "react";
import { api } from "../App";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import ReactDatePicker from "react-datepicker";
import { spectralColors } from '../Lib/Utility.js';

const RegionLayer = ({ data }) => {
    //use states for what to show and what not to show
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [selectedNeighbourhood, setSelectedNeighbourhood] = useState(null);
    const [showMinTemp, setShowMinTemp] = useState(false);
    const [showMaxTemp, setShowMaxTemp] = useState(false);
    const [showGemTemp, setShowGemTemp] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [tempGraphData, setTempGraphData] = useState([]);
    const [humGraphData, setHumGraphData] = useState([]);
    const [stofGraphData, setStofGraphData] = useState([]);
    const [selectedGraph, setSelectedGraph] = useState('tempGraph'); // New state for selected graph type

    const errRef = useRef();

    let mintemp = 1000;
    let maxtemp = -1000;
    let tempDif = 1;

    data.forEach((neighbourhood) => {
        if (!isNaN(neighbourhood.avgTemp)) {
            if (neighbourhood.avgTemp < mintemp) {
                mintemp = neighbourhood.avgTemp;
            }
            if (neighbourhood.avgTemp > maxtemp) {
                maxtemp = neighbourhood.avgTemp;
            }
        }
    });

    if (maxtemp - mintemp !== 0) {
        tempDif = maxtemp - mintemp;
    }

    function setRegionColour(value) {
        if (isNaN(value))
            return "rgb(136,136,136)";
        let contrastValue = (value - mintemp) / tempDif;
        let colorIndex = Math.round(contrastValue * (Object.keys(spectralColors).length - 1));
        return spectralColors[colorIndex];
    }

    useEffect(() => {
        function formatDate(date) {
            const padZero = (num) => num.toString().padStart(2, '0');
            const year = date.getFullYear();
            const month = padZero(date.getMonth() + 1); // Months are zero-indexed
            const day = padZero(date.getDate());
            const hours = padZero(date.getHours());
            const minutes = padZero(date.getMinutes());

            return `${day}-${month}-${year} ${hours}:${minutes}`;
        }

        if (selectedNeighbourhood === null)
            return;

        setLoading(true);

        api.get("/neighbourhood/history/average/" + selectedNeighbourhood, {
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
            }));
            setStofGraphData(stofData);
            setLoading(false);
        }).catch(handleError);
    }, [selectedNeighbourhood, startDate, endDate]);

    function handleError() {
        setErrorMessage("Het ophalen van de gegevens is mislukt");
    }

    const handleClick = (e) => {
        if (startDate.getTime() === endDate.getTime()) {
            let date = startDate;
            date.setMonth(date.getMonth() - 1);
            setStartDate(date);
        }

        setSelectedNeighbourhood(e.target.options.id);
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

    return (
        <>
            {
                data.map((neighbourhood) => (

                    <Polygon
                        positions={neighbourhood.coordinates}
                        key={neighbourhood.id}
                        id={neighbourhood.id}
                        pathOptions={{
                            color: setRegionColour(neighbourhood.avgTemp),
                            opacity: neighbourhood.avgTemp === "NaN" ? .4 : 1,
                            fillOpacity: neighbourhood.avgTemp === "NaN" ? .25 : .5
                        }}
                        eventHandlers={{ click: handleClick }}
                    >
                        <Popup>
                            <label className="bold">{neighbourhood.name}</label> <br />

                            <div>
                                <label>
                                    {neighbourhood.avgTemp !== "NaN" ? "Gemiddelde wijktemperatuur: " + RoundToOneDecimal(neighbourhood.avgTemp) + " °C" : "Geen data beschikbaar"}
                                </label>
                            </div>

                            <hr></hr>

                            <label className="bold mt-2">Historische data</label>

                            {
                                errorMessage && (
                                    <div>
                                        <p className={'text-danger m-0'} ref={errRef} aria-live="assertive">{errorMessage}</p>
                                    </div>
                                )
                            }

                            {
                                loading && (
                                    <div>
                                        <p className={'text-warning m-0'}>Data wordt opgehaald...</p>
                                    </div>
                                )
                            }

                            {/* Dropdown for graph selection */}
                            <div className="mb-3">
                                <label htmlFor={`graphType-${neighbourhood.id}`} className="form-label">Kies het type grafiek</label>
                                <select id={`graphType-${neighbourhood.id}`} className="form-select" value={selectedGraph} onChange={handleGraphChange}>
                                    <option value="tempGraph">Temperatuur</option>
                                    <option value="humGraph">Vochtigheid</option>
                                    <option value="stofGraph">Fijnstof</option>
                                </select>
                            </div>

                            <ResponsiveContainer minWidth={250} minHeight={250}>
                                <LineChart data={graphData}>
                                    <XAxis dataKey="timestamp" />
                                    <YAxis width={30} />
                                    <CartesianGrid stroke="#ccc" />
                                    <Legend onClick={handleLegendChange} />
                                    <Line type="monotone" dataKey="min" name="Min" stroke="#0000ff" hide={showMinTemp} dot={false} />
                                    <Line type="monotone" dataKey="max" name="Max" stroke="#ff0000" hide={showMaxTemp} dot={false} />
                                    <Line type="monotone" dataKey="avg" name="Gemiddeld" stroke="#00ee00" hide={showGemTemp} dot={false} />
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
                    </Polygon>
                ))
            }
        </>
    );
};

export default RegionLayer;
