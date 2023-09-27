import React from 'react';
import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from 'react-router-dom';

const App = () => {
  const [posts, setPost] = useState([]);
  useEffect(() => {
    fetch("http://localhost:8082/api/Translation")
      .then((response) => response.json())

      .then((data) => {
        console.log(data);
        setPost(data);
      })

      .catch((err) => {
        console.log(err.message);
      });
  }, []);

  return (null);
};

function GiveLanguage() {
  const Language = "Nederlands"
  return Language;
}

function GivePageId() {
  const PageId = "Account"
  return PageId;
}

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
  }, []);

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