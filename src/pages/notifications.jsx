import {Link} from "react-router-dom";

// Placeholder until notifications exist. It explains what is coming and offers
// working links, so nobody lands on a dead end.
export default function Notifications() {
    return (
        <div className="mx-auto max-w-2xl px-4 py-6">
            <header className="mb-6 flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                <div className="flex h-11 w-11 items-center justify-center rounded-lg bg-brand-100 text-brand-700">
                    <i className="bi bi-bell text-xl" aria-hidden="true"></i>
                </div>
                <h1 className="text-xl font-bold text-gray-900">Meldingen</h1>
            </header>

            <section className="rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm" aria-label="Meldingen komen eraan">
                <i className="bi bi-bell-slash text-4xl text-gray-500" aria-hidden="true"></i>
                <h2 className="mt-3 text-lg font-semibold text-gray-900">Meldingen komen eraan</h2>
                <p className="mt-2 text-sm text-gray-700">
                    Binnenkort zie je hier waarschuwingen over jouw stations en jouw wijk, zoals hitte, slechte
                    luchtkwaliteit of een station dat geen data meer doorgeeft. Nu is er nog niets te melden.
                </p>
                <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                    <Link to="/" className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-dark hover:bg-brand-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-dark">
                        Naar de kaart
                    </Link>
                    <Link to="/my/stations" className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-100 focus:outline-none focus-visible:ring-2 focus-visible:ring-dark">
                        Naar mijn stations
                    </Link>
                </div>
            </section>
        </div>
    );
}
