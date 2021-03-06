import { useState, useEffect } from "react";
import axios from '../api/axios';
import { MapContainer, TileLayer, useMap, Popup, Marker} from 'react-leaflet';


const AVERAGE_DATA_URL = "/Sensor/average";


const MapPage = () => {

    const [avgData, setAvgData] = useState();
    const [errMsg, setErrMsg] = useState('');
    const [data, setData] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        //used to clean up the async function in the useEffect
        let isMounted = true;
        const controller = new AbortController();

        axios
        .get(`http://localhost:8082/api/Station/Stations`)
        .then((response) => setData(response.data) + console.log(response))
        .catch((error) => console.log(error))
        .finally(() => setLoading(false));

        const getAvgData = async () => {
            try {
                const response = await axios.get(AVERAGE_DATA_URL, {
                    signal: controller.signal
                });
                console.log(response.data);
                isMounted && setAvgData(response.data); 
                // const count = Object.keys(response.data).length;
                // console.log(count);
                if (response.data.length === 0) {
                    setErrMsg('Geen algemene data gevonden');
                }
            } catch (err) {
                setErrMsg('Server timeout');
                console.error(err);
            }
        }

        getAvgData();

        return () => {
            isMounted = false;
            controller.abort();
        }
    }, [])

    
    return (
        <div className="container">
            <div className="row seethroughsection">

                <div className="col-md-9">
                  <MapContainer center={[51.565120, 5.066322]} zoom={13}>
                    <TileLayer
                      attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    {data.map(({ id, latitude, longitude , name}) => (
                          <Marker key = {id} position={[latitude, longitude]}>
                            <Popup>
                              {name}
                            </Popup>
                          </Marker>
                      ))}
                  </MapContainer>
                </div>

                <div className="col-md-3">
                    <div className="two-thirdpadding">
                        <div className="legend">
                            <h4>Algemene data</h4>
                            {(!errMsg)
                                ? (
                                    <ul>
                                        <li><span></span>Temperatuur: {avgData?.temperature} ??C</li>
                                        <li><span></span>Stikstof (N2): {avgData?.nitrogen}</li>
                                        <li><span></span>koolstofdioxide (CO2): {avgData?.carbonDioxide}</li>
                                        <li><span></span>Fijnstof: {avgData?.particulateMatter} ??m</li>
                                        <li><span></span>Luchtvochtigheid: {avgData?.humidity}%</li>
                                        <li><span></span>Windsnelheid: {avgData?.windSpeed} km/h</li>
                                    </ul>
                                ) : <p>{errMsg}</p>
                            }
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default MapPage
