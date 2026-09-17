import {backendApi} from "../../utils/backend-api.jsx";
import {useState} from "react";
import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";
import {Spinner} from "../ui/Preloader.jsx";
import PropTypes from "prop-types";

export default function DeleteWorkshopModal({ workshop, isShown, onClose, onWorkshopDeleted }) {
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleDelete = async () => {
        try {
            setLoading(true);
            const response = await backendApi.delete(`/workshops/${workshop.code}`, {
                withCredentials: true
            });

            if (response?.status >= 200 && response?.status < 300) {
                onWorkshopDeleted(); // Call the parent handler
            } else {
                console.error("Failed to delete workshop code", response);
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
            title="Workshop code verwijderen"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose}>
                        Annuleren
                    </Button>
                    <Button variant="danger" onClick={handleDelete} disabled={loading}>
                        {loading && <Spinner className="h-4 w-4" />} Verwijderen
                    </Button>
                </>
            }
        >
            {error && <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm text-red-700">{error}</div>}
            <p className="text-gray-700">Weet je zeker dat je de workshop code <b>{`${workshop.code}`}</b> wilt verwijderen?</p>
        </Modal>
    );
}

DeleteWorkshopModal.propTypes = {
    workshop: PropTypes.object.isRequired,
    isShown: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onWorkshopDeleted: PropTypes.func.isRequired
}
