import {backendApi} from "../../utils/backend-api.jsx";
import {useState} from "react";
import {Button, Modal} from "react-bootstrap";
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
        <Modal show={isShown} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Workshop code verwijderen</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div>
                    {error && <div className="error-msg">{error}</div>}
                </div>
                <p>Weet je zeker dat je de workshop code <b>{`${workshop.code}`}</b> wilt verwijderen?</p>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="dark" onClick={onClose}>
                    Annuleren
                </Button>
                <Button variant="danger" onClick={handleDelete} disabled={loading}>
                    {loading && <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>} Verwijderen
                </Button>
            </Modal.Footer>
        </Modal>
    );
}

DeleteWorkshopModal.propTypes = {
    workshop: PropTypes.object.isRequired,
    isShown: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onWorkshopDeleted: PropTypes.func.isRequired
}