import {useForm} from "react-hook-form";
import {useState} from "react";
import {backendApi} from "../../utils/backend-api.jsx";

export default function ForgotPassword() {
    const [errMsg, setErrMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [isSubmitProcessing, setIsSubmitProcessing] = useState(false);
    const {register, handleSubmit, formState: {errors}} = useForm({
        mode: "onBlur"
    });

    const onSubmit = async (data) => {
        setIsSubmitProcessing(true);
        setSuccessMsg('');
        setErrMsg('');
        try {
            const response = await backendApi.post('/authentication/forgot-password', JSON.stringify(data));
            console.log(response);
            if (response?.status === 200) {
                setSuccessMsg('Er is een e-mail verstuurd. Controleer je inbox en spamfolder.');
            }
        } catch (err) {
            console.error(err);
            if (err.status === 400) {
                setErrMsg('Er is geen account gevonden met dit e-mailadres');
            } else {
                setErrMsg('Er is iets misgegaan');
            }

        } finally {
            setIsSubmitProcessing(false);
        }
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-12 col-md-8 col-lg-6 col-xxl-4 offset-md-2 offset-lg-3 offset-xxl-4">
                    <h1 className="page-header-margin text-center">Wachtwoord vergeten?</h1>
                    {errMsg && <div className="error-msg">{errMsg}</div>}
                    {successMsg && <div className="success-msg">{successMsg}</div>}
                    <p>Vul hieronder je e-mailadres in om een e-mail te ontvangen waarmee je je wachtwoord opnieuw kunt
                        instellen.</p>
                    <form onSubmit={handleSubmit(onSubmit)}>
                        {/* Email input */}
                        <div className="form-floating mb-3">
                            <input
                                type="email"
                                id="email"
                                autoComplete="off"
                                {...register("email", {required: true})}
                                className={`form-control ${errors.email || errMsg ? 'is-invalid' : ''}`}
                                placeholder="Email"
                                disabled={isSubmitProcessing} // Disable input when submitting
                            />
                            <label htmlFor="email" className="form-label">E-mailadres</label>
                            {errors.email && <div className="invalid-feedback">E-mailadres is verplicht</div>}
                        </div>
                        <div className="d-grid mb-2">
                            <button className="btn btn-lg btn-primary"
                                    type={"submit"}
                                    disabled={isSubmitProcessing}>
                                {isSubmitProcessing && (<div className="spinner-border spinner-border-sm" role="status">
                                    <span className="visually-hidden">Loading...</span>
                                </div>)} Aanvraag versturen
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}