import { useLocation, useParams, Link } from 'react-router-dom';
import React from 'react';
import { useState, useEffect } from "react";
import axios from "axios";

export default function Station() {
    const readValues = {id: 0, name: "", height: 0, locationName: "", longtitude: 0, latitude: 0, ispublic: false  };
    const [station, setStation] = useState(readValues);

    let {id} = useParams();

    useEffect(() => {

      axios.get('http://localhost:8082/api/Station/'+ (id))
    
      .then(resp => {
        const { id, name, locationName, height, longitude, latitude, ispublic} = resp.data
        setStation({ id, name, height, locationName, longitude, latitude, ispublic })
        console.log(resp.data);
      })
    }, []);

    return (
        <div className="Station">
          <div>
              <p>Naam: {station.name}</p>
              <p>Hoogte: {station.height}</p>
              <p>Lengtegraad: {station.longitude}</p>
              <p>Breedtegraad: {station.latitude}</p>
              <p>Dit station is {station.ispublic ? "publiek zichtbaar" : "privé"}</p>
              <a style={{ textDecoration: 'none', color: '#FFF', borderRadius: '4px',  backgroundColor: '#0d6efd', border: 'none', padding: '20px', width: '200px'}}href={"/edit/" + station.id}>Edit</a>
          </div>
        </div>
    );
}