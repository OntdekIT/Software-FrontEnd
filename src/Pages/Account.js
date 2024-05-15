import React, {useRef} from 'react';
import { useState, useEffect, useContext } from "react";
import { Link } from 'react-router-dom';
import { api } from "../App";
import MeetStationView from "../Components/MeetStationView";

export default function Account() {
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const [errMsg, setErrMsg] = useState(null);
  const [naam, setNaam] = useState(null);
  const [meetstations, setMeetstations] = useState([]);
  const { isLoggedIn } = useContext(LoginCheck);

  useEffect(() => {
    if (!isLoggedIn) {
      setRedirecting(true);
      window.location.href = '/Login';
    }
    else {
    const getData = async () => {
      try {
        const response = await api.get('/User/getUser', { withCredentials: true });

        setMeetstations(response.data.meetstations);

        setNaam(response.data.firstName);
        setErrMsg(null);
      } catch (err) {
        setErrMsg(err.message);

      } finally {
        setLoading(false);
      }
    };

    getData();
  }
  }, []);

  if(!isLoggedIn) {
    return null;
  }

  else {
    return (
      <div className="Account" style={{margin: '10px'}}>
        <title>Account</title>
        <h1>Welkom {naam}!</h1>
        <h2>Stations</h2>
        {loading && <div>A moment please...</div>}
        {errMsg && <div className="error-msg">{errMsg}</div>}
        {/*<Link to={"/station/create"}>*/}
        {/*  <button className={"button2"}>Station toevoegen</button>*/}
        {/*</Link>*/}
        <div className="row g-2">
          {meetstations.map((meetstation, index) => (
              <div className="col-4" key={meetstation.stationid}>
                <MeetStationView meetstation={meetstation}></MeetStationView>
              </div>
          ))}
        </div>
        {meetstations.length % 3 !== 0 && <div className="w-100"></div>}
      </div>
  );
  }
}