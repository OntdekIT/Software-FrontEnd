import { useRef, useState, useEffect } from "react";
import useAuth from '../hooks/useAuth';
//import '../SignUpIn.css'
import axios from '../api/axios';
import { Link, useNavigate, useLocation } from 'react-router-dom';

const App = () => {
    const [posts, setPost] = useState([]);
    useEffect(() => {
        fetch("http://localhost:8082/api/Translation")
            .then((response) => response.json())

            .then((data) => {
                console.log(data);
                setPost(data);
            })

            .catch((err) => {
                console.log(err.message);
            });
    }, []);

    return (null);
};

function GiveLanguage(){    const Language = "Nederlands"
    return Language;
}

function GivePageId(){
    const PageId = "Login"
    return PageId;
}

const LOGIN_URL = '/Authentication/login';

const Login = () => {

    //after successfull login, set new auth state to global context (so the whole app?)
    const { setAuth } = useAuth();

    const navigate = useNavigate();
    const location = useLocation();
    const from = location.state?.from?.pathname || "/";
    
    const mailRef = useRef();
    const errRef = useRef();
    const successRef = useRef();

    const [mail, setMail] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [successMsg, setSuccessMsg] = useState('');

    //put focus on user input box
    useEffect(() => {
      mailRef.current.focus();
    }, [])

    useEffect(() => {
      setErrMsg('');
      setSuccessMsg('');
    }, [mail])


    const handleSubmit = async (e) => {
      e.preventDefault();
      try {
        const response = await axios.post(LOGIN_URL, JSON.stringify({ mailAddress : mail }),
        {
            headers: { 'Content-Type': 'application/JSON' },
            withCredentials: false
        });

        console.log(JSON.stringify(response?.data));
        const accessToken = response?.data?.accessToken;
        const roles = response?.data?.roles;

        //save all of our info in auth object, which is saved in global context
        setAuth({ mail, roles, accessToken });
        setMail('');
        if (response?.status === 200) {
          setSuccessMsg('Gelukt! Bekijk uw mail voor verdere instructies');
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
