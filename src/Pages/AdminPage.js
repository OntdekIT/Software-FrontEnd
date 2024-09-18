import React, {useContext} from 'react';
import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { api } from "../App";
import LoginCheck from '../Components/LoginCheck';

export default function AdminPage() {
  const [errMsg, setErrMsg] = useState(null);
  const { isAdmin } = useContext(LoginCheck);

  if (!isAdmin)
    {
      window.location.href = "/";
    }

  useEffect(() => {
  }, []);


  return (
    <div className="Account">
      <title>Admin Panel</title>
      {/* {user.admin ? valueToShowIfTrue : valueToShowIfFalse} */}
      {isAdmin ? (
  <div>
    <h1>Welkom bij de admin panel</h1>
    <Link to={"/Admin/workshopcode/create"}>
      <button className="btn btn-lg bg-warning">Workshopcode aanmaken</button>
    </Link>
    <Link to={"/Admin/workshopcode/show"}>
      <button className="btn btn-lg bg-warning">Workshopcodes zien</button>
    </Link>
    <Link to={"/Admin/grantUserAdmin"}>
      <button className="btn btn-lg bg-warning">Gebruiker adminrechten geven</button>
    </Link>
  </div>
) : (
  <div>
    
  </div>
)}

    </div>
  );
}