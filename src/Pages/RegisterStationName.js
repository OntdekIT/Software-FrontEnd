import React, { useRef, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
export default function () {
    const { state } = useLocation();
    const nameRef = useRef();
    const navigate = useNavigate();

    const params = new URLSearchParams(window.location.search);
    const items = JSON.parse(decodeURIComponent(params.get('items')));
    const [strings, setStrings] = useState([items]);


    const [errorMessage, setErrorMessage] = useState(null);

    const handleClick = (name) => {
        setErrorMessage(null);

        if (name === "") {
            setErrorMessage("Vul een naam in.");
        } else {
            let updatedStrings = [];

            if (state !== null) {
                updatedStrings = [state, name];
            } else {
                updatedStrings = [...strings, name];
            }

            navigate(`/station/create/height?items=${encodeURIComponent(JSON.stringify(updatedStrings))}`);
        }

    }

    return (
        <div className={"color"}>
            <br />
            <div className={"container gy-5"}>
                <div className={"row"}>
                    <div className={"col-4"}></div>
                    <div className={"col-4"}>
                        <h4><b>(2/5) Meetstation toevoegen</b></h4>
                        <label className={"labelMargin"}>
                            <h5>Naam</h5>
                            <div className={"form-text"}> Geef uw meetstation een naam. </div>

                            <input type={"text"} className={"form-control"} placeholder={"Naam..."} ref={nameRef} required />
                            <br />
                            {errorMessage && <label className={"error-msg"}>{errorMessage}</label>}
                        </label>
                    </div>
                </div>
                <div className={"row mt-5"}>
                    <div className={"col-4"}>
                    </div>
                    <div className={"col-5"}>
                        <Link to={"/station/create"} >
                            <button className={"button2Inline"}>Vorige</button>
                        </Link>
                        <button className={"button2"} onClick={() => handleClick(nameRef.current.value)}>Volgende</button>
                    </div>
                </div>
            </div>
        </div>
    );
}