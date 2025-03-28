import {useEffect, useRef, useState} from "react";
import {Link, useNavigate} from "react-router-dom";
import {backendApi} from "../../utils/backend-api.jsx";
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis} from "recharts";
import LoadingComponent from "../loading-component.jsx";
import ReactDatePicker from "react-datepicker";
import PropTypes from "prop-types";

export default function StationCard({station}) {
//use states for what to show and what not to show
    const [endDate, setEndDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date());
    const [selectedStation, setSelectedStation] = useState(station.stationid);
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
    const dateTime = new Date();

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

        backendApi.get("/measurement/history/average/" + selectedStation, {
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
            console.log(station);
        }).catch(handleError);

        if (station.isActive === false) {
            setGraphVisible(false);
          }
    }, [selectedStation, startDate, endDate, station.isActive, station.tempError, station.humError, station.stofError, station.locError]);

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

    const toggleGraphVisibility = () => {
        setGraphVisible(!graphVisible);
    };

    const handleGraphChange = (event) => {
        setSelectedGraph(event.target.value);
    };

    const graphData = selectedGraph === 'tempGraph' ? tempGraphData : selectedGraph === 'humGraph' ? humGraphData : stofGraphData;

    return (
        <div className="card">
            <div className="card-header d-flex align-items-center">
                <h4 className="card-title flex-grow-1">{station.name}: {station.stationid}</h4>
                <Link to={`/stations/${station.stationid}`} className="btn btn-outline-dark btn-sm ms-2"><i
                    className="bi bi-info"></i></Link>
                <Link to={`/stations/${station.stationid}/edit`} className="btn btn-outline-dark btn-sm ms-2"><i
                    className="bi bi-pencil"></i></Link>
            </div>
            <div className="card-body">
                <div className="p-0">
                <div key={station.stationid} style={{ padding: "5%" }}>
                {station.locError === true ? (
                station.isActive === true ? (
                    <div className="d-flex justify-content-center">
                        <span className="warning-text">
                            ⚠️ LET OP: De locatie wordt niet meer gemeten!
                        </span>
                    </div>
                ) : null
                ) : (
                <>
                    {!station.is_public && (
                    <div className="form-text">
                        Het station is onzichtbaar, maar de data wordt gebruikt binnen de metingen van een wijk.
                    </div>
                    )}
                    {station.is_public && (
                    <div className="form-text">
                        Het station is zichtbaar en kan door iedereen bekeken worden.
                    </div>
                    )}
                </>
                )}

                </div>

                    
                    
                    {station.isActive === true ? (
                        <div className="d-flex justify-content-center" onClick={toggleGraphVisibility} style={{cursor: 'pointer'}}>
                            {/* Toggle button */}
                            {graphVisible ? <span>&#x25B2;</span> : <span>&#x25BC;</span>}
                        </div>
                    ) : (
                        <div className="d-flex justify-content-center">
                            <span className="warning-text">
                                ⚠️ LET OP: Dit station is inactief!
                            </span>
                        </div>
                        
                    )}

                    
                    

                    {graphVisible && (
                        <div>
                            <hr style={{margin: "0"}}></hr>
                            <label className="fst-italic mt-1">Meting
                                van: {dateTime.toLocaleString('nl-NL')}</label>
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
                                    <LoadingComponent message="Data aan het ophalen..."
                                                      isFullScreen={false}></LoadingComponent>
                                )}
                            </div>
                            {(() => {
                                switch (selectedGraph) {
                                    case "tempGraph":
                                        return station.tempError ? (
                                            <div className="d-flex justify-content-center">
                                                <span className="warning-text">
                                                    ⚠️ LET OP: De temperatuur wordt niet meer gemeten!
                                                </span>
                                            </div>
                                        ) : null;
                                    case "humGraph":
                                        return station.humError ? (
                                            <div className="d-flex justify-content-center">
                                                <span className="warning-text">
                                                    ⚠️ LET OP: De luchtvochtigheid wordt niet meer gemeten!
                                                </span>
                                            </div>
                                        ) : null;
                                    case "stofGraph":
                                        return station.stofError ? (
                                            <div className="d-flex justify-content-center">
                                                <span className="warning-text">
                                                    ⚠️ LET OP: De Fijnstof wordt niet meer gemeten!
                                                </span>
                                            </div>
                                        ) : null;
                                    default:
                                        return null;
                                }
                            })()}
                            <ResponsiveContainer minWidth={250} minHeight={250}>
                                <LineChart key={station.stationid} data={graphData}>
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
                                        <label>Startdatum</label>
                                        <ReactDatePicker
                                            className="form-control"
                                            dateFormat="dd-MM-yyyy"
                                            selected={startDate}
                                            onChange={handleStartDateChange}
                                            maxDate={endDate}
                                            showMonthYearDropdown={true}/>
                                    </div>
                                    <div className="col-12 col-md-6">
                                        <label>Einddatum</label>
                                        <ReactDatePicker
                                            className="form-control"
                                            dateFormat="dd-MM-yyyy"
                                            selected={endDate}
                                            onChange={handleEndDateChange}
                                            minDate={startDate}
                                            maxDate={new Date()}
                                            showMonthYearDropdown={true}/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

StationCard.propTypes = {
    station: PropTypes.object.isRequired
};