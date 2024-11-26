import {useState} from "react";
import {useForm} from "react-hook-form";
import {useNavigate, useSearchParams} from "react-router-dom";
import {backendApi} from "../../utils/backend-api.jsx";

export default function ResetPassword() {
    const [errMsg, setErrMsg] = useState('');
    const [isSubmitProcessing, setIsSubmitProcessing] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const [email, setEmail] = useState(searchParams.get('email'));
    const [token, setToken] = useState(searchParams.get('token'));
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
            const response = await backendApi.post('/authentication/reset-password', JSON.stringify(body));
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

    return (<div className="container">
        <div className="row">
            <div className="col-12 col-md-8 col-lg-6 col-xxl-4 offset-md-2 offset-lg-3 offset-xxl-4">
                <h1 className="page-header-margin text-center">Wachtwoord resetten</h1>
                {errMsg && <div className="error-msg">{errMsg}</div>}
                <p>Vul hieronder een nieuw wachtwoord in voor het account met e-mailadres <b>{email}</b></p>
                <form onSubmit={handleSubmit(onSubmit)}>
                    {/*Password input*/}
                    <div className="form-floating mb-3">
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
                            className={`form-control ${errors.password || errMsg ? 'is-invalid' : ''}`}
                            placeholder="Wachtwoord"
                            disabled={isSubmitProcessing} // Disable input when submitting
                        />
                        <label htmlFor="password" className="form-label">Wachtwoord</label>
                        {errors.password && <div className="invalid-feedback">{errors.password.message}</div>}
                    </div>

                    {/*Confirm password input*/}
                    <div className="form-floating mb-3">
                        <input
                            type="password"
                            id="confirmPassword"
                            autoComplete="off"
                            {...register("confirmPassword", {
                                required: 'Herhaal wachtwoord is verplicht',
                                validate: value => value === watch('password') || 'Wachtwoorden komen niet overeen'
                            })}
                            className={`form-control ${errors.confirmPassword || errMsg ? 'is-invalid' : ''}`}
                            placeholder="Herhaal wachtwoord"
                            disabled={isSubmitProcessing} // Disable input when submitting
                        />
                        <label htmlFor="confirmPassword" className="form-label">Herhaal wachtwoord</label>
                        {errors.confirmPassword &&
                            <div className="invalid-feedback">{errors.confirmPassword.message}</div>}
                    </div>

                    <div className="d-grid mb-2">
                        <button className="btn btn-lg btn-primary"
                                type={"submit"}
                                disabled={isSubmitProcessing}>
                            {isSubmitProcessing && (<div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Loading...</span>
                            </div>)} Wachtwoord resetten
                        </button>
                    </div>
                </form>
            </div>
        </div>
    </div>);
}