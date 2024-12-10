import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { backendApi } from "../../../utils/backend-api";
import LoadingComponent from "../../../components/loading-component";
import EditUserProfileModal from "../../../components/users/edit-User-Modal";
import UserUtils from "../../../utils/user-utils";

export default function Profile() {
    const navigate = useNavigate();

    const [loggedInUser, setLoggedInUser] = useState(null);
    const [showEditModal, setShowEditModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const getLoggedInUser = async () => {
        try {
            const response = await backendApi.get("/my-account", { withCredentials: true });
            setLoggedInUser(response.data);
        } catch (err) {
            if (err.response?.status === 401) {
                navigate("/auth/login");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleModalClose = () => {
        setShowEditModal(false);
    };

    const handleProfileUpdated = () => {
        getLoggedInUser();
        setShowEditModal(false);
    };

    useEffect(() => {
        getLoggedInUser();
    }, []);

    return (
        <>
            {/* Page Content */}
            <div className="container">
                <div className="row">
                    <div className="col-md-8 offset-md-2">
                        <div className="card mt-4">
                            <div className="card-header">
                                <h5>Mijn profiel</h5>
                            </div>
                            <div className="card-body">
                                {loading ? (
                                    <LoadingComponent message="Loading your profile..." isFullScreen={false} />
                                ) : (
                                    <>
                                        <p><strong>Naam:</strong> {loggedInUser?.firstName} {loggedInUser?.lastName}</p>
                                        <p><strong>Email:</strong> {loggedInUser?.email}</p>
                                        <p><strong>Rol:</strong> {UserUtils.translateRole(loggedInUser?.role)}</p>

                                        <button className="btn btn-primary" onClick={() => setShowEditModal(true)}>
                                            <i className="bi bi-pencil"></i> Profiel bijwerken
                                        </button>
                                    </>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Profile Modal */}
            {loggedInUser && (
                <EditUserProfileModal
                    user={loggedInUser}
                    isShown={showEditModal}
                    onClose={handleModalClose}
                    onProfileUpdated={handleProfileUpdated}
                />
            )}
        </>
    );
}
