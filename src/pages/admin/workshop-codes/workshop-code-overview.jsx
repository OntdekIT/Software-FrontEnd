import {useEffect, useState} from "react";
import {LoginCheckContext} from "../../../context/login-check-provider.jsx";
import {backendApi} from "../../../utils/backend-api.jsx";
import {Link} from "react-router-dom";
import LoadingComponent from "../../../components/map/loading-component.jsx";

export default function WorkshopCodeOverview() {
    const [workshopCodes, setWorkshopCodes] = useState([]); // Initialize with empty array
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState(null);

    const getData = async () => {
        try {
            const getWorkshopCodes = await backendApi.get("/Admin/getworkshopcodes", {
                withCredentials: true
            });
            console.log(getWorkshopCodes.data);

            setWorkshopCodes(getWorkshopCodes.data);
            setErrMsg(null);
        } catch (err) {
            setErrMsg(err.message);

            if (err.response?.status === 401) {
                window.location.href = "/login";
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
            getData();
    }, []);

    return (
        <>
            <div className="toolbar fixed-top d-flex justify-content-between align-items-center">
                <Link to={"./create"} className="btn btn-primary btn-sm ms-auto">Workshopcode aanmaken</Link>
            </div>
            <div className="container">
                <div className="row">
                    <div className="col text-center">
                        <div className="nav-size"></div>
                        <h1>Workshopcodes</h1>
                    </div>
                </div>
                <div className="row">
                    <div className="col">
                        {loading ? (
                            <LoadingComponent message="Workshopcodes aan het ophalen..." isFullScreen={true}></LoadingComponent>
                        ) : (
                            <div>
                                {workshopCodes && workshopCodes.map(workshopCode => (
                                    <div key={workshopCode.id} className="card mb-2">
                                        <div className="card-body">
                                            <h4 className="card-title mb-0">{workshopCode.code}</h4>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}