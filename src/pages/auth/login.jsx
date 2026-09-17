import {useState} from "react";
import {backendApi} from "../../utils/backend-api.jsx";
import {Link} from "react-router-dom";
import LoadingComponent from "../../components/loading-component.jsx";
import VerifyEmail from "../../components/auth/verify-email.jsx";
import {useForm} from "react-hook-form";
import Button from "../../components/ui/Button.jsx";
import {useToast} from "../../components/ui/toast.jsx";

export default function Login() {
    const {register, handleSubmit, formState: {errors}} = useForm({
        mode: "onBlur"
    });

    const toast = useToast();
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
                setVerify(true);
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

    return (
        <>
            {verify ? (
                <VerifyEmail email={formData.email} message={"Login bevestigen"}/>
            ) : (
                <div className="mx-auto w-full max-w-md px-4 py-8">
                    <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">Inloggen</h1>
                    {loading && (
                        <LoadingComponent message="Gegevens aan het controleren en email aan het sturen..."
                                          isFullScreen={true}></LoadingComponent>
                    )}

                    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                        {/* Email input */}
                        <div>
                            <label htmlFor="email" className="mb-1 block text-sm font-medium text-gray-700">E-mailadres</label>
                            <input
                                type="email"
                                id="email"
                                autoComplete="off"
                                {...register("email", {required: true})}
                                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Email"
                                disabled={loading} // Disable input when submitting
                            />
                            {errors.email && <p className="mt-1 text-sm text-red-600">E-mailadres is verplicht</p>}
                        </div>

                        {/* Password input */}
                        <div>
                            <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">Wachtwoord</label>
                            <input
                                type="password"
                                id="password"
                                autoComplete="off"
                                {...register("password", {required: true})}
                                className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.password ? 'border-red-500' : 'border-gray-300'}`}
                                placeholder="Password"
                                disabled={loading} // Disable input when submitting
                            />
                            {errors.password && <p className="mt-1 text-sm text-red-600">Wachtwoord is verplicht</p>}
                        </div>
                        <Button data-testid='Login' type="submit" size="lg" disabled={loading} className="w-full">
                            Inloggen
                        </Button>
                        <Link to={"/auth/forgot-password"} className="text-sm text-brand-600 hover:underline">Wachtwoord vergeten?</Link>
                        <p className="text-sm text-gray-700">Nog geen account? <Link to={"/auth/register"} data-testid="RegisterButton" className="text-brand-600 hover:underline">registreer hier</Link></p>
                    </form>
                </div>
            )}
        </>
    );
}