import useAuth from "../../hooks/use-auth.jsx";
import {useEffect, useRef, useState} from "react";
import {backendApi} from "../../utils/backend-api.jsx";
import {Link} from "react-router-dom";
import LoadingComponent from "../../components/map/loading-component.jsx";
import VerifyEmail from "../../components/auth/verify-email.jsx";
import {useForm} from "react-hook-form";

export default function Login() {
    const {register, handleSubmit, formState: {errors}} = useForm({
        mode: "onBlur"
    });

    const {setAuth} = useAuth();
    const [formData, setFormData] = useState({});
    const [errMsg, setErrMsg] = useState('');
    const [verify, setVerify] = useState(false);
    const [loading, setLoading] = useState(false); // State to manage form submission status

    useEffect(() => {
        setErrMsg('');
    }, []);

    const onSubmit = async (data) => {
        localStorage.removeItem("stationId");
        setLoading(true); // Disable form on submit
        setFormData(data);
        try {
            const response = await backendApi.post('/Authentication/login', JSON.stringify({
                mailAddress: data.email,
                password: data.password
            }), {
                headers: {'Content-Type': 'application/JSON'},
                withCredentials: false
            });

            const accessToken = response?.data?.accessToken;
            const roles = response?.data?.roles;
            setAuth({mail: data.email, password: data.password, roles, accessToken});

            if (response?.status === 200) {
                setVerify(true);
            }
        } catch (err) {
            console.error(err);
            if (err.status > 400 && err.status < 500) {
                setErrMsg('Email en/of wachtwoord is onjuist');
            } else {
                setErrMsg('Er is iets misgegaan');
            }
        }
        setLoading(false); // Re-enable form if there's an error
    }

    return (
        <>
            {verify ? (
                <VerifyEmail email={formData.email} message={"Login bevestigen"}/>
            ) : (
                <div className="container">
                    <div className="row">
                        <div className="col-12 col-md-8 col-lg-6 col-xxl-4 offset-md-2 offset-lg-3 offset-xxl-4">
                            <h1 className="text-center page-header-margin">Inloggen</h1>
                            {errMsg && <div className="error-msg">{errMsg}</div>}
                            {loading && (
                                <LoadingComponent message="Gegevens aan het controleren en email aan het sturen..."
                                                  isFullScreen={true}></LoadingComponent>
                            )}

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
                                        disabled={loading} // Disable input when submitting
                                    />
                                    <label htmlFor="email" className="form-label">E-mailadres</label>
                                    {errors.email && <div className="invalid-feedback">E-mailadres is verplicht</div>}
                                </div>

                                {/* Password input */}
                                <div className="form-floating mb-3">
                                    <input
                                        type="password"
                                        id="password"
                                        autoComplete="off"
                                        {...register("password", {required: true})}
                                        className={`form-control ${errors.password || errMsg ? 'is-invalid' : ''}`}
                                        placeholder="Password"
                                        disabled={loading} // Disable input when submitting
                                    />
                                    <label htmlFor="password" className="form-label">Wachtwoord</label>
                                    {errors.password && <div className="invalid-feedback">Wachtwoord is verplicht</div>}
                                </div>
                                <div className="d-grid mb-2">
                                    <button className="btn btn-lg btn-primary"
                                            disabled={loading}>
                                        Inloggen
                                    </button>
                                </div>
                                <p>Nog geen account? <Link to={"/auth/register"}>registreer hier</Link></p>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}