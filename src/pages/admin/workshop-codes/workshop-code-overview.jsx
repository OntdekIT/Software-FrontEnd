import {useEffect, useState} from "react";
import {backendApi} from "../../../utils/backend-api.jsx";
import {SkeletonCard} from "../../../components/ui/Skeleton.jsx";
import {Spinner} from "../../../components/ui/Preloader.jsx";
import DeleteWorkshopModal from "../../../components/workshop/delete-workshop-modal.jsx";
import Button from "../../../components/ui/Button.jsx";
import Modal from "../../../components/ui/Modal.jsx";
import WorkshopCodeForm from "../../../components/workshop/workshop-code-form.jsx";

export default function WorkshopCodeOverview() {
    const [workshopCodes, setWorkshopCodes] = useState([]); // Initialize with empty array
    const [loading, setLoading] = useState(true);
    const [ready, setReady] = useState(false);
    const [errMsg, setErrMsg] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [selectedWorkshop, setSelectedWorkshop] = useState(null);
    const [showExpired, setShowExpired] = useState(false);
    const [showCreateModal, setShowCreateModal] = useState(false);

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
        await getData(showExpired);
    }

    const getData = async (isExpired = false) => {
        setLoading(true);
        try {
            const queryParams = new URLSearchParams();
            if (isExpired) {
                queryParams.append("isExpired", "true");
            }

            const response = await backendApi.get(`/workshops?${queryParams.toString()}`, {
                withCredentials: true
            });

            if (response.data.length === 0) {
                setWorkshopCodes([]);
                setErrMsg(isExpired ? "Geen verlopen workshop codes gevonden" : "Geen actieve workshop codes gevonden");
            } else {
                setWorkshopCodes(response.data);
                setErrMsg(null);
            }
        } catch (err) {
            setErrMsg(err.message);

            if (err.response?.status === 401) {
                window.location.href = "/login";
            }
        } finally {
            setLoading(false);
            setReady(true);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    const toggleShowExpired = () => {
        setShowExpired(!showExpired);
        getData(!showExpired);
    };

    // Only the very first load blanks the page with skeletons; later refetches
    // (toggling expired) keep the list visible and show a small inline spinner.
    const refetching = ready && loading;

    return (
        <>
            <div className="mx-auto max-w-3xl px-4 py-6">
                <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                        <i className="bi bi-123 text-brand-500"></i>
                        Workshopcodes
                    </h1>
                    <div className="flex flex-wrap items-center gap-2">
                        {refetching && (
                            <span className="flex items-center gap-2 text-sm text-gray-500">
                                <Spinner className="h-4 w-4" /> bijwerken…
                            </span>
                        )}
                        <Button variant="secondary" size="sm" onClick={toggleShowExpired}>
                            <i className={`bi ${showExpired ? 'bi-check-circle' : 'bi-clock-history'}`}></i>
                            {showExpired ? "toon actieve codes" : "toon verlopen codes"}
                        </Button>
                        <Button variant="primary" size="sm" onClick={() => setShowCreateModal(true)}>
                            <i className="bi bi-plus-lg"></i>
                            Workshopcode aanmaken
                        </Button>
                    </div>
                </div>

                {!ready ? (
                    <div className="flex flex-col gap-3">
                        {Array.from({length: 5}).map((_, i) => (
                            <SkeletonCard key={i}/>
                        ))}
                    </div>
                ) : (!workshopCodes || workshopCodes.length === 0) ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
                        <i className="bi bi-123 text-3xl text-gray-400"></i>
                        <p>{errMsg || (showExpired ? "Geen verlopen workshopcodes gevonden." : "Geen actieve workshopcodes gevonden.")}</p>
                    </div>
                ) : (
                    <div className="flex flex-col gap-3">
                        {workshopCodes.map(workshopCode => (
                            <div key={workshopCode.id}
                                 className={`rounded-xl border p-4 shadow-sm ${showExpired ? 'border-red-200 bg-red-50' : 'border-gray-200 bg-white'}`}>
                                <div className="flex items-center gap-3">
                                    <h2 className="text-lg font-semibold text-gray-900">{workshopCode.code}</h2>
                                    {workshopCode?.expirationDate && (
                                        <p className="ml-auto flex items-center gap-1 text-sm text-gray-500"><i
                                            className="bi bi-clock-history"></i> {parseDate(workshopCode?.expirationDate)}
                                        </p>)}
                                    <Button variant="outline" size="sm"
                                            className={`text-red-600 hover:bg-red-50 ${workshopCode?.expirationDate ? '' : 'ml-auto'}`}
                                            onClick={() => handleDeleteButtonClick(workshopCode)}
                                            aria-label="Workshopcode verwijderen">
                                        <i className="bi bi-trash"></i>
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
            {selectedWorkshop && (
                <DeleteWorkshopModal
                    workshop={selectedWorkshop}
                    isShown={showModal}
                    onClose={handleModalClose}
                    onWorkshopDeleted={handleWorkshopDeleted}
                />
            )}
            <Modal show={showCreateModal} onClose={() => setShowCreateModal(false)} title="Workshopcode aanmaken">
                <WorkshopCodeForm onSuccess={async () => {
                    setShowCreateModal(false);
                    await getData(showExpired);
                }}/>
            </Modal>
        </>
    );
}
