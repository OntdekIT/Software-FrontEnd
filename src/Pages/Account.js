import React from 'react'

import { useState, useEffect } from "react";
import axios from "axios";


export default function Account() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8082/api/Station/user/1` 
        );
        setData(response.data);
        setError(null);
      } catch (err) {
        setError(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    getData();
  });


  return (
    <div className="Account">
      <h1>Stations</h1>
      {loading && <div>A moment please...</div>}
      {error && (
        <div>{`There is a problem fetching the post data - ${error}`}</div>
      )}
      <ul>
        {data &&
          data.map(({ id, name, height, locationId, locationName, latitude, longitude, sensors }) => (
            <lu key={id}>
              <h3>Naam: {name}</h3>
              <h2>Hoogte: {height}</h2>
              <h2>Locatie Id: {locationId}</h2>
              <h2>Locatie: {locationName}</h2>
              <h2>Latitude: {latitude}</h2>
              <h2>Longitude: {longitude}</h2>
              <h2>Aantal sensoren: {sensors}</h2>
            </lu>
          ))}
      </ul>
    </div>
  );
}

