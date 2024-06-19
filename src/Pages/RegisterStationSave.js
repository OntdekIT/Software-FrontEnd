import React, {useEffect, useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import { wait } from "@testing-library/user-event/dist/utils";
import '../index.css';
import { api } from "../App";

const RegisterStationCode = () => {
    const stepvalues = {
        num: '',
        title: '',
        subTitle: '',
        description: '',
        onClick: ''
    }

    const [errorMessage, setErrorMessage] = useState(null);

    const [registrationCode, setRegistrationCode] = useState();
    const [databaseTag, setDatabaseTag] = useState();
    const [step, setStep] = useState(stepvalues);

    let success = false;

    useEffect(() => {
        SetStepValues(1);
        console.log(stepvalues);
    }, []);

    const getMeetstationCode = (databaseTag, registrationCode) => {
        api.get(`http://localhost:8082/api/Station/available?databaseTag=${databaseTag}&registrationCode=${registrationCode}`)
            .then((response) => {
                if (response.ok) {
                    success = true;
                } else {
                    setErrorMessage("De registratiecode is niet beschikbaar.");
                }
                return response.text();
            })
            .then((data) => {
                console.log(data);
            }).catch((err) => {
            setErrorMessage(err.message);

        });
    }
    const SetStepValues = (num) => {
        console.log(num);
        switch (num) {
            case 1:
                console.log("num1");
                setStep({
                    num: 1,
                    title: "Meetstation Zoeken",
                    subTitle: 'Meetstation nummer',
                    description: 'Meetstation nummer is aanwezig op uw meetstation.',
                    onClick: checkMeetstation
                })
                break;
            case 2:
                console.log("num2");
                setStep({
                    num: 2,
                    title: "Meetstation Privacy",
                    subTitle: 'Meetstation privacy instellen',
                    description: 'Hier kunt u kiezen tot op welke hoogte uw meetstation te zien is.',
                    onClick: checkMeetstation
                });
                break;
            case 3:
                console.log("num3");
                setStep({
                    num: 3,
                    title: "Meetstation Naam",
                    subTitle: 'Meetstation naam instellen',
                    description: 'Hier kunt u een naam aan uw meetstation geven.',
                    onClick: checkMeetstation
                });
                break;
            case 4:
                console.log("num4");
                setStep({
                    num: 3,
                    title: "Meetstation gegevens",
                    subTitle: 'Meetstation gegevens controleren',
                    description: 'Hier kunt u de ingevulde gegevens controleren.',
                    onClick: checkMeetstation
                });
                break;
        }
    }

    const navigate = useNavigate();
    const checkMeetstation = () => {
        setErrorMessage(null);

        if (registrationCode === undefined) {
            setErrorMessage("Vul een registratie code in.");
        } else if (databaseTag === undefined) {
            setErrorMessage("Vul een tag in.");
        } else {
            getMeetstationCode(databaseTag, registrationCode);
            wait(300).then(() => {
                    if (success === true) {
                        console.log("YIPPEEE");
                        success = false;
                        navigate(`/station/create/name?items=${encodeURIComponent(registrationCode)}`)
                    } else {
                        console.log("oh:(");
                    }
                }
            );
        }

    }

    const handleChangeCode = (event) => {
        setRegistrationCode(event.target.value);
    }
    const handleChangeTag = (event) => {
        setDatabaseTag(event.target.value);
    }

    return (
        <div className={"color"}>
            <br />
            <div className={"container gy-5"}>
                <div><div className={"row"}>
                    <div className={"col-4"}></div>
                    <div className={"col-4"}>
                        <h4><b>(1/5) Meetstation toevoegen</b></h4>
                        <label className={"labelMargin"}>
                            <h5>Registratie code </h5>
                            <div className={"form-text"}> Registratie code is aanwezig op uw meetstation. </div>
                        </label>

                    </div>
                </div>

                    <div className={"row mt-1"}>
                        <div className={"col-4"}></div>
                        <div className={"col-2"}>
                            <select className={"form-select"} value={databaseTag} onChange={handleChangeTag} required>
                                <option selected={true}>Selecteer uw tag</option>
                                <option value={"MJS"}>MJS</option>
                            </select>

                        </div>
                        <div className={"col-2"}>
                            <input type={"number"}
                                   className={"form-control"}
                                   placeholder={"Registratiecode..."}
                                   onChange={handleChangeCode}
                                   value={registrationCode}
                                   required
                            />
                        </div>
                    </div>
                    <div className={"row"}>
                        <div className={"col-4"}></div>
                        <div className={"col-4"}>
                            <br />
                            {errorMessage && <label className={"error-msg"}>{errorMessage}</label>}
                        </div>
                    </div>
                </div>
                {/*<div className={"row mt-5"}>*/}
                {/*    <div className={"col-4"}></div>*/}
                {/*    <div className={"col-5"}>*/}
                {/*        <Link to={"/Account"}>*/}
                {/*            <button className={"button2Inline"}>Annuleren</button>*/}
                {/*        </Link>*/}
                {/*        <button className={"button2"} onClick={checkMeetstation}>Checken</button>*/}
                {/*        <Link to={"/station/create/name"} state={registrationCode}>*/}
                {/*            <button className={"button2"} >Volgende</button>*/}
                {/*        </Link>*/}

                {/*    </div>*/}
                {/*</div>*/}
                <div className={"row mt-5"}>
                    <div className={"col-4"}></div>
                    <div className={"col-5"}>
                        <Link to={"/Account"}>
                            <button className={"button2Inline"}>Annuleren</button>
                        </Link>
                        {/*<Link to={"/station/create/name"} state={registrationCode}>*/}
                        <button className={"button2"} onClick={step.onClick}>Volgende</button>
                        {/*</Link>*/}
                    </div>
                </div>
            </div>
        </div>
    );
}
export default RegisterStationCode;