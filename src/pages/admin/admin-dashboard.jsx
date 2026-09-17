import {Link} from "react-router-dom";

const ACTIONS = [
    {
        link: "/admin/workshop-codes",
        title: "Workshopcodes",
        description: "Beheer actieve en verlopen workshopcodes.",
        icon: "bi bi-123",
    },
    {
        link: "/admin/users",
        title: "Gebruikers",
        description: "Bekijk gebruikers en beheer hun rollen.",
        icon: "bi bi-person",
    },
    {
        link: "/admin/stations",
        title: "Stations",
        description: "Beheer meetstations en hun instellingen.",
        icon: "bi bi-broadcast",
    },
];

export default function AdminDashboard() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-6">
            <header className="mb-6">
                <h1 className="flex items-center gap-2 text-2xl font-bold text-gray-900">
                    <i className="bi bi-gear text-brand-500"></i>
                    Beheer
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                    Kies een onderdeel om te beheren.
                </p>
            </header>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {ACTIONS.map((action) => (
                    <Link
                        key={action.link}
                        to={action.link}
                        className="group flex flex-col rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                    >
                        <span className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-brand-50 text-2xl text-brand-500 transition-colors group-hover:bg-brand-500 group-hover:text-dark">
                            <i className={action.icon}></i>
                        </span>
                        <h2 className="flex items-center justify-between text-lg font-semibold text-gray-900">
                            {action.title}
                            <i className="bi bi-arrow-right text-base text-gray-300 transition-colors group-hover:text-brand-500"></i>
                        </h2>
                        <p className="mt-1 text-sm text-gray-500">{action.description}</p>
                    </Link>
                ))}
            </div>
        </div>
    );
}
