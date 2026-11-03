import {useEffect, useState} from "react";
import {Link} from "react-router-dom";
import {backendApi} from "../../utils/backend-api.jsx";
import {Spinner} from "../ui/Preloader.jsx";
import Button from "../ui/Button.jsx";
import ReactDatePicker from "react-datepicker";
import PropTypes from "prop-types";
import ZoomableChart from "../charts/ZoomableChart";
import {useChartZoom} from "../charts/UseChartZoom";

const DAY = 24 * 60 * 60 * 1000;

const SINGLE_LINES = [
    {key: "min", name: "Min", color: "#0000ff"},
    {key: "max", name: "Max", color: "#ff0000"},
    {key: "avg", name: "Gemiddeld", color: "#00ee00"},
];

const COMBINED_LINES = [
    {key: "temp", name: "Temperatuur", color: "#ff0000", yAxisId: "left"},
    {key: "stof", name: "Fijnstof", color: "#8884d8", yAxisId: "right"},
];

const COMBINED_AXES = [
    {id: "left", orientation: "left", stroke: "#ff0000"},
    {id: "right", orientation: "right", stroke: "#8884d8"},
];

export default function StationCard({station}) {
    const [endDate, setEndDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date());
    // Geen useState meer: zo volgt hij het station als je van station wisselt.
    const selectedStation = station.stationid;
    const [, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [tempGraphData, setTempGraphData] = useState([]);
    const [humGraphData, setHumGraphData] = useState([]);
    const [stofGraphData, setStofGraphData] = useState([]);
    const [combinedGraphData, setCombinedGraphData] = useState([]);
    const [graphVisible, setGraphVisible] = useState(true);
    const [selectedGraph, setSelectedGraph] = useState('combinedGraph');
    const zoom = useChartZoom();
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
                setCombinedGraphData(response.data.map((meting) => ({
                    timestamp: meting.timestamp,
                    temp: meting.avgTemp,
                    stof: meting.avgStof
                })));

                setTempGraphData(response.data.map((meting) => ({
                    timestamp: meting.timestamp,
                    avg: meting.avgTemp,
                    min: meting.minTemp,
                    max: meting.maxTemp
                })));

                setHumGraphData(response.data.map((meting) => ({
                    timestamp: meting.timestamp,
                    avg: meting.avgHum,
                    min: meting.minHum,
                    max: meting.maxHum
                })));

                setStofGraphData(response.data.map((meting) => ({
                    timestamp: meting.timestamp,
                    avg: meting.avgStof,
                    min: meting.minStof,
                    max: meting.maxStof
                })));

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
            }, 1000 * 60 * 60);
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
        setLoading(false);
    }

    // Vaste periode: dag / week / maand
    const setPeriod = (days) => {
        const end = new Date();
        const start = new Date(end.getTime() - days * DAY);
        setStartDate(start);
        setEndDate(end);
        zoom.clearRange();
    };

    const handleStartDateChange = (date) => {
        if (date.getDate() === endDate.getDate()) {
            date.setDate(date.getDate() - 1)
        }
        setStartDate(date);
        zoom.clearRange();
    }
    const handleEndDateChange = (date) => {
        if (date.getDate() === startDate.getDate()) {
            date.setDate(date.getDate() + 1)
        }
        setEndDate(date);
        zoom.clearRange();
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
            <div className="space-y-4 p-4">
                <div>
                    {station.locError === true ? (
                        station.isActive === true ? (
                            <div className="flex justify-center">
                                <span className="warning-text">
                                    ⚠️ LET OP: De locatie wordt niet meer gemeten!
                                </span>
                            </div>
                        ) : null
                    ) : (
                        <div className="text-sm text-gray-500">
                            {station.is_public
                                ? "Het station is zichtbaar en kan door iedereen bekeken worden."
                                : "Het station is onzichtbaar, maar de data wordt gebruikt binnen de metingen van een wijk."}
                        </div>
                    )}
                </div>

                {station.isActive === true ? (
                    <div className="flex cursor-pointer justify-center text-gray-500 hover:text-brand-500" onClick={toggleGraphVisibility}>
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
                    <div className="space-y-3 border-t border-gray-200 pt-4">
                        <label className="block text-sm italic text-gray-500">Meting
                            van: {dateTime.toLocaleString('nl-NL')}</label>
                        <label className="block font-semibold text-gray-800">Historische data</label>

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

                        {/* Vaste periodes */}
                        <div className="flex gap-2">
                            <Button variant="outline" size="sm" onClick={() => setPeriod(1)}>Dag</Button>
                            <Button variant="outline" size="sm" onClick={() => setPeriod(7)}>Week</Button>
                            <Button variant="outline" size="sm" onClick={() => setPeriod(30)}>Maand</Button>
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
                            <ZoomableChart
                                data={combinedGraphData}
                                lines={COMBINED_LINES}
                                yAxes={COMBINED_AXES}
                                zoom={zoom}
                            />
                        ) : (
                            <ZoomableChart
                                data={graphData}
                                lines={SINGLE_LINES}
                                zoom={zoom}
                            />
                        )}

                        {/* Eigen bereik */}
                        <div className="mt-3">
                            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Startdatum</label>
                                    <ReactDatePicker
                                        className="w-full rounded border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500"
                                        dateFormat="dd-MM-yyyy"
                                        selected={startDate}
                                        onChange={handleStartDateChange}
                                        maxDate={endDate}
                                        showMonthYearDropdown={true}/>
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium text-gray-700">Einddatum</label>
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
    );
}

StationCard.propTypes = {
    station: PropTypes.object.isRequired
};