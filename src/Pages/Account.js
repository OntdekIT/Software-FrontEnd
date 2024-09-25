import React from 'react';
import { useState, useEffect, useContext } from "react";
import { api } from "../App";
import MeetStationView from "../Components/MeetStationView";
import LoginCheck from '../Components/LoginCheck';
import LoadingComponent from "../Components/LoadingComponent";
import { useNavigate } from 'react-router-dom';

export default function Account() {
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState(null);
  const [naam, setNaam] = useState(null);
  const [meetstations, setMeetstations] = useState([]);
  const { isLoggedIn } = useContext(LoginCheck);
  const navigate = useNavigate();

  useEffect(() => {
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
  }, []);

  const handleButtonClick = () => {
    navigate('/stations/claim'); // Replace with the desired path
  };

  return (
      <div className="Account position-relative" style={{ margin: '10px' }}>
        <title>Account</title>
        <h1>Welkom {naam}!</h1>
        <h2>Stations</h2>
        <button
            className="btn btn-primary"
            style={{ position: 'absolute', top: '10px', right: '10px' }}
            onClick={handleButtonClick}
        >
          Meetstation toevoegen
        </button>
        {loading && (
            <div className="position-relative">
              {loading && (
                  <LoadingComponent message="Account data aan het ophalen..." isFullScreen={true}></LoadingComponent>
              )}
            </div>
        )}
        {errMsg && <div className="error-msg">{errMsg}</div>}
        <div className="row g-2">
          {meetstations
              .sort((a, b) => a.stationid - b.stationid)
              .map((meetstation, index) => (
                  <div className="col-4" key={meetstation.stationid}>
                    <MeetStationView meetstation={meetstation}></MeetStationView>
                  </div>
              ))}
        </div>
        {meetstations.length % 3 !== 0 && <div className="w-100"></div>}
      </div>
  );
}
