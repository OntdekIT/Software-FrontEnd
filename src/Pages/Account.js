import React from 'react';
import { useState, useEffect } from "react";
import { Link } from 'react-router-dom';
import { api } from "../App";

export default function Account() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errMsg, setErrMsg] = useState(null);

  useEffect(() => {
    const getData = async () => {
      try {
        const response = await api.get(
          `/Station/user/1` 
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
    getData();
  }, []);

  return (
    <div className="Account">
      <title>Account</title>
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

      <Link to={"/station/create"}> <button className={"button2"}>Station toevoegen</button></Link>
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