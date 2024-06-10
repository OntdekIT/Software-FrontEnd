import { Marker, Popup } from "react-leaflet";
import { RoundToOneDecimal } from "../Lib/Utility";
import { api } from "../App";
import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, XAxis, YAxis } from "recharts";
import ReactDatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import GraphView from "../Components/GraphView";
import {end} from "@popperjs/core";

const InfoStation = () => {
    const [endDate, setEndDate] = useState(new Date());
    const [startDate, setStartDate] = useState(new Date());
    const [startDatePDF, setStartDatePDF] = useState(new Date());
    const [meetstation, setMeetstation] = useState({});
    const errRef = useRef();
    const [errorMessage, setErrorMessage] = useState('');
    const [loading, setLoading] = useState(false);
    // data to be shown
    const [tempGraphData, setTempGraphData] = useState([]);
    const [humGraphData, setHumGraphData] = useState([]);
    const [stofGraphData, setStofGraphData] = useState([]);
    const EditIcon = process.env.PUBLIC_URL + '/editButton.ico';
    const infoIcon = process.env.PUBLIC_URL + '/infoButton.ico';
    const dateTime = new Date();
    const navigate = useNavigate(); // Initialize useNavigate
    const location = useLocation();

    const query = new URLSearchParams(location.search);
    const stationId = query.get('id');

    useEffect(() => {
        const fetchStation = async () => {
            try {
                const response = await api.get(`/Meetstation/${stationId}`, {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: false
                });

                setMeetstation(response.data);
                console.log("Response 1: ", response.data);

            } catch (err) {
                console.error("error: ", err);
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
            try {
                const response = await api.get("/measurement/history/average/" + meetstation.stationid, {
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
                    min: meting.minStof,
                    max: meting.maxStof
                }))
                setStofGraphData(stofData);
            } catch (err) {
                console.error("error: ", err);
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
        api.get("/Meetstation/measurements/" + meetstation.stationid, {
            params: {
                startDate: formatDate(startDatePDF),
                endDate: formatDate(endDate)
            },
            responseType: 'blob'
        }).then((response) => {
            console.log("pdf response: ", )

            const contentType = response.headers['content-type'];
            const contentDisposition = response.headers['content-disposition'];

            const blob = new Blob([response.data], { type: contentType });

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

    const handleEditClick = () => {
        navigate(`/Station/Edit?id=${meetstation.stationid}`);
    }

    return (
        <>
            <div className="border bg-light position-relative rounded" style={{ minWidth: "150px" }}>
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
                            <a href="#" onClick={getPDF}>
                                Download metingen van: {formatDate(startDatePDF)} tot: {formatDate(endDate)}
                            </a>
                        </div>
                        <hr style={{margin: "2"}}></hr>
                        <GraphView graphData={tempGraphData} dataType={"temperatuur"}></GraphView>
                        <hr style={{margin: "2"}}></hr>
                        <GraphView graphData={humGraphData} dataType={"luchtvochtigheid"}></GraphView>
                        <hr style={{margin: "2"}}></hr>
                        <GraphView graphData={stofGraphData} dataType={"fijnstof"}></GraphView>
                        <hr style={{margin: "2"}}></hr>
                    </div>


                </div>
            </div>
        </>
    )
}

export default InfoStation;
