import {Button, Modal} from "react-bootstrap";
import PropTypes from "prop-types";
import {backendApi} from "../../utils/backend-api.jsx";
import {useState} from "react";

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
        <Modal show={isShown} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Gebruiker verwijderen</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div>
                    {error && <div className="error-msg">{error}</div>}
                </div>
                <p>Weet je zeker dat je de gebruiker <b>{`${user.firstName} ${user.lastName}`}</b> wilt verwijderen?</p>
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

DeleteUserModal.propTypes = {
    user: PropTypes.object.isRequired,
    isShown: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onUserDeleted: PropTypes.func.isRequired
};