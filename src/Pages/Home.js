import { useState, useRef, useEffect } from "react";
import { api } from "../App";
import { Map, TileLayer, useMap, Popup, Marker, Polygon } from 'react-leaflet';
import HeatmapLayer from '../Components/HeatmapLayer';
import RadioButtonGroup from '../Components/RadioButtons';


const App = () => {
    const [posts, setPost] = useState([]);
    useEffect(() => {
        api.get("/Translation")
            .then((response) => response.json())

            .then((data) => {
                console.log(data);
                setPost(data);
            })

            .catch((err) => {
                console.log(err.message);
            });
    }, []);

    return (null);
};

function GiveLanguage() {
    const Language = "Nederlands"
    return Language;
}

function GivePageId() {
    const PageId = "Home"
    return PageId;
}

const BLUR = 30;
const RADIUS = 30;

//TODO: implement RegionCords en Region uit DB!

const gradient_default = {
    0.1: '#89BDE0', 0.2: '#96E3E6', 0.4: '#82CEB6',
    0.6: '#FAF3A5', 0.8: '#F5D98B', '1.0': '#DE9A96'
};

const gradient_fijnstof = {
    0.1: '#6D28ED', 0.2: '#9A07EF', 0.4: '#CD13F2',
    0.6: '#F900E0', 0.8: '#F73D94', '1.0': '#F43430'
};

function getGradient(typeID) {
    if (typeID === 4) return gradient_fijnstof;
    return gradient_default;
}

/*const colors = {
    1: "red", 2: "green", 3: "blue", 4: "purple", 5: "cyan", 6: "brown", 7: '#F73D94', 8: "pink", 9: "gray", 10: "yellow",
    11: "red", 12: "green", 13: "blue", 14: "purple", 15: "cyan", 16: "brown", 17: '#F73D94', 18: "pink", 19: "gray", 20: "green",
    21: "red", 22: "green", 23: "blue", 24: "purple", 25: "cyan", 26: "brown", 27: '#F73D94', 28: "pink", 29: "gray", 30: "green",
    31: "red", 32: "green", 33: "blue", 34: "purple", 35: "cyan", 36: "brown", 37: '#F73D94', 38: "pink", 39: "gray", 40: "green",
    41: "red", 42: "green", 43: "blue", 44: "purple", 45: "red", 46: "green", 47: "blue", 48: "purple", 49: "red", 50: "green"
}*/

const colors = {
    1: "red", 2: "red", 3: "red", 4: "red", 5: "red", 6: "red", 7: 'red', 8: "red", 9: "red", 10: "red",
    11: "red", 12: "red", 13: "red", 14: "red", 15: "red", 16: "red", 17: 'red', 18: "red", 19: "red", 20: "red",
    21: "red", 22: "red", 23: "red", 24: "red", 25: "red", 26: "red", 27: 'red', 28: "red", 29: "red", 30: "red",
    31: "red", 32: "red", 33: "red", 34: "red", 35: "red", 36: "red", 37: 'red', 38: "red", 39: "red", 40: "red",
    41: "red", 42: "red", 43: "red", 44: "red", 45: "red", 46: "red", 47: "red", 48: "red", 49: "red", 50: "red"
}

function getRegionColor(regionId) {
    if (regionId <= 50) return colors[regionId];
    else return regionId[1];
}

