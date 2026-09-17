import ReactDatePicker from "react-datepicker";
import {useEffect, useState} from "react";
import {Link, useParams} from "react-router-dom";
import {backendApi} from "../../utils/backend-api.jsx";
import LoadingComponent from "../../components/loading-component.jsx";
import GraphView from "../../components/stations/graph-view.jsx";

export default function StationDetails() {
    const {stationId} = useParams(); // Extract stationId from URL
    const [endDate, setEndDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date());
    const [startDatePDF, setStartDatePDF] = useState(new Date());
    const [meetstation, setMeetstation] = useState({});
    const [loading, setLoading] = useState(false); // LoadingComponent state
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

    return (
        <>
            {loading && (
                <LoadingComponent message="Data aan het ophalen..." isFullScreen={true}></LoadingComponent>
            )}
            <div className="flex items-center gap-2 rounded-t-md bg-gray-200 m-0 p-2.5">
                <div className="flex-1">
                    <label className="font-bold text-base">{meetstation.name}: {meetstation.stationid}</label>
                </div>
                <div className="shrink-0">
                    <Link
                        to={`/stations/${meetstation.stationid}/edit`}
                        aria-label="Station bewerken"
                        className="inline-flex items-center justify-center gap-2 rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 transition-colors hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-gray-400 focus-visible:ring-offset-2"
                    >
                        <i className="bi bi-pencil"></i>
                    </Link>
                </div>
            </div>
            <div className="p-0">
                <div key={meetstation.stationid} className="p-1">
                    {meetstation.is_public === false && (
                        <div className="text-sm text-gray-500">Het station is onzichtbaar, maar de data wordt gebruikt binnen
                            de metingen van een wijk.</div>
                    )}
                    {meetstation.is_public === true && (
                        <div className="text-sm text-gray-500">Het station is zichtbaar en kan door iedereen bekeken
                            worden.</div>
                    )}
                </div>

                <div className="px-[5%] pb-[5%]">
                    <hr className="my-2 border-gray-200" />
                    <div className="mx-auto max-w-3xl text-center">
                        <div className="grid grid-cols-1 gap-2 pb-4 md:grid-cols-2">
                            <div>
                                <label className="mr-2">Start datum</label>
                                <ReactDatePicker
                                    className="rounded border border-gray-400 px-3 py-2"
                                    dateFormat="dd-MM-yyyy"
                                    selected={startDate}
                                    onChange={handleStartDateChange}
                                    maxDate={endDate}
                                    showMonthYearDropdown={true}/>
                            </div>
                            <div>
                                <label className="mr-2">Eind datum</label>
                                <ReactDatePicker
                                    className="rounded border border-gray-400 px-3 py-2"
                                    dateFormat="dd-MM-yyyy"
                                    selected={endDate}
                                    onChange={handleEndDateChange}
                                    minDate={startDate}
                                    maxDate={new Date()}
                                    showMonthYearDropdown={true}/>
                            </div>
                        </div>
                    </div>
                    {/*<div className="px-[5%] pb-[5%]">*/}
                    {/*    <a href="#" onClick={getPDF}>*/}
                    {/*        Download metingen van: {formatDate(startDatePDF)} tot: {formatDate(endDate)}*/}
                    {/*    </a>*/}
                    {/*</div>*/}
                    <hr className="my-2 border-gray-200" />
                    <GraphView graphData={tempGraphData} dataType={"temperatuur"}></GraphView>
                    <hr className="my-2 border-gray-200" />
                    <GraphView graphData={humGraphData} dataType={"luchtvochtigheid"}></GraphView>
                    <hr className="my-2 border-gray-200" />
                    <GraphView graphData={stofGraphData} dataType={"fijnstof"}></GraphView>
                    <hr className="my-2 border-gray-200" />
                </div>
            </div>
        </>
    )
}