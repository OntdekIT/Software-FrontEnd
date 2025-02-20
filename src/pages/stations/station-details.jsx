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
    }, [meetstation, startDate, endDate]);

    function formatDate(date) {
        const padZero = (num) => num.toString().padStart(2, '0');
        const year = date.getFullYear();
        const month = padZero(date.getMonth() + 1);
        const day = padZero(date.getDate());
        const hours = padZero(date.getHours());
        const minutes = padZero(date.getMinutes());

        return `${day}-${month}-${year} ${hours}:${minutes}`;
    }

    const getPDF = () => {
        backendApi.get("/Meetstation/measurements/" + meetstation.stationid, {
            params: {
                startDate: formatDate(startDatePDF),
                endDate: formatDate(endDate)
            },
            responseType: 'blob'
        }).then((response) => {
            console.log("pdf response: ",)

            const contentType = response.headers['content-type'];
            const contentDisposition = response.headers['content-disposition'];

            const blob = new Blob([response.data], {type: contentType});

            const link = document.createElement('a');
            link.href = window.URL.createObjectURL(blob);

            const fileNameRegex = /filename[^;=\n]*=((['"]).*?\2|[^;\n]*)/;
            const matches = fileNameRegex.exec(contentDisposition);
            const fileName = matches != null && matches[1] ? matches[1].replace(/['"]/g, '') : `measurements ${formatDate(startDatePDF)} tot ${formatDate(endDate)}.pdf`;
            link.download = fileName;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }).catch((error) => {
            console.error(error);
        });
    };

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
            <div className="row align-items-center" style={{
                backgroundColor: "#e9ecef",
                margin: "0",
                padding: "10px",
                borderTopLeftRadius: "0.375rem",
                borderTopRightRadius: "0.375rem"
            }}>
                <div className="col">
                    <label className="bold fs-6">{meetstation.name}: {meetstation.stationid}</label>
                </div>
                <div className="col-auto">
                    <Link to={`/stations/${meetstation.stationid}/edit`} className="btn btn-outline-dark"><i
                        className="bi bi-pencil"></i></Link>
                </div>
            </div>
            <div className="p-0">
                <div key={meetstation.stationid} style={{padding: "1%"}}>
                    {meetstation.is_public === false && (
                        <div className={"form-text"}>Het station is onzichtbaar, maar de data wordt gebruikt binnen
                            de metingen van een wijk.</div>
                    )}
                    {meetstation.is_public === true && (
                        <div className={"form-text"}>Het station is zichtbaar en kan door iedereen bekeken
                            worden.</div>
                    )}
                </div>

                <div style={{padding: "5%", paddingTop: "0"}}>
                    <hr style={{margin: "2"}}></hr>
                    <div className="container text-center">
                        <div className="row gy-2" style={{paddingBottom: "1%"}}>
                            <div className="col-12 col-md-6">
                                <label className="me-2">Start datum</label>
                                <ReactDatePicker
                                    className="border border-secondary"
                                    dateFormat="dd-MM-yyyy"
                                    selected={startDate}
                                    onChange={handleStartDateChange}
                                    maxDate={endDate}
                                    showMonthYearDropdown={true}/>
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
                                    showMonthYearDropdown={true}/>
                            </div>
                        </div>
                    </div>
                    {/*<div style={{padding: "5%", paddingTop: "0"}}>*/}
                    {/*    <a href="#" onClick={getPDF}>*/}
                    {/*        Download metingen van: {formatDate(startDatePDF)} tot: {formatDate(endDate)}*/}
                    {/*    </a>*/}
                    {/*</div>*/}
                    <hr style={{margin: "2"}}></hr>
                    <GraphView graphData={tempGraphData} dataType={"temperatuur"}></GraphView>
                    <hr style={{margin: "2"}}></hr>
                    <GraphView graphData={humGraphData} dataType={"luchtvochtigheid"}></GraphView>
                    <hr style={{margin: "2"}}></hr>
                    <GraphView graphData={stofGraphData} dataType={"fijnstof"}></GraphView>
                    <hr style={{margin: "2"}}></hr>
                </div>
            </div>
        </>
    )
}