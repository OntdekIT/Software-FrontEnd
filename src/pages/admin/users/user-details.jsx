import {useLoaderData, useNavigate} from "react-router-dom";
import {useEffect, useState} from "react";
import {backendApi} from "../../../utils/backend-api.jsx";
import EditUserRoleModal from "../../../components/users/edit-user-role-modal.jsx";
import DeleteUserModal from "../../../components/users/delete-user-modal.jsx";
import UserUtils from "../../../utils/user-utils.jsx";
import StationCard from "../../../components/stations/station-card.jsx";
import Button from "../../../components/ui/Button.jsx";
import {Skeleton, SkeletonText, SkeletonCard} from "../../../components/ui/Skeleton.jsx";

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
            <div className="mx-auto max-w-5xl px-4 py-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <Skeleton className="h-8 w-56"/>
                    <div className="flex gap-2">
                        <Skeleton className="h-9 w-9"/>
                        <Skeleton className="h-9 w-9"/>
                    </div>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 px-4 py-3">
                        <Skeleton className="h-4 w-48"/>
                    </div>
                    <div className="px-4 py-4">
                        <SkeletonText lines={3}/>
                    </div>
                </div>
                <h2 className="mt-6 mb-3 flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <i className="bi bi-broadcast text-brand-500" aria-hidden="true"></i>
                    Stations
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {Array.from({length: 3}).map((_, i) => (
                        <SkeletonCard key={i}/>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <>
            <div className="mx-auto max-w-5xl px-4 py-6">
                <div className="mb-4 flex items-center justify-between gap-3">
                    <h1 className="flex min-w-0 items-center gap-2 text-2xl font-bold text-gray-900">
                        <i className="bi bi-person-circle text-brand-500" aria-hidden="true"></i>
                        <span className="truncate">{user.firstName} {user.lastName}</span>
                    </h1>
                    {user.id !== loggedInUser?.id && (
                        <div className="flex shrink-0 gap-2">
                            <Button variant="primary" size="sm" aria-label="Gebruiker bewerken"
                                    onClick={() => handleEditButtonClick()}>
                                <i className="bi bi-pencil" aria-hidden="true"></i></Button>
                            <Button variant="danger" size="sm" aria-label="Gebruiker verwijderen"
                                    onClick={() => handleDeleteButtonClick()}>
                                <i className="bi bi-trash" aria-hidden="true"></i></Button>
                        </div>
                    )}
                </div>

                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="flex items-center gap-2 border-b border-gray-200 px-4 py-3 font-medium text-gray-700">
                        <i className="bi bi-info-circle text-brand-500" aria-hidden="true"></i>
                        Algemene informatie
                    </div>
                    <dl className="grid grid-cols-1 gap-y-3 px-4 py-4 sm:grid-cols-[8rem_1fr] sm:gap-x-4">
                        <dt className="font-medium text-gray-500">Naam</dt>
                        <dd className="text-gray-900">{user.firstName} {user.lastName}</dd>
                        <dt className="font-medium text-gray-500">E-mailadres</dt>
                        <dd className="text-gray-900">{user.email}</dd>
                        <dt className="font-medium text-gray-500">Rol</dt>
                        <dd className="text-gray-900">{UserUtils.translateRole(user.role)}</dd>
                    </dl>
                </div>

                <h2 className="mt-6 mb-3 flex items-center gap-2 text-xl font-semibold text-gray-900">
                    <i className="bi bi-broadcast text-brand-500" aria-hidden="true"></i>
                    Stations
                </h2>
                {user.stations.length === 0 ? (
                    <div className="flex flex-col items-center gap-2 rounded-xl border border-gray-200 bg-white p-10 text-center text-gray-500 shadow-sm">
                        <i className="bi bi-inbox text-3xl text-gray-400" aria-hidden="true"></i>
                        <p>Geen meetstations gevonden.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
                        {user.stations
                            .sort((a, b) => a.stationid - b.stationid)
                            .map((station) => (
                                <div key={station.stationid}>
                                    <StationCard station={station}></StationCard>
                                </div>
                            ))}
                    </div>
                )}
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
