import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { useEffect } from "react";
import Button from "../ui/Button.jsx";

export default function StationFilters({ filters, onFiltersChange }) {
    const { register, setValue, reset, handleSubmit } = useForm();

    useEffect(() => {
        if (filters) {
            Object.keys(filters).forEach(key => {
                setValue(key, filters[key]);
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
    const labelClass = "mb-0 block text-sm font-medium text-gray-700";

    return (
        <form>
            <div className="mb-3">
                <label htmlFor="name" className={labelClass}>Naam:</label>
                <input type="text" placeholder="Naam" className={fieldClass}
                       id="name" {...register("name")} />
            </div>

            <div className="mb-3">
                <label htmlFor="database_tag" className={labelClass}>Database Tag:</label>
                <input type="text" placeholder="Database Tag" className={fieldClass}
                       id="database_tag" {...register("database_tag")} />
            </div>

            <div className="mb-3">
                <label htmlFor="isPublic" className={labelClass}>Publiek:</label>
                <select className={fieldClass} id="isPublic" {...register("isPublic")}>
                    <option value="">Alles</option>
                    <option value="true">Ja</option>
                    <option value="false">Nee</option>
                </select>
            </div>

            <div className="mb-3">
                <label htmlFor="registration_code" className={labelClass}>Registratiecode:</label>
                <input type="number" placeholder="Registratiecode" className={fieldClass}
                       id="registration_code" {...register("registration_code")} />
            </div>

            <div className="mb-3">
                <label htmlFor="username" className={labelClass}>Gebruikersnaam:</label>
                <input type="text" placeholder="Gebruikersnaam (bijv. John Pork)" className={fieldClass}
                    id="username" {...register("username")} />
            </div>

            <div className="mb-3">
                <label htmlFor="isActive" className={labelClass}>Actief:</label>
                <select className={fieldClass} id="isActive" {...register("isActive")}>
                    <option value="">Alles</option>
                    <option value="true">Ja</option>
                    <option value="false">Nee</option>
                </select>
            </div>

            <div className="flex justify-between gap-2">
                <Button type="button" variant="secondary" className="flex-grow" onClick={clearFilters}><i className="bi bi-arrow-counterclockwise"></i> Reset</Button>
                <Button type="submit" variant="primary" className="flex-grow" onClick={handleSubmit(onSubmit)}><i className="bi bi-funnel"></i> Pas toe</Button>
            </div>
        </form>
    );
}

StationFilters.propTypes = {
    filters: PropTypes.object,
    onFiltersChange: PropTypes.func.isRequired
};
