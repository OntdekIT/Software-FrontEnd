import PropTypes from "prop-types";
import {useForm} from "react-hook-form";
import {useEffect} from "react";

export default function UserFilters({filters, onFiltersChange}) {
    const {register, setValue, reset, handleSubmit, formState: {errors}} = useForm();

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

    return (
        <form>
            {/*First Name*/}
            <div className="mb-3">
                <label htmlFor="firstName" className="form-label mb-0">Voornaam:</label>
                <input type="text" placeholder="Voornaam" className="form-control form-control-sm"
                       id="firstName" {...register("firstName")} />
            </div>

            {/*Last Name*/}
            <div className="mb-3">
                <label htmlFor="lastName" className="form-label mb-0">Achternaam:</label>
                <input type="text" placeholder="Achternaam" className="form-control form-control-sm"
                       id="lastName" {...register("lastName")} />
            </div>

            {/*Email*/}
            <div className="mb-3">
                <label htmlFor="email" className="form-label mb-0">E-mailadres:</label>
                <input type="email" placeholder="E-mailadres" className="form-control form-control-sm"
                       id="email" {...register("email")} />
            </div>

            {/*Role (admin)*/}
            <div className="mb-3">
                <label htmlFor="admin" className="form-label mb-0">Rol:</label>
                <select className="form-select form-select-sm" id="admin" {...register("admin")}>
                    <option value={null}>Alles</option>
                    <option value={"false"}>Gebruiker</option>
                    <option value={"true"}>Admin</option>
                </select>
            </div>

            <div className="d-flex justify-content-between">
                <button type="button" className="btn btn-dark flex-grow-1 me-1" onClick={clearFilters}>Reset</button>
                <button type="submit" className="btn btn-primary flex-grow-1 ms-1" onClick={handleSubmit(onSubmit)}>Pas toe</button>
            </div>
        </form>
    )
}

UserFilters.propTypes = {
    filters: PropTypes.object,
    onFiltersChange: PropTypes.func.isRequired
};