import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {backendApi} from "../../utils/backend-api.jsx";
import {CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis} from "recharts";
import {Spinner} from "../ui/Preloader.jsx";
import Button from "../ui/Button.jsx";
import ReactDatePicker from "react-datepicker";
import PropTypes from "prop-types";

export default function StationCard({station}) {
//use states for what to show and what not to show
    const [endDate, setEndDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date());
    const [selectedStation] = useState(station.stationid);
    const [showMinTemp, setShowMinTemp] = useState(false);
    const [showMaxTemp, setShowMaxTemp] = useState(false);
    const [showGemTemp, setShowGemTemp] = useState(false);
    const [, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    //data to be shown
    const [tempGraphData, setTempGraphData] = useState([]);
    const [humGraphData, setHumGraphData] = useState([]);
    const [stofGraphData, setStofGraphData] = useState([]);
    const [combinedGraphData, setCombinedGraphData] = useState([]); // New state for combined
    const [graphVisible, setGraphVisible] = useState(true);
    const [selectedGraph, setSelectedGraph] = useState('combinedGraph'); // Default to combined
    const dateTime = new Date();

    useEffect(() => {
        function formatDate(date) {
            const padZero = (num) => num.toString().padStart(2, '0');
            const year = date.getFullYear();
            const month = padZero(date.getMonth() + 1);
            const day = padZero(date.getDate());
            const hours = padZero(date.getHours());
            const minutes = padZero(date.getMinutes());

            return `${day}-${month}-${year} ${hours}:${minutes}`;
        }

        const fetchHistoryData = () => {
            setLoading(true);

            const currentStartDate = new Date(startDate);
            currentStartDate.setHours(0, 0, 0, 0);

            const currentEndDate = new Date(endDate);
            currentEndDate.setHours(23, 59, 59, 999);

            backendApi.get("/measurement/history/average/" + selectedStation, {
                params: {
                    startDate: formatDate(currentStartDate),
                    endDate: formatDate(currentEndDate)
                }
            }).then((response) => {
                const combinedData = response.data.map((meting) => ({
                    timestamp: meting.timestamp,
                    temp: meting.avgTemp,
                    stof: meting.avgStof
                }));
                setCombinedGraphData(combinedData);

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
        };

        fetchHistoryData();

        let interval;
        const today = new Date();
        if (endDate.getDate() === today.getDate() &&
            endDate.getMonth() === today.getMonth() &&
            endDate.getFullYear() === today.getFullYear()) {
            interval = setInterval(() => {
                fetchHistoryData();
            }, 1000 * 60 * 60); // every hour
        }

        if (station.isActive === false) {
            setGraphVisible(false);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [selectedStation, station.isActive, startDate, endDate]);

    function handleError() {
        setErrorMessage('Het ophalen van de gegevens is mislukt');
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

    const graphData =
        selectedGraph === 'tempGraph' ? tempGraphData :
        selectedGraph === 'humGraph' ? humGraphData :
        selectedGraph === 'stofGraph' ? stofGraphData : [];

    return (
        <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
            <div className="flex items-center border-b border-gray-200 px-4 py-3">
                <h4 className="flex flex-grow items-center gap-2 text-lg font-semibold text-gray-800">
                    <i className="bi bi-broadcast text-brand-500"></i>{station.name}: {station.stationid}
                </h4>
                <Link to={`/stations/${station.stationid}`} aria-label="Station details" className="ml-2">
                    <Button variant="outline" size="sm"><i className="bi bi-info-circle"></i></Button>
                </Link>
                <Link to={`/stations/${station.stationid}/edit`} aria-label="Station bewerken" className="ml-2">
                    <Button variant="outline" size="sm"><i className="bi bi-pencil"></i></Button>
                </Link>
            </div>
            <div className="p-4">
                <div className="p-0">
                <div key={station.stationid} style={{ padding: "5%" }}>
                {station.locError === true ? (
                station.isActive === true ? (
                    <div className="flex justify-center">
                        <span className="warning-text">
                            ⚠️ LET OP: De locatie wordt niet meer gemeten!
                        </span>
                    </div>
                ) : null
                ) : (
                <>
                    {!station.is_public && (
                    <div className="text-sm text-gray-500">
                        Het station is onzichtbaar, maar de data wordt gebruikt binnen de metingen van een wijk.
                    </div>
                    )}
                    {station.is_public && (
                    <div className="text-sm text-gray-500">
                        Het station is zichtbaar en kan door iedereen bekeken worden.
                    </div>
                    )}
                </>
                )}

                </div>



                    {station.isActive === true ? (
                        <div className="flex cursor-pointer justify-center" onClick={toggleGraphVisibility}>
                            {/* Toggle button */}
                            {graphVisible ? <span>&#x25B2;</span> : <span>&#x25BC;</span>}
                        </div>
                    ) : (
                        <div className="flex justify-center">
                            <span className="warning-text">
                                ⚠️ LET OP: Dit station is inactief!
                            </span>
                        </div>

                    )}

                    
                    

                    {graphVisible && (
                        <div>
                            <hr style={{margin: "0"}}></hr>
                            <label className="mt-1 block italic">Meting
                                van: {dateTime.toLocaleString('nl-NL')}</label>
                            <label className="mt-2 block font-bold">Historische data</label>

                            {/* Dropdown for graph selection */}
                            <div className="mb-3">
                                <label htmlFor="graphType" className="mb-1 block text-sm font-medium text-gray-700">Kies het type grafiek</label>
                                <select id="graphType" className="w-full rounded border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500" value={selectedGraph}
                                        onChange={handleGraphChange}>
                                    <option value="combinedGraph">Gecombineerd (Temp & Fijnstof)</option>
                                    <option value="tempGraph">Temperatuur</option>
                                    <option value="humGraph">Vochtigheid</option>
                                    <option value="stofGraph">FijnStof</option>
                                </select>
                            </div>
                            {loading && (
                                <div className="flex items-center justify-center gap-2 py-2 text-sm text-gray-500">
                                    <Spinner className="h-5 w-5 text-brand-500" />
                                    Data aan het ophalen...
                                </div>
                            )}
                            {(() => {
                                switch (selectedGraph) {
                                    case "tempGraph":
                                        return station.tempError ? (
                                            <div className="flex justify-center">
                                                <span className="warning-text">
                                                    ⚠️ LET OP: De temperatuur wordt niet meer gemeten!
                                                </span>
                                            </div>
                                        ) : null;
                                    case "humGraph":
                                        return station.humError ? (
                                            <div className="flex justify-center">
                                                <span className="warning-text">
                                                    ⚠️ LET OP: De luchtvochtigheid wordt niet meer gemeten!
                                                </span>
                                            </div>
                                        ) : null;
                                    case "stofGraph":
                                        return station.stofError ? (
                                            <div className="flex justify-center">
                                                <span className="warning-text">
                                                    ⚠️ LET OP: De Fijnstof wordt niet meer gemeten!
                                                </span>
                                            </div>
                                        ) : null;
                                    case "combinedGraph":
                                        return (station.tempError || station.stofError) ? (
                                            <div className="flex justify-center">
                                                <span className="warning-text">
                                                    ⚠️ LET OP: Niet alle data is beschikbaar!
                                                </span>
                                            </div>
                                        ) : null;
                                    default:
                                        return null;
                                }
                            })()}

                            {selectedGraph === 'combinedGraph' ? (
                                <ResponsiveContainer minWidth={250} minHeight={250}>
                                    <LineChart key={station.stationid} data={combinedGraphData}>
                                        <XAxis dataKey="timestamp" />
                                        <YAxis yAxisId="left" orientation="left" stroke="#ff0000" />
                                        <YAxis yAxisId="right" orientation="right" stroke="#8884d8" />
                                        <CartesianGrid stroke="#ccc" />
                                        <Legend />
                                        <Line yAxisId="left" type="monotone" dataKey="temp" name="Temperatuur" stroke="#ff0000" dot={false} />
                                        <Line yAxisId="right" type="monotone" dataKey="stof" name="Fijnstof" stroke="#8884d8" dot={false} />
                                    </LineChart>
                                </ResponsiveContainer>
                            ) : (
                                <ResponsiveContainer minWidth={250} minHeight={250}>
                                    <LineChart key={station.stationid + selectedGraph} data={graphData}>
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
                            )}

                            <div className="mt-3 text-center">
                                <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
                                    <div>
                                        <label className="block">Startdatum</label>
                                        <ReactDatePicker
                                            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                            dateFormat="dd-MM-yyyy"
                                            selected={startDate}
                                            onChange={handleStartDateChange}
                                            maxDate={endDate}
                                            showMonthYearDropdown={true}/>
                                    </div>
                                    <div>
                                        <label className="block">Einddatum</label>
                                        <ReactDatePicker
                                            className="w-full rounded border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
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