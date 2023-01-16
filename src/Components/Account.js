import React from 'react';
import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';

export default function Account() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState(null);

  const navigate = useNavigate();
  
  useEffect(() => {
    const getData = async () => {
      try {
        const response = await axios.get(
          `http://localhost:8082/api/Station/user/1` 
        );
        setData(response.data);
        setErrMsg(null);
      } catch (err) {
        setErrMsg(err.message);
        setData(null);
      } finally {
        setLoading(false);
      }
    };
    const log = console.log(data);
    getData();
  },[]);

  return (
    <div className="Account">
      <h1>Stations</h1>
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