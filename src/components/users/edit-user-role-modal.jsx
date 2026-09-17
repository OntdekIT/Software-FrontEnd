import { useState } from "react";
import PropTypes from "prop-types";
import { backendApi } from "../../utils/backend-api";
import Button from "../ui/Button.jsx";
import Modal from "../ui/Modal.jsx";
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
        <Modal show={isShown} onClose={onClose} title="Gegevens bewerken">
            {/* Form for profile edit */}
            <form onSubmit={handleSubmit}>
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

                <div className="relative mb-3">
                    <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">Wachtwoord</label>
                    <div
                        className="relative flex items-center"
                        onMouseEnter={() => setShowPassword(true)}
                        onMouseLeave={() => setShowPassword(false)}
                    >
                        <input
                            placeholder="(Ongewijzigd)"
                            id="password"
                            name="password"
                            type={showPassword ? "text" : "password"}
                            className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 disabled:bg-gray-100"
                            value={formData.password}
                            onChange={handleChange}
                            disabled={loading}
                        />
                        <div
                            className="ml-2 flex h-6 w-6 cursor-pointer items-center justify-center rounded-full bg-brand-500 font-bold text-white"
                            title={showPassword ? "Hide Password" : "Show Password"}
                        >
                            🔍
                        </div>
                    </div>
                </div>

                <div className="flex justify-end gap-2">
                    <Button variant="secondary" onClick={onClose} disabled={loading}>
                        Annuleren
                    </Button>
                    <Button variant="primary" type="submit" disabled={loading}>
                        {loading ? "Saving..." : "Opslaan"}
                    </Button>
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
