import React from "react";
import {Link} from "react-router-dom";
export default function RegisterStationName() {
    return (
        <div>
            <br/>
            <div className={"container gy-5"}>
                <div className={"row"}>
                    <div className={"col-4"}></div>
                    <div className={"col-4"}>
                        <h4><b>(2/5) Meetstation toevoegen</b></h4>
                        <label>
                            <h5>Naam</h5>
                            <div className={"form-text"}> Geef uw meetstation een naam. </div>
                        </label>
                        <input type={"text"} className={"form-control"} placeholder={"Naam..."}/>

                    </div>
                </div>
                <div className={"row mt-5"}>
                    <div className={"col-4"}></div>
                    <div className={"col-5"}>
                        <Link to={"/station/create"}><button className={"btn btn-outline-primary mx-4"}>Vorige</button></Link>
                        <Link to={"/station/create/height"}><button className={"btn btn-primary mx-4"}>Volgende</button></Link>
                    </div>
                </div>
            </div>
        </div>
    );
}