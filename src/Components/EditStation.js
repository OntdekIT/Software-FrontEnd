import { useState, useEffect } from "react";
import {useParams, useNavigate} from 'react-router-dom';
import React from "react";
import axios from "axios";

function EditStation() {

const inputvalues = { id: 0, name: '', height: 0, locationName: '', longitude: 0, latitude: 0 };
const [station, setStation] = useState(inputvalues);
const navigate = useNavigate();
const { stationId } = useParams();
console.log(stationId);


const handleChange = (event) => {
  const { name, value } = event.target;
  setStation({ ...station, [name]: value });
  console.log(station);
};

useEffect(() => {
  axios.get('http://localhost:8082/api/Station/'+ (stationId))
  .then(resp => {
    const { id, name, locationName, height, longitude, latitude} = resp.data
    setStation({ id, name, height, locationName, longitude, latitude })
  })
}, []);

  const handleSubmit = e => {
    e.preventDefault();
        const currentStation = {
          id: station.id,
          name: station.name,
          address: station.locationName,
          height: station.height,
          longitude: station.longitude,
          latitude: station.latitude
      }
        axios.put('http://localhost:8082/api/Station/', currentStation)
          .then((response) => {
            console.log(response);
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
          return navigate('/');   
    }

    const handleDelete = (e) => {
      e.preventDefault();
      let confirmDelete = window.confirm('Delete station?')
      if(confirmDelete){
        axios.delete('http://localhost:8082/api/Station/'+ (stationId))
        .then((response) => {
          console.log(response);
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
      return navigate('/');   
      };

  return (
    <div className="form">
      <div>
        <h1>Edit Station</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-input">
          <label className="label">name</label>
          <input
            onChange={handleChange}
            className="form-control"
            defaultValue={station.name || ''}
            name="name"
            type="text"
          />
          <label className="label">locationName</label>
          <input
            onChange={handleChange}
            className="form-control"
            defaultValue={station.locationName || ''}
            name="locationName"
            type="text"
          />
          <div className="form-input">
            <label className="label">height</label>
            <input
              onChange={handleChange}
              defaultValue={station.height || ''}
              className="form-control"
              name="height"
              type="text"
            />
          </div>
          <div className="form-input">
            <label className="label">longitude</label>
            <input
              onChange={handleChange}
              defaultValue={station.longitude || ''}
              className="form-control"
              name="longitude"
              type="text"
            />
          </div>
          <div className="form-input">
            <label className="label">latitude</label>
            <input
              onChange={handleChange}
              defaultValue={station.latitude || ''}
              className="form-control"
              name="latitude"
              type="text"
            />
          </div>
          <button size="sm" color="danger" onClick={(e) =>handleDelete(e, station.id)}>Delete</button>
          <button className="btn btn-primary" type="submit">Submit</button>
        </div>
      </form>
    </div>
  );
}

export default EditStation;
