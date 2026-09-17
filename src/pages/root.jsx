import {Outlet} from "react-router-dom";
import Navbar from "../components/navbar.jsx";
import useTokenExpirationCheck from "../hooks/use-token-expiration-check.jsx";

export default function Root() {
    useTokenExpirationCheck();

    return (
        <div className="min-h-screen bg-gray-50 text-gray-900">
            <Navbar/>
            {/* Navbar spacer element (matches the fixed 4rem/h-16 navbar) */}
            <div className="h-16" aria-hidden="true"></div>
            <main className="w-full">
                <Outlet/>
            </main>
        </div>
    )
}
