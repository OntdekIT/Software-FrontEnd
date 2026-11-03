import {useState} from "react";
import PropTypes from "prop-types";
import {backendApi} from "../../utils/backend-api.jsx";
import {useForm} from "react-hook-form";
import {useNavigate} from "react-router-dom";
import WorkshopUtils from "../../utils/workshop-utils.jsx";
import Button from "../ui/Button.jsx";
import {useToast} from "../ui/toast.jsx";

export default function WorkshopCodeForm({onSuccess}) {
    const {register, handleSubmit, formState: {errors}} = useForm({
        mode: "onChange"
    });

    const navigate = useNavigate();
    const toast = useToast();
    const [loading, setLoading] = useState(false);

    const onSubmit = async (data) => {
        setLoading(true);
        try {
            const body = {
                expirationDate: WorkshopUtils.generateExpirationDate(data.duration)
            }

            console.log(body);

            const response = await backendApi.post("/workshops", body,
                {
                    headers: {'Content-Type': 'application/json'},
                    withCredentials: true
                });

            if (response?.status === 201) {
                localStorage.setItem('workshopcode', response.data);
                toast.success('Workshopcode succesvol aangemaakt');
                onSuccess?.();
            }
        } catch (err) {
            console.error('Error:', err);
            toast.error('Er is iets misgegaan');
            setLoading(false);

            if (err.response?.status === 401) {
                navigate("/auth/login");
            }
        }
    };

    return (
        <form onSubmit={handleSubmit(onSubmit)}>
            <p className="text-center text-gray-600">Hier kan een workshopcode aangemaakt worden. De code wordt gegenereerd met willekeurige
                cijfers</p>

            <div className="mb-3 mt-6">
                <label htmlFor="duration" className="mb-1 block text-sm font-medium text-gray-700">Geldigheidsduur</label>
                <select className={`w-full rounded border bg-white px-3 py-2 focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.duration ? 'border-red-500' : 'border-gray-300'}`}
                        id="duration" {...register("duration", {required: true, valueAsNumber: true})}>
                    <option value={''} selected={true}>Kies hoelang de code geldig is</option>
                    <option value={15}>15 min</option>
                    <option value={30}>30 min</option>
                    <option value={60}>60 min</option>
                    <option value={120}>2 uur</option>
                    <option value={240}>4 uur</option>
                    <option value={720}>12 uur</option>
                    <option value={1440}>1 dag</option>
                    <option value={4320}>3 dagen</option>
                    <option value={10080}>1 week</option>
                </select>
                {errors.duration && <div className="mt-1 text-sm text-red-600">Geldigheidsduur is verplicht</div>}
            </div>
            <div className="mb-2 flex flex-col">
                <Button type="submit" variant="primary" size="lg" disabled={loading}>
                    <i className="bi bi-plus-lg"></i>
                    Workshopcode aanmaken
                </Button>
            </div>
        </form>
    );
}

WorkshopCodeForm.propTypes = {
    onSuccess: PropTypes.func
};
