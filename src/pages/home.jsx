import {useEffect, useRef, useState} from "react";
import {backendApi} from "../utils/backend-api.jsx";
import {MapContainer, TileLayer} from "react-leaflet";
import RegionLayer from "../components/map/region-layer.jsx";
import MeetStationLayer from "../components/map/meetstation-layer.jsx";
import HeatmapLayer from "../components/map/heatmap-layer.jsx";
import RadioButtonGroup from "../components/map/radio-button-group.jsx";
import RadioButton from "../components/map/radio-button.jsx";
import Checkbox from "../components/map/checkbox.jsx";
import ColorLegend from "../components/map/color-legend.jsx";
import nl from 'date-fns/locale/nl';
import ReactDatePicker from "react-datepicker";

//TODO: Fix crash when pressing heatmap radio button
export default function Home() {
    const errRef = useRef();
    const [errMsg, setErrMsg] = useState('');

    //data from API's
    const [regionData, setRegionData] = useState([]);
    const [tempMeasurements, setTempMeasurements] = useState([]);
    //use states for what to show and what not to show
    const [showTemp, setShowTemp] = useState(false)
    const [showDataStations, setShowDataStations] = useState(false);
    const [showRegions, setShowRegions] = useState(true);
    const [heatmapType, setHeatmapType] = useState('temperature')
    const [dateTime, setDateTime] = useState(new Date());
    const [userId, setUserId] = useState('');

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

        const fetchUserId = async () => {
            try {
                const response = await backendApi.get('/User/getID', {withCredentials: true});
                setUserId(response.data); // Assuming response.data contains the userId
                console.log(userId);
            } catch (error) {
                console.error('Error fetching user ID:', error);
                // Handle error here, e.g., setUserId to a default value or handle it in UI
            }
        };

        try {
            // Get measurements data
            console.log(dateTime.toISOString());
            backendApi.get(`/measurement/history?timestamp=${dateTime.toISOString()}`)
                .then(resp => {
                    console.log(resp.data);
                    setTempMeasurements(resp.data.filter(station => station.is_public === true)); //laat ze alleen zien als ze true zijn
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
            // Errors don't reach this catch, check function 'handleAxiosError'
            setErrMsg('Fout bij ophalen kaart-data.');
        }
        fetchUserId();
    }, [dateTime])

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
                        <MeetStationLayer data={tempMeasurements} visible={showDataStations} selectedDate={dateTime}
                                          userId={userId}></MeetStationLayer>
                        {tempMeasurements &&
                            <HeatmapLayer data={tempMeasurements} visible={showTemp} type={heatmapType}/>}
                    </MapContainer>

                    <div className="layer-control">
                        <RadioButtonGroup
                            handleToggleShowRegions={handleToggleShowRegions}
                            handleToggleTemp={handleToggleTemp}/>
                        {showTemp && <div className={'heatmapRadio'}>

                            <RadioButton data={tempMeasurements} handleChange={setHeatmapType} current={heatmapType}/>
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
                    <ColorLegend temperatures={tempMeasurements}/>
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