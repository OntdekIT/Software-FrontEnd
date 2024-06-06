import React, { useContext } from 'react';
import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { api } from "../App";
import LoginCheck from '../Components/LoginCheck';

export default function Account() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [errMsg, setErrMsg] = useState(null);
  const [naam, setNaam] = useState(null);
  const [meetstations, setMeetstations] = useState(null);
  const { isLoggedIn } = useContext(LoginCheck);

  useEffect(() => {

    const getData = async () => {
      try {
        const response = await api.get('/User/getUser', { withCredentials: true });

        setMeetstations(response.data.meetstations);

        setNaam(response.data.firstName);
        setErrMsg(null);
      } catch (err) {
        setErrMsg(err.message);

        if (err.response?.status === 401) {
          window.location.href = "/login";

        }

      } finally {
        setLoading(false);
      }
    };

    getData();

  }, []);

  if(!isLoggedIn) {
    return null;
  }

  else {
    return (
      <div className="Account">
        <title>Account</title>
          <h1>Welkom {naam}!</h1>
        <h2>Stations</h2>
        {
          loading && (
            <div>A moment please...</div>
          )
        }
        {
          errMsg && (
            <div className="error-msg">{errMsg}</div>
          )
        }
  
        <Link to={"/station/create"}> <button className={"button2"}>Station toevoegen</button></Link>
        <table>
          <tr>
            <th>Station Naam</th>
          </tr>
          {data &&
            <ul>
              {data.map(({ id, name }) => (
                <li key={id}>
                  <Link to={`/Station/${id}`} style={{ color: '#00F' }}> {name}</Link>
                </li>
              ))}
            </ul>}
        </table>
      </div>
    );
  }
}