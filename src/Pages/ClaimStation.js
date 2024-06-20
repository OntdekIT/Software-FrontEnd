import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import '../index.css';
import { api } from "../App";

const ClaimStation = () => {
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

    const [station, setStation] = useState(inputvalues);
    const [errorMessage, setErrorMessage] = useState(null);
    const [step, setStep] = useState(stepvalues);
    const [success, setSuccess] = useState(false);
    const [visibility, setVisibility] = useState('0');

    const [stationId, setStationId] = useState('');
    const [name, setName] = useState('');
    const [databaseTag, setDatabaseTag] = useState('');
    const [isPublic, setIsPublic] = useState('');

    const navigate = useNavigate();

    useEffect(() => {
        station.stationid = null;
        station.visibility = '0';
        SetStepValues(1);
    }, []);

    const SetStepValues = (num) => {
        switch (num) {
            case 1:
                setStep({
                    num: 1,
                    title: "Meetstation Zoeken",
                    subTitle: 'Meetstation nummer',
                    description: 'Meetstation nummer is aanwezig op uw meetstation.',
                })
                break;
            case 2:
                setStep({
                    num: 2,
                    title: "Meetstation Privacy",
                    subTitle: 'Meetstation privacy instellen',
                    description: 'Hier kunt u kiezen tot op welke hoogte uw meetstation te zien is.',
                });
                break;
            case 3:
                setStep({
                    num: 3,
                    title: "Meetstation Naam",
                    subTitle: 'Meetstation naam instellen',
                    description: 'Hier kunt u een naam aan uw meetstation geven.',
                });
                break;
            case 4:
                setStep({
                    num: 4,
                    title: "Meetstation gegevens",
                    subTitle: 'Meetstation gegevens controleren',
                    description: 'Hier kunt u de ingevulde gegevens controleren.',
                });
                break;
        }
    }

    const verifyStationNumber = async () => {
        setErrorMessage(null);
        try {
            if (!station.stationid) {
                setErrorMessage("Vul een registratie code in.");
            } else if (!station.databaseTag) {
                setErrorMessage("Vul een tag in.");
            } else {
                const response = await api.get(`Meetstation/Availibility/${station.stationid}`, {
                    headers: { 'Content-Type': 'application/json' },
                    withCredentials: false
                });
                if (response.data) {
                    SetStepValues(step.num + 1);
                } else {
                    setErrorMessage("Meetstation is niet beschikbaar");
                }
            }
        } catch (err) {
            console.error(err);
        }
    }

    const goForward = () => {
        SetStepValues(step.num + 1);
    }

    const goBack = () => {
        if (step.num == 1) {
            navigate(-1);
        }
        SetStepValues(step.num - 1);
    }

    const handleChange = (event) => {
        const { name, value } = event.target;
        setStation({ ...station, [name]: value });
    };

    const handleButtonClick = (num) => {
        if (num == 1){
            verifyStationNumber();
        }
        else if(num == 4){
            handleSubmit();
        }
        else{
            goForward();
        }
    }

    const handleSubmit = () => {
        const currentStation = {
            stationid: station.stationid,
            name: station.name,
            database_tag: station.databaseTag,
            is_public: station.visibility === '1',
        };

        console.log(currentStation);
        api.put('/Meetstation/Claim', currentStation, {
            headers: { 'Content-Type': 'application/json' },
            withCredentials: true
        })
            .then((response) => {
                navigate(-1);
            })
            .catch((error) => {
                if (error.response) {
                    console.error(error.response.headers);
                } else if (error.request) {
                    console.error(error.request);
                } else {
                    console.error("Error", error.message);
                }
            });
    };

    return (
        <div className="color">
            <br />
            <div className="container gy-5">
                <div className="row">
                    <div className="col-4"></div>
                    <div className="col-4">
                        <h4><b>({step.num}/4) {step.title}</b></h4>
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
                                            <select className="form-select" value={station.databaseTag} onChange={handleChange} name="databaseTag" required>
                                                <option value="">Selecteer uw tag</option>
                                                <option value="MJS">MJS</option>
                                            </select>
                                        </div>
                                        <div className="col-2">
                                            <input
                                                type="number"
                                                className="form-control"
                                                name="stationid"
                                                placeholder="Station nummer..."
                                                onChange={handleChange}
                                                value={station.stationid}
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
                                                <select
                                                    value={station.visibility}
                                                    onChange={handleChange}
                                                    className="form-select"
                                                    name="visibility"
                                                >
                                                    <option value="0">Onzichtbaar</option>
                                                    <option value="1">Zichtbaar</option>
                                                </select>
                                                {station.visibility === '0' && (
                                                    <div className="form-text">Het station is onzichtbaar, maar de data wordt gebruikt binnen de metingen van een wijk.</div>
                                                )}
                                                {station.visibility === '1' && (
                                                    <div className="form-text">Het station is zichtbaar en kan door iedereen bekeken worden.</div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            );
                        case 3:
                            return (
                                <>
                                    <div className="row mt-1">
                                        <div className="col-4"></div>
                                        <div className="col-4">
                                            <input
                                                onChange={handleChange}
                                                className={"form-control"}
                                                value={station.name}
                                                name="name"
                                                type="text"
                                            />
                                        </div>
                                    </div>
                                </>
                            );
                        case 4:
                            return(
                                <>
                                    <div className="row mt-1">
                                        <div className="col-4"></div>
                                        <div className="col-4">
                                            <div>Station nummer: {station.stationid}</div>
                                            <div>Station naam: {station.name}</div>
                                            <div>
                                                Station visibility:
                                                {station.visibility === '0' ? (
                                                    <div className="form-text">Het station is onzichtbaar, maar de data
                                                        wordt gebruikt binnen de metingen van een wijk.</div>
                                                ) : station.visibility === '1' ? (
                                                    <div className="form-text">Het station is zichtbaar en kan door
                                                        iedereen bekeken worden.</div>
                                                ) : null}
                                            </div>
                                        </div>
                                    </div>
                                </>
                            )
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
                        <button className="button2Inline" onClick={goBack}>Terug</button>
                        <button className={"button2"} onClick={() => handleButtonClick(step.num)}>Volgende</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default ClaimStation;
