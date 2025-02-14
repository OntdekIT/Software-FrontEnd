import {Outlet} from "react-router-dom";
import Navbar from "../components/navbar.jsx";
import useTokenExpirationCheck from "../hooks/use-token-expiration-check.jsx";

export default function Root() {
    useTokenExpirationCheck();

    return (
        <>
            <Navbar/>
            <div className="container-fluid p-0">
                {/* Navbar spacer element */}
                <div className="nav-size"></div>
                <Outlet/>
            </div>
        </>
    )
}