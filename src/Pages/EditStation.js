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
  const [visibility, setVisibility] = useState('private');
  const navigate = useNavigate();
  const location = useLocation();

  const query = new URLSearchParams(location.search);
  const stationId = query.get('id');

  const handleChange = (event) => {
    const { name, value } = event.target;
    setStation({ ...station, [name]: value });
    console.log("value change test: ", station);
  };

  const dropdownHandler = (event) => {
    const { name, checked } = event.target;
    setStation({ ...station, [name]: checked });
    setVisibility(checked);
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
        setVisibility(response.data.is_public.toString());
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
                <h4><b>Aanpassen station nummer {station.stationid}</b></h4>
                <label className={"labelMargin"}>
                  <div className={"form-text"}>Hier kunnen de meetstation gegevens aangepast worden</div>
                </label>
              </div>
            </div>

            <form onSubmit={handleSubmit}>
              <div className={"row mt-1"}>
                <div className={"col-4"}></div>
                <div className={"col-4"}>
                  <label className={"label"}>Station naam</label>
                  <input
                      onChange={handleChange}
                      className={"form-control"}
                      value={station.name}
                      name="name"
                      type="text"
                  />
                  <div className={"form-group"}>
                    <label className={"form-label"}>Visibility</label>
                    <select
                        value={visibility}
                        onChange={dropdownHandler}
                        className={"form-control"}
                        name="visibility"
                    >
                      <option value="private">Private</option>
                      <option value="public">Public</option>
                      <option value="restricted">Restricted</option>
                    </select>
                  </div>
              </div>
          </div>

          <div className={"row mt-5"}>
            <div className={"col-4"}></div>
            <div className={"col-5"}>
              <button type="button" className={"button2Inline"} onClick={() => navigate(-1)}>Back</button>
              <button size="sm" color="danger" type="button" className={"button2Inline"}
                      onClick={handleDelete}>Delete
                  </button>
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
