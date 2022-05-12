import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "../api/axios";

function UserDetails() {
  const [userData, setUserData] = useState(null);
  const { id } = useParams();

  const handleChange = (e) => {
    console.log(e);
  };

  const handleSubmit = (e) => {
    console.log(e);
  };

  useEffect(() => {
    axios
      .get(`http://localhost:8082/api/User/${id}`, {})
      .then((response) => {
        setUserData(response);
      })
      .catch((error) => {
        console.log(error);
      });
  }, []);

  return (
    <>
      <div className="Form-Input">UserDetails</div>
      <form onSubmit={handleSubmit}>
        <div>
          <label className="labels">Name</label>
          <input
            name="username"
            placeholder="Username"
            type="text"
            className="form-control"
            onChange={handleChange}
            value={userData.username}
          />
          <label className="labels">Email</label>
          <input
            name="Email"
            placeholder="Email"
            type="text"
            className="form-control"
            onChange={handleChange}
          />
          <label className="labels">Password</label>
          <input
            name="Password"
            placeholder="Password"
            type="text"
            className="form-control"
            onChange={handleChange}
          />
          <label className="labels">Repeat Password</label>
          <input
            name="Password2"
            placeholder="Repeat password"
            type="text"
            className="form-control"
            onChange={handleChange}
          />
          <button>Update my data!</button>
        </div>
      </form>
    </>
  );
}

export default UserDetails;