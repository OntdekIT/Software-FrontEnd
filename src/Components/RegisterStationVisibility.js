import React from "react";
import {Link} from "react-router-dom";
export default function RegisterStationVisibility() {
    return (
        <div>
            <br/>
            <div className={"container gy-5"}>
                <div className={"row"}>
                    <div className={"col-4"}></div>
                    <div className={"col-4"}>
                        <h4><b>(5/5) Meetstation toevoegen</b></h4>
                        <label>
                            <h5>Prive meetstation </h5>
                            <div className={"form-text"}> Specifieke data van een meetstation kunnen alleen bekeken worden door de eigenaar. Data van een prive meetstation worden alsnog gebruikt in de kaart. </div>
                        </label>

                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="RadioVisibility" id="RadioPrivate"
                                   value="Private" />
                            <label className="form-check-label" htmlFor="RadioPrivate">Prive</label>
                        </div>

                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="RadioVisibility" id="RadioPublic"
                                   value="Public" />
                            <label className="form-check-label" htmlFor="RadioPublic">Openbaar</label>
                        </div>
                    </div>


                </div>
                <div className={"row mt-5"}>
                    <div className={"col-4"}></div>
                    <div className={"col-5"}>
                        <Link to={"/station/create/data"}><button className={"btn btn-outline-primary mx-4"}>Vorige</button></Link>
                        <Link to={"/station/create/name"}><button className={"btn btn-primary mx-4"}>Afronden</button></Link>
                    </div>
                </div>
            </div>
        </div>
    );
}