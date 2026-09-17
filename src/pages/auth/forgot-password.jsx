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
                        <h1 className="text-2xl font-bold text-gray-900">Wachtwoord vergeten?</h1>
                        <p className="mt-1 text-sm text-gray-500">
                            Vul je e-mailadres in en we sturen je een link om je wachtwoord opnieuw in te stellen.
                        </p>
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
                                    disabled={isSubmitProcessing} // Disable input when submitting
                                />
                            </div>
                            {errors.email && <p className="mt-1 text-sm text-red-600">E-mailadres is verplicht</p>}
                        </div>

                        <Button type="submit" size="lg" disabled={isSubmitProcessing} className="mt-2 w-full">
                            {isSubmitProcessing ? <Spinner className="h-4 w-4" /> : <i className="bi bi-envelope" aria-hidden="true"></i>}
                            {isSubmitProcessing ? 'Aanvraag versturen…' : 'Aanvraag versturen'}
                        </Button>
                    </form>
                </div>

                <p className="mt-6 text-center text-sm text-gray-600">
                    <Link to={"/auth/login"} className="inline-flex items-center gap-1 font-medium text-brand-600 hover:underline">
                        <i className="bi bi-arrow-left" aria-hidden="true"></i> Terug naar inloggen
                    </Link>
                </p>
            </div>
        </div>
    );
}
