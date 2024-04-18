import { useRef, useState, useEffect } from "react";
import useAuth from '../Hooks/useAuth';
import { Link } from 'react-router-dom';
import { api } from "../App";
import Verify from "../Components/Verify";

const REGISTER_URL = '/Authentication/register';

const Register = () => {
  const { setAuth } = useAuth();
  const firstnameRef = useRef();
  const surnameRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const emailRef = useRef();
  const errRef = useRef();
  const successRef = useRef();

  const [firstname, setFirstname] = useState('');
  const [surname, setSurname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  const [verify, setVerify] = useState(false); // Add verify state

  useEffect(() => {
    firstnameRef.current.focus();
  }, []);

  useEffect(() => {
    setErrMsg('');
  }, [firstname, surname, password, confirmPassword, email]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(REGISTER_URL, JSON.stringify({ firstName: firstname, lastName: surname, password: password, confirmPassword: confirmPassword, mailAddress: email }), {
        headers: { 'Content-Type': 'application/JSON' },
        withCredentials: false
      });

      const accessToken = response?.data?.accessToken;
      const roles = response?.data?.roles;

      setAuth({ firstname, surname, password, confirmPassword, email, roles, accessToken });

      if (response?.status === 201) {
        setVerify(true);
      }
    } catch (err) {

    }
  }

  return (
      <section className="form-section">
        <title>Register</title>
        {errMsg && <div ref={errRef} className="error-msg">{errMsg}</div>}
        {successMsg && <div ref={successRef} className="success-msg">{successMsg}</div>}
        {verify ? (
            <Verify mail={email} />
        ) : (
            <div>
              <h1>Registreren</h1>
              <form onSubmit={handleSubmit}>
                <input
                    type="text"
                    id="firstname"
                    ref={firstnameRef}
                    autoComplete="off"
                    onChange={(e) => setFirstname(e.target.value)}
                    value={firstname}
                    required
                    placeholder="Voornaam"
                />
                <input
                    type="text"
                    id="surname"
                    ref={surnameRef}
                    autoComplete="off"
                    onChange={(e) => setSurname(e.target.value)}
                    value={surname}
                    required
                    placeholder="Achternaam"
                />
                <input
                    type="email"
                    id="email"
                    ref={emailRef}
                    autoComplete="off"
                    onChange={(e) => setEmail(e.target.value)}
                    value={email}
                    required
                    placeholder="Email"
                />
                <input
                    type="password"
                    id="password"
                    ref={passwordRef}
                    autoComplete="off"
                    onChange={(e) => setPassword(e.target.value)}
                    value={password}
                    required
                    placeholder="Wachtwoord"
                />
                <input
                    type="password"
                    id="confirmPassword"
                    ref={confirmPasswordRef}
                    autoComplete="off"
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    value={confirmPassword}
                    required
                    placeholder="Herhaal Wachtwoord"
                />
                <button className="button">Registreren</button>
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
