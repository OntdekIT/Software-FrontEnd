import React, {useState} from "react";
import {Link, useLocation} from "react-router-dom";
export default function RegisterStationHeight() {
    //const { state } = useLocation();
    const [direction, setDirection] = useState();
    const [height, setHeight] = useState();
    const [location, setLocation] = useState();
    const [answers, setAnswers] = useState([]);
    const locationRouter = useLocation();
    const strings = locationRouter.state.strings;

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
        setAnswers([...answers, strings[0], strings[1], height, direction, location]);
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
                        {strings.map(s => {
                            return(
                                <div>{s}</div>
                            )
                        })}
                    </div>
                    <div className={"col-5"}>
                        <Link to={"/station/create/name"} state={strings[0]}><button className={"btn btn-outline-primary mx-4"}>Vorige</button></Link>
                        <button className={"btn btn-secondary"} onClick={handleClick}>Test</button>
                        <Link onClick={handleClick} to={"/station/create/visibility"} state={answers}><button className={"btn btn-primary mx-4"}>Volgende</button></Link>
                    </div>
                </div>
            </div>
        </div>
    );
}