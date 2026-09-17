import {useState} from "react";
import {useForm} from "react-hook-form";
import {Link, useNavigate, useSearchParams} from "react-router-dom";
import {backendApi} from "../../utils/backend-api.jsx";
import Button from "../../components/ui/Button.jsx";
import {Spinner} from "../../components/ui/Preloader.jsx";
import {useToast} from "../../components/ui/toast.jsx";

export default function ResetPassword() {
    const [isSubmitProcessing, setIsSubmitProcessing] = useState(false);
    const [hasError, setHasError] = useState(false);
    const [searchParams] = useSearchParams();
    const [email] = useState(searchParams.get('email'));
    const [token] = useState(searchParams.get('token'));
    const navigate = useNavigate();
    const toast = useToast();
    const {register, handleSubmit, formState: {errors}, watch} = useForm({
        mode: "onBlur"
    });

    const onSubmit = async (data) => {
        setIsSubmitProcessing(true);
        setHasError(false);

        const body = {
            password: data.password,
            token: token,
            email: email
        }

        try {
            const response = await backendApi.post('/authentication/reset-password', body);
            if (response?.status === 200) {
                toast.success('Je wachtwoord is opnieuw ingesteld. Je kunt nu inloggen.');
                navigate('/auth/login');
            }
        } catch (err) {
            console.error(err);
            setHasError(true);
            if (err.status === 400) {
                if (err.response?.data?.message?.includes('password')) {
                    toast.error('Wachtwoord voldoet niet aan de minimale eisen');
                } else {
                    toast.error('Er is geen account gevonden met dit e-mailadres of de aanvraag is verlopen.');
                }
            } else {
                toast.error('Er is iets misgegaan');
            }
        } finally {
            setIsSubmitProcessing(false);
        }
    }

    return (<div className="mx-auto w-full max-w-md px-4 py-8">
        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
            <h1 className="mb-6 flex items-center justify-center gap-2 text-center text-2xl font-bold text-gray-900">
                <i className="bi bi-lock text-brand-500" aria-hidden="true"></i>
                Wachtwoord resetten
            </h1>
            <p className="mb-4 text-sm text-gray-700">Vul hieronder een nieuw wachtwoord in voor het account met e-mailadres <b>{email}</b></p>
            <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
                {/*Password input*/}
                <div>
                    <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">Wachtwoord</label>
                    <div className="relative">
                        <i className="bi bi-lock pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true"></i>
                        <input
                            type="password"
                            id="password"
                            autoComplete="off"
                            {...register("password", {
                                required: 'Wachtwoord is verplicht',
                                minLength: {
                                    value: 8,
                                    message: 'Wachtwoord moet minimaal 8 tekens lang zijn'
                                },
                                pattern: {
                                    value: /^(?=.*[A-Z])(?=.*\d).+$/,
                                    message: 'Wachtwoord moet minimaal één hoofdletter en één cijfer bevatten'
                                }
                            })}
                            className={`w-full rounded-lg border px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.password || hasError ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Wachtwoord"
                            disabled={isSubmitProcessing} // Disable input when submitting
                        />
                    </div>
                    {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
                </div>

                {/*Confirm password input*/}
                <div>
                    <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">Herhaal wachtwoord</label>
                    <div className="relative">
                        <i className="bi bi-lock pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true"></i>
                        <input
                            type="password"
                            id="confirmPassword"
                            autoComplete="off"
                            {...register("confirmPassword", {
                                required: 'Herhaal wachtwoord is verplicht',
                                validate: value => value === watch('password') || 'Wachtwoorden komen niet overeen'
                            })}
                            className={`w-full rounded-lg border px-3 py-2 pl-10 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.confirmPassword || hasError ? 'border-red-500' : 'border-gray-300'}`}
                            placeholder="Herhaal wachtwoord"
                            disabled={isSubmitProcessing} // Disable input when submitting
                        />
                    </div>
                    {errors.confirmPassword &&
                        <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
                </div>

                <Button type="submit" size="lg" disabled={isSubmitProcessing} className="w-full">
                    {isSubmitProcessing ? <Spinner className="h-4 w-4" /> : <i className="bi bi-lock" aria-hidden="true"></i>} Wachtwoord resetten
                </Button>
                <Link to={"/auth/login"} className="flex items-center justify-center gap-1 text-sm text-brand-600 hover:underline">
                    <i className="bi bi-arrow-left" aria-hidden="true"></i> Terug naar inloggen
                </Link>
            </form>
        </div>
    </div>);
}
