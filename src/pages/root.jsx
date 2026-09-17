import {Outlet} from "react-router-dom";
import Navbar from "../components/navbar.jsx";
import useTokenExpirationCheck from "../hooks/use-token-expiration-check.jsx";

export default function Root() {
    useTokenExpirationCheck();

    return (
        <>
            <Navbar/>
            <div className="w-full p-0">
                {/* Navbar spacer element */}
                <div className="h-16"></div>
                <Outlet/>
            </div>
        </>
    )
}
