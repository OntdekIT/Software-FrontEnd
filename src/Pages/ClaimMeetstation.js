import React, {useRef, useState, useEffect} from "react";
import useAuth from '../Hooks/useAuth';
import {Link} from 'react-router-dom';
import Verify from "../Components/Verify";
import {api} from "../App";
import {Oval} from "react-loader-spinner";
import LoadingComponent from "../Components/LoadingComponent";

const ClaimMeetstation = () => {
    const {setAuth} = useAuth();
    const stationIdRef = useRef();
    const errRef = useRef();

    const [stationId, setStationId] = useState('');
    const [errMsg, setErrMsg] = useState('');
    const [loading, setLoading] = useState(false); // State to manage form submission status

    useEffect(() => {
        stationIdRef.current.focus();
    }, []);

    useEffect(() => {
        setErrMsg('');
    }, [stationId]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true); // Disable form on submit
        try {
            const response = await api.put(`/Meetstation/${stationId}`, {
                headers: { 'Content-Type': 'application/json' },
                withCredentials: true
            });
        } catch (err) {
            setErrMsg('Failed');
        }
        setLoading(false);
    }

    return (
        <section className="form-section position-relative">
            <title>Login</title>
            {errMsg && <div ref={errRef} className="error-msg">{errMsg}</div>}
            {loading && (
                <LoadingComponent message="Gegevens aan het controleren en meetstation aan het claimen..." isFullScreen={true}></LoadingComponent>
            )}
                <div>
                    <h1>Inloggen</h1>
                    <form onSubmit={handleSubmit}>
                        <input
                            type="number"
                            id="stationId"
                            ref={stationIdRef}
                            autoComplete="off"
                            onChange={(e) => setStationId(e.target.value)}
                            value={stationId}
                            required
                            placeholder="Email"
                            disabled={loading} // Disable input when submitting
                        />
                        <button className="button" disabled={loading}>Inloggen</button>
                    </form>
                    <div className="form-redirect">
                        <p>Nog geen account?</p>
                        <span className="line">
              <Link to="/register">Registreren</Link>
            </span>
                    </div>
                </div>
        </section>
    )
}

export default ClaimMeetstation;
