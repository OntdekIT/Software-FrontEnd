import React, { useRef, useState, useEffect, useContext } from "react";
import useAuth from '../Hooks/useAuth';
import { Link } from 'react-router-dom';
import { api } from "../App";
import LoginCheck from "../Components/LoginCheck";

const ADMIN_URL = '/Admin/createworkshopcode';

const CreateWorkshopCode = () => {
    const [workshopCode, setWorkshopCode] = useState('');
    const [duration, setDuration] = useState(0);
    const [length, setLength] = useState(6);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState('');
    const { isAdmin } = useContext(LoginCheck);
    const errRef = useRef(null);

    useEffect(() => {
        setErrMsg('');
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!duration || duration === 0) {
            setErrMsg('Selecteer een geldigheidsduur');
            return;
        }

        try {
            const response = await api.post(ADMIN_URL, { duration, length },
                {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });

            if (response?.status === 200) {
                localStorage.setItem('workshopcode', response.data);
                window.location.href = "http://localhost:3000/Admin/workshopcode/show";
            }
        } catch (err) {
            console.error('Error:', err);

            if (err.response?.status === 401) {
                window.location.href = "/login";
            }
        }
    };

    const handleChangeDuration = (event) => {
        setDuration(event.target.value);
    }

    const handleChangeLength = (event) => {
        setLength(event.target.value);
    }

    return (
        <div className="CreateWorkshopCode">
            <title>Create Workshopcode</title>
            {errMsg && <div ref={errRef} className="error-msg">{errMsg}</div>}
            {isAdmin ? (
                <div className={"color"}>
                    <br />
                    <div className={"container gy-5"}>
                        <div>
                            <div className={"row"}>
                                <div className={"col-4"}></div>
                                <div className={"col-4"}>
                                    <h4><b>Workshop code aanmaken</b></h4>
                                    <label className={"labelMargin"}>
                                        <div className={"form-text"}> Hier kan een workshopcode aangemaakt worden. De code wordt random gegenereerd</div>
                                    </label>
                                </div>
                            </div>

                            <div className={"row mt-1"}>
                                <div className={"col-4"}></div>
                                <div className={"col-2"}>
                                    <select className={"form-select"} style={{ width: '136%' }} value={duration}
                                            onChange={handleChangeDuration} required>
                                        <option value={0} selected={true}>Kies hoelang de code geldig is</option>
                                        <option value={15}>15 min</option>
                                        <option value={30}>30 min</option>
                                        <option value={60}>60 min</option>
                                        <option value={120}>2 uur</option>
                                        <option value={240}>4 uur</option>
                                        <option value={720}>12 uur</option>
                                        <option value={1440}>1 dag</option>
                                        <option value={4320}>3 dagen</option>
                                        <option value={2880}>1 week</option>
                                    </select>
                                </div>
                            </div>

                            <div className={"row"}>
                                <div className={"col-4"}></div>
                                <div className={"col-4"}>
                                    <br />
                                    {/*{errorMessage && <label className={"error-msg"}>{errorMessage}</label>}*/}
                                </div>
                            </div>
                        </div>
                        <div className={"row mt-5"}>
                            <div className={"col-4"}></div>
                            <div className={"col-5"}>
                                <Link to={"/Admin"}>
                                    <button className={"button2Inline"}>Terug</button>
                                </Link>
                                {/*<Link to={"/station/create/name"} state={registrationCode}>*/}
                                <button className={"button2"} onClick={handleSubmit}>Code genereren</button>
                                {/*</Link>*/}
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div>
                    <h1>Nuh uh</h1>
                </div>
            )}
        </div>
    )
}
export default CreateWorkshopCode;
