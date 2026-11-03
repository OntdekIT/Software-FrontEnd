import { useState } from "react";
import PropTypes from "prop-types";
import { backendApi } from "../../utils/backend-api";
import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";
import { Spinner } from "../ui/Preloader.jsx";
import { useToast } from "../ui/toast.jsx";

export default function EditUserProfileModal({ user, isShown, onClose, onProfileUpdated }) {
    const [formData, setFormData] = useState({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        password: "",
    });
    const [loading, setLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false); // State to toggle password visibility
    const toast = useToast();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({ ...prevData, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            setLoading(true);
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
            toast.error(err.response?.data?.message || "Er is iets misgegaan. Probeer het later opnieuw.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <Modal
            show={isShown}
            onClose={onClose}
            title="Gegevens bewerken"
            footer={
                <>
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        <i className="bi bi-x-lg"></i> Annuleren
                    </Button>
                    <Button variant="primary" type="submit" form="edit-user-role-form" disabled={loading}>
                        {loading ? <Spinner className="h-4 w-4" /> : <i className="bi bi-check-lg"></i>} Opslaan
                    </Button>
                </>
            }
        >
            {/* Form for profile edit */}
            <form id="edit-user-role-form" onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">Voornaam</label>
                    <input
                        id="firstName"
                        name="firstName"
                        type="text"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-gray-100"
                        value={formData.firstName}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">Achternaam</label>
                    <input
                        id="lastName"
                        name="lastName"
                        type="text"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-gray-100"
                        value={formData.lastName}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">Email</label>
                    <input
                        id="email"
                        name="email"
                        type="email"
                        className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-gray-100"
                        value={formData.email}
                        onChange={handleChange}
                        disabled={loading}
                    />
                </div>

                <div className="mb-3">
                    <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">Wachtwoord</label>
                    <div className="relative flex items-center">
                        <input
                            placeholder="(Ongewijzigd)"
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 pr-10 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-gray-100"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <Button
                            variant="ghost"
                            size="sm"
                            className="absolute right-1 !px-2 text-gray-500"
                            onClick={() => setShowPassword((v) => !v)}
                            disabled={loading}
                            aria-label={showPassword ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
                            title={showPassword ? "Wachtwoord verbergen" : "Wachtwoord tonen"}
                        >
                            <i className={showPassword ? "bi bi-eye-slash" : "bi bi-eye"}></i>
                        </Button>
                    </div>
                </div>
            </form>
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
