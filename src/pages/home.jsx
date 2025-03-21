import {useEffect, useRef, useState} from "react";
import {backendApi} from "../utils/backend-api.jsx";
import {MapContainer, TileLayer} from "react-leaflet";
import RegionLayer from "../components/map/region-layer.jsx";
import MeetStationLayer from "../components/map/meetstation-layer.jsx";
import RadioButtonGroup from "../components/map/radio-button-group.jsx";
import RadioButton from "../components/map/radio-button.jsx";
import Checkbox from "../components/map/checkbox.jsx";
import ColorLegend from "../components/map/color-legend.jsx";
import nl from 'date-fns/locale/nl';
import ReactDatePicker from "react-datepicker";
import HeatmapLayer from "react-leaflet-heat-layer";
import {gradient} from "../utils/map-utils.jsx";

export default function Home() {
    const errRef = useRef();
    const [errMsg, setErrMsg] = useState('');

    //data from API's
    const [regionData, setRegionData] = useState([]);
    const [stations, setStations] = useState([]);
    const [measurements, setMeasurements] = useState([]);
    //use states for what to show and what not to show
    const [showTemp, setShowTemp] = useState(false)
    const [showDataStations, setShowDataStations] = useState(false);
    const [showRegions, setShowRegions] = useState(true);
    const [heatmapType, setHeatmapType] = useState('temperature')
    const [dateTime, setDateTime] = useState(new Date());
    const [loggedInUser, setLoggedInUser] = useState(JSON.parse(localStorage.getItem("loggedInUser")));

    const calRef = useRef();

    function handleToggleTemp() {
        setShowRegions(false);
        setShowTemp(!showTemp);
    }

    function handleToggleShowDataStations() {
        setShowDataStations(!showDataStations);
    }

    function handleToggleShowRegions() {
        setShowRegions(!showRegions);
        setShowTemp(false);
    }

    function handleAxiosError(error) {
        setErrMsg('Het ophalen van de gegevens is mislukt');
    }

    useEffect(() => {
        try {
            // Get Stations
            backendApi.get(`/Meetstation/stationsMetMeasurements?timestamp=${dateTime.toISOString()}`)
                .then(resp => {
                    console.log("API Response:", resp.data); // Logs full response
                    if (resp.data.length > 0) {
                        console.log("First station:", resp.data[0]); // Logs first station
                    }
                    setStations(resp.data);
                })
                .catch(handleAxiosError);

            // Get timestamp measurements
            console.log(dateTime.toISOString());backendApi.get(`/measurement/history?timestamp=${dateTime.toISOString()}`)
            .then(resp => {
                console.log(resp.data);
                setMeasurements(resp.data);
            })
            .catch(function (error) {
                handleAxiosError(error);
            });
            
            // Get neighbourhood data
            backendApi.get(`/neighbourhood/history?timestamp=${dateTime.toISOString()}`)
                .then((response) => {
                    setRegionData(response.data);
                })
                .catch(function (error) {
                    handleAxiosError(error);
                });
        } catch (error) {
            setErrMsg('Fout bij ophalen kaart-data.');
        }
    }, [dateTime]);
    

    return (
        <div>
            <title>Home</title>
            <section className="home-section">
                <div className="map-container">
                    {
                        errMsg && (
                            <div className="error-overlay">
                                <p ref={errRef} aria-live="assertive">{errMsg}</p>
                                <button className="btn btn-primary" onClick={() => window.location.reload(false)}>Opnieuw
                                    proberen
                                </button>
                            </div>
                        )
                    }

                    <MapContainer center={[51.57898, 5.08772]} zoom={12} maxZoom={15} minZoom={11}
                                  closePopupOnClick={false}>
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        {showRegions && <RegionLayer data={regionData}></RegionLayer>}
                        <MeetStationLayer 
                            stations={stations} 
                            visible={showDataStations} 
                            selectedDate={dateTime}
                            userId={loggedInUser?.id ? loggedInUser.id.toString() : ''} 
                        />

                        {showTemp && measurements.length > 0 &&
                            <HeatmapLayer
                                fitBoundsOnLoad
                                fitBoundsOnUpdate
                                latlngs={
                                    measurements
                                    .filter(m => m.latitude && m.longitude) // Ensure valid lat/lng
                                    .map(m => ([m.latitude, m.longitude, m[heatmapType] || 0]))
                                }
                                longitudeExtractor={m => m[1]}
                                latitudeExtractor={m => m[0]}
                                intensityExtractor={m => m[2]}
                                max={Math.max(...measurements.map(m => m[heatmapType] || 0))}
                                min={Math.min(...measurements.map(m => m[heatmapType] || 0))}
                                gradient={gradient}
                            />
                        }
                    </MapContainer>

                    <div className="layer-control">
                        <RadioButtonGroup
                            handleToggleShowRegions={handleToggleShowRegions}
                            handleToggleTemp={handleToggleTemp}/>
                        {showTemp && <div className={'heatmapRadio'}>

                            <RadioButton data={measurements} handleChange={setHeatmapType} current={heatmapType}/>
                        </div>}
                        <Checkbox handleToggleShowDataStations={handleToggleShowDataStations}/>
                        <ReactDatePicker
                            className="outline-none border-0"
                            ref={calRef}
                            locale={nl}
                            selected={dateTime}
                            onChange={(date) => setDateTime(date)}
                            showIcon
                            showTimeInput
                            dateFormat={"dd/MM/yyyy HH:mm"}
                            maxDate={new Date()}
                            showMonthYearDropdown={false}>
                            <button
                                className="btn btn-secondary"
                                onClick={() => {
                                    setDateTime(new Date());
                                    calRef.current.setOpen(false);
                                }}
                            >
                                Momenteel
                            </button>
                        </ReactDatePicker>
                    </div>
                    <ColorLegend temperatures={measurements}/>
                </div>
            </section>
        </div>
    )
}

// export default function Home() {
//     return(<div className="row">
//         <div className="col">
//             <h1 className="page-header-margin">Home</h1>
//         </div>
//     </div>)
// }