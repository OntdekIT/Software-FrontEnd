import { useRef, useState, useEffect } from "react";
import useAuth from '../Hooks/useAuth';
import { Link } from 'react-router-dom';
import { api } from "../App";

const REGISTER_URL = '/Authentication/register';

const Register = () => {

  //after successfull login, set new auth state to global context (so the whole app?)
  const { setAuth } = useAuth();

  const firstnameRef = useRef();
  const surnameRef = useRef();
  const passwordRef = useRef();
  const confirmPasswordRef = useRef();
  const emailRef = useRef();
  const meetstationCodeRef = useRef();
  const errRef = useRef();
  const successRef = useRef();

  const [firstname, setFirstname] = useState('');
  const [surname, setSurname] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [email, setEmail] = useState('');
  const [meetstationCode, setMeetstationCode] = useState('');
  const [errMsg, setErrMsg] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  //put focus on user input box
  useEffect(() => {
    firstnameRef.current.focus();
  }, [])

  useEffect(() => {
    setErrMsg('');
  }, [firstname, surname, password, confirmPassword, email, meetstationCode])


  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await api.post(REGISTER_URL, JSON.stringify({ firstName: firstname, lastName: surname, password: password, confirmPassword: confirmPassword, mailAddress: email, meetstationCode: meetstationCode }),
        {
          headers: { 'Content-Type': 'application/JSON' },
          withCredentials: false
        });

      console.log(JSON.stringify(response?.data));
      const accessToken = response?.data?.accessToken;
      const roles = response?.data?.roles;

      //save all of our info in auth object, which is saved in global context
      setAuth({ firstname, surname, password, confirmPassword, email, meetstationCode, roles, accessToken });

      setFirstname('');
      setSurname('');
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setMeetstationCode('');
      if (response?.status === 201) {
        sessionStorage.setItem("email", email);
        window.location.href = "http://localhost:3000/verify";
      }

      // Navigates to home page
      //navigate(from, { replace: true });

    } catch (err) {
      if (!err?.response) {
        setErrMsg('Kon geen verbinding maken, probeer het later opnieuw');
        }
      else {
        setErrMsg(err.response.data);
        
        console.log(err);
        console.log(err.response);
        console.log(err.errMsg);
      }
      // if (!err?.response) {
      //   setErrMsg('Kon geen verbinding maken, probeer het later opnieuw');
      // } else if (err.response?.status === 400) {
      //   setErrMsg('De ingevulde gegevens zijn te lang');
      // } else if (err.response?.status === 409) {
      //   if (err.response?.data === 2) {
      //     setErrMsg('Het email adres is al in gebruik');
      //   }
      //   setErrMsg('De ingevulde gegevens zijn incorrect');
      // } else if (err.response?.status === 422) {
      //   if (err.response?.data === 2) {
      //     setErrMsg('Het email adres ontbreekt');
      //   }
      //   else if (err.response?.data === 3) {
      //     setErrMsg('Voornaam ontbreekt');
      //   }
      //   else if (err.response?.data === 4) {
      //     setErrMsg('Achternaam ontbreekt');
      //   }
      //   else if (err.response?.data === 5) {
      //     setErrMsg('Wachtwoord ontbreekt');
      //   }
      //   else if (err.response?.data === 6) {
      //     setErrMsg('Herhaal wachtwoord ontbreekt');
      //   }
      //   setErrMsg('Er ontbreken nog gegevens');
      // } else {
      //   setErrMsg('Registreren gefaald, probeer het later opnieuw');
      // }
      //set focus on error display, so a screenreader can read info
      //errRef.current.focus();
    }
  }

  return (
    <section className="form-section">
      <title>Register</title>
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
        <label htmlFor="firstname">First name</label>
        <input
          type="text"
          id="firstname"
          ref={firstnameRef}
          autoComplete="off"
          onChange={(e) => setFirstname(e.target.value)}
          value={firstname}
          placeholder="Voornaam"
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
