import ReactDatePicker from "react-datepicker";
import {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {backendApi} from "../../utils/backend-api.jsx";
import Preloader from "../../components/ui/Preloader.jsx";
import Button from "../../components/ui/Button.jsx";
import GraphView from "../../components/stations/graph-view.jsx";

export default function StationDetails() {
    const {stationId} = useParams(); // Extract stationId from URL
    const [endDate, setEndDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date());
    const [startDatePDF, setStartDatePDF] = useState(new Date());
    const [meetstation, setMeetstation] = useState({});
    const [loading, setLoading] = useState(false); // whole-page Preloader state
    // data to be shown
    const [tempGraphData, setTempGraphData] = useState([]);
    const [humGraphData, setHumGraphData] = useState([]);
    const [stofGraphData, setStofGraphData] = useState([]);


    useEffect(() => {
        const fetchStation = async () => {
            setLoading(true); // Start loading
            try {
                const response = await backendApi.get(`/Meetstation/${stationId}`, {
                    headers: {'Content-Type': 'application/json'},
                    withCredentials: false
                });

                setMeetstation(response.data);
                setLoading(false); // End loading
            } catch (err) {
                console.error("error: ", err);
                setLoading(false); // End loading
            }
        };

        if (stationId) {
            fetchStation();
        }
    }, [stationId]);

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
            date.setMonth(date.getMonth() - 6);
            setStartDate(date);
        }
        if (startDatePDF.getTime() === endDate.getTime()) {
            let date = startDatePDF;
            date.setMonth(date.getMonth() - 1);
            setStartDatePDF(date);
        }
        const fetchGraphData = async () => {
            setLoading(true); // Start loading
            try {
                const response = await backendApi.get("/measurement/history/average/" + meetstation.stationid, {
                    params: {
                        startDate: formatDate(startDate),
                        endDate: formatDate(endDate)
                    }
                });
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
                    min: meting.minStof
                }))
                setStofGraphData(stofData);
                setLoading(false); // End loading
            } catch (err) {
                console.error("error: ", err);
                setLoading(false); // End loading
            }
        };

        if (meetstation.stationid) {
            fetchGraphData();
        }
        // startDatePDF is normalised in-effect and also set here; adding it as a
        // dep would re-trigger the fetch/normalisation loop. Intentionally scoped
        // to the graph date range.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [meetstation, startDate, endDate]);

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
        let date2 = new Date(date);
        date2.setMonth(date2.getMonth() - 1);
        setStartDatePDF(date2);
    }

    if (loading) {
        return <Preloader message="Data aan het ophalen..." />;
    }

    const latest = (arr) => (arr.length ? arr[arr.length - 1].avg : null);
    const fmt = (v, unit) => (v == null || isNaN(v) ? "—" : `${Number(v).toFixed(1)} ${unit}`);
    const isActive = meetstation.isActive !== false;

    const summaryCards = [
        { label: "Temperatuur", value: fmt(latest(tempGraphData), "°C"), icon: "bi-thermometer-half", tint: "text-warning" },
        { label: "Luchtvochtigheid", value: fmt(latest(humGraphData), "%"), icon: "bi-droplet-half", tint: "text-info" },
        { label: "Fijnstof", value: fmt(latest(stofGraphData), "µg/m³"), icon: "bi-wind", tint: "text-secondary" },
    ];

    const graphs = [
        { data: tempGraphData, type: "temperatuur", title: "Temperatuur", icon: "bi-thermometer-half" },
        { data: humGraphData, type: "luchtvochtigheid", title: "Luchtvochtigheid", icon: "bi-droplet-half" },
        { data: stofGraphData, type: "fijnstof", title: "Fijnstof", icon: "bi-wind" },
    ];

    return (
        <div className="mx-auto max-w-5xl px-4 py-6">
            {/* Hero header */}
            <div className="mb-6 flex flex-col gap-4 rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <Link to="/stations" aria-label="Terug naar stations">
                        <Button variant="ghost" size="sm"><i className="bi bi-arrow-left" aria-hidden="true"></i></Button>
                    </Link>
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                        <i className="bi bi-geo-alt text-xl" aria-hidden="true"></i>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{meetstation.name || `Station ${meetstation.stationid}`}</h1>
                        <div className="mt-0.5 flex items-center gap-2 text-sm text-gray-500">
                            <span>Stationnummer {meetstation.stationid}</span>
                            <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${isActive ? "bg-success/10 text-success" : "bg-gray-100 text-gray-500"}`}>
                                <span className={`h-1.5 w-1.5 rounded-full ${isActive ? "bg-success" : "bg-gray-400"}`}></span>
                                {isActive ? "Actief" : "Inactief"}
                            </span>
                        </div>
                    </div>
                </div>
                <Link to={`/stations/${meetstation.stationid}/edit`} aria-label="Station bewerken">
                    <Button variant="outline" size="sm"><i className="bi bi-pencil" aria-hidden="true"></i> Bewerken</Button>
                </Link>
            </div>

            {meetstation.is_public === false && (
                <p className="mb-4 rounded-lg bg-gray-50 px-4 py-2 text-sm text-gray-500">
                    Dit station is onzichtbaar, maar de data wordt gebruikt binnen de metingen van een wijk.
                </p>
            )}

            {/* Summary stat cards */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {summaryCards.map((c) => (
                    <div key={c.label} className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <div className={`flex h-11 w-11 items-center justify-center rounded-lg bg-gray-50 ${c.tint}`}>
                            <i className={`bi ${c.icon} text-xl`} aria-hidden="true"></i>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">{c.label}</p>
                            <p className="text-lg font-semibold text-gray-900">{c.value}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Date range filter */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-end">
                    <div className="flex-1">
                        <label className="mb-1 block text-sm font-medium text-gray-700">Startdatum</label>
                        <ReactDatePicker
                            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            dateFormat="dd-MM-yyyy"
                            selected={startDate}
                            onChange={handleStartDateChange}
                            maxDate={endDate}
                            showMonthYearDropdown={true}/>
                    </div>
                    <div className="flex-1">
                        <label className="mb-1 block text-sm font-medium text-gray-700">Einddatum</label>
                        <ReactDatePicker
                            className="w-full rounded border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500"
                            dateFormat="dd-MM-yyyy"
                            selected={endDate}
                            onChange={handleEndDateChange}
                            minDate={startDate}
                            maxDate={new Date()}
                            showMonthYearDropdown={true}/>
                    </div>
                </div>
            </div>

            {/* Graphs, each in its own card */}
            <div className="space-y-6">
                {graphs.map((g) => (
                    <div key={g.type} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                        <h2 className="mb-3 flex items-center gap-2 font-semibold text-gray-800">
                            <i className={`bi ${g.icon} text-brand-500`} aria-hidden="true"></i>
                            {g.title}
                        </h2>
                        <GraphView graphData={g.data} dataType={g.type}></GraphView>
                    </div>
                ))}
            </div>
        </div>
    )
}