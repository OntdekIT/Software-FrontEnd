import {useForm} from "react-hook-form";
import {useState} from "react";
import {Link} from "react-router-dom";
import {backendApi} from "../../utils/backend-api.jsx";
import Button from "../../components/ui/Button.jsx";
import {Spinner} from "../../components/ui/Preloader.jsx";
import {useToast} from "../../components/ui/toast.jsx";

export default function ForgotPassword() {
    const [isSubmitProcessing, setIsSubmitProcessing] = useState(false);
    const toast = useToast();
    const {register, handleSubmit, formState: {errors}} = useForm({
        mode: "onBlur"
    });

    const onSubmit = async (data) => {
        setIsSubmitProcessing(true);
        try {
            const response = await backendApi.post('/authentication/forgot-password', data);
            console.log(response);
            if (response?.status === 200) {
                toast.success('Er is een e-mail verstuurd. Controleer je inbox en spamfolder.');
            }
        } catch (err) {
            console.error(err);
            if (err.status === 400) {
                toast.error('Er is geen account gevonden met dit e-mailadres');
            } else {
                toast.error('Er is iets misgegaan');
            }

        } finally {
            setIsSubmitProcessing(false);
        }
    };

    return (
        <div className="mx-auto w-full max-w-md px-4 py-8">
            <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                <h1 className="mb-6 flex items-center justify-center gap-2 text-center text-2xl font-bold text-gray-900">
                    <i className="bi bi-lock text-brand-500" aria-hidden="true"></i>
                    Wachtwoord vergeten?
                </h1>
                <p className="mb-4 text-sm text-gray-700">Vul hieronder je e-mailadres in om een e-mail te ontvangen waarmee je je wachtwoord opnieuw kunt
                    instellen.</p>
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
                                disabled={isSubmitProcessing} // Disable input when submitting
                            />
                        </div>
                        {errors.email && <p className="mt-1 text-sm text-red-600">E-mailadres is verplicht</p>}
                    </div>
                    <Button type="submit" size="lg" disabled={isSubmitProcessing} className="w-full">
                        {isSubmitProcessing ? <Spinner className="h-4 w-4" /> : <i className="bi bi-envelope" aria-hidden="true"></i>} Aanvraag versturen
                    </Button>
                    <Link to={"/auth/login"} className="flex items-center justify-center gap-1 text-sm text-brand-600 hover:underline">
                        <i className="bi bi-arrow-left" aria-hidden="true"></i> Terug naar inloggen
                    </Link>
                </form>
            </div>
        </div>
    );
}
