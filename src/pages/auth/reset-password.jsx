import {useState} from "react";
import {useForm} from "react-hook-form";
import {useNavigate, useSearchParams} from "react-router-dom";
import {backendApi} from "../../utils/backend-api.jsx";
import Button from "../../components/ui/Button.jsx";
import {Spinner} from "../../components/ui/Preloader.jsx";

export default function ResetPassword() {
    const [errMsg, setErrMsg] = useState('');
    const [isSubmitProcessing, setIsSubmitProcessing] = useState(false);
    const [searchParams] = useSearchParams();
    const [email] = useState(searchParams.get('email'));
    const [token] = useState(searchParams.get('token'));
    const navigate = useNavigate();
    const {register, handleSubmit, formState: {errors}, watch} = useForm({
        mode: "onBlur"
    });

    const onSubmit = async (data) => {
        setIsSubmitProcessing(true);
        setErrMsg('');

        const body = {
            password: data.password,
            token: token,
            email: email
        }

        try {
            const response = await backendApi.post('/authentication/reset-password', body);
            if (response?.status === 200) {
                navigate('/auth/login');
            }
        } catch (err) {
            console.error(err);
            if (err.status === 400) {
                if (err.response?.data?.message?.includes('password')) {
                    setErrMsg('Wachtwoord voldoet niet aan de minimale eisen');
                } else {
                    setErrMsg('Er is geen account gevonden met dit e-mailadres of de aanvraag is verlopen.');
                }
            } else {
                setErrMsg('Er is iets misgegaan');
            }
        } finally {
            setIsSubmitProcessing(false);
        }
    }

    return (<div className="mx-auto w-full max-w-md px-4 py-8">
        <h1 className="mb-6 text-center text-2xl font-bold text-gray-900">Wachtwoord resetten</h1>
        {errMsg && (
            <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">{errMsg}</div>
        )}
        <p className="mb-4 text-sm text-gray-700">Vul hieronder een nieuw wachtwoord in voor het account met e-mailadres <b>{email}</b></p>
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
            {/*Password input*/}
            <div>
                <label htmlFor="password" className="mb-1 block text-sm font-medium text-gray-700">Wachtwoord</label>
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
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.password || errMsg ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Wachtwoord"
                    disabled={isSubmitProcessing} // Disable input when submitting
                />
                {errors.password && <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>}
            </div>

            {/*Confirm password input*/}
            <div>
                <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium text-gray-700">Herhaal wachtwoord</label>
                <input
                    type="password"
                    id="confirmPassword"
                    autoComplete="off"
                    {...register("confirmPassword", {
                        required: 'Herhaal wachtwoord is verplicht',
                        validate: value => value === watch('password') || 'Wachtwoorden komen niet overeen'
                    })}
                    className={`w-full rounded-lg border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500 ${errors.confirmPassword || errMsg ? 'border-red-500' : 'border-gray-300'}`}
                    placeholder="Herhaal wachtwoord"
                    disabled={isSubmitProcessing} // Disable input when submitting
                />
                {errors.confirmPassword &&
                    <p className="mt-1 text-sm text-red-600">{errors.confirmPassword.message}</p>}
            </div>

            <Button type="submit" size="lg" disabled={isSubmitProcessing} className="w-full">
                {isSubmitProcessing && <Spinner className="h-4 w-4" />} Wachtwoord resetten
            </Button>
        </form>
    </div>);
}