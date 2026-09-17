import { useEffect, useRef, useState } from "react";
import { backendApi } from "../../utils/backend-api.jsx";
import PropTypes from "prop-types";
import { useNavigate } from "react-router-dom";
import {useAuth} from "../../providers/auth-provider.jsx";
import Button from "../ui/Button.jsx";
import { Spinner } from "../ui/Preloader.jsx";

export default function VerifyEmail({ email, message }) {
    const { updateToken } = useAuth();
    const errRef = useRef();
    const codeRef = useRef();
    const navigate = useNavigate();
    const [errMsg, setErrMsg] = useState('');
    const [code, setCode] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        setErrMsg('');
    }, [email]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const response = await backendApi.post('/authentication/verify', JSON.stringify({ email: email, code: code }), {
                headers: { 'Content-Type': 'application/JSON' },
                withCredentials: true
            });


            if (response?.status === 200) {
                updateToken(response.data.token);
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
        <div className="mx-auto max-w-md px-4">
            <h1 className="mt-8 mb-6 text-center text-2xl font-bold text-gray-900">{message ? message : "Email bevestigen"}</h1>
            {errMsg && <div ref={errRef} className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">{errMsg}</div>}
            <p className="mb-4 text-center text-gray-600">Vul de per email ontvangen code in om je aanvraag te bevestigen.</p>
            <form onSubmit={handleSubmit}>
                <div className="mb-3">
                    <label htmlFor="code" className="mb-1 block text-sm font-medium text-gray-700">Code</label>
                    <input
                        className={`w-full rounded-lg border px-3 py-2 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${errMsg ? 'border-red-500' : 'border-gray-300'}`}
                        type="code"
                        id="code"
                        ref={codeRef}
                        autoComplete="off"
                        onChange={(e) => setCode(e.target.value)}
                        value={code}
                        required
                    />
                </div>

                <div className="mb-2 flex flex-col">
                    <Button data-testid="verifyCode" type="submit" size="lg" disabled={loading || !code}>
                        {loading && <Spinner className="h-4 w-4" />}
                        Code verifiëren
                    </Button>
                </div>
            </form>
        </div>
    );
}

VerifyEmail.propTypes = {
    email: PropTypes.string.isRequired,
    message: PropTypes.string
};