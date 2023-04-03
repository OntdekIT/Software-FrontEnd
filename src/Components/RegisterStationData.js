import React from "react";
import {Link} from "react-router-dom";
export default function RegisterStationData() {
    return (
        <div>
            <br/>
            <div className={"container gy-5"}>
                <div className={"row"}>
                    <div className={"col-4"}></div>
                    <div className={"col-4"}>
                        <h4><b>(4/5) Meetstation toevoegen</b></h4>
                        <label>
                            <h5>Meetdata </h5>
                            <div className={"form-text"}> Welke data meet uw meetstation?. </div>
                        </label>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                                <label className="form-check-label" htmlFor="flexCheckDefault">
                                    Tempratuur
                                </label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                            <label className="form-check-label" htmlFor="flexCheckDefault">
                                Luchtvochtigheid
                            </label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                            <label className="form-check-label" htmlFor="flexCheckDefault">
                                Licht
                            </label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                            <label className="form-check-label" htmlFor="flexCheckDefault">
                                Stikstof
                            </label>
                        </div>
                        <div className="form-check">
                            <input className="form-check-input" type="checkbox" value="" id="flexCheckDefault" />
                            <label className="form-check-label" htmlFor="flexCheckDefault">
                                Koolstofdioxide
                            </label>
                        </div>
                    </div>
                </div>
                <div className={"row mt-5"}>
                    <div className={"col-4"}></div>
                    <div className={"col-5"}>
                        <Link to={"/station/create/height"}><button className={"btn btn-outline-primary mx-4"}>Vorige</button></Link>
                        <Link to={"/station/create/visibility"}><button className={"btn btn-primary mx-4"}>Volgende</button></Link>
                    </div>
                </div>
            </div>
        </div>
    );
}