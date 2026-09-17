import {useLoaderData, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {backendApi} from "../../../utils/backend-api.jsx";
import EditUserRoleModal from "../../../components/users/edit-user-role-modal.jsx";
import DeleteUserModal from "../../../components/users/delete-user-modal.jsx";
import UserUtils from "../../../utils/user-utils.jsx";
import StationCard from "../../../components/stations/station-card.jsx";
import Button from "../../../components/ui/Button.jsx";
import { Skeleton, SkeletonText, SkeletonCard } from "../../../components/ui/Skeleton.jsx";

export default function UserDetails() {
    const {user} = useLoaderData();
    const navigate = useNavigate();

    const modalTypes = {
        EDIT: "EDIT",
        DELETE: "DELETE"
    };

    const [showSelectedModal, setshowSelectedModal] = useState(false);
    const [selectedModalType, setSelectedModalType] = useState(modalTypes.EDIT);
    const [loggedInUser, setLoggedInUser] = useState(null);
    const [loading, setLoading] = useState(true);

    const handleModalClose = () => {
        setshowSelectedModal(false);
    }

    const handleUserChanged = () => {
        window.location.reload();
    }

    const handleUserDeleted = () => {
        navigate("/admin/users");
    }

    const handleEditButtonClick = () => {
        setSelectedModalType(modalTypes.EDIT);
        setshowSelectedModal(true);
    }

    const handleDeleteButtonClick = () => {
        setSelectedModalType(modalTypes.DELETE);
        setshowSelectedModal(true);
    }

    const getLoggedInUser = async () => {
        try {
            const response = await backendApi.get("/my-account", {
                withCredentials: true
            });

            setLoggedInUser(response.data);
        } catch (err) {
            if (err.response?.status === 401) {
                navigate("/auth/login")
            }
        } finally {
            setLoading(false);
        }
    }

    useEffect(() => {
        getLoggedInUser().then();
        // Fetch once on mount; getLoggedInUser is stable for this purpose.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    if (loading) {
        return (
            <>
                <div className="toolbar fixed-top flex items-center">
                    <Skeleton className="h-5 w-40" />
                </div>
                <div className="mx-auto max-w-5xl px-4">
                    <div>
                        <div className="nav-size"></div>
                        <div className="page-header-margin rounded-xl border border-gray-200 bg-white shadow-sm">
                            <div className="border-b border-gray-200 px-4 py-3">
                                <Skeleton className="h-4 w-48" />
                            </div>
                            <div className="px-4 py-4">
                                <SkeletonText lines={3} />
                            </div>
                        </div>
                        <h2 className="mt-4 flex items-center justify-center gap-2 text-center">
                            <i className="bi bi-broadcast" aria-hidden="true"></i>
                            Stations
                        </h2>
                        <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <SkeletonCard key={i} />
                            ))}
                        </div>
                    </div>
                </div>
            </>
        );
    }

    return (
        <>
            <div className="toolbar fixed-top flex items-center">
                <p className="mb-0 flex flex-grow items-center gap-2">
                    <i className="bi bi-person-circle" aria-hidden="true"></i>
                    {user.firstName} {user.lastName}
                </p>
                {user.id !== loggedInUser?.id && (
                    <>
                        <Button variant="primary" size="sm" className="ml-2" aria-label="Gebruiker bewerken"
                                onClick={() => handleEditButtonClick()}>
                            <i className="bi bi-pencil" aria-hidden="true"></i></Button>
                        <Button variant="danger" size="sm" className="ml-2" aria-label="Gebruiker verwijderen"
                                onClick={() => handleDeleteButtonClick()}>
                            <i className="bi bi-trash" aria-hidden="true"></i></Button>
                    </>)
                }

            </div>
            <div className="mx-auto max-w-5xl px-4">
                <div>
                    <div className="nav-size"></div>
                    <div className="page-header-margin rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 font-medium text-gray-700">
                            <i className="bi bi-info-circle" aria-hidden="true"></i>
                            Algemene informatie
                        </div>
                        <div className="flex flex-col gap-1 px-4 py-4">
                            <span><b>Naam: </b> {user.firstName} {user.lastName}</span>
                            <span><b>E-mailadres: </b> {user.email}</span>
                            <span><b>Rol: </b> {UserUtils.translateRole(user.role)}</span>
                        </div>
                    </div>
                    <h2 className="mt-4 flex items-center justify-center gap-2 text-center">
                        <i className="bi bi-broadcast" aria-hidden="true"></i>
                        Stations
                    </h2>
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                        {user.stations.length === 0 && (
                            <p className="col-span-full text-center text-gray-400">
                                <i className="bi bi-inbox" aria-hidden="true"></i> Geen meetstations gevonden
                            </p>
                        )}
                        {user.stations.length > 0 && user.stations
                            .sort((a, b) => a.stationid - b.stationid)
                            .map((station) => (
                                <div key={station.stationid}>
                                    <StationCard station={station}></StationCard>
                                </div>
                            ))}
                    </div>
                </div>
            </div>
            {selectedModalType === modalTypes.EDIT &&
                <EditUserRoleModal user={user} isShown={showSelectedModal} onClose={handleModalClose}
                                   onRoleChanged={handleUserChanged}/>}
            {selectedModalType === modalTypes.DELETE &&
                <DeleteUserModal user={user} isShown={showSelectedModal} onClose={handleModalClose}
                                 onUserDeleted={handleUserDeleted}/>}
        </>
    );
}
