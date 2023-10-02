import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
export default function RegisterStationVisibility() {
    const [visibility, setVisibility] = useState();
    const navigate = useNavigate();
    const params = new URLSearchParams(window.location.search);
    const items = JSON.parse(decodeURIComponent(params.get('items')));

    const [errorMessage, setErrorMessage] = useState(null);

    const [answers, setAnswers] = useState(items);
    let answersValid = true;

    const handleRadioChange = (event) => {
        setVisibility(event.target.value);
    }


    const handleClick = () => {
        setErrorMessage(null);

        answers.map(a => {
            console.log(a);
        })

        if (visibility === undefined) {
            setErrorMessage("Vul een status in.");
        } else {
            const updatedAnswers = [...answers, visibility];
            setAnswers(updatedAnswers);
            navigate(`/station/create/data?items=${encodeURIComponent(JSON.stringify(updatedAnswers))}`);
        }

    }

    const toPreviousPage = () => {
        const array = [items[0], items[1], items[2], items[3], items[4]];
        navigate(`/station/create/height?items=${encodeURIComponent(JSON.stringify(array))}`);
    }

    return (
        <div className={"color"}>
            <br />
            <div className={"container gy-5"}>
                <div className={"row"}>
                    <div className={"col-4"}></div>
                    <div className={"col-4"}>
                        <h4><b>(4/5) Meetstation toevoegen</b></h4>
                        <label className={"labelMargin"}>
                            <h5>Prive meetstation </h5>
                            <div className={"form-text"}> Specifieke data van een meetstation kunnen alleen bekeken worden door de eigenaar. Data van een prive meetstation worden alsnog gebruikt in de kaart. </div>

                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" name="RadioVisibility" id="RadioPrivate"
                                    value="false" onChange={handleRadioChange} />
                                <label className="form-check-label" htmlFor="RadioPrivate">Prive</label>
                            </div>

                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" name="RadioVisibility" id="RadioPublic"
                                    value="true" onChange={handleRadioChange} />
                                <label className="form-check-label" htmlFor="RadioPublic">Openbaar</label>
                            </div>
                        </label>
                        <br />
                        {errorMessage && <label className={"error-msg"}>{errorMessage}</label>}
                    </div>


                </div>
                <div className={"row mt-5"}>
                    <div className={"col-4"}>
                    </div>
                    <div className={"col-5"}>
                        <button className={"button2Inline"} onClick={toPreviousPage}>Vorige</button>
                        <button className={"button2"} onClick={handleClick}>Afronden</button>
                    </div>
                </div>
            </div>
        </div>
    );
}