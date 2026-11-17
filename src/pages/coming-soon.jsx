import {Link, useLocation} from "react-router-dom";
import {NAV_ITEMS, isNavItemActive} from "../utils/nav-items.js";

// Tijdelijke plek voor pagina's die in het menu staan maar nog niet bestaan.
// De pagina-PR's (#184 tot #186) vervangen de route in main.jsx, daarna kan
// dit bestand weg.
export default function ComingSoon() {
    const {pathname} = useLocation();
    const item = NAV_ITEMS.find((candidate) => isNavItemActive(candidate, pathname));

    return (
        <main className="mx-auto max-w-xl px-4 py-16 text-center">
            <h1 className="text-2xl font-semibold text-dark">{item ? item.label : "Deze pagina"} komt eraan</h1>
            <p className="mt-3 text-gray-700">Deze pagina is nog in aanbouw. Bekijk intussen de kaart.</p>
            <Link to="/" className="mt-6 inline-block rounded-md bg-dark px-4 py-2 text-sm font-medium text-white">
                Naar de kaart
            </Link>
        </main>
    );
}
