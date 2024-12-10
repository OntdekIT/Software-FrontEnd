import { Button, Modal } from "react-bootstrap";
import { useState } from "react";
import PropTypes from "prop-types";
import { backendApi } from "../../utils/backend-api";

export default function EditUserProfileModal({ user, isShown, onClose, onProfileUpdated }) {
    const [formData, setFormData] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
            console.log("Form Data:", formData);
            const response = await backendApi.put("/my-account", formData, {
                headers: { "Content-Type": "application/json" },
                withCredentials: true,
            });
            if (response?.status === 200) {
                onProfileUpdated();
                onClose();
            } else {
                throw new Error("Unexpected response code: " + response.status);
            }
        } catch (err) {
            console.error("PUT /api/my-account failed:", err);
            if (err.response) {
                console.error("Error response:", err.response);
                console.error("Error message:", err.response?.data?.message);
                setError(err.response?.data?.message || "Failed to update profile");
                if (err.response?.status === 401) {
                    window.location.href = "/auth/login";
                }
            } else {
                setError("An unexpected error occurred. Please try again later.");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal show={isShown} onHide={onClose}>
            <Modal.Header closeButton>
                <Modal.Title>Gegevens bewerken</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {/* Show error if there's any */}
                {error && <div className="alert alert-danger">{error}</div>}

                {/* Form for profile edit */}
                <form onSubmit={handleSubmit}>
                    <div className="mb-3">
                        <label htmlFor="firstName" className="form-label">Voornaam</label>
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
                        <label htmlFor="lastName" className="form-label">Achternaam</label>
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
                        <label htmlFor="password" className="form-label">Wachtwoord</label>
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

                    <div className="d-flex justify-content-end">
                        <Button variant="secondary" onClick={onClose} disabled={loading} className="me-2">
                            Annuleren
                        </Button>
                        <Button variant="primary" type="submit" disabled={loading}>
                            {loading ? "Saving..." : "Opslaan"}
                        </Button>
                    </div>
                </form>
            </Modal.Body>
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
