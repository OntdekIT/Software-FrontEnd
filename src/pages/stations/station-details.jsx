import ReactDatePicker from "react-datepicker";
import {useEffect, useState} from "react";
import {Link, Outlet, useParams} from "react-router-dom";
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

    const fmt = (v, unit) => (v == null || isNaN(v) ? "—" : `${Number(v).toFixed(1)} ${unit}`);
    const isActive = meetstation.isActive !== false;

    // Period statistics over the selected date range: min/max/avg + a trend
    // computed by comparing the average of the first vs the second half.
    const computeStats = (arr) => {
        const avgs = arr.map((d) => Number(d.avg)).filter((n) => !isNaN(n));
        if (!avgs.length) return { min: null, max: null, avg: null, delta: null };
        const min = Math.min(...arr.map((d) => Number(d.min)).filter((n) => !isNaN(n)));
        const max = Math.max(...arr.map((d) => Number(d.max)).filter((n) => !isNaN(n)));
        const avg = avgs.reduce((a, b) => a + b, 0) / avgs.length;
        const mid = Math.floor(avgs.length / 2);
        let delta = null;
        if (avgs.length >= 2) {
            const firstHalf = avgs.slice(0, mid);
            const secondHalf = avgs.slice(mid);
            const mean = (xs) => xs.reduce((a, b) => a + b, 0) / xs.length;
            delta = mean(secondHalf) - mean(firstHalf);
        }
        return { min, max, avg, delta };
    };

    const metrics = [
        { key: "temp", label: "Temperatuur", unit: "°C", data: tempGraphData, icon: "bi-thermometer-half", tint: "text-warning" },
        { key: "hum", label: "Luchtvochtigheid", unit: "%", data: humGraphData, icon: "bi-droplet-half", tint: "text-info" },
        { key: "stof", label: "Fijnstof", unit: "µg/m³", data: stofGraphData, icon: "bi-wind", tint: "text-secondary" },
    ].map((m) => ({ ...m, stats: computeStats(m.data) }));

    // Quick-range selector: set start N days before end (= now).
    const setQuickRange = (days) => {
        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - days);
        setEndDate(end);
        setStartDate(start);
    };
    const rangeDays = Math.max(1, Math.round((endDate - startDate) / 86400000));

    // Export the selected period's measurements to CSV (replaces the dead PDF code).
    const exportCsv = () => {
        const rows = [["datum", "metric", "min", "max", "gemiddeld"]];
        metrics.forEach((m) => m.data.forEach((d) => {
            rows.push([d.timestamp, m.label, d.min, d.max, d.avg]);
        }));
        const csv = rows.map((r) => r.join(",")).join("\n");
        const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = `metingen-station-${meetstation.stationid}.csv`;
        link.click();
        URL.revokeObjectURL(url);
    };

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
                <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={exportCsv} aria-label="Exporteer metingen als CSV">
                        <i className="bi bi-download" aria-hidden="true"></i> CSV
                    </Button>
                    <Link to={`/stations/${meetstation.stationid}/edit`} aria-label="Station bewerken">
                        <Button variant="outline" size="sm"><i className="bi bi-pencil" aria-hidden="true"></i> Bewerken</Button>
                    </Link>
                </div>
            </div>

            {meetstation.is_public === false && (
                <p className="mb-4 rounded-lg bg-gray-50 px-4 py-2 text-sm text-gray-500">
                    Dit station is onzichtbaar, maar de data wordt gebruikt binnen de metingen van een wijk.
                </p>
            )}

            {/* Period stat cards: min / max / avg + trend over the selected range */}
            <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
                {metrics.map((m) => {
                    const up = m.stats.delta != null && m.stats.delta > 0.05;
                    const down = m.stats.delta != null && m.stats.delta < -0.05;
                    return (
                        <div key={m.key} className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                            <div className="mb-3 flex items-center justify-between">
                                <span className="flex items-center gap-2 font-medium text-gray-700">
                                    <i className={`bi ${m.icon} ${m.tint}`} aria-hidden="true"></i>
                                    {m.label}
                                </span>
                                {m.stats.delta != null && (
                                    <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${up ? "bg-red-50 text-red-600" : down ? "bg-blue-50 text-blue-600" : "bg-gray-100 text-gray-500"}`}>
                                        <i className={`bi ${up ? "bi-arrow-up" : down ? "bi-arrow-down" : "bi-dash"}`} aria-hidden="true"></i>
                                        {m.stats.delta > 0 ? "+" : ""}{m.stats.delta.toFixed(1)} {m.unit}
                                    </span>
                                )}
                            </div>
                            <div className="grid grid-cols-3 gap-2 text-center">
                                <div><div className="text-xs text-gray-500">Min</div><div className="font-semibold text-blue-600">{fmt(m.stats.min, "")}</div></div>
                                <div><div className="text-xs text-gray-500">Gem.</div><div className="text-lg font-bold text-gray-900">{fmt(m.stats.avg, "")}</div></div>
                                <div><div className="text-xs text-gray-500">Max</div><div className="font-semibold text-red-600">{fmt(m.stats.max, "")}</div></div>
                            </div>
                            <div className="mt-1 text-center text-xs text-gray-400">{m.unit}</div>
                        </div>
                    );
                })}
            </div>

            {/* Date range filter + quick-range buttons */}
            <div className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex flex-wrap items-center gap-2">
                    <span className="mr-1 text-sm font-medium text-gray-700">Periode:</span>
                    {[{ d: 1, l: "24u" }, { d: 7, l: "7d" }, { d: 30, l: "30d" }, { d: 90, l: "3 mnd" }].map((q) => (
                        <Button
                            key={q.d}
                            variant={rangeDays === q.d ? "primary" : "outline"}
                            size="sm"
                            onClick={() => setQuickRange(q.d)}
                        >
                            {q.l}
                        </Button>
                    ))}
                </div>
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

            {/* Nested edit route renders its modal here, over the detail page. */}
            <Outlet />
        </div>
    )
}