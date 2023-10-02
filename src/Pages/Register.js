import { useRef, useState, useEffect } from "react";
import useAuth from '../Hooks/useAuth';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { api } from "../App";

const REGISTER_URL = '/Authentication/register';

const Register = () => {

  //after successfull login, set new auth state to global context (so the whole app?)
  const { setAuth } = useAuth();

  const navigate = useNavigate();
  const location = useLocation();
  const from = location.state?.from?.pathname || "/";

  const firstnameRef = useRef();
  const surnameRef = useRef();
  const usernameRef = useRef();
  const emailRef = useRef();
  const errRef = useRef();
  const successRef = useRef();

  const [firstname, setFirstname] = useState('');
  const [surname, setSurname] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  //put focus on user input box
  useEffect(() => {
    firstnameRef.current.focus();
  }, [])

  useEffect(() => {
    setErrMsg('');
  }, [firstname, surname, username, email])


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(REGISTER_URL, JSON.stringify({ firstName: firstname, lastName: surname, userName: username, mailAddress: email }),
        {
          headers: { 'Content-Type': 'application/JSON' },
          withCredentials: false
        });

      console.log(JSON.stringify(response?.data));
      const accessToken = response?.data?.accessToken;
      const roles = response?.data?.roles;

      //save all of our info in auth object, which is saved in global context
      setAuth({ firstname, surname, username, email, roles, accessToken });

      setFirstname('');
      setSurname('');
      setUsername('');
      setEmail('');

      if (response?.status === 201) {
        setSuccessMsg('Gelukt! Bekijk uw mail voor verdere instructies');
      }

      // Navigates to home page
      //navigate(from, { replace: true });

    } catch (err) {
      if (!err?.response) {
        setErrMsg('Kon geen verbinding maken, probeer het later opnieuw');
      } else if (err.response?.status === 400) {
        setErrMsg('De ingevulde gegevens zijn te lang');
      } else if (err.response?.status === 409) {
        if (err.response?.data === 1) {
          setErrMsg('De gebruikersnaam is al in gebruik');
        }
        else if (err.response?.data === 2) {
          setErrMsg('Het email adres is al in gebruik');
        }
        setErrMsg('De ingevulde gegevens zijn incorrect');
      } else if (err.response?.status === 422) {
        if (err.response?.data === 1) {
          setErrMsg('De gebruikersnaam ontbreekt');
        }
        else if (err.response?.data === 2) {
          setErrMsg('Het email adres ontbreekt');
        }
        else if (err.response?.data === 3) {
          setErrMsg('Voornaam ontbreekt');
        }
        else if (err.response?.data === 4) {
          setErrMsg('Achternaam ontbreekt');
        }
        setErrMsg('Er ontbreken nog gegevens');
      } else {
        setErrMsg('Registreren gefaald, probeer het later opnieuw');
      }
      //set focus on error display, so a screenreader can read info
      errRef.current.focus();
    }
  }

  return (
    <section className="form-section">
      {
        errMsg && (
          <div ref={errRef} className="error-msg">{errMsg}</div>
        )
      }
      {
        successMsg && (
          <div ref={successRef} className="success-msg">{successMsg}</div>
        )
      }
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
          type="text"
          id="username"
          ref={usernameRef}
          autoComplete="off"
          onChange={(e) => setUsername(e.target.value)}
          value={username}
          required
          placeholder="Gebruikersnaam"
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
        <button className="button">Registreren</button>
      </form>
      <div className="form-redirect">
        <p>Al een account?</p>
        <span className="line">
          <Link to="/login">Inloggen</Link>
        </span>
      </div>
    </section>
  )
}

export default Register
