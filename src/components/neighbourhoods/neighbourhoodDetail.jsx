export default function NeighbourhoodDetail({ neighbourhood }) {
    if (!neighbourhood) {
        return (
            <section className="neighbourhood-detail">
                <h1>Selecteer een wijk</h1>
                <p>Kies een wijk aan de linkerkant om de details te bekijken.</p>
            </section>
        );
    }

    const avgTemp = Number(neighbourhood.avgTemp);
    const hasTemperature = Number.isFinite(avgTemp);

    return (
        <section className="neighbourhood-detail">
            <h1>{neighbourhood.name}</h1>

            <article>
                <h2>Huidige temperatuur</h2>

                {hasTemperature ? (
                    <p>{avgTemp.toFixed(1)}°C</p>
                ) : (
                    <p>Geen actuele temperatuur beschikbaar.</p>
                )}
            </article>

            <article>
                <h2>Historische temperatuur</h2>
                <p>Grafiek komt hier later.</p>
            </article>
        </section>
    );
}