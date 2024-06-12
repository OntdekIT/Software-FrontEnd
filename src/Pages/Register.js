import {useRef, useState, useEffect} from "react";
import useAuth from '../Hooks/useAuth';
import {Link} from 'react-router-dom';
import {api} from "../App";
import Verify from "../Components/Verify";

const REGISTER_URL = '/Authentication/register';

const Register = () => {
    const {setAuth} = useAuth();
    const firstnameRef = useRef();
    const surnameRef = useRef();
    const passwordRef = useRef();
    const confirmPasswordRef = useRef();
    const emailRef = useRef();
    const meetstationCodeRef = useRef();
    const workshopCodeRef = useRef();
    const errRef = useRef();
    const successRef = useRef();

    const [firstname, setFirstname] = useState('');
    const [surname, setSurname] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [email, setEmail] = useState('');
    const [meetstationCode, setMeetstationCode] = useState('');
    const [workshopCode, setWorkshopCode] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');
    const [verify, setVerify] = useState(false); // Add verify state
    const [isSubmitting, setIsSubmitting] = useState(false); // State to manage form submission status

    useEffect(() => {
        firstnameRef.current.focus();
    }, []);

    useEffect(() => {
        setErrMsg('');
    }, [firstname, surname, password, confirmPassword, email, meetstationCode, workshopCode])

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true); // Disable form on submit

        try {
            const response = await api.post(REGISTER_URL, JSON.stringify({
                    firstName: firstname,
                    lastName: surname,
                    password: password,
                    confirmPassword: confirmPassword,
                    mailAddress: email,
                    meetstationCode: meetstationCode,
                    workshopCode: workshopCode,
                }),
                {
                    headers: {'Content-Type': 'application/JSON'},
                    withCredentials: false
                });

            const accessToken = response?.data?.accessToken;
            const roles = response?.data?.roles;

            //save all of our info in auth object, which is saved in global context
            setAuth({
                firstname,
                surname,
                password,
                confirmPassword,
                email,
                meetstationCode,
                workshopCode,
                roles,
                accessToken
            });

            if (response?.status === 201) {
                setVerify(true);
            }
        } catch (err) {
            setIsSubmitting(false); // Re-enable form if there's an error
            if (!err?.response) {
                setErrMsg('Kon geen verbinding maken, probeer het later opnieuw');
            } else {
                setErrMsg(err.response.data);

                console.log(err);
                console.log(err.response);
                console.log(err.errMsg);
            }
        }
    }

    return (
        <section className="form-section">
            <title>Register</title>
            {errMsg && <div ref={errRef} className="error-msg">{errMsg}</div>}
            {successMsg && <div ref={successRef} className="success-msg">{successMsg}</div>}
            {verify ? (
                <Verify mail={email}/>
            ) : (
                <div>
                    <h1>Registreren</h1>
                    <form onSubmit={handleSubmit}>
                        <label htmlFor="firstname">First name</label>
                        <input
                            type="text"
                            id="firstname"
                            ref={firstnameRef}
                            autoComplete="off"
                            onChange={(e) => setFirstname(e.target.value)}
                            value={firstname}
                            placeholder="Voornaam"
                            disabled={isSubmitting} // Disable input when submitting
                        />
                        <label htmlFor="surname">Last name</label>
                        <input
                            type="text"
                            id="surname"
                            ref={surnameRef}
                            autoComplete="off"
                            onChange={(e) => setSurname(e.target.value)}
                            value={surname}
                            placeholder="Achternaam"
                            disabled={isSubmitting} // Disable input when submitting
                        />
                        <label htmlFor="email">Email</label>
                        <input
                            type="text"
                            id="email"
                            ref={emailRef}
                            autoComplete="off"
                            onChange={(e) => setEmail(e.target.value)}
                            value={email}
                            placeholder="Email"
                            disabled={isSubmitting} // Disable input when submitting
                        />
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            id="password"
                            ref={passwordRef}
                            autoComplete="off"
                            onChange={(e) => setPassword(e.target.value)}
                            value={password}
                            placeholder="Wachtwoord"
                            disabled={isSubmitting} // Disable input when submitting
                        />
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                            type="password"
                            id="confirmPassword"
                            ref={confirmPasswordRef}
                            autoComplete="off"
                            onChange={(e) => setConfirmPassword(e.target.value)}
                            value={confirmPassword}
                            placeholder="Herhaal Wachtwoord"
                            disabled={isSubmitting} // Disable input when submitting
                        />
                        <label htmlFor="meetstationCode">Meetstation Code</label>
                        <input
                            type="number"
                            id="meetstationCode"
                            ref={meetstationCodeRef}
                            autoComplete="off"
                            onChange={(e) => setMeetstationCode(e.target.value)}
                            value={meetstationCode}
                            placeholder="123456"
                            disabled={isSubmitting} // Disable input when submitting
                        />
                        <label htmlFor="workshopCode">Workshop Code</label>
                        <input
                            type="number"
                            id="workshopCode"
                            ref={workshopCodeRef}
                            autoComplete="off"
                            onChange={(e) => setWorkshopCode(e.target.value)}
                            value={workshopCode}
                            placeholder="123456"
                            disabled={isSubmitting} // Disable input when submitting
                        />
                        <button className="button" disabled={isSubmitting}>Registreren</button>
                    </form>
                    <div className="form-redirect">
                        <p>Al een account?</p>
                        <span className="line">
                  <Link to="/login">Inloggen</Link>
                </span>
                    </div>
                </div>
            )}
        </section>
    )
}

export default Register;
