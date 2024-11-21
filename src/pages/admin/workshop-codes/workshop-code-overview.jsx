import {useEffect, useState} from "react";
import {backendApi} from "../../../utils/backend-api.jsx";
import {Link} from "react-router-dom";
import LoadingComponent from "../../../components/loading-component.jsx";
import DeleteWorkshopModal from "../../../components/workshop/delete-workshop-modal.jsx";

export default function WorkshopCodeOverview() {
    const [workshopCodes, setWorkshopCodes] = useState([]); // Initialize with empty array
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);

    const parseDate = (dateString) => {
        let date = new Date(dateString);
        return date.toLocaleDateString("nl-NL") + " " + date.toLocaleTimeString("nl-NL", {
            hour: "2-digit",
            minute: "2-digit"
        });
    };

    const handleModalClose = () => {
        setShowModal(false);

    }

    const handleDeleteButtonClick = (workshopCode) => {
        setSelectedWorkshop(workshopCode);
        setShowModal(true);
    }

    const handleWorkshopDeleted = async () => {
        setShowModal(false);
        setSelectedWorkshop(null);
        await getData();
    }

    const getData = async () => {
        try {
            const response = await backendApi.get("/workshops", {
                withCredentials: true
            });

            setWorkshopCodes(response.data);
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
                        {errMsg && <div className="error-msg">{errMsg}</div>}
                        {loading ? (
                            <LoadingComponent message="Workshopcodes aan het ophalen..."
                                              isFullScreen={true}></LoadingComponent>
                        ) : (
                            <div>
                                {workshopCodes && workshopCodes.map(workshopCode => (
                                    <div key={workshopCode.id} className="card mb-2">
                                        <div className="card-body d-flex align-items-center">
                                            <h4 className="card-title mb-0">{workshopCode.code}</h4>
                                            {workshopCode?.expirationDate && (
                                                <p className="ms-auto text-body-tertiary mb-0"><i
                                                    className="bi bi-clock-history"></i> {parseDate(workshopCode?.expirationDate)}
                                                </p>)}
                                            <button className="btn btn-outline-danger btn-sm ms-2"
                                                    onClick={() => handleDeleteButtonClick(workshopCode)}>
                                                <i className="bi bi-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
            {selectedWorkshop && (
                <DeleteWorkshopModal
                    workshop={selectedWorkshop}
                    isShown={showModal}
                    onClose={handleModalClose}
                    onWorkshopDeleted={handleWorkshopDeleted}
                />
            )}
        </>
    );
}