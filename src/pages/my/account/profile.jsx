import { useState } from "react";
import EditUserProfileModal from "../../../Components/users/edit-User-Modal.jsx";
import UserUtils from "../../../utils/user-utils";
import { useAuth } from "../../../providers/auth-provider.jsx";

export default function Profile() {
    const { loggedInUser, refreshUserInfo } = useAuth();
    const [showEditModal, setShowEditModal] = useState(false);
    const [successMessage, setSuccessMessage] = useState("");

    const handleModalClose = () => {
        setShowEditModal(false);
    };

    const handleProfileUpdated = () => {
        refreshUserInfo();
        setShowEditModal(false);
        setSuccessMessage("Veranderingen succesvol bijgewerkt!");

        // Hide the message after 3 seconds
        setTimeout(() => setSuccessMessage(""), 3000);
    };

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
                                {/* Success Message */}
                                {successMessage && (
                                    <div className="alert alert-success" role="alert">
                                        {successMessage}
                                    </div>
                                )}

                                <p><strong>Naam:</strong> {loggedInUser?.firstName} {loggedInUser?.lastName}</p>
                                <p><strong>Email:</strong> {loggedInUser?.email}</p>
                                <p><strong>Rol:</strong> {UserUtils.translateRole(loggedInUser?.role)}</p>

                                <button className="btn btn-primary" onClick={() => setShowEditModal(true)}>
                                    <i className="bi bi-pencil"></i> Profiel bijwerken
                                </button>
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