const Home = () => {

    const [avgData, setAvgData] = useState();
    const errRef = useRef();
    const [errMsg, setErrMsg] = useState('');

    const [showSettings, setShowSettings] = useState(false)
    const [showTemp, setShowTemp] = useState(false)
    const [showStikstof, setShowStikstof] = useState(false)
    const [showKoolstof, setShowKoolstof] = useState(false)
    const [showFijnstof, setShowFijnstof] = useState(false)
    const [showVochtigheid, setShowVochtigheid] = useState(false)
    const [showWindspeed, setShowWindspeed] = useState(false)

    const [data, setData] = useState([]);
    const [temperatureData, setTemperatureData] = useState([]);
    const [fijnstofData, setFijnstofData] = useState([]);
    const [regionData, setRegionData] = useState([]);

    const [showDataStations, setShowDataStations] = useState(true);
    const [showRegions, setShowRegions] = useState(true);

    function handleToggleTemp() {
        setShowTemp(!showTemp);
        setShowRegions(false);
        setShowFijnstof(false);
    }

    function handleToggleStikstof() {
        setShowStikstof(!showStikstof);
    }

    function handleToggleKoolstof() {
        setShowKoolstof(!showKoolstof);
    }

    function handleToggleFijnStof() {
        setShowFijnstof(!showFijnstof);
        setShowTemp(false);
        setShowRegions(false);
    }

    function handleToggleVochtigheid() {
        setShowVochtigheid(!showVochtigheid);
    }

    function handleToggleWindspeed() {
        setShowWindspeed(!showWindspeed);
    }

    function handleToggleShowDataStations() {
        setShowDataStations(!showDataStations);
    }

    function handleToggleShowRegions() {
        setShowRegions(!showRegions);
        setShowFijnstof(false);
        setShowTemp(false)
    }

    function getHeatmapData()
    {
        api.get('/Heatmap/' + 1).then((response) => setTemperatureData(response.data))
        .catch(function (error) {
            handleAxiosError(error);
        })

        api.get('/Heatmap/' + 4).then(function (response) {
            setFijnstofData(response.data)
        })
            .catch(function (error) {
                handleAxiosError(error);
            })
    }

    function getStationsData()
    {
        api.get(`/Station/Stations`).then((response) => {setData(response.data); console.log(response.data);})
        .catch(function (error) {
            handleAxiosError(error);
        })
    }

    function getAverageData()
    {
        api.get('/Sensor/average').then((response) => setAvgData(response.data))
        .catch(function (error) {
            handleAxiosError(error);
        })
    }

    function getRegionCords()
    {
        api.get('/Region/regioninfo').then((response) => {
            setRegionData(response.data);
            // Since this is the last called get request, enable settings when successfull
            setShowSettings(true);
            console.log(response.data);
        })
            .catch(function (error) {
                handleAxiosError(error);
            })

    }

    function handleAxiosError(error) {
        console.log(error);
        setErrMsg('Het ophalen van de gegevens is mislukt');
    }

    useEffect(() => {
        try {
            getStationsData();
            getAverageData();
            getHeatmapData();
            getRegionCords();
        }
        catch (error) {
            // Errors don't reach this catch, check function 'handleAxiosError'
            console.log('error loading data.');
            setErrMsg('Fout bij ophalen kaart-data.');
        }
    }, [])

    return (
        <section className="home-section">
            <div className="map-container">
                {
                    errMsg && (
                        <div className="errorOverlay">
                            <p ref={errRef} aria-live="assertive">{errMsg}</p>
                            <button className="button" onClick={() => window.location.reload(false)}>Opnieuw proberen</button>
                        </div>
                    )
                }
                <Map center={[51.565120, 5.066322]} zoom={13}>
                    <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                    <RegionLayer data={regionData} visible={showRegions}></RegionLayer>
                    <MeetStationLayer data={data} visible={showDataStations}></MeetStationLayer>
                    <HeatMapLayer heatmapData={temperatureData} gradient={getGradient(1)} visible={showTemp}></HeatMapLayer>
                    <HeatMapLayer heatmapData={fijnstofData} gradient={getGradient(4)} visible={showFijnstof}></HeatMapLayer>
                </Map>
            </div>
            <RadioButtonGroup handleToggleShowRegions={handleToggleShowRegions} handleToggleTemp={handleToggleTemp} handleToggleFijnStof={handleToggleFijnStof} />
        </section>
    )
}

const RegionLayer = ({ data, visible }) => {
    if (!visible) return (<></>);

    return (
        <>
            {data.map(({ region, cordsList, averageData }) => (
                <Polygon positions={cordsList} key={region.id} color={getRegionColor(region.id)} opacity={0.25} fillOpacity={0.2}>
                    <Popup>
                        <label className="bold">Algemene data {region.name}</label> <br />

                        {averageData.map(({ id, name, data }) => (
                            <div key={id}>
                                <label>
                                    {name}: {data} {getDataTypeSuffix(id)}
                                </label>
                            </div>

                        ))}
                    </Popup>
                </Polygon>
            ))}
        </>)

}


const HeatMapLayer = ({ heatmapData, gradient, visible }) => {
    if (!visible) return (<></>);

    return (
        <HeatmapLayer
            fitBoundsOnLoad
            points={heatmapData}
            longitudeExtractor={marker => marker.longitude}
            latitudeExtractor={marker => marker.latitude}
            gradient={gradient}
            intensityExtractor={marker => marker.value}
            radius={Number(RADIUS)}
            blur={Number(BLUR)}
            max={Number.parseFloat(0.4)}
        />
    )
}

const MeetStationLayer = ({ data, visible }) => {
    if (!visible) return (<></>);

    return (
        <>
            {data.map(({ id, latitude, longitude, name, sensors }) => (
                <Marker key={id} position={[latitude, longitude]}>
                    <Popup>
                        <label className="bold">{name}</label>

                        {sensors.map(({ id, typeId, data }) => (
                            <div key={id}>
                                <label>
                                    {getDataType(typeId)}: {data} {getDataTypeSuffix(typeId)}
                                </label>
                            </div>

                        ))}
                    </Popup>
                </Marker>
            ))}
        </>
    )
}


function getDataTypeSuffix(typeId) {
    switch (typeId) {
        case 1:
            return "°C";
        case 2:
            return "ppm";
        case 3:
            return "ppm";
        case 4:
            return "ppm";
        case 5:
            return "%";
        case 6:
            return "km/h";
        default:
            return "Onbekend.";
    }
}

function getDataType(typeId) {
    switch (typeId) {
        case 1:
            return "Temperatuur";
        case 2:
            return "Stikstof (N2)";
        case 3:
            return "koolstofdioxide (CO2)";
        case 4:
            return "Fijnstof (PPM)";
        case 5:
            return "Luchtvochtigheid";
        case 6:
            return "Windsnelheid";
        default:
            return "Onbekend.";
    }
}

export default Home
