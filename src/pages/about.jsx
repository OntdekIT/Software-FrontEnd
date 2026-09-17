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
                <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm md:col-span-2">
                    <h2 className="mb-2 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <i className="bi bi-globe-europe-africa text-secondary" aria-hidden="true"></i>
                        Wat is MB Ontdekt?
                    </h2>
                    <p className="text-gray-600">
                        MB Ontdekt brengt het klimaat in Meierijstad in kaart met behulp van een netwerk
                        van meetstations. Zo krijg je inzicht in temperatuur en fijnstof, per wijk en over tijd.
                    </p>
                </section>

                <section className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
                    <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                        <i className="bi bi-stars text-brand-600" aria-hidden="true"></i>
                        Kenmerken
                    </h2>
                    <ul className="space-y-2 text-gray-600">
                        <li className="flex items-center gap-2">
                            <i className="bi bi-map text-secondary" aria-hidden="true"></i>
                            <span>Interactieve heatmap</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <i className="bi bi-geo-alt text-secondary" aria-hidden="true"></i>
                            <span>Meetgegevens per wijk</span>
                        </li>
                        <li className="flex items-center gap-2">
                            <i className="bi bi-broadcast text-secondary" aria-hidden="true"></i>
                            <span>Eigen meetstations beheren</span>
                        </li>
                    </ul>
                </section>
            </div>
        </div>
    )
}
