import PropTypes from "prop-types";
import { useForm } from "react-hook-form";
import { useEffect } from "react";

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

    return (
        <form>
            <div className="mb-3">
                <label htmlFor="name" className="form-label mb-0">Naam:</label>
                <input type="text" placeholder="Naam" className="form-control form-control-sm"
                       id="name" {...register("name")} />
            </div>

            <div className="mb-3">
                <label htmlFor="database_tag" className="form-label mb-0">Database Tag:</label>
                <input type="text" placeholder="Database Tag" className="form-control form-control-sm"
                       id="database_tag" {...register("database_tag")} />
            </div>

            <div className="mb-3">
                <label htmlFor="isPublic" className="form-label mb-0">Publiek:</label>
                <select className="form-select form-select-sm" id="isPublic" {...register("isPublic")}>
                    <option value="">Alles</option>
                    <option value="true">Ja</option>
                    <option value="false">Nee</option>
                </select>
            </div>

            <div className="mb-3">
                <label htmlFor="registration_code" className="form-label mb-0">Registratiecode:</label>
                <input type="number" placeholder="Registratiecode" className="form-control form-control-sm"
                       id="registration_code" {...register("registration_code")} />
            </div>

            <div className="mb-3">
                <label htmlFor="username" className="form-label mb-0">Gebruikersnaam:</label>
                <input type="text" placeholder="Gebruikersnaam (bijv. John Pork)" className="form-control form-control-sm"
                    id="username" {...register("username")} />
            </div>

            <div className="mb-3">
                <label htmlFor="isActive" className="form-label mb-0">Actief:</label>
                <select className="form-select form-select-sm" id="isActive" {...register("isActive")}>
                    <option value="">Alles</option>
                    <option value="true">Ja</option>
                    <option value="false">Nee</option>
                </select>
            </div>

            <div className="d-flex justify-content-between">
                <button type="button" className="btn btn-dark flex-grow-1 me-1" onClick={clearFilters}>Reset</button>
                <button type="submit" className="btn btn-primary flex-grow-1 ms-1" onClick={handleSubmit(onSubmit)}>Pas toe</button>
            </div>
        </form>
    );
}

StationFilters.propTypes = {
    filters: PropTypes.object,
    onFiltersChange: PropTypes.func.isRequired
};
