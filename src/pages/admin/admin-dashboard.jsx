import {useContext} from "react";
import {LoginCheckContext} from "../../context/login-check-provider.jsx";
import DashboardButton from "../../components/dashboard-button.jsx";

export default function AdminDashboard() {
    const {isAdmin} = useContext(LoginCheckContext);

    if (!isAdmin) {
        throw new Error("Unauthorized");
    }

    return (
        <>
            <div className="container">
                <div className="row">
                    <h1 className="text-center page-header-margin">Beheer</h1>
                </div>
                <div className="row">
                    <div className="col-12 col-sm-6 mb-4">
                        <DashboardButton link={"/admin/workshop-codes"} text={"Workshopcodes"}
                                         icon={"bi bi-123"}></DashboardButton>
                    </div>
                    <div className="col-12 col-sm-6 mb-4">
                        <DashboardButton link={"/admin/users"} text={"Gebruikers"}
                                         icon={"bi bi-person"}></DashboardButton>
                    </div>
                </div>
            </div>
        </>
    )
}