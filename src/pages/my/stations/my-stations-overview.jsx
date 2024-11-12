import {useContext, useEffect, useState} from "react";
import {LoginCheckContext} from "../../../context/login-check-provider.jsx";
import {Link, useNavigate} from "react-router-dom";
import {backendApi} from "../../../utils/backend-api.jsx";
import LoadingComponent from "../../../components/loading-component.jsx";
import StationCard from "../../../components/stations/station-card.jsx";

export default function MyStationsOverview() {
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState(null);
    const [naam, setNaam] = useState(null);
    const [meetstations, setMeetstations] = useState([]);
    const {isLoggedIn} = useContext(LoginCheckContext);
    const navigate = useNavigate();

    useEffect(() => {
        const getData = async () => {
            try {
                const response = await backendApi.get('/my-account?includeStations=true', { withCredentials: true });
                setMeetstations(response.data.stations);
                setNaam(response.data.firstName);
                setErrMsg(null);
            } catch (err) {
                setErrMsg(err.message);
            } finally {
                setLoading(false);
            }
        };
        getData();
    }, []);

    return (
        <>
            <div className="toolbar fixed-top d-flex justify-content-between align-items-center">
                <span>Welkom {naam}</span>
                <Link to={"./claim"} className="btn btn-primary btn-sm">Nieuw station toevoegen</Link>
            </div>
            <div className="container">
                <div className="row">
                    <div className="col">
                        <div className="nav-size"></div>
                        <h1>Mijn stations</h1>
                    </div>
                    {loading && (
                        <div className="position-relative">
                            {loading && (
                                <LoadingComponent message="Account data aan het ophalen..." isFullScreen={true}></LoadingComponent>
                            )}
                        </div>
                    )}
                    {errMsg && <div className="error-msg">{errMsg}</div>}
                    <div className="row g-2">
                        {meetstations
                            .sort((a, b) => a.stationid - b.stationid)
                            .map((station, index) => (
                                <div className="col-12 col-md-6 col-lg-4" key={station.stationid}>
                                    <StationCard station={station}></StationCard>
                                </div>
                            ))}
                    </div>
                    {meetstations.length % 3 !== 0 && <div className="w-100"></div>}
                </div>
            </div>
        </>
    )
}