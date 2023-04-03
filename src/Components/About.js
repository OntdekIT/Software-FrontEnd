import React from "react";
export default function About() {
  return (
      <div>
          <br/>
          <div className={"container gy-5"}>
              <div className={"row"}>
                  <div className={"col-4"}></div>
                  <div className={"col-5"}>
                      <h4>(1/5) Meetstation toevoegen</h4>
                      <label>
                          <h5>Registratie code </h5>
                          <div className={"form-text"}> Registratie code is aanwezig op uw meetstation. </div>
                          <input type={"text"} className={"form-control"} placeholder={"Registratiecode..."}/>
                      </label>
                  </div>
              </div>
              <div className={"row mt-5"}>
                  <div className={"col-4"}></div>
                  <div className={"col-5"}>
                      <button className={"btn btn-outline-primary mx-4"}>Annuleren</button>
                      <button className={"btn btn-primary mx-4"}>Volgende</button>
                  </div>
              </div>
          </div>
      </div>
  );
}
