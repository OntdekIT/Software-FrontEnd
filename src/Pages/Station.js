import { useParams } from 'react-router-dom';
import React from 'react';
import { useState, useEffect } from "react";
import { api } from '../App';

export default function Station() {
    const readValues = {id : 0, name: "", height:0, locationName:"", longtitude:0,latitude:0  };
    const [station, setStation] = useState(readValues);

    let {id} = useParams();

    useEffect(() => {

      api.get('/Station/'+ (id))
    
      .then(resp => {
        const { id, name, locationName, height, longitude, latitude} = resp.data
        setStation({ id, name, height, locationName, longitude, latitude })
        console.log(resp.data);
      })
    }, []);

    return (
        <div className="Station">
          <div>
              <p>Naam: {station.name}</p>
              <p>Locatie: {station.locationName}</p>
              <p>Hoogte: {station.height}</p>
              <p>Lengtegraad: {station.longitude}</p>
              <p>Breedtegraad: {station.latitude}</p>
          </div>
        </div>
    );
}
