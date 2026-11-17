import { Link } from "react-router-dom";

const card = "rounded-xl border border-gray-200 bg-white p-4 shadow-sm";
const cardTitle = "mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900";

const STEPS = [
    {
        icon: "bi-tools",
        title: "Bouw een meetstation",
        text: "Tijdens een workshop van Ontdekstation en Bibliotheek Midden-Brabant maak je zelf een meetstation.",
    },
    {
        icon: "bi-broadcast",
        title: "Het station meet",
        text: "Het station meet onder andere temperatuur, luchtvochtigheid en fijnstof en verstuurt die data naar Meet je Stad.",
    },
    {
        icon: "bi-cloud-download",
        title: "MB Ontdekt haalt de data op",
        text: "Deze applicatie haalt de metingen op via de API van Meet je Stad.",
    },
    {
        icon: "bi-graph-up",
        title: "Jij ziet het resultaat",
        text: "De gegevens staan overzichtelijk op kaarten, per wijk en in grafieken per station.",
    },
];

const FEATURES = [
    { icon: "bi-speedometer2", to: "/dashboard", label: "Dashboard", text: "De staat van het meetnet in één oogopslag: actieve en uitgevallen stations en gemiddelde meetwaarden." },
    { icon: "bi-geo-alt", to: "/kaart", label: "Kaart", text: "Meetstations en wijken op de kaart, met temperatuur of fijnstof als kleurlaag." },
    { icon: "bi-map", to: "/newheatmap", label: "Heatmap", text: "Bekijk hoe temperatuur en fijnstof zich over de tijd verspreiden met een tijdslider." },
    { icon: "bi-pin-map", to: "/wijken", label: "Wijken", text: "Meetgegevens per wijk, met grafieken voor een gekozen periode." },
];

export default function About() {
    return (
        <div className="mx-auto max-w-5xl px-4 py-6">
            <title>Over ons</title>

            <header className="mb-6 flex items-center gap-3">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-100 text-brand-700">
                    <i className="bi bi-info-circle text-xl" aria-hidden="true"></i>
                </span>
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">Over ons</h1>
                    <p className="text-sm text-gray-500">Meet mee met het klimaat in jouw wijk</p>
                </div>
            </header>

            <div className="grid gap-4 md:grid-cols-3">
                <section className={`${card} md:col-span-2`}>
                    <h2 className={cardTitle}>
                        <i className="bi bi-globe-europe-africa text-brand-700" aria-hidden="true"></i>
                        Wat is MB Ontdekt?
                    </h2>
                    <p className="text-gray-600">
                        Ontdekstation organiseert samen met Bibliotheek Midden-Brabant workshops voor jong en oud
                        waarin je jouw talenten op het gebied van wetenschap en techniek kunt ontdekken. Onderdeel
                        daarvan is een project om temperatuur en luchtkwaliteit te meten: in een workshop maak je een
                        eigen meetstation. MB Ontdekt laat de gegevens van al die meetstations zien, zodat je kunt
                        ontdekken hoe het klimaat per wijk verschilt en verandert.
                    </p>
                </section>

                <section className={card}>
                    <h2 className={cardTitle}>
                        <i className="bi bi-stars text-brand-600" aria-hidden="true"></i>
                        Kenmerken
                    </h2>
                    <ul className="space-y-2 text-gray-600">
                        <li className="flex items-center gap-2">
                            <i className="bi bi-map text-brand-700" aria-hidden="true"></i>
                            <span>Interactieve kaart en heatmap</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <i className="bi bi-geo-alt text-brand-700" aria-hidden="true"></i>
                            <span>Meetgegevens per wijk</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <i className="bi bi-graph-up text-brand-700" aria-hidden="true"></i>
                            <span>Grafieken per station</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <i className="bi bi-broadcast text-brand-700" aria-hidden="true"></i>
                            <span>Eigen meetstations beheren</span>
                        </li>
                    </ul>
                </section>

                <section className={`${card} md:col-span-3`}>
                    <h2 className={`${cardTitle} mb-4`}>
                        <i className="bi bi-diagram-3 text-brand-700" aria-hidden="true"></i>
                        Hoe werkt het?
                    </h2>
                    <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                        {STEPS.map((step, i) => (
                            <li key={step.title} className="flex gap-3">
                                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-brand-100 text-brand-700">
                                    <i className={`bi ${step.icon}`} aria-hidden="true"></i>
                                </span>
                                <div>
                                    <h3 className="text-sm font-semibold text-gray-900">{i + 1}. {step.title}</h3>
                                    <p className="mt-1 text-sm text-gray-600">{step.text}</p>
                                </div>
                            </li>
                        ))}
                    </ol>
                </section>

                <section className={`${card} md:col-span-3`}>
                    <h2 className={`${cardTitle} mb-4`}>
                        <i className="bi bi-compass text-brand-700" aria-hidden="true"></i>
                        Wat kun je hier doen?
                    </h2>
                    <ul className="grid gap-3 sm:grid-cols-2">
                        {FEATURES.map((f) => (
                            <li key={f.to}>
                                <Link
                                    to={f.to}
                                    className="flex h-full gap-3 rounded-lg border border-gray-200 p-3 transition-colors hover:border-brand-500 hover:bg-brand-50"
                                >
                                    <i className={`bi ${f.icon} text-xl text-brand-700`} aria-hidden="true"></i>
                                    <span>
                                        <span className="block font-semibold text-gray-900">{f.label}</span>
                                        <span className="block text-sm text-gray-600">{f.text}</span>
                                    </span>
                                </Link>
                            </li>
                        ))}
                    </ul>
                    <p className="mt-4 text-sm text-gray-600">
                        Heb je een workshop gevolgd en een eigen meetstation gebouwd? Maak een account aan en
                        koppel je station met je workshopcode, dan kun je je eigen station beheren en de metingen
                        terugzien.
                    </p>
                </section>

                <section className={`${card} md:col-span-2`}>
                    <h2 className={cardTitle}>
                        <i className="bi bi-mortarboard text-brand-700" aria-hidden="true"></i>
                        Over het project
                    </h2>
                    <p className="text-gray-600">
                        MB Ontdekt (in de code ook wel ClimateChecker of OntdekStation013) is gebouwd als
                        groepsproject van studenten van Fontys Hogescholen binnen semester 3. De applicatie
                        bestaat uit een webapplicatie (React) en een eigen backend (Spring Boot). De meetgegevens
                        komen van{" "}
                        <a
                            href="https://meetjestad.net"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-secondary underline hover:text-brand-700"
                        >
                            Meet je Stad
                        </a>
                        . De broncode staat op{" "}
                        <a
                            href="https://github.com/OntdekIT"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-secondary underline hover:text-brand-700"
                        >
                            GitHub
                        </a>
                        .
                    </p>
                </section>

                <section className={card}>
                    <h2 className={cardTitle}>
                        <i className="bi bi-people text-brand-700" aria-hidden="true"></i>
                        Team en contact
                    </h2>
                    <p className="text-gray-600">
                        Vragen of opmerkingen? Maak een issue aan op{" "}
                        <a
                            href="https://github.com/OntdekIT/Software-FrontEnd/issues"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="font-medium text-secondary underline hover:text-brand-700"
                        >
                            GitHub
                        </a>
                        . Contactgegevens van het team volgen nog.
                    </p>
                </section>
            </div>
        </div>
    )
}
