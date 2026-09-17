import {useState} from "react";
import {backendApi} from "../../../utils/backend-api.jsx";
import {useForm} from "react-hook-form";
import {useNavigate} from "react-router-dom";
import WorkshopUtils from "../../../utils/workshop-utils.jsx";
import Button from "../../../components/ui/Button.jsx";
import {useToast} from "../../../components/ui/toast.jsx";

export default function CreateWorkshopCode() {
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
                navigate("/admin/workshop-codes");
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
        <div className="mx-auto max-w-2xl px-4">
            <div className="mx-auto w-full max-w-lg">
                <form onSubmit={handleSubmit(onSubmit)}>
                    <h1 className="page-header-margin text-center text-3xl font-bold">Workshopcode aanmaken</h1>
                    <p className="text-center text-gray-600">Hier kan een workshopcode aangemaakt worden. De code wordt gegenereerd met willekeurige
                        cijfers</p>

                    <div className="mb-3">
                        <label htmlFor="duration" className="mb-1 block text-sm font-medium text-gray-700">Geldigheidsduur</label>
                        <select className={`w-full rounded-lg border bg-white px-3 py-2 focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500 ${errors.duration ? 'border-red-500' : 'border-gray-300'}`}
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
                            Workshopcode aanmaken
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}