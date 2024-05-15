import React, { useRef, useState, useEffect } from "react";
import useAuth from '../Hooks/useAuth';
import { Link } from 'react-router-dom';
import { api } from "../App";

const ADMIN_URL = '/Admin/createworkshopcode';

const CreateWorkshopCode = () => {
    const [workshopCode, setWorkshopCode] = useState('');
    const [duration, setDuration] = useState(10);
    const [length, setLength] = useState(6);
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState(null);
    const [isAdmin, setIsAdmin] = useState(null);
    
    useEffect(() => {
        const getData = async () => {
          try {
            const response = await api.get(
              '/User/checkAdmin',
                {
                  withCredentials: true
                });
            console.log(response.data);
            setIsAdmin(response.data)
            setErrMsg(null);
          } catch (err) {
            setErrMsg(err.message);
          } finally {
            setLoading(false);
          }
        };
        getData();
      }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();

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
        }
    };

    const handleChangeDuration = (event) => {
        setDuration(event.target.value);
    }

    const handleChangeLength = (event) => {
        setLength(event.target.value);
    }
    
    if (loading) {
        return <div>Loading...</div>;
      }

    return (
        <div className="CreateWorkshopCode">
        <title>Create Workshopcode</title>
        {isAdmin ? (
            <div className={"color"}>
                <br/>
                <div className={"container gy-5"}>
                    <div>
                        <div className={"row"}>
                            <div className={"col-4"}></div>
                            <div className={"col-4"}>
                                <h4><b>Workshop code aanmaken</b></h4>
                                <label className={"labelMargin"}>
                                    <div className={"form-text"}> Hier kan een workshopcode aangemaakt worden.</div>
                                </label>

                            </div>
                        </div>

                        <div className={"row mt-1"}>
                            <div className={"col-4"}></div>
                            <div className={"col-2"}>
                                <select className={"form-select"} value={duration} onChange={handleChangeDuration}
                                        required>
                                    <option selected={true}>Kies geldigheids duur</option>
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
                            <div className={"col-2"}>
                                <select className={"form-select"} value={length} onChange={handleChangeLength}
                                        required>
                                    <option selected={true}>Kies aantal cijfers</option>
                                    <option value={3}>3 cijfers</option>
                                    <option value={4}>4 cijfers</option>
                                    <option value={5}>5 cijfers</option>
                                    <option value={6}>6 cijfers</option>
                                    <option value={7}>7 cijfers</option>
                                    <option value={8}>8 cijfers</option>
                                </select>
                            </div>
                        </div>
                        <div className={"row"}>
                            <div className={"col-4"}></div>
                            <div className={"col-4"}>
                                <br/>
                                {/*{errorMessage && <label className={"error-msg"}>{errorMessage}</label>}*/}
                            </div>
                        </div>
                    </div>
                    <div className={"row mt-5"}>
                        <div className={"col-4"}></div>
                        <div className={"col-5"}>
                            <Link to={"/Admin"}>
                                <button className={"button2Inline"}>Annuleren</button>
                            </Link>
                            {/*<Link to={"/station/create/name"} state={registrationCode}>*/}
                            <button className={"button2"} onClick={handleSubmit}>Volgende</button>
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