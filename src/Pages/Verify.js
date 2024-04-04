import { api } from "../App";
import { useRef, useState, useEffect } from "react";
import useAuth from '../Hooks/useAuth';
//import '../SignUpIn.css'
import { Link } from 'react-router-dom';
const VERIFY_URL = '/Authentication/verify';

const Verify = () => {

    //after successfull login, set new auth state to global context (so the whole app?)
    const { setAuth } = useAuth();

    const mail = sessionStorage.getItem("email");
    const errRef = useRef();
    const successRef = useRef();
    const codeRef = useRef();

    const [errMsg, setErrMsg] = useState('');
    const [code, setCode] = useState('');

    //put focus on user input box
    useEffect(() => {
        setErrMsg('');
    }, [mail])


    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await api.post(VERIFY_URL, JSON.stringify({ mailAddress: mail, code: code }),
                {
                    headers: { 'Content-Type': 'application/JSON' },
                    withCredentials: false
                });

            console.log(JSON.stringify(response?.data));
            const accessToken = response?.data?.accessToken;
            const roles = response?.data?.roles;

            //save all of our info in auth object, which is saved in global context
            setAuth({ mail, code, roles, accessToken });
            setCode('');
            if (response?.status === 200) {
                window.location.href = "http://localhost:3000/Account";
            }
        } catch (err) {
            if (!err?.response) {
                setErrMsg('Kon geen verbinding maken, probeer het later opnieuw');
            } else if (err.response?.status === 400) {
                setErrMsg('De ingevulde gegevens zijn te lang');
            } else if (err.response?.status === 404) {
                setErrMsg('Het email adres kon niet gevonden worden');
            } else if (err.response?.status === 422) {
                if (err.response?.data === 2) {
                    setErrMsg('Het email adres ontbreekt');
                }
                setErrMsg('Er ontbreken nog gegevens');
            } else {
                setErrMsg('Inloggen gefaald, probeer het later opnieuw');
            }
        }
    }

    return (
        <section className="form-section">
            <div style={{position: 'relative', margin: '80px', height: '100vh'}}>
                <title>Verify</title>
                {
                    errMsg && (
                        <div ref={errRef} className="error-msg">{errMsg}</div>
                    )
                }
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