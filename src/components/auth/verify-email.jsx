import useAuth from "../../hooks/use-auth.jsx";
import { useEffect, useRef, useState, useContext } from "react";
import { backendApi } from "../../utils/backend-api.jsx";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import { LoginCheckContext } from "../../context/login-check-provider.jsx";

export default function VerifyEmail({ email, message }) {
    const { setAuth } = useAuth();
    const { checkLogin, checkAdmin } = useContext(LoginCheckContext);
    const errRef = useRef();
    const codeRef = useRef();
    const navigate = useNavigate();
    const [errMsg, setErrMsg] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setErrMsg('');
        console.log("test: " + email);
    }, [email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await backendApi.post('/Authentication/verify', JSON.stringify({ mailAddress: email, code: code }), {
                headers: { 'Content-Type': 'application/JSON' },
                withCredentials: true
            });
            sessionStorage.setItem("name", response.data);
            const accessToken = response?.data?.accessToken;
            const roles = response?.data?.roles;

            setAuth({ email, code, roles, accessToken });

            if (response?.status === 200) {
                checkLogin();
                checkAdmin();
                const stationId = localStorage.getItem("stationId");
                if (stationId != null) {
                    navigate('/my/stations/claim');
                } else {
                    navigate('/my/stations');
                }
            }
        } catch (err) {
            console.error(err);
            if (err.status === 400) {
                setErrMsg('De gegeven code is onjuist');
            } else {
                setErrMsg('Er is iets misgegaan');
            }
        }
        setLoading(false);
    };

    return (
        <div className="container">
            <div className="row">
                <div className="col-12 col-md-8 col-lg-6 col-xxl-4 offset-md-2 offset-lg-3 offset-xxl-4">
                    <h1 className="text-center page-header-margin">{message ? message : "Email bevestigen"}</h1>
                    {errMsg && <div ref={errRef} className="error-msg">{errMsg}</div>}
                    <p className="text-center">Vul de per email ontvangen code in om je aanvraag te bevestigen.</p>
                    <form onSubmit={handleSubmit}>
                        <div className="form-floating mb-3">
                            <input
                                className={`form-control ${errMsg ? 'is-invalid' : ''}`}
                                type="code"
                                id="code"
                                ref={codeRef}
                                autoComplete="off"
                                onChange={(e) => setCode(e.target.value)}
                                value={code}
                                required
                            />
                            <label htmlFor="code" className="form-label">Code</label>
                        </div>

                        <div className="d-grid mb-2">
                            <button className="btn btn-lg btn-primary" disabled={loading || !code}>
                                {loading && <span className="spinner-border spinner-border-sm me-2" aria-hidden="true"></span>}
                                Code verifiëren
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

VerifyEmail.propTypes = {
    email: PropTypes.string.isRequired,
    message: PropTypes.string
};