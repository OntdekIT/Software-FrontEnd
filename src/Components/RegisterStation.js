import { useState } from "react";
import React from "react";
import { api } from "../App";

function RegisterStation() {
  // states for Registration
  /*  userId is currently forced to 1
      this needs to be changed once a logged in user is applicable */
  const inputvalues = {
    userId: 1,
    stationname: "",
    address: "",
    height: 0,
    longitude: 0,
    latitude: 0,
    ispublic: false,
  };
  const [inputs, setInputs] = useState(inputvalues);
  const [isChecked, setIsChecked] = useState(false);
  //States for checking errors
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setInputs({ ...inputs, [name]: value });
    console.log(inputs);
  };

  const checkboxHandler = (event) => {
    setIsChecked(!isChecked);
    const { name, checked } = event.target;
    setInputs({ ...inputs, [name]: checked });
    console.log(inputs);
  };

  // Handling the form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    setError(validate(inputs));
    if (error == false) {
      setSubmitted(true);
      api
        .post("/Station", inputs)
        .then((response) => {
          console.log(response);
        })
        .catch((error) => {
          console.log(error);
        });
    }
  };

  //Showing success message
  const successMessage = () => {
    return (
      <div className="success" style={{ display: submitted ? "" : "none" }}>
        <h1> Station succesfully registered! </h1>
      </div>
    );
  };
  // Showing error message if error is true
  const errorMessage = () => {
    return (
      <div className="error" style={{ display: error ? "" : "none" }}>
        <h1>please enter all the fields</h1>
      </div>
    );
  };

  const validate = (values) => {
    const errors = {};
    if (!values.stationname) {
      errors.stationname = "name is required";
    }
    if (!values.address) {
      errors.address = "adress is required";
    }
    if (!values.height) {
      errors.height = "Password is required";
    }
    if (!values.longitude) {
      errors.longitude = "Longitude is required";
    }
    if (!values.latitude) {
      errors.latitude = "Latitude is required";
    }
    return errors;
  };

  return (
    <div className="form">
      <div>
        <h1>Station Registration</h1>
      </div>

      <div className="messages">
        {errorMessage()}
        {successMessage()}
      </div>

      <form onSubmit={handleSubmit}>
        <div className="form-input">
          <label className="label">Naam</label>
          <input
            onChange={handleChange}
            placeholder="Name"
            className="form-control"
            name="stationname"
            type="text"
            required
          />
          <label className="label">Adres</label>
          <input
            onChange={handleChange}
            placeholder="Adress"
            className="form-control"
            name="address"
            type="text"
            required
          />
          <div className="form-input">
            <label className="label">Hoogte</label>
            <input
              onChange={handleChange}
              placeholder="Height"
              className="form-control"
              name="height"
              type="text"
              required
            />
          </div>
          <div className="form-input">
            <label className="label">Longitude</label>
            <input
              onChange={handleChange}
              placeholder="Longitude"
              className="form-control"
              name="longitude"
              type="text"
              required
            />
          </div>
          <div className="form-input">
            <label className="label">Latitude</label>
            <input
              onChange={handleChange}
              placeholder="Latitude"
              className="form-control"
              name="latitude"
              type="text"
              required
            />
          </div>
          <div>
            <input
              type="checkbox"
              checked={isChecked}
              onChange={checkboxHandler}
              placeholder="Ispublic"
              name="ispublic"
              required
            />
            <label className="label">
              Ik wil dit station publiek zichtbaar hebben
            </label>
          </div>

          <button className="btn btn-primary" type="submit">
            Versturen
          </button>
        </div>
      </form>
    </div>
  );
}

export default RegisterStation;
