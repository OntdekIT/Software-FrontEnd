import { useState } from "react";
import EditUserProfileModal from "../../../components/users/edit-user-modal.jsx";
import UserUtils from "../../../utils/user-utils";
import { useAuth } from "../../../providers/auth-provider.jsx";
import Button from "../../../components/ui/Button.jsx";
import { useToast } from "../../../components/ui/toast.jsx";

export default function Profile() {
    const { loggedInUser, refreshUserInfo } = useAuth();
    const [showEditModal, setShowEditModal] = useState(false);
    const toast = useToast();

    const handleModalClose = () => {
        setShowEditModal(false);
    };

    const handleProfileUpdated = () => {
        refreshUserInfo();
        setShowEditModal(false);
        toast.success("Veranderingen succesvol bijgewerkt!");
    };

    return (
        <>
            {/* Page Content */}
            <div className="mx-auto max-w-6xl px-4 py-6">
                <div className="mx-auto mt-8 w-full max-w-2xl">
                    <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                        <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                            <h5 className="flex items-center gap-2 text-lg font-semibold text-gray-800">
                                <i className="bi bi-person-circle text-brand-500"></i> Mijn profiel
                            </h5>
                        </div>
                        <div className="space-y-3 p-6">
                            <p><strong>Naam:</strong> {loggedInUser?.firstName} {loggedInUser?.lastName}</p>
                            <p><strong>Email:</strong> {loggedInUser?.email}</p>
                            <p><strong>Rol:</strong> {UserUtils.translateRole(loggedInUser?.role)}</p>

                            <Button variant="primary" onClick={() => setShowEditModal(true)}>
                                <i className="bi bi-pencil"></i> Profiel bijwerken
                            </Button>
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
