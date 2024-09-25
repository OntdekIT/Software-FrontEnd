import React, {useContext} from 'react';
import {useState, useEffect} from "react";
import {Link} from 'react-router-dom';
import {api} from "../../App";
import LoginCheck from '../../Components/LoginCheck';
import DashboardButton from "../../Components/Shared/DashboardButton";

export default function AdminPage() {
    const [errMsg, setErrMsg] = useState(null);
    const {isAdmin} = useContext(LoginCheck);

    if (!isAdmin) {
        window.location.href = "/errors/unauthorized";
    }

    useEffect(() => {
    }, []);


    return (<div className="Account">
            <title>Beheer</title>
            {/* {user.admin ? valueToShowIfTrue : valueToShowIfFalse} */}
            {isAdmin ? (
                <div className="container">
                    <div className="row">
                        <h1 className="text-center page-header-margin">Beheer</h1>
                    </div>
                    <div className="row">
                        <div className="col-12 col-sm-6 col-md-4 mb-4">
                            <DashboardButton link={"/admin/workshop-codes/create"} text={"Workshopcode aanmaken"}
                                             icon={"bi bi-123"}></DashboardButton>
                        </div>
                        <div className="col-12 col-sm-6 col-md-4 mb-4">
                            <DashboardButton link={"/admin/workshop-codes"} text={"Workshopcodes zien"}
                                             icon={"bi bi-123"}></DashboardButton>
                        </div>
                        <div className="col-12 col-sm-6 col-md-4 mb-4">
                            {/*<Link to={"/Admin/grantUserAdmin"}>*/}
                            {/*    <button className="btn btn-lg bg-warning">Gebruiker adminrechten geven</button>*/}
                            {/*</Link>*/}
                            <DashboardButton link={"/admin/grantUserAdmin"} text={"Gebruiker adminrechten geven"}
                                             icon={"bi bi-person"}></DashboardButton>
                        </div>
                    </div>
                </div>
            ) : (
                <div>

                </div>
            )}

        </div>
    );
}