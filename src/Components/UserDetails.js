import React, { useState } from "react";
import axios from "../api/axios";

function UserDetails() {
  const [userData, setUserData] = useState();

  const handleChange = (e) => {
    console.log(e);
  };

  const handleSubmit = (e) => {
    console.log(e);
  };
  axios
    .get("http://localhost:8082/api/User", {})
    .then((response) => {
      console.log(response);
    })
    .catch((error) => {
      console.log(error);
    });

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
