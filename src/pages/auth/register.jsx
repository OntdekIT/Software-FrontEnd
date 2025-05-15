import {useState} from "react";
import {backendApi} from "../../utils/backend-api.jsx";
import LoadingComponent from "../../components/loading-component.jsx";
import VerifyEmail from "../../components/auth/verify-email.jsx";
import {Link} from "react-router-dom";
import {useForm} from "react-hook-form";

export default function Register() {
    const {register, handleSubmit, formState: {errors}} = useForm({
        mode: "onBlur"
    });
    const [errMsg, setErrMsg] = useState('');
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
                localStorage.setItem("stationId", data.meetstationCode);
            }
        } catch (err) {
            if (!err?.response) {
                setErrMsg('Kon geen verbinding maken, probeer het later opnieuw');
            } else {
                setErrMsg(err.response.data);
            }
        }
        setLoading(false);
    };

    return (
        <>
            {verify ? (
                <VerifyEmail email={formData.email}/>
            ) : (
                <div className="container">
                    <div className="row">
                        <div className="col-12 col-md-8 col-lg-6 offset-md-2 offset-lg-3">
                            <h1 className="text-center page-header-margin">Registreren</h1>
                            {errMsg && <div className="error-msg">{errMsg}</div>}
                            {loading && (
                                <LoadingComponent message="Gegevens aan het controleren en email aan het sturen..."
                                                  isFullScreen={true}></LoadingComponent>
                            )}

                            <form onSubmit={handleSubmit(onSubmit)}>
                                <div className="row">
                                    <div className="col-6">
                                        <div className="form-floating mb-3">
                                            <input
                                                className={"form-control" + (errors.firstName ? " is-invalid" : "")}
                                                type="text"
                                                id="firstName"
                                                {...register("firstName", {required: true})}
                                                placeholder="Voornaam"
                                                disabled={loading}
                                            />
                                            <label htmlFor="firstName">Voornaam</label>
                                            {errors.firstName &&
                                                <span className="invalid-feedback">Voornaam is verplicht</span>}
                                        </div>
                                    </div>

                                    <div className="col-6">
                                        <div className="form-floating mb-3">
                                            <input
                                                className={"form-control" + (errors.lastName ? " is-invalid" : "")}
                                                type="text"
                                                id="lastName"
                                                {...register("lastName", {required: true})}
                                                placeholder="Achternaam"
                                                disabled={loading}
                                            />
                                            <label htmlFor="lastName">Achternaam</label>
                                            {errors.lastName &&
                                                <span className="invalid-feedback">Achternaam is verplicht</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-floating mb-3">
                                    <input
                                        className={"form-control " + (errors.email ? "is-invalid" : "")}
                                        type="email"
                                        id="email"
                                        {...register("email", {required: true})}
                                        placeholder="Email"
                                        disabled={loading}
                                    />
                                    <label htmlFor="email">E-mailadres</label>
                                    {errors.email && <span className="invalid-feedback">E-mailadres is verplicht</span>}
                                </div>

                                <div className="row">
                                    <div className="col-6">
                                        <div className="form-floating mb-3">
                                            <input
                                                className={"form-control" + (errors.password ? " is-invalid" : "")}
                                                type="password"
                                                id="password"
                                                {...register("password", {required: true})}
                                                placeholder="Wachtwoord"
                                                disabled={loading}
                                            />
                                            <label htmlFor="password">Wachtwoord</label>
                                            {errors.password &&
                                                <span className="invalid-feedback">Wachtwoord is verplicht</span>}
                                        </div>
                                    </div>

                                    <div className="col-6">
                                        <div className="form-floating mb-3">
                                            <input
                                                className={"form-control" + (errors.confirmPassword ? " is-invalid" : "")}
                                                type="password"
                                                id="confirmPassword"
                                                {...register("confirmPassword", {required: true})}
                                                placeholder="Herhaal Wachtwoord"
                                                disabled={loading}
                                            />
                                            <label htmlFor="confirmPassword">Herhaal Wachtwoord</label>
                                            {errors.confirmPassword && <span className="invalid-feedback">Herhaal Wachtwoord is verplicht</span>}
                                        </div>
                                    </div>
                                </div>

                                <div className="form-floating mb-3">
                                    <input
                                        className={"form-control" + (errors.stationCode ? " is-invalid" : "")}
                                        type="number"
                                        id="stationCode"
                                        {...register("stationCode", {required: true})}
                                        placeholder="123456"
                                        disabled={loading}
                                    />
                                    <label htmlFor="stationCode">Meetstation Code</label>
                                    {errors.stationCode &&
                                        <span className="invalid-feedback">Meetstation Code is verplicht</span>}
                                </div>

                                <div className="form-floating mb-3">
                                    <input
                                        className={"form-control" + (errors.workshopCode ? " is-invalid" : "")}
                                        type="number"
                                        id="workshopCode"
                                        {...register("workshopCode", {required: true})}
                                        placeholder="123456"
                                        disabled={loading}
                                    />
                                    <label htmlFor="workshopCode">Workshop Code</label>
                                    {errors.workshopCode &&
                                        <span className="invalid-feedback">Workshop Code is verplicht</span>}
                                </div>

                                <div className="d-grid mb-2">
                                    <button className="btn btn-lg btn-primary" data-testid='Register' disabled={loading}>
                                        Registreren
                                    </button>
                                </div>
                                <p>Heb je al een account? <Link to={"/auth/login"}>log hier in</Link></p>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}