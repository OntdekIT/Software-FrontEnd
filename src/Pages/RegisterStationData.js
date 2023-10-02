import { api } from "../App";
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";

export default function RegisterStationData() {
    const navigate = useNavigate();
    const params = new URLSearchParams(window.location.search);
    const items = JSON.parse(decodeURIComponent(params.get('items')));

    const [errorMessage, setErrorMessage] = useState(null);

    const [answers, setAnswers] = useState(items);
    let answersValid = true;

    const postNaarBackend = async () => {
        await api.get('/Station/registerStation', {
            method: 'POST',
            body: JSON.stringify({
                userId: "1",
                registerCode: answers[0],
                databaseTag: "MJS",
                stationName: answers[1],
                height: answers[2],
                direction: answers[3],
                publicInfo: answers[5],
                outside: answers[4]
            }),
            headers: {
                'Content-type': 'application/json; charset=UTF-8',
            },
        })
            .then((response) => response.json())
            .then((data) => {
                console.log(data);
            })
            .catch((err) => {
                console.log(err.message);
            });
    };


    const checkValues = () => {
        console.log(answers);
        if (answers.length === 6) {
            answers.map(a => {
                if (a == null) {
                    answersValid = false;
                }
            });
        }
        else {
            answersValid = false;
        }
    }

    const handleClick = () => {
        setErrorMessage(null);

        answers.map(a => {
            console.log(a);
        })
        checkValues();


        if (answersValid) {
            postNaarBackend();
        }
        else {
            console.log("Antwoorden zijn niet valid");
        }


    }

    const toPreviousPage = () => {
        navigate(`/station/create/visibility?items=${encodeURIComponent(JSON.stringify(items))}`);
    }

    return (
        <div className={"color"}>
            <br />
            <div className={"container gy-5"}>
                <div className={"row"}>
                    <div className={"col-4"}></div>
                    <div className={"col-4"}>
                        <h4><b>(5/5) Gegevens controleren</b></h4>
                        <label className={"labelMargin"}>
                            Registratiecode: <br />
                            <div className={"form-text"}>{items[0]}</div><br />
                            Naam: <br />
                            <div className={"form-text"}>{items[1]}</div><br />
                            Hoogte: <br />
                            <div className={"form-text"}>{items[2]} cm</div><br />
                            Richting:<br />
                            <div className={"form-text"}>{items[3]}</div><br />
                            Buiten: <br />
                            <div className={"form-text"}>{items[4]}</div><br />
                            Prive: <br />
                            <div className={"form-text"}>{items[5]}</div>
                        </label>
                        {errorMessage && <label className={"error-msg"}>{errorMessage}</label>}
                    </div>


                </div>
                <div className={"row mt-5"}>
                    <div className={"col-4"}>
                    </div>
                    <div className={"col-5"}>
                        <button className={"button2Inline"} onClick={toPreviousPage}>Vorige</button>
                        <Link to={"/Account"}>
                            <button className={"button2"} onClick={handleClick}>Afronden</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}