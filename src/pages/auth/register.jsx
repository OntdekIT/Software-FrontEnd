import {useState} from "react";
import {backendApi} from "../../utils/backend-api.jsx";
import Preloader from "../../components/ui/Preloader.jsx";
import VerifyEmail from "../../components/auth/verify-email.jsx";
import {Link} from "react-router-dom";
import {useForm} from "react-hook-form";
import Button from "../../components/ui/Button.jsx";
import {Spinner} from "../../components/ui/Preloader.jsx";
import {useToast} from "../../components/ui/toast.jsx";

export default function Register() {
    const {register, handleSubmit, formState: {errors}} = useForm({
        mode: "onBlur"
    });
    const toast = useToast();
    const [verify, setVerify] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState(null);

    const onSubmit = async (data) => {
        setLoading(true);
        setFormData(data);

        try {
            const body = {
                firstName: data.firstName,
                lastName: data.lastName,
                password: data.password,
                email: data.email,
                stationCode: data.stationCode,
                workshopCode: data.workshopCode,
            };

            const response = await backendApi.post("/authentication/register", JSON.stringify(body), {
                headers: {'Content-Type': 'application/JSON'},
                withCredentials: false
            });

            if (response?.status === 201) {
                setVerify(true);
                localStorage.setItem("stationId", data.stationCode);
            }
        } catch (err) {
            if (!err?.response) {
                toast.error('Kon geen verbinding maken, probeer het later opnieuw');
            } else {
                toast.error(err.response.data);
            }
        }
        setLoading(false);
    };

    return (
        <>
            {verify ? (
                <VerifyEmail email={formData.email}/>
            ) : (
                <div className="mx-auto w-full max-w-2xl px-4 py-8">
                    {loading && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-white/70">
                            <Preloader message="Gegevens aan het controleren en email aan het sturen…" />
                        </div>
                    )}

                    <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                        <h1 className="mb-6 flex items-center justify-center gap-2 text-center text-2xl font-bold text-gray-900">
                            <i className="bi bi-person-plus text-brand-500" aria-hidden="true"></i>
                            Registreren
                        </h1>

                        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="firstName" className="mb-1 block text-sm font-medium text-gray-700">Voornaam</label>
                                    <div className="relative">
                                        <i className="bi bi-person pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true"></i>
                                        <input
                                            className={`w-full rounded-lg border px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.firstName ? 'border-red-500' : 'border-gray-300'}`}
                                            type="text"
                                            id="firstName"
                                            {...register("firstName", {required: true})}
                                            placeholder="Voornaam"
                                            disabled={loading}
                                        />
                                    </div>
                                    {errors.firstName &&
                                        <p className="mt-1 text-sm text-red-600">Voornaam is verplicht</p>}
                                </div>

                                <div>
                                    <label htmlFor="lastName" className="mb-1 block text-sm font-medium text-gray-700">Achternaam</label>
                                    <div className="relative">
                                        <i className="bi bi-person pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true"></i>
                                        <input
                                            className={`w-full rounded-lg border px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.lastName ? 'border-red-500' : 'border-gray-300'}`}
                                            type="text"
                                            id="lastName"
                                            {...register("lastName", {required: true})}
                                            placeholder="Achternaam"
                                            disabled={loading}
                                        />
                                    </div>
                                    {errors.lastName &&
                                        <p className="mt-1 text-sm text-red-600">Achternaam is verplicht</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">E-mailadres</label>
                                <div className="relative">
                                    <i className="bi bi-envelope pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true"></i>
                                    <input
                                        className={`w-full rounded-lg border px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                        type="email"
                                        id="email"
                                        {...register("email", {required: true})}
                                        placeholder="Email"
                                        disabled={loading}
                                    />
                                </div>
                                {errors.email && <p className="mt-1 text-sm text-red-600">E-mailadres is verplicht</p>}
                            </div>

                            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                                <div>
                                    <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">Wachtwoord</label>
                                    <div className="relative">
                                        <i className="bi bi-lock pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true"></i>
                                        <input
                                            className={`w-full rounded-lg border px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                            type="password"
                                            id="password"
                                            {...register("password", {required: true})}
                                            placeholder="Wachtwoord"
                                            disabled={loading}
                                        />
                                    </div>
                                    {errors.password &&
                                        <p className="mt-1 text-sm text-red-600">Wachtwoord is verplicht</p>}
                                </div>

                                <div>
                                    <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">Herhaal Wachtwoord</label>
                                    <div className="relative">
                                        <i className="bi bi-lock pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true"></i>
                                        <input
                                            className={`w-full rounded-lg border px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.confirmPassword ? 'border-red-500' : 'border-gray-300'}`}
                                            type="password"
                                            id="confirmPassword"
                                            {...register("confirmPassword", {required: true})}
                                            placeholder="Herhaal Wachtwoord"
                                            disabled={loading}
                                        />
                                    </div>
                                    {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">Herhaal Wachtwoord is verplicht</p>}
                                </div>
                            </div>

                            <div>
                                <label htmlFor="stationCode" className="mb-1 block text-sm font-medium text-gray-700">Meetstation Code</label>
                                <div className="relative">
                                    <i className="bi bi-broadcast pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true"></i>
                                    <input
                                        className={`w-full rounded-lg border px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.stationCode ? 'border-red-500' : 'border-gray-300'}`}
                                        type="number"
                                        id="stationCode"
                                        {...register("stationCode", {required: true})}
                                        placeholder="123456"
                                        disabled={loading}
                                    />
                                </div>
                                {errors.stationCode &&
                                    <p className="mt-1 text-sm text-red-600">Meetstation Code is verplicht</p>}
                            </div>

                            <div>
                                <label htmlFor="workshopCode" className="mb-1 block text-sm font-medium text-gray-700">Workshop Code</label>
                                <div className="relative">
                                    <i className="bi bi-mortarboard pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true"></i>
                                    <input
                                        className={`w-full rounded-lg border px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.workshopCode ? 'border-red-500' : 'border-gray-300'}`}
                                        type="number"
                                        id="workshopCode"
                                        {...register("workshopCode", {required: true})}
                                        placeholder="123456"
                                        disabled={loading}
                                    />
                                </div>
                                {errors.workshopCode &&
                                    <p className="mt-1 text-sm text-red-600">Workshop Code is verplicht</p>}
                            </div>

                            <Button type="submit" size="lg" data-testid='Register' disabled={loading} className="w-full">
                                {loading ? <Spinner className="h-4 w-4" /> : <i className="bi bi-person-plus" aria-hidden="true"></i>}
                                Registreren
                            </Button>
                            <p className="text-sm text-gray-700">Heb je al een account? <Link to={"/auth/login"} className="text-brand-600 hover:underline">log hier in</Link></p>
                        </form>
                    </div>
                </div>
            )}
        </>
    );
}
