import PropTypes from "prop-types";
import {useForm} from "react-hook-form";
import {useEffect} from "react";
import UserRole from "../../domain/user-role.jsx";
import UserUtils from "../../utils/user-utils.jsx";
import Button from "../ui/Button.jsx";

export default function UserFilters({filters, onFiltersChange}) {
    const {register, setValue, reset, handleSubmit} = useForm();

    useEffect(() => {
        if (filters) {
            Object.keys(filters).forEach(key => {
                setValue(`${key}`, filters[key]);
            });
        }
    }, [filters, setValue]);

    const onSubmit = (data) => {
        onFiltersChange(data);
    };

    const clearFilters = () => {
        onFiltersChange({});
        reset();
    };

    const fieldClass = "w-full rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

    return (
        <form>
            {/*First Name*/}
            <div className="mb-3">
                <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">Voornaam:</label>
                <input type="text" placeholder="Voornaam" className={fieldClass}
                       id="firstName" {...register("firstName")} />
            </div>

            {/*Last Name*/}
            <div className="mb-3">
                <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">Achternaam:</label>
                <input type="text" placeholder="Achternaam" className={fieldClass}
                       id="lastName" {...register("lastName")} />
            </div>

            {/*Email*/}
            <div className="mb-3">
                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">E-mailadres:</label>
                <input type="email" placeholder="E-mailadres" className={fieldClass}
                       id="email" {...register("email")} />
            </div>

            {/*Role*/}
            <div className="mb-3">
                <label htmlFor="role" className="mb-1 block text-sm font-medium text-gray-700">Rol:</label>
                <select className={fieldClass} id="role" {...register("role")}>
                    <option value={""}>Alles</option>
                    {Object.values(UserRole).map(role => (
                        <option key={role} value={role}>{UserUtils.translateRole(role)}</option>
                    ))}
                </select>
            </div>

            <div className="flex justify-between gap-2">
                <Button variant="secondary" type="button" className="flex-1" onClick={clearFilters}>Reset</Button>
                <Button variant="primary" type="submit" className="flex-1" onClick={handleSubmit(onSubmit)}>Pas toe</Button>
            </div>
        </form>
    )
}

UserFilters.propTypes = {
    filters: PropTypes.object,
    onFiltersChange: PropTypes.func.isRequired
};
