import React, { useRef, useState, useEffect } from "react";
import useAuth from '../Hooks/useAuth';
import { Link } from 'react-router-dom';
import { api } from "../App";

const ADMIN_URL = '/Admin/grantuseradmin';

const GrantUserAdmin = () => {
    const [selectedUserId, setSelectedUserId] = useState();
    const [adminRights, setAdminRights] = useState();
    const [loading, setLoading] = useState(true);
    const [errMsg, setErrMsg] = useState(null);
    const [isAdmin, setIsAdmin] = useState(null);
    const [users, setUsers] = useState(null);
    
    
    useEffect(() => {
        const getData = async () => {
          try {
            console.log(document.cookie);
            const isAdminResponse = await api.get(
              '/User/checkAdmin',
                {
                  withCredentials: true
                });
            const getUsersResponse = await api.get(
              '/User',
                {
                  withCredentials: true
                });
            const getUserId = await api.get(
                '/User/getID',
                {
                  withCredentials: true
                });
            ;
            console.log(getUserId.data);
            console.log(getUsersResponse.data);
            console.log(isAdminResponse.data);

            //zodat je eigen adminrechten niet kan wijzigen
            const filteredUsers = getUsersResponse.data.filter(user => user.id !== getUserId.data);
            console.log(filteredUsers);

            setUsers(filteredUsers);
            setIsAdmin(isAdminResponse.data);
            
            setErrMsg(null);
          } catch (err) {
            setErrMsg(err.message);
          } finally {
            setLoading(false);
          }
        };

        getData();
      }, []);

    const handleSubmit = async () => {
        console.log(selectedUserId);
        console.log(ADMIN_URL);
        console.log(adminRights);

        try {
            const response = await api.post(ADMIN_URL, { userId: selectedUserId, adminRights: adminRights },
                {
                    
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: true
                });

            if (response?.status === 200) {
                window.location.href = "http://localhost:3000/Admin";
            }
            
            if (response?.status === 400) {
                setErrMsg("Please fill in every field");
                console.log(errMsg);
            }
        } catch (err) {
            console.error(err.message);
            if (err.response.status === 400) {
                setErrMsg("Please fill in every field");
            }
        }
    };
    
    if (loading) {
        return <div>Loading...</div>;
      }

    return (
        <div className="GrantUserAdmin">
        <title>Grant user admin</title>
        {isAdmin ? (
            <div className={"color"}>
                <br/>
                <div className={"container gy-5"}>
                    <div>
                        <div className={"row"}>
                            <div className={"col-4"}></div>
                            <div className={"col-4"}>
                                <h4><b>Geef een gebruiker administrator rechten</b></h4>
                                <label className={"labelMargin"}>
                                    <div className={"form-text"}> Hier kan een user adminrechten gegeven of ontnomen worden.</div>
                                </label>

                            </div>
                        </div>

                        <div className={"row mt-1"}>
                            <div className={"col-4"}></div>
                            <div className={"col-2"}>
                                <select id="selectUserDropdown" className={"form-select"} value={selectedUserId} onChange={(e) => setSelectedUserId(e.target.value)} required>
                                    <option value="" hidden>Kies een gebruiker</option>
                                    {users.map(user => (
                                        <option key={user.id} value={user.id}>
                                        {user.firstName} {user.lastName}
                                    </option>
                                    ))}
                            </select>
                            </div>
                        </div>

                        <div className={"row mt-1"}>
                            <div className={"col-4"}></div>
                            <div className={"col-2"}>
                                <select id="selectAdminRightsDropdown" className={"form-select"} value={adminRights} onChange={(e) => setAdminRights(e.target.value === 'true')} required>
                                    <option value="" hidden>Admin Rechten?</option>
                                    <option value="true">Admin</option>
                                    <option value="false">Geen admin</option>
                            </select>
                            </div>
                        </div>

                        <div className={"row"}>
                            <div className={"col-4"}></div>
                            <div className={"col-4"}>
                                <br/>
                                {errMsg && <label id='error-message'className={"error-msg"}>{errMsg}</label>}
                            </div>
                        </div>
                    </div>
                    <div className={"row mt-5"}>
                        <div className={"col-4"}></div>
                        <div className={"col-5"}>
                            <Link to={"/Admin"}>
                                <button className={"button2Inline"}>Annuleren</button>
                            </Link>
                            <button id="submitbutton" className={"button2"} onClick={handleSubmit}>Volgende</button>
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
export default GrantUserAdmin;