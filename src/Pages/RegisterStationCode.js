import React, {useEffect, useState} from "react";
import { Link, useNavigate } from "react-router-dom";
import '../index.css';
import { api } from "../App";

const RegisterStationCode = () => {
    const inputvalues = {
        stationid: '0',
        name: '',
        database_tag: '',
        location_locationid: 0,
        userid: 0,
        is_public: false,
    };

    const stepvalues = {
        num: '',
        title: '',
        subTitle: '',
        description: '',
        onClick: ''
    }

    // const [station, setStation] = useState(inputvalues);
    const [errorMessage, setErrorMessage] = useState(null);
    const [step, setStep] = useState(stepvalues);
    const [success, setSuccess] = useState(false);
    const [visibility, setVisibility] = useState('0');

    const [stationId, setStationId] = useState('0');
    const [name, setName] = useState('');
    const [databaseTag, setDatabaseTag] = useState('');
    const [isPublic, setIsPublic] = useState('');

    const navigate = useNavigate();



    useEffect(() => {
        SetStepValues(1);
        console.log(stepvalues);
    }, []);

    const SetStepValues = (num) => {
        console.log(num);
        switch(num){
            case 1:
                console.log("num1");
                setStep({
                    num: 1,
                    title: "Meetstation Zoeken",
                    subTitle: 'Meetstation nummer',
                    description: 'Meetstation nummer is aanwezig op uw meetstation.',
                    onClick: verifyStationNumber
                })
                break;
            case 2:
                console.log("num2");
                setStep({
                    num: 2,
                    title: "Meetstation Privacy",
                    subTitle: 'Meetstation privacy instellen',
                    description: 'Hier kunt u kiezen tot op welke hoogte uw meetstation te zien is.',
                    onClick: goForward
                });
                break;
            case 3:
                console.log("num3");
                setStep({
                    num: 3,
                    title: "Meetstation Naam",
                    subTitle: 'Meetstation naam instellen',
                    description: 'Hier kunt u een naam aan uw meetstation geven.',
                    onClick: goForward
                });
                break;
            case 4:
                console.log("num4");
                setStep({
                    num: 3,
                    title: "Meetstation gegevens",
                    subTitle: 'Meetstation gegevens controleren',
                    description: 'Hier kunt u de ingevulde gegevens controleren.',
                    onClick: goForward
                });
                break;
        }
    }

    const verifyStationNumber = async () => {
        setErrorMessage(null);
        try{
            if (!stationId) {
                setErrorMessage("Vul een registratie code in.");
            } else if (!databaseTag) {
                setErrorMessage("Vul een tag in.");
            } else {
                const response = await api.get(`Meetstation/Availibility/${stationId}`, {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: false
                });
                if (response.data){
                    SetStepValues(step.num + 1);
                }
                else{
                    setErrorMessage("Meetstation is niet beschikbaar");
                }
            }
        }
        catch (err){
            console.error(err);
        }
    }


    const goForward = () => {
        SetStepValues(step.num + 1);
    }

    const goBack = () => {
        if (step.num === 1){
            navigate(-1);
        }
        SetStepValues(step.num - 1);
    }


    const handleChangeTag = (event) => {
        setDatabaseTag(event.target.value);
    };

    const handleChangeCode = (event) => {
        setStationId(event.target.value);
    };

    const handleChangeVisibility = (event) => {
        setVisibility(event.target.value);
    };

    return (
        <div className="color">
            <br />
            <div className="container gy-5">
                <div className="row">
                    <div className="col-4"></div>
                    <div className="col-4">
                        <h4><b>({step.num}/5) {step.title}</b></h4>
                        <label className="labelMargin">
                            <h5>{step.subTitle} </h5>
                            <div className="form-text">{step.description}</div>
                        </label>
                    </div>
                </div>

                {(() => {
                    switch (step.num) {
                        case 1:
                            return (
                                <>
                                    <div className="row mt-1">
                                        <div className="col-4"></div>
                                        <div className="col-2">
                                            <select className="form-select" value={databaseTag}
                                                    onChange={handleChangeTag} required>
                                                <option value="">Selecteer uw tag</option>
                                                <option value="MJS">MJS</option>
                                            </select>
                                        </div>
                                        <div className="col-2">
                                            <input
                                                type="number"
                                                className="form-control"
                                                placeholder="Station nummer..."
                                                onChange={handleChangeCode}
                                                value={stationId}
                                                required
                                            />
                                        </div>
                                    </div>
                                </>
                            );
                        case 2:
                            return (
                                <>
                                    <div className="row mt-1">
                                        <div className="col-4"></div>
                                        <div className="col-4">
                                            <div className="form-group">
                                                <label className="form-label">Zichtbaarheid van meetstation</label>
                                                <select
                                                    value={visibility}
                                                    onChange={handleChangeVisibility}
                                                    className="form-select"
                                                    name="visibility"
                                                >
                                                    <option value="0">Onzichtbaar</option>
                                                    <option value="1">Zichtbaar</option>
                                                </select>
                                                {visibility === '0' && (
                                                    <div className="form-text">Het station is onzichtbaar, maar de data
                                                        wordt gebruikt binnen de metingen van een wijk.</div>
                                                )}
                                                {visibility === '1' && (
                                                    <div className="form-text">Het station is zichtbaar en kan door
                                                        iedereen bekeken worden.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            );
                        // Add more cases as needed for additional steps
                        default:
                            return null; // Default case if step.num doesn't match any specific case
                    }
                })()}
                <div className="row">
                    <div className="col-4"></div>
                    <div className="col-4">
                        <br/>
                        {errorMessage && <label className="error-msg">{errorMessage}</label>}
                    </div>
                </div>
                <div className="row mt-5">
                    <div className="col-4"></div>
                    <div className="col-5">
                        <Link to="/Account">
                            <button className="button2Inline" onClick={goBack}>Annuleren</button>
                        </Link>
                        <button className="button2" onClick={step.onClick}>Volgende</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default RegisterStationCode;
