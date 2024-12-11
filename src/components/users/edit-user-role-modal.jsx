import {Button, Modal} from "react-bootstrap";
import {backendApi} from "../../utils/backend-api.jsx";
import {useEffect, useState} from "react";
import PropTypes from "prop-types";
import UserRole from "../../domain/user-role.jsx";
import UserUtils from "../../utils/user-utils.jsx";
import {useForm} from "react-hook-form";
import {useAuth} from "../../providers/auth-provider.jsx";

export default function EditUserRoleModal({user, isShown, onClose, onRoleChanged}) {
    const {loggedInUser} = useAuth();
    const [roleOptions, setRoleOptions] = useState([]);
    const [isSubmitProcessing, setIsSubmitProcessing] = useState(false);
    const [error, setError] = useState(null);
    const {register, handleSubmit, formState: {errors}} = useForm({
        mode: "onBlur"
    });

    const calculateRoleOptions = () => {
        const loggedInUserRole = loggedInUser.role;
        const userRole = user.role;

        if (loggedInUserRole === UserRole.SUPER_ADMIN) {
            setRoleOptions([UserRole.USER, UserRole.ADMIN, UserRole.SUPER_ADMIN]);
        } else if (loggedInUserRole === UserRole.ADMIN) {
            if (userRole === UserRole.USER) {
                setRoleOptions([UserRole.USER, UserRole.ADMIN]);
            } else if (userRole === UserRole.ADMIN) {
                setRoleOptions([UserRole.ADMIN]);
            } else {
                setRoleOptions([UserRole.SUPER_ADMIN]);
            }
        }
    };

    const handleUpdateRole = async (value) => {
        setIsSubmitProcessing(true);

        try {
            const updateData = {
                role: value.role
            };

            const response = await backendApi.put(`/users/${user.id}`, updateData);

            if (response?.status === 200) {
                onRoleChanged();
            }
        } catch (err) {
            setError(err.message);
            console.error(err);

            if (err.response?.status === 401) {
                window.location.href = "/login";
            }
        } finally {
            setIsSubmitProcessing(false);
        }
    };

    useEffect(() => {
        calculateRoleOptions();
    }, [loggedInUser, user]);

    return (
        <Modal show={isShown} onHide={onClose}>
            <form onSubmit={handleSubmit(handleUpdateRole)}>
                <Modal.Header closeButton>
                    <Modal.Title>Rol aanpassen</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <div>
                        {error && <div className="error-msg">{error}</div>}
                    </div>
                    <p>Selecteer een rol om aan de gebruiker <b>{`${user.firstName} ${user.lastName}`}</b> toe te
                        kennen.</p>
                    <label>Rol<small className="text-danger">*</small></label>
                    <select
                        className={"form-select" + (errors.role ? " is-invalid" : "")}
                        {...register("role", {required: "Dit veld is vereist"})}
                        defaultValue={user.role}
                        disabled={isSubmitProcessing}
                    >
                        {roleOptions.map(role => (
                            <option key={role} value={role}>{UserUtils.translateRole(role)}</option>
                        ))}
                    </select>
                    {errors.role && <div className="invalid-feedback">{errors.role.message}</div>}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="dark" onClick={onClose}>Annuleren</Button>
                    <Button variant="primary" type="submit" disabled={isSubmitProcessing}>Opslaan</Button>
                </Modal.Footer>
            </form>
        </Modal>
    );
}

EditUserRoleModal.propTypes = {
    user: PropTypes.shape({
        id: PropTypes.number.isRequired,
        role: PropTypes.oneOf(Object.values(UserRole)).isRequired,
        firstName: PropTypes.string.isRequired,
        lastName: PropTypes.string.isRequired,
    }).isRequired,
    isShown: PropTypes.bool.isRequired,
    onClose: PropTypes.func.isRequired,
    onRoleChanged: PropTypes.func.isRequired,
};