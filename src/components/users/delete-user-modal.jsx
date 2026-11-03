import PropTypes from "prop-types";
import {backendApi} from "../../utils/backend-api.jsx";
import {useState} from "react";
import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";
import {Spinner} from "../ui/Preloader.jsx";

export default function DeleteUserModal({user, isShown, onClose, onUserDeleted}) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleDelete = async () => {
        try {
            setLoading(true);
            const response = await backendApi.delete(`/users/${user.id}`, {
                withCredentials: true
            });

            if (response?.status === 200) {
                onUserDeleted();
            }
        } catch (err) {
            setError(err.message);

            if (err.response?.status === 401) {
                window.location.href = "/login";
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            show={isShown}
            onClose={onClose}
            title="Gebruiker verwijderen"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        <i className="bi bi-x-lg"></i> Annuleren
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={loading}>
                        {loading ? <Spinner className="h-4 w-4" /> : <i className="bi bi-trash"></i>} Verwijderen
                    </Button>
                </>
            }
        >
            {error && (
                <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">
                    {error}
                </div>
            )}
            <p className="text-gray-700">Weet je zeker dat je de gebruiker <b>{`${user.firstName} ${user.lastName}`}</b> wilt verwijderen?</p>
        </Modal>
    );
}

DeleteUserModal.propTypes = {
    user: PropTypes.object.isRequired,
    isShown: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onUserDeleted: PropTypes.func.isRequired
};
