import React from 'react';
import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';

export default function Account() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  let navigate = useNavigate();

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
      <table>
        <tr>
          <th>Station Naam</th>
        </tr>
        {data &&
          <ul>
          {data.map(({ id, name }) => (
            <li key={id}>
              <Link to="/Station/" state={id}>{name}</Link>
            </li>
          ))}
          </ul>}
      </table>
    </div>
  );
}

