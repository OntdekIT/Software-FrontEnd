import { useState, useEffect } from "react";
import { useNavigate, useLocation } from 'react-router-dom';
import React from "react";
import { api } from "../App";

const EditStation = () => {
  const inputvalues = {
    stationid: 0,
    name: '',
    database_tag: '',
    registrationCode: '',
    location_locationid: 0,
    userid: 0,
    is_public: false,
  };

  const [station, setStation] = useState(inputvalues);
  const [isChecked, setIsChecked] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const stationId = query.get('id');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setStation({ ...station, [name]: value });
  };

  const checkboxHandler = (event) => {
    const { name, checked } = event.target;
    setStation({ ...station, [name]: checked });
    setIsChecked(checked);
  };

  useEffect(() => {
    const fetchStation = async () => {
      try {
        const response = await api.get(`/Meetstation/${stationId}`, {
          headers: { 'Content-Type': 'application/json' },
          withCredentials: false
        });
        console.log("Response: ", response);

        setStation(response.data);
        console.log(station);
        setIsChecked(response.data.is_public);
      } catch (err) {
        console.error("error: ", err);
      }
    };
    if (stationId) {
      fetchStation();
    }
  }, [stationId]);

  const handleSubmit = e => {
    e.preventDefault();
    const currentStation = {
      stationid: station.id,
      name: station.name,
      database_tag: station.database_tag,
      registrationCode: station.registrationCode,
      location_locationid: station.location_locationid,
      userid: station.userid,
      is_public: station.is_public,
    };

    api.put('/Station/', currentStation)
        .then((response) => {
          navigate('/');
        })
        .catch((error) => {
          if (error.response) {
            console.error(error.response.headers);
          } else if (error.request) {
            console.error(error.request);
          } else {
            console.error("Error", error.message);
          }
        });
  };

  const handleDelete = (e) => {
    e.preventDefault();
    let confirmDelete = window.confirm('Delete station?');
    if (confirmDelete) {
      api.delete('/Station/' + stationId)
          .then((response) => {
            console.log(response);
            navigate('/');
          })
          .catch((error) => {
            if (error.response) {
              console.error(error.response.data);
              console.error(error.response.status);
              console.error(error.response.headers);
            } else if (error.request) {
              console.error(error.request);
            } else {
              console.error("Error", error.message);
            }
          });
    }
  };

  return (
      <div className={"color"}>
        <br/>
        <div className={"container gy-5"}>
          <div>
            <div className={"row"}>
              <div className={"col-4"}></div>
              <div className={"col-4"}>
                <h4><b>Edit Station</b></h4>
                <label className={"labelMargin"}>
                  <div className={"form-text"}>Hier kunnen de meetstation gegevens aangepast worden</div>
                </label>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={"row mt-1"}>
                <div className={"col-4"}></div>
                <div className={"col-4"}>
                  <label className={"label"}>Station nummer</label>
                  <input
                      onChange={handleChange}
                      className={"form-control"}
                      value={station.stationid}
                      name="stationid"
                      type="text"
                      readOnly
                  />
                  <label className={"label"}>Station naam</label>
                  <input
                      onChange={handleChange}
                      className={"form-control"}
                      value={station.name}
                      name="name"
                      type="text"
                  />
                  <label className={"label"}>Database tag</label>
                  <input
                      onChange={handleChange}
                      value={station.database_tag}
                      className={"form-control"}
                      name="database_tag"
                      type="text"
                  />
                  <label className={"label"}>Registratie code</label>
                  <input
                      onChange={handleChange}
                      value={station.registrationCode}
                      className={"form-control"}
                      name="registrationCode"
                      type="text"
                      readOnly
                  />
                  <label className={"label"}>Locatie id (wordt longitude/latitude)</label>
                  <input
                      onChange={handleChange}
                      value={station.location_locationid}
                      className={"form-control"}
                      name="location_locationid"
                      type="text"
                      readOnly
                  />
                  <label className={"label"}>Gebruikers Id (wordt voornaam)</label>
                  <input
                      onChange={handleChange}
                      value={station.userid}
                      className={"form-control"}
                      name="userid"
                      type="text"
                      readOnly
                  />
                  <div className={"form-check"}>
                    <input
                        type="checkbox"
                        checked={isChecked}
                        onChange={checkboxHandler}
                        className={"form-check-input"}
                        name="is_public"
                    />
                    <label className={"form-check-label"}>I want this station to be publicly visible</label>
                  </div>
                </div>
              </div>

              <div className={"row mt-5"}>
                <div className={"col-4"}></div>
                <div className={"col-5"}>
                  <button type="button" className={"button2Inline"} onClick={() => navigate(-1)}>Back</button>
                  <button size="sm" color="danger" type="button" className={"button2Inline"} onClick={handleDelete}>Delete</button>
                  <button className={"button2"} type="submit">Submit</button>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
  );
}

export default EditStation;
