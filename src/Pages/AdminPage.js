import React from 'react';
import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { api } from "../App";
import LoginCheck from '../Components/LoginCheck';

export default function AdminPage() {
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState(null);
  const { isAdmin } = useContext(LoginCheck);

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

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="Account">
      <title>Admin Panel</title>
      {/* {user.admin ? valueToShowIfTrue : valueToShowIfFalse} */}
      {isAdmin ? (
  <div>
    <h1>Welkom bij de admin panel</h1>
    <Link to={"/Admin/workshopcode/create"}>
      <button className={"button2"}>Workshopcode aanmaken</button>
    </Link>
    <Link to={"/Admin/grantUserAdmin"}>
      <button className={"button2"}>Gebruiker adminrechten geven</button>
    </Link>
  </div>
) : (
  <div>
    <h1>Nuh uh</h1>
  </div>
)}

    </div>
  );
}