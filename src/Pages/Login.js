import { useRef, useState, useEffect } from "react";
import useAuth from '../Hooks/useAuth';
//import '../SignUpIn.css'
import { Link } from 'react-router-dom';
import { api } from "../App";

const LOGIN_URL = '/Authentication/login';

const Login = () => {

  //after successfull login, set new auth state to global context (so the whole app?)
  const { setAuth } = useAuth();

  const mailRef = useRef();
  const errRef = useRef();
  const successRef = useRef();
  const passwordRef = useRef();

  const [mail, setMail] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [password, setPassword] = useState('');


  //put focus on user input box
  useEffect(() => {
    mailRef.current.focus();
  }, [])

  useEffect(() => {
    setErrMsg('');
  }, [mail])


  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await api.post(LOGIN_URL, JSON.stringify({ mailAddress: mail, password: password }),
        {
          headers: { 'Content-Type': 'application/JSON' },
          withCredentials: false
        });

      const accessToken = response?.data?.accessToken;
      const roles = response?.data?.roles;
      //save all of our info in auth object, which is saved in global context
      setAuth({ mail, password, roles, accessToken });
      if (response?.status === 200) {
        sessionStorage.setItem("email", mail);
        window.location.href = "http://localhost:3000/verify";
      }
    } catch (err) {
      if (!err?.response) {
        setErrMsg('Kon geen verbinding maken, probeer het later opnieuw');
      } else if (err.response?.status === 400) {
        setErrMsg('De ingevulde gegevens zijn te lang');
      } else if (err.response?.status === 404) {
        setErrMsg('Gegevens zijn onjuist ingevuld');
      } else if (err.response?.status === 422) {
        if (err.response?.data === 2) {
          setErrMsg('Het email adres ontbreekt');
        }
        setErrMsg('Er ontbreken nog gegevens');
      } else {
        setErrMsg('Inloggen gefaald, probeer het later opnieuw');
      }
      //set focus on error display, so a screenreader can read info
      errRef.current.focus();
    }
  }

  return (
    <section className="form-section">
      <title>Login</title>
      {
        errMsg && (
          <div ref={errRef} className="error-msg">{errMsg}</div>
        )
      }
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
        />
        <button className="button">Inloggen</button>
      </form>
      <div className="form-redirect">
        <p>Nog geen account?</p>
        <span className="line">
          <Link to="/register">Registreren</Link>
        </span>
      </div>
    </section>
  )
}

export default Login
