import {useState} from "react";
import {backendApi} from "../../utils/backend-api.jsx";
import {Link, useNavigate} from "react-router-dom";
import VerifyEmail from "../../components/auth/verify-email.jsx";
import {useForm} from "react-hook-form";
import Button from "../../components/ui/Button.jsx";
import {Spinner} from "../../components/ui/Preloader.jsx";
import {useToast} from "../../components/ui/toast.jsx";
import {useAuth} from "../../providers/auth-provider.jsx";

export default function Login() {
    const {register, handleSubmit, formState: {errors}} = useForm({
        mode: "onBlur"
    });

    const toast = useToast();
    const navigate = useNavigate();
    const {updateToken} = useAuth();
    const [formData, setFormData] = useState({});
    const [verify, setVerify] = useState(false);
    const [loading, setLoading] = useState(false); // State to manage form submission status

    const onSubmit = async (data) => {
        localStorage.removeItem("stationId");
        setLoading(true); // Disable form on submit
        setFormData(data);
        try {
            const response = await backendApi.post('/authentication/login', JSON.stringify({
                email: data.email,
                password: data.password
            }), {
                headers: {'Content-Type': 'application/JSON'},
                withCredentials: false
            });

            if (response?.status === 200) {
                // Vertrouwd IP: de backend geeft direct een token terug en de
                // mailverificatie wordt overgeslagen. Anders naar het verify-scherm.
                if (response.data?.verificationRequired === false && response.data?.token) {
                    updateToken(response.data.token);
                    navigate("/my/stations");
                } else {
                    setVerify(true);
                }
            }
        } catch (err) {
            console.error(err);
            if (err.status > 400 && err.status < 500) {
                toast.error('Email en/of wachtwoord is onjuist');
            } else {
                toast.error('Er is iets misgegaan');
            }
        }
        setLoading(false); // Re-enable form if there's an error
    }

    if (verify) {
        return <VerifyEmail email={formData.email} message={"Login bevestigen"}/>;
    }

    return (
        <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-10">
            <div className="w-full max-w-md">
                {/* Brand header */}
                <div className="mb-6 flex flex-col items-center text-center">
                    <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-xl bg-brand-500 text-dark shadow-sm">
                        <i className="bi bi-broadcast text-2xl" aria-hidden="true"></i>
                    </span>
                    <span className="text-lg font-semibold tracking-tight text-gray-900">MB Ontdekt</span>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                    <div className="mb-6 text-center">
                        <h1 className="text-2xl font-bold text-gray-900">Inloggen</h1>
                        <p className="mt-1 text-sm text-gray-500">Log in om verder te gaan naar je account.</p>
                    </div>

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        {/* Email input */}
                        <div>
                            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">E-mailadres</label>
                            <div className="relative">
                                <i className="bi bi-envelope pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true"></i>
                                <input
                                    type="email"
                                    id="email"
                                    autoComplete="off"
                                    {...register("email", {required: true})}
                                    className={`w-full rounded-lg border px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Email"
                                    disabled={loading} // Disable input when submitting
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-sm text-red-600">E-mailadres is verplicht</p>}
                        </div>

                        {/* Password input */}
                        <div>
                            <div className="mb-1 flex items-center justify-between">
                                <label htmlFor="password" className="block text-sm font-medium text-gray-700">Wachtwoord</label>
                                <Link to={"/auth/forgot-password"} className="text-sm text-brand-600 hover:underline">Wachtwoord vergeten?</Link>
                            </div>
                            <div className="relative">
                                <i className="bi bi-lock pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true"></i>
                                <input
                                    type="password"
                                    id="password"
                                    autoComplete="off"
                                    {...register("password", {required: true})}
                                    className={`w-full rounded-lg border px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Password"
                                    disabled={loading} // Disable input when submitting
                                />
                            </div>
                            {errors.password && <p className="mt-1 text-sm text-red-600">Wachtwoord is verplicht</p>}
                        </div>

                        <Button data-testid='Login' type="submit" size="lg" disabled={loading} className="mt-2 w-full">
                            {loading ? <Spinner className="h-4 w-4" /> : <i className="bi bi-box-arrow-in-right" aria-hidden="true"></i>}
                            {loading ? 'Bezig met inloggen…' : 'Inloggen'}
                        </Button>
                    </form>
                </div>

                <p className="mt-6 text-center text-sm text-gray-600">
                    Nog geen account?{' '}
                    <Link to={"/auth/register"} data-testid="RegisterButton" className="font-medium text-brand-600 hover:underline">Registreer hier</Link>
                </p>
            </div>
        </div>
    );
}
