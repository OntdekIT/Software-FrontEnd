import React, {useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
export default function RegisterStationHeight() {
    const [direction, setDirection] = useState();
    const [height, setHeight] = useState();
    const [location, setLocation] = useState();
    const [answers, setAnswers] = useState([]);
    const navigate = useNavigate();
    const params = new URLSearchParams(window.location.search);
    const items = JSON.parse(decodeURIComponent(params.get('items')));

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
        const updatedAnswers = [...answers, items[0], items[1], height, direction, location];
        setAnswers(updatedAnswers);
        navigate(`/station/create/visibility?items=${encodeURIComponent(JSON.stringify(updatedAnswers))}`);
    }
    return (
        <div>
            <br/>
            <div className={"container gy-5"}>
                <div className={"row"}>
                    <div className={"col-4"}></div>
                    <div className={"col-4"}>
                        <h4><b>(3/4) Meetstation toevoegen</b></h4>
                        <label>
                            <h5>Richting</h5>
                            <div className={"form-text"}>Naar welke richting staat uw meetstation gericht? </div>
                        </label>
                        <select className="form-select" value={direction} onChange={handleDirectionChange}>
                            <option value="N">Noord</option>
                            <option value="E">Oost</option>
                            <option value="S">Zuid</option>
                            <option value="W">West</option>
                        </select>


                        <label>
                            <h5>Hoogte (cm)</h5>
                            <div className={"form-text"}>Op welke hoogte vanaf de grond hangt uw meetstation? </div>
                        </label>
                            <input type={"text"} className={"form-control"} placeholder={"Hoogte..."} value={height}
                            onChange={handleHeightChange}
                            />


                        <label>
                            <h5>Locatie</h5>
                            <div className={"form-text"}>Staat uw meetstation buiten of binnen? </div>
                        </label>
                        <br/>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="RadioInsideOrOutside" id="RadioInside"
                                   value="false" onChange={handleRadioChange}/>
                            <label className="form-check-label" htmlFor="RadioInside">Binnen</label>
                        </div>
                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="RadioInsideOrOutside" id="RadioOutside"
                                   value="true" onChange={handleRadioChange}/>
                            <label className="form-check-label" htmlFor="RadioOutside">Buiten</label>

                        </div>
                    </div>
                </div>
                <div className={"row mt-5"}>
                    <div className={"col-4"}>
                        <ul>
                            {items.map((item, index) => (
                                <li key={index}>{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div className={"col-5"}>
                        <Link to={"/station/create/name"} state={items}><button className={"btn btn-outline-primary mx-4"}>Vorige</button></Link>
                        <button className={"btn btn-primary"} onClick={handleClick}>Volgende</button>
                    </div>
                </div>
            </div>
        </div>
    );
}