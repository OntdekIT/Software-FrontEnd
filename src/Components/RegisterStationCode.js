import React from "react";
import {Link} from "react-router-dom";

export default function RegisterStationCode() {
    return (
        <div>
            <br/>
            <div className={"container gy-5"}>
                <div className={"row"}>
                    <div className={"col-4"}></div>
                    <div className={"col-4"}>
                        <h4><b>(1/5) Meetstation toevoegen</b></h4>
                        <label>
                            <h5>Registratie code </h5>
                            <div className={"form-text"}> Registratie code is aanwezig op uw meetstation. </div>
                        </label>
                        <input type={"text"} className={"form-control"} placeholder={"Registratiecode..."} />
                    </div>
                </div>
                <div className={"row mt-5"}>
                    <div className={"col-4"}></div>
                    <div className={"col-5"}>
                        <button className={"btn btn-outline-primary mx-4"}>Annuleren</button>
                        <Link to={"/station/create/name"}><button className={"btn btn-primary mx-4"}>Volgende</button></Link>
                    </div>
                </div>
            </div>
        </div>
    );
}