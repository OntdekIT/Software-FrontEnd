import React, {useState, useRef} from "react";
import {Link} from "react-router-dom";
import {wait} from "@testing-library/user-event/dist/utils";
import '../index.css';

export default function RegisterStationCode() {
    const [errorMessage, setErrorMessage] = useState(null);

    const [registrationCode, setRegistrationCode] = useState();
    const [databaseTag, setDatabaseTag] = useState();
    let success = false;
    const getMeetstationCode = (databaseTag, registrationCode) => {
        fetch(`http://localhost:8082/api/Station/available?databaseTag=${databaseTag}&registrationCode=${registrationCode}`)
            .then((response) => {
                if(response.ok) {
                   success = true;
                }else{
                    setErrorMessage("De registratiecode bestaat niet...");
                }
                return response.text();
            })
            .then((data) => {
                console.log(data);
            }).catch((err) => {
                setErrorMessage(err.message);

        });
    }

    const checkMeetstation = () => {
        setErrorMessage(null);
        getMeetstationCode(databaseTag, registrationCode);
        wait(300).then(() => {
            if(success === true) {
                console.log("YIPPEEE");
                success = false;
            }
            else {
                console.log("oh:(");
            }}
        );

    }

    const buttonValidationCheck = () => {
        let valid = false;

        if(registrationCode != null && databaseTag != null){
            valid = true;
        }

        if(valid == true){
            return(
            <Link to={"/station/create/name"} state={registrationCode}></Link>
            )
        }

        return null;
    }

    const handleChangeCode = (event) => {
        setRegistrationCode(event.target.value);
    }
    const handleChangeTag = (event) => {
        setDatabaseTag(event.target.value);
    }

    return (
        <div className={"color"}>
             <br/>
             <div className={"container gy-5"}>
                 <div><div className={"row"}>
                         <div className={"col-4"}></div>
                         <div className={"col-4"}>
                             <h4><b>(1/4) Meetstation toevoegen</b></h4>
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
                             <br/>
                             {errorMessage && <label className={"error-msg"}>{errorMessage}</label>}
                         </div>
                     </div>
                </div>
                <div className={"row mt-5"}>
                    <div className={"col-4"}></div>
                    <div className={"col-5"}>
                        <Link to={"/Account"}>
                            <button className={"button2Inline"}>Annuleren</button>
                        </Link>
                        <button className={"button2"} onClick={checkMeetstation}>Checken</button>
                        <Link to={"/station/create/name"} state={registrationCode}>
                            <button className={"button2"} >Volgende</button>
                        </Link>

                        {/*<button className={"button2"} onClick={buttonValidationCheck}>Volgende</button>*/}
                    </div>
                </div>
            </div>
        </div>
    );
}

