import { Button, Modal } from "react-bootstrap";
import { useState } from "react";
import PropTypes from "prop-types";
import { backendApi } from "../../utils/backend-api"; // Adjust path as needed

export default function EditUserProfileModal({ user, isShown, onClose, onProfileUpdated }) {
    const [formData, setFormData] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: "", // Password field for updates (can be left empty)
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    // Handle form field changes
    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    // Handle form submission to update user profile
    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            const response = await backendApi.put(`/api/my-account/${user.id}`, formData, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true, // Ensure credentials are sent for authentication
            });

            if (response?.status === 200) {
                onProfileUpdated();  // Callback to inform parent component of the update
                onClose();  // Close modal after successful update
            }
        } catch (err) {
            setError(err.message);  // Capture and display error
            if (err.response?.status === 401) {
                window.location.href = "/login";  // Redirect to login if unauthorized
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={isShown} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Edit Profile</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {error && <div className="alert alert-danger">{error}</div>}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="firstName" className="form-label">First Name</label>
                        <input
                            id="firstName"
                            name="firstName"
                            type="text"
                            className="form-control"
                            value={formData.firstName}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="lastName" className="form-label">Last Name</label>
                        <input
                            id="lastName"
                            name="lastName"
                            type="text"
                            className="form-control"
                            value={formData.lastName}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="email" className="form-label">Email</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="form-control"
                            value={formData.email}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                    <div className="mb-3">
                        <label htmlFor="password" className="form-label">Password (leave empty to keep current)</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            className="form-control"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Save Changes"}
                    </Button>
                </form>
            </Modal.Body>
            <Modal.Footer>
                <Button variant="secondary" onClick={onClose} disabled={loading}>Cancel</Button>
                <Button variant="primary" type="submit" disabled={loading}>Save Changes</Button>
            </Modal.Footer>
        </Modal>
    );
}

EditUserProfileModal.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.number.isRequired,
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
        email: PropTypes.string.isRequired,
    }).isRequired,
    isShown: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onProfileUpdated: PropTypes.func.isRequired,
};
