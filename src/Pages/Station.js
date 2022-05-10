import { useLocation, useParams } from 'react-router-dom';
import React from 'react';
import { useState, useEffect } from "react";
import axios from "axios";


export default function Station(props) {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    
    const location = useLocation();
    const datas = location.state;
    console.log(datas);

    useEffect(() => {
      const getData = async () => {
        try {
          const response = await axios.get(
            `http://localhost:8082/api/Station/` + console.log(datas)
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
        <div className="Station">
          <h1>Station</h1>
          <p>id: {datas}</p>
        </div>
    );
}
