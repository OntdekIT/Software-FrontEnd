import {Outlet} from "react-router-dom";
import Navbar from "../components/navbar.jsx";
import BottomBar from "../components/bottom-bar.jsx";
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
            {/* Reserves the height of the fixed bottom bar (4rem plus the safe area) so it never covers content */}
            <div className="h-[calc(4rem+env(safe-area-inset-bottom))] lg:hidden" aria-hidden="true"></div>
            <BottomBar/>
        </div>
    )
}
