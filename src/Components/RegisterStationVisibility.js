import React, {useState} from "react";
import {Link, useLocation, useNavigate} from "react-router-dom";
export default function RegisterStationVisibility() {
    const [visibility, setVisibility] = useState();
    const navigate = useNavigate();
    const params = new URLSearchParams(window.location.search);
    const items = JSON.parse(decodeURIComponent(params.get('items')));

    const [answers, setAnswers] = useState(items);
    let answersValid = true;

    const postNaarBackend = async () => {
        await fetch('http://localhost:8082/api/Station/registerStation', {
            method: 'POST',
            body: JSON.stringify({
                userId: "1",
                registerCode: answers[0],
                databaseTag: "MJS",
                stationName: answers[1],
                height: answers[2],
                direction: answers[3],
                publicInfo: visibility,
                outside: answers[4]
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
            .then((response) => response.json())
            .then((data) => {
            })
            .catch((err) => {
                console.log(err.message);
            });
    };

    const handleRadioChange = (event) => {
        setVisibility(event.target.value);
    }

    const checkValues = () => {
        if(answers.length === 5)
        {
            answers.map(a => {
               if(a == null) {
                    answersValid = false;
               }
            });
        }
        else {
            answersValid = false;
        }
    }

    const handleClick = () => {

        answers.map(a => {
            console.log(a);
        })
        checkValues();
        if(answersValid) {
            postNaarBackend();
        }
        else {
            console.log("Antwoorden zijn niet valid");
        }
    }
    return (
        <div>
            <br/>
            <div className={"container gy-5"}>
                <div className={"row"}>
                    <div className={"col-4"}></div>
                    <div className={"col-4"}>
                        <h4><b>(4/4) Meetstation toevoegen</b></h4>
                        <label>
                            <h5>Prive meetstation </h5>
                            <div className={"form-text"}> Specifieke data van een meetstation kunnen alleen bekeken worden door de eigenaar. Data van een prive meetstation worden alsnog gebruikt in de kaart. </div>
                        </label>

                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="RadioVisibility" id="RadioPrivate"
                                   value="false" onChange={handleRadioChange}/>
                            <label className="form-check-label" htmlFor="RadioPrivate">Prive</label>
                        </div>

                        <div className="form-check form-check-inline">
                            <input className="form-check-input" type="radio" name="RadioVisibility" id="RadioPublic"
                                   value="true" onChange={handleRadioChange}/>
                            <label className="form-check-label" htmlFor="RadioPublic">Openbaar</label>
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
                        <Link to={"/station/create/height"} state={items}><button className={"btn btn-outline-primary mx-4"}>Vorige</button></Link>
                        <button className={"btn btn-primary mx-4"} onClick={handleClick}>Afronden</button>
                    </div>
                </div>
            </div>
        </div>
    );
}