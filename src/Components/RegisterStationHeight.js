import React, {useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
export default function RegisterStationHeight() {
    const [direction, setDirection] = useState("N");
    const [height, setHeight] = useState();
    const [location, setLocation] = useState();
    const [answers, setAnswers] = useState([]);

    const navigate = useNavigate();
    const params = new URLSearchParams(window.location.search);
    const items = JSON.parse(decodeURIComponent(params.get('items')));

    const [errorMessage, setErrorMessage] = useState(null);

    const handleRadioChange = (event) => {
        setLocation(event.target.value);
    }

    const handleDirectionChange = (event) => {
        setDirection(event.target.value);
    }

    const handleHeightChange = (event) => {
        setHeight(event.target.value);
    }
    const handleClick = () => {
        setErrorMessage(null);

        if(direction === undefined){
            setErrorMessage("Vul een richting in.");
        } else if(height === undefined){
            setErrorMessage("Vul een hoogte in.");
        } else if (location === undefined){
            setErrorMessage("Vul een locatie in.");
        } else {
            const updatedAnswers = [...answers, items[0], items[1], height, direction, location];
            setAnswers(updatedAnswers);
            navigate(`/station/create/visibility?items=${encodeURIComponent(JSON.stringify(updatedAnswers))}`);
        }

    }

    return (
        <div className={"color"}>
            <br/>
            <div className={"container gy-5"}>
                <div className={"row"}>
                    <div className={"col-4"}></div>
                    <div className={"col-4"}>
                        <h4><b>(3/5) Meetstation toevoegen</b></h4>
                        <label className={"labelMargin"}>
                            <h5>Richting</h5>
                            <div className={"form-text"}>Naar welke richting staat uw meetstation gericht? </div>

                            <select className="form-select" value={direction} onChange={handleDirectionChange} required>
                                <option value="N">Noord</option>
                                <option value="E">Oost</option>
                                <option value="S">Zuid</option>
                                <option value="W">West</option>
                            </select>
                        </label>


                        <label className={"labelMargin"}>
                            <h5>Hoogte (cm)</h5>
                            <div className={"form-text"}>Op welke hoogte vanaf de grond hangt uw meetstation? </div>

                            <input type={"text"} className={"form-control"} placeholder={"Hoogte in cm"} value={height}
                            onChange={handleHeightChange} required
                            />
                        </label>

                        <label className={"labelMargin"}>
                            <h5>Locatie</h5>
                            <div className={"form-text"}>Staat uw meetstation buiten of binnen? </div>

                            <br/>
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" name="RadioInsideOrOutside" id="RadioInside"
                                       value="false" onChange={handleRadioChange} />
                                <label className="form-check-label" htmlFor="RadioInside">Binnen</label>
                            </div>
                            <div className="form-check form-check-inline">
                                <input className="form-check-input" type="radio" name="RadioInsideOrOutside" id="RadioOutside"
                                       value="true" onChange={handleRadioChange}/>
                                <label className="form-check-label" htmlFor="RadioOutside">Buiten</label>

                            </div>
                        </label>
                        <br/>
                        {errorMessage && <label className={"error-msg"}>{errorMessage}</label>}
                    </div>

                </div>
                <div className={"row mt-5"}>
                    <div className={"col-4"}>
                    </div>
                    <div className={"col-5"}>
                        <Link to={"/station/create/name"} state={items[0]}>
                            <button className={"button2Inline"}>Vorige</button>
                        </Link>
                        <button className={"button2"} onClick={handleClick}>Volgende</button>
                    </div>
                </div>
            </div>
        </div>
    );
}