import { Marker, Popup } from "react-leaflet";
import { RoundToOneDecimal } from "../Lib/Utility";
import { api } from "../App";
import React, { useEffect, useRef, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { useNavigate } from "react-router-dom";
import Loading from "./Loading"; // Import useNavigate

const MeetStationView = ({ meetstation }) => {
    //use states for what to show and what not to show
    const [endDate, setEndDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date());
    const [selectedStation, setSelectedStation] = useState(meetstation.stationid);
    const [showMinTemp, setShowMinTemp] = useState(false);
    const [showMaxTemp, setShowMaxTemp] = useState(false);
    const [showGemTemp, setShowGemTemp] = useState(false);
    const errRef = useRef();
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    //data to be shown
    const [tempGraphData, setTempGraphData] = useState([]);
    const [humGraphData, setHumGraphData] = useState([]);
    const [stofGraphData, setStofGraphData] = useState([]);
    const [graphVisible, setGraphVisible] = useState(true);
    const [selectedGraph, setSelectedGraph] = useState('tempGraph'); // New state for selected graph type
    const EditIcon =  process.env.PUBLIC_URL + '/editButton.ico';
    const infoIcon =  process.env.PUBLIC_URL + '/infoButton.ico';
    const dateTime = new Date();
    const navigate = useNavigate(); // Initialize useNavigate

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

        if (startDate.getTime() === endDate.getTime()) {
            let date = startDate;
            date.setMonth(date.getMonth() - 1);
            setStartDate(date);
        }

        setLoading(true);

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

    const handleEditClick = () => {
        navigate(`/Station/Edit?id=${meetstation.stationid}`);
    }

    const handleInfoClick = () => {
        navigate(`/Station/Info?id=${meetstation.stationid}`);
    }

    const toggleGraphVisibility = () => {
        setGraphVisible(!graphVisible);
    };

    const handleGraphChange = (event) => {
        setSelectedGraph(event.target.value);
    };

    const graphData = selectedGraph === 'tempGraph' ? tempGraphData : selectedGraph === 'humGraph' ? humGraphData : stofGraphData;

    return (
        <>
            <div className="border bg-light position-relative rounded" style={{minWidth: "150px"}}>
                <div className="row align-items-center" style={{backgroundColor: "#e9ecef", margin: "0", padding: "10px", borderTopLeftRadius: "0.375rem", borderTopRightRadius: "0.375rem"}}>
                    <div className="col">
                        <label className="bold fs-6">{meetstation.name}: {meetstation.stationid}</label>
                    </div>
                    <div className="col-auto">
                        <img
                            src={infoIcon}
                            alt="Info"
                            className="custom-icon"
                            style={{
                                width: "30px",
                                height: "30px",
                                transition: "transform 0.3s",
                                cursor: "pointer",
                                position: "relative"
                            }}
                            onClick={handleInfoClick}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = "scale(1.1)";
                                document.body.style.cursor = "pointer";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                document.body.style.cursor = "auto";
                            }}
                            title="Meer informatie over dit meetstation" // Tooltip text
                        />
                    </div>
                    <div className="col-auto">
                        <img
                            src={EditIcon}
                            alt="Edit"
                            className="custom-icon"
                            style={{
                                width: "30px",
                                height: "30px",
                                transition: "transform 0.3s",
                                cursor: "pointer",
                                position: "relative"
                            }}
                            onClick={handleEditClick}
                            onMouseOver={(e) => {
                                e.currentTarget.style.transform = "scale(1.1)";
                                document.body.style.cursor = "pointer";
                            }}
                            onMouseOut={(e) => {
                                e.currentTarget.style.transform = "scale(1)";
                                document.body.style.cursor = "auto";
                            }}
                            title="Dit meetstation bewerken" // Tooltip text
                        />
                    </div>
                </div>

                <div className="p-0">
                    <div key={meetstation.stationid} style={{padding: "5%"}}>
                        {meetstation.is_public === false && (
                            <div className={"form-text"}>Het station is onzichtbaar, maar de data wordt gebruikt binnen
                                de metingen van een wijk.</div>
                        )}
                        {meetstation.is_public === true && (
                            <div className={"form-text"}>Het station is zichtbaar en kan door iedereen bekeken
                                worden.</div>
                        )}
                    </div>

                    <hr style={{margin: "0"}}></hr>

                    <div className="d-flex justify-content-center" onClick={toggleGraphVisibility}
                         style={{cursor: 'pointer'}}>
                        {/* Toggle button */}
                        {graphVisible ? <span>&#x25B2;</span> : <span>&#x25BC;</span>}
                    </div>

                    {graphVisible && (
                        <div style={{padding: "5%", paddingTop: "0"}}>
                            <label className="fst-italic mt-1">Meting van: {dateTime.toLocaleString('nl-NL')}</label>
                            <br></br>
                            <label className="bold mt-2">Historische data</label>

                            {/* Dropdown for graph selection */}
                            <div className="mb-3">
                                <label htmlFor="graphType" className="form-label">Kies het type grafiek</label>
                                <select id="graphType" className="form-select" value={selectedGraph}
                                        onChange={handleGraphChange}>
                                    <option value="tempGraph">Temperatuur</option>
                                    <option value="humGraph">Vochtigheid</option>
                                    <option value="stofGraph">FijnStof</option>
                                </select>
                            </div>
                            <div className="position-relative">
                                {loading && (
                                    <Loading></Loading>
                                )}
                            </div>
                            <ResponsiveContainer minWidth={250} minHeight={250}>
                                <LineChart key={meetstation.stationid} data={graphData}>
                                    <XAxis dataKey="timestamp"/>
                                    <YAxis width={30}/>
                                    <CartesianGrid stroke="#ccc"/>
                                    <Legend onClick={handleLegendChange}/>
                                    <Line type="monotone" dataKey="min" name="Min" stroke="#0000ff"
                                          hide={showMinTemp}
                                          dot={false}/>
                                    <Line type="monotone" dataKey="max" name="Max" stroke="#ff0000"
                                          hide={showMaxTemp}
                                          dot={false}/>
                                    <Line type="monotone" dataKey="avg" name="Gemiddeld" stroke="#00ee00"
                                          hide={showGemTemp}
                                          dot={false}/>
                                </LineChart>
                            </ResponsiveContainer>
                            <div className="container text-center">
                                <div className="row gy-2">
                                    <div className="col-12 col-md-6">
                                        <label className="me-2">Start datum</label>
                                        <ReactDatePicker
                                            className="border border-secondary"
                                            dateFormat="dd-MM-yyyy"
                                            selected={startDate}
                                            onChange={handleStartDateChange}
                                            maxDate={endDate}
                                        />
                                    </div>
                                    <div className="col-12 col-md-6">
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
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}

export default MeetStationView;
