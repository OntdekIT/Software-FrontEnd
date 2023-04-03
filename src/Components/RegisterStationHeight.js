import React from "react";
import {Link} from "react-router-dom";
export default function RegisterStationHeight() {
    return (
        <div>
            <br/>
            <div className={"container gy-5"}>
                <div className={"row"}>
                    <div className={"col-4"}></div>
                    <div className={"col-4"}>
                        <h4><b>(3/5) Meetstation toevoegen</b></h4>
                        <label>
                            <h5>Richting</h5>
                            <div className={"form-text"}>Naar welke richting staat uw meetstation gericht? </div>
                        </label>
                        <select className="form-select">
                            <option value="North">Noord</option>
                            <option value="East">Oost</option>
                            <option value="South">Zuid</option>
                            <option value="West">West</option>
                        </select>


                        <label>
                            <h5>Hoogte (cm)</h5>
                            <div className={"form-text"}>Op welke hoogte vanaf de grond hangt uw meetstation? </div>
                        </label>
                            <input type={"text"} className={"form-control"} placeholder={"Hoogte..."}/>



                        <label>
                            <h5>Locatie</h5>
                            <div className={"form-text"}>Staat uw meetstation buiten of binnen? </div>
                        </label>
                        <br/>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="RadioInsideOrOutside" id="RadioInside"
                                   value="Inside" />
                            <label className="form-check-label" htmlFor="RadioInside">Binnen</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="RadioInsideOrOutside" id="RadioOutside"
                                   value="Outside" />
                            <label className="form-check-label" htmlFor="RadioOutside">Buiten</label>
                        </div>
                    </div>
                </div>
                <div className={"row mt-5"}>
                    <div className={"col-4"}></div>
                    <div className={"col-5"}>
                        <Link to={"/station/create/name"}><button className={"btn btn-outline-primary mx-4"}>Vorige</button></Link>
                        <Link to={"/station/create/data"}><button className={"btn btn-primary mx-4"}>Volgende</button></Link>
                    </div>
                </div>
            </div>
        </div>
    );
}