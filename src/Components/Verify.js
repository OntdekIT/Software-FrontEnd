import { useRef, useState, useEffect } from "react";
import useAuth from '../Hooks/useAuth';
import { api } from "../App";

const VERIFY_URL = '/Authentication/verify';

const Verify = ({ mail }) => {
    const { setAuth } = useAuth();
    const errRef = useRef();
    const codeRef = useRef();

    const [errMsg, setErrMsg] = useState('');
    const [code, setCode] = useState('');

    useEffect(() => {
        setErrMsg('');
        console.log("test: " + mail);
    });

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(VERIFY_URL, JSON.stringify({ mailAddress: mail, code: code }), {
                headers: { 'Content-Type': 'application/JSON' },
                withCredentials: false
            });
            sessionStorage.setItem("name", response.data);
            const accessToken = response?.data?.accessToken;
            const roles = response?.data?.roles;

            setAuth({ mail, code, roles, accessToken });

            if (response?.status === 200) {
                window.location.href = "http://localhost:3000/Account";
            }
        } catch (err) {

        }
    }

    return (
        <section className="form-section">
            <div style={{ position: 'relative', margin: '80px', height: '100vh' }}>
                <title>Verify</title>
                {errMsg && <div ref={errRef} className="error-msg">{errMsg}</div>}
                <h1>Verify</h1>
                <p align="center">Vul de per email ontvangen code in</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="code"
                        id="code"
                        ref={codeRef}
                        autoComplete="off"
                        onChange={(e) => setCode(e.target.value)}
                        value={code}
                        required
                        placeholder="Code"
                    />
                    <button className="button">Verify</button>
                </form>
            </div>
        </section>
    )
}

export default Verify;
