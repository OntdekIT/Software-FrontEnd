import {useRef, useState, useEffect} from "react";
import useAuth from '../Hooks/useAuth';
import {Link} from 'react-router-dom';
import Verify from "../Components/Verify";
import {api} from "../App";

const LOGIN_URL = '/Authentication/login';

const Login = () => {
    const {setAuth} = useAuth();
    const mailRef = useRef();
    const errRef = useRef();
    const passwordRef = useRef();

    const [mail, setMail] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [password, setPassword] = useState('');
    const [verify, setVerify] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false); // State to manage form submission status

    useEffect(() => {
        mailRef.current.focus();
    }, []);

    useEffect(() => {
        setErrMsg('');
    }, [mail]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); // Disable form on submit
        try {
            const response = await api.post(LOGIN_URL, JSON.stringify({mailAddress: mail, password: password}), {
                headers: {'Content-Type': 'application/JSON'},
                withCredentials: false
            });

            const accessToken = response?.data?.accessToken;
            const roles = response?.data?.roles;
            setAuth({mail, password, roles, accessToken});

            if (response?.status === 200) {
                setVerify(true);
            }
        } catch (err) {
            setErrMsg('Login failed');
            setIsSubmitting(false); // Re-enable form if there's an error
        }
    }

    return (
        <section className="form-section">
            <title>Login</title>
            {errMsg && <div ref={errRef} className="error-msg">{errMsg}</div>}

            {verify ? (
                <Verify mail={mail}/>
            ) : (
                <div>
                    <h1>Inloggen</h1>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            id="email"
                            ref={mailRef}
                            autoComplete="off"
                            onChange={(e) => setMail(e.target.value)}
                            value={mail}
                            required
                            placeholder="Email"
                            disabled={isSubmitting} // Disable input when submitting
                        />
                        <input
                            type="password"
                            id="password"
                            ref={passwordRef}
                            autoComplete="off"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            required
                            placeholder="Password"
                            disabled={isSubmitting} // Disable input when submitting
                        />
                        <button className="button" disabled={isSubmitting}>Inloggen</button>
                    </form>
                    <div className="form-redirect">
                        <p>Nog geen account?</p>
                        <span className="line">
              <Link to="/register">Registreren</Link>
            </span>
                    </div>
                </div>
            )}
        </section>
    )
}

export default Login;
