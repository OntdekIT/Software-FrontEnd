import { useState } from "react";
import EditUserProfileModal from "../../../components/users/edit-user-modal.jsx";
import UserUtils from "../../../utils/user-utils";
import { useAuth } from "../../../providers/auth-provider.jsx";
import Button from "../../../components/ui/Button.jsx";
import { SkeletonText } from "../../../components/ui/Skeleton.jsx";
import { useToast } from "../../../components/ui/toast.jsx";

export default function Profile() {
    const { loggedInUser, refreshUserInfo } = useAuth();
    const [showEditModal, setShowEditModal] = useState(false);
    const toast = useToast();

    // The user comes from the auth provider. Only blank the card on the very
    // first mount before it's populated; refreshUserInfo() keeps it visible.
    const ready = Boolean(loggedInUser);

    const handleModalClose = () => {
        setShowEditModal(false);
    };

    const handleProfileUpdated = () => {
        refreshUserInfo();
        setShowEditModal(false);
        toast.success("Veranderingen succesvol bijgewerkt!");
    };

    const fields = [
        {
            icon: "bi-person",
            label: "Naam",
            value: `${loggedInUser?.firstName ?? ""} ${loggedInUser?.lastName ?? ""}`.trim(),
        },
        { icon: "bi-envelope", label: "Email", value: loggedInUser?.email },
        { icon: "bi-shield-lock", label: "Rol", value: UserUtils.translateRole(loggedInUser?.role) },
    ];

    return (
        <>
            <div className="mx-auto max-w-2xl px-4 py-6">
                {/* Page header */}
                <div className="mb-6 flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                    <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-100 text-brand-600">
                        <i className="bi bi-person-circle text-xl" aria-hidden="true"></i>
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Mijn profiel</h1>
                        <p className="mt-0.5 text-sm text-gray-500">Bekijk en beheer je accountgegevens</p>
                    </div>
                </div>

                {/* Profile card */}
                <div className="overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 bg-gray-50 px-6 py-4">
                        <h2 className="flex items-center gap-2 text-sm font-semibold uppercase tracking-wide text-gray-600">
                            <i className="bi bi-card-text text-brand-500" aria-hidden="true"></i> Accountgegevens
                        </h2>
                    </div>

                    {!ready ? (
                        <div className="p-6">
                            <SkeletonText lines={4} />
                        </div>
                    ) : (
                        <>
                            <dl className="divide-y divide-gray-100">
                                {fields.map((f) => (
                                    <div key={f.label} className="flex items-center gap-3 px-6 py-4">
                                        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
                                            <i className={`bi ${f.icon}`} aria-hidden="true"></i>
                                        </span>
                                        <div>
                                            <dt className="text-xs font-medium uppercase tracking-wide text-gray-400">{f.label}</dt>
                                            <dd className="text-sm font-medium text-gray-800">{f.value || "—"}</dd>
                                        </div>
                                    </div>
                                ))}
                            </dl>
                            <div className="border-t border-gray-200 bg-gray-50 px-6 py-4">
                                <Button variant="primary" onClick={() => setShowEditModal(true)}>
                                    <i className="bi bi-pencil" aria-hidden="true"></i> Profiel bijwerken
                                </Button>
                            </div>
                        </>
                    )}
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
