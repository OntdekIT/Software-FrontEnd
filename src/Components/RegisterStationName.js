import React, {useRef, useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
export default function () {
    const { state } = useLocation();
    const [strings, setStrings] = useState([state]);
    const nameRef = useRef();
    const navigate = useNavigate();

    const handleClick = (name) => {
        const updatedStrings = [...strings, name]
        setStrings(updatedStrings);
        navigate(`/station/create/height?items=${encodeURIComponent(JSON.stringify(updatedStrings))}`);

    }

    return (
        <div className={"color"}>
            <br/>
            <div className={"container gy-5"}>
                <div className={"row"}>
                    <div className={"col-4"}></div>
                    <div className={"col-4"}>
                        <h4><b>(2/4) Meetstation toevoegen</b></h4>
                        <label className={"labelMargin"}>
                            <h5>Naam</h5>
                            <div className={"form-text"}> Geef uw meetstation een naam. </div>

                            <input type={"text"} className={"form-control"} placeholder={"Naam..."} ref={nameRef} required/>
                        </label>
                    </div>
                </div>
                <div className={"row mt-5"}>
                    <div className={"col-4"}></div>
                    <div className={"col-5"}>
                        <Link to={"/station/create"}><button className={"button2Inline"}>Vorige</button></Link>
                        <button className={"button2"} onClick={() => handleClick(nameRef.current.value)}>Volgende</button>
                    </div>
                </div>
            </div>
        </div>
    );
}