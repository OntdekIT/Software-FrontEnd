import React, {useState, useRef} from "react";
import {Link} from "react-router-dom";
import {wait} from "@testing-library/user-event/dist/utils";
import '../index.css';

export default function RegisterStationCode() {
    const [registrationCode, setRegistrationCode] = useState();
    const [databaseTag, setDatabaseTag] = useState();
    let success = false;
    const getMeetstationCode = (databaseTag, registrationCode) => {
        fetch(`http://localhost:8082/api/Station/available?databaseTag=${databaseTag}&registrationCode=${registrationCode}`)
            .then((response) => {
                if(response.ok) {
                   success = true;
                }
                return response.text();
            })
            .then((data) => {
                console.log(data);
            }).catch((err) => {
                console.log(err.message);

        });
    }

    const checkMeetstation = () => {
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
                </div>
                <div className={"row mt-5"}>
                    <div className={"col-4"}></div>
                    <div className={"col-5"}>
                        <Link to={"/Account"}>
                            <button className={"button2Inline"}>Annuleren</button>
                        </Link>
                        <button className={"button2"} onClick={checkMeetstation}>Checken</button>
                        <Link to={"/station/create/name"} state={registrationCode}>
                            <button className={"button2"}>Volgende</button>
                        </Link>
                    </div>
                </div>
            </div>
        </div>
    );
}


// <br/>
// <div className={"container gy-5"}>
//     <div>
//         <div className={"row"}>
//             <div className={"col-4"}></div>
//             <div className={"col-4"}>
//                 <h4><b>(1/4) Meetstation toevoegen</b></h4>
//                 <label>
//                     <h5>Registratie code </h5>
//                     <div className={"form-text"}> Registratie code is aanwezig op uw meetstation. </div>
//                 </label>
//
//             </div>
//         </div>
//
//         <div className={"row mt-1"}>
//             <div className={"col-4"}></div>
//             <div className={"col-2"}>
//                 <select className={"form-select"} value={databaseTag} onChange={handleChangeTag} required>
//                     <option selected={true}>Selecteer uw tag</option>
//                     <option value={"MJS"}>MJS</option>
//                 </select>
//
//             </div>
//             <div className={"col-2"}>
//                 <input type={"number"}
//                        className={"form-control"}
//                        placeholder={"Registratiecode..."}
//                        onChange={handleChangeCode}
//                        value={registrationCode}
//                        required
//                 />
//             </div>
//         </div>
//     </div>
//     <div className={"row mt-5"}>
//         <div className={"col-4"}></div>
//         <div className={"col-5"}>
//             <button className={"btn btn-outline-primary mx-4"}>Annuleren</button>
//             <button className={"btn btn-secondary mx-4"} onClick={checkMeetstation}>Checken</button>
//             <Link to={"/station/create/name"} state={registrationCode}>
//                 <button className={"btn btn-primary mx-4"}>Volgende</button>
//             </Link>
//         </div>
//     </div>
// </div>