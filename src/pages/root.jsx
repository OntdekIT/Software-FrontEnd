import {Outlet} from "react-router-dom";
import Navbar from "../components/navbar.jsx";

export default function Root() {
    return (
        <>
            <Navbar/>
            <div className="container-fluid p-0">
                <div className="nav-size"></div> {/* Navbar spacer element */}
                <Outlet/>
            </div>
        </>
    )
}