import React, {useRef, useState} from "react";
import {Link, useLocation} from "react-router-dom";
export default function RegisterStationName() {
    const { state } = useLocation();
    const [strings, setStrings] = useState([state]);
    const nameRef = useRef();
    const handleClick = () => {
        const name = nameRef.current.value;
        setStrings([...strings, name]);
    }


    return (
        <div>
            <br/>
            <div className={"container gy-5"}>
                <div className={"row"}>
                    <div className={"col-4"}></div>
                    <div className={"col-4"}>
                        <h4><b>(2/4) Meetstation toevoegen</b></h4>
                        <label>
                            <h5>Naam</h5>
                            <div className={"form-text"}> Geef uw meetstation een naam. </div>
                        </label>
                            <input type={"text"} className={"form-control"} placeholder={"Naam..."} ref={nameRef}/>
                    </div>
                </div>


                <div className={"row mt-5"}>
                    <div className={"col-4"}>
                    </div>


                    <div className={"col-5"}>

                        <Link to={"/station/create"}><button className={"btn btn-outline-primary mx-4"}>Vorige</button></Link>
                        <button className={"btn btn-secondary"} onClick={handleClick}>Test</button>
                        <Link onClick={handleClick} to={"/station/create/height"} state={{strings: strings}} onClick={handleClick} className={"btn btn-primary mx-4"}>Volgende</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}