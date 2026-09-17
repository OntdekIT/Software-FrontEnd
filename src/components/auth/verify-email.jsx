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
                        <span className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                            <i className="bi bi-envelope-check text-2xl" aria-hidden="true"></i>
                        </span>
                        <h1 className="text-2xl font-bold text-gray-900">{message ? message : "Email bevestigen"}</h1>
                        <p className="mt-1 text-sm text-gray-500">Vul de per e-mail ontvangen code in om je aanvraag te bevestigen.</p>
                    </div>

                    {errMsg && (
                        <div ref={errRef} className="mb-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
                            <i className="bi bi-exclamation-circle" aria-hidden="true"></i>
                            {errMsg}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                        <div>
                            <label htmlFor="code" className="mb-1 block text-sm font-medium text-gray-700">Code</label>
                            <div className="relative">
                                <i className="bi bi-key pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" aria-hidden="true"></i>
                                <input
                                    className={`w-full rounded-lg border px-3 py-2 pl-10 text-sm tracking-widest focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${errMsg ? 'border-red-500' : 'border-gray-300'}`}
                                    type="code"
                                    id="code"
                                    ref={codeRef}
                                    autoComplete="off"
                                    onChange={(e) => setCode(e.target.value)}
                                    value={code}
                                    placeholder="Voer je code in"
                                    required
                                />
                            </div>
                        </div>

                        <Button data-testid="verifyCode" type="submit" size="lg" disabled={loading || !code} className="mt-2 w-full">
                            {loading ? <Spinner className="h-4 w-4" /> : <i className="bi bi-envelope-check" aria-hidden="true"></i>}
                            {loading ? 'Code verifiëren…' : 'Code verifiëren'}
                        </Button>
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
