import {Button, Modal} from "react-bootstrap";
import {backendApi} from "../../utils/backend-api.jsx";
import {useState} from "react";
import PropTypes from "prop-types";

export default function EditUserRoleModal({user, isShown, onClose, onRoleChanged}) {
    const [adminRights, setAdminRights] = useState(user.admin);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleSubmit = async () => {
        try {
            setLoading(true);
            const response = await backendApi.post('/User/grantuseradmin', {
                    userId: user.id,
                    adminRights: adminRights
                },
                {

                    headers: {'Content-Type': 'application/json'},
                    withCredentials: true
                });

            if (response?.status === 200) {
                onRoleChanged();
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
                <Modal.Title>Rol aanpassen</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <div>
                    {error && <div className="error-msg">{error}</div>}
                </div>
                <form>
                    <p>Selecteer een rol om aan de gebruiker <b>{`${user.firstName} ${user.lastName}`}</b> toe te
                        kennen.</p>
                    <label htmlFor="role">Rol</label>
                    <select
                        id="role"
                        className="form-select"
                        value={adminRights ? "admin" : "user"}
                        onChange={(e) => setAdminRights(e.target.value === "admin")}
                        disabled={loading}
                    >
                        <option value="user">Gebruiker</option>
                        <option value="admin">Admin</option>
                    </select>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="dark" onClick={onClose}>Annuleren</Button>
                <Button variant="primary" onClick={handleSubmit} disabled={loading}>Opslaan</Button>
            </Modal.Footer>
        </Modal>
    );
}

EditUserRoleModal.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.number.isRequired,
        admin: PropTypes.bool.isRequired,
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
    }).isRequired,
    isShown: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onRoleChanged: PropTypes.func.isRequired,
};