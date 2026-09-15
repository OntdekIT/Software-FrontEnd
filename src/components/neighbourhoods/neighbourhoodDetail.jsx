import { useEffect, useState } from "react";
import TemperatureGraph from "./temperatureGraph";
import { backendApi } from "../../utils/backend-api.jsx";
import DustGraph from "./DustGraph";

function formatDateForApi(date, time) {
    return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()} ${time}`;
}

export default function NeighbourhoodDetail({ neighbourhood }) {
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        if (!neighbourhood?.id) {
            setHistory([]);
            return;
        }

        setHistory([]);
        setHistoryLoading(true);

        const end = new Date();
        const start = new Date();
        start.setDate(start.getDate() - 7);

        const startDate = formatDateForApi(start, "00:00");
        const endDate = formatDateForApi(end, "23:59");

        backendApi
            .get(`/neighbourhood/history/average/${neighbourhood.id}`, {
                params: {
                    startDate,
                    endDate,
                },
            })
            .then((response) => {
                setHistory(response.data);
            })
            .catch(() => {
                setHistory([]);
            })
            .finally(() => {
                setHistoryLoading(false);
            });
    }, [neighbourhood?.id]);

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

    const avgPm25 = Number(neighbourhood.avgPm25);
    const hasPm25 = Number.isFinite(avgPm25);

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

    {historyLoading ? (
        <p>Historische temperatuurdata wordt geladen...</p>
    ) : (
        <TemperatureGraph data={history} />
    )}
</article>

<article>
    <h2>Huidige fijnstof</h2>

    {hasPm25 ? (
        <p>{avgPm25.toFixed(1)} µg/m³</p>
    ) : (
        <p>Geen actuele fijnstofdata beschikbaar.</p>
    )}
</article>

<article>
    <h2>Historische fijnstof</h2>

    {historyLoading ? (
        <p>Historische fijnstofdata wordt geladen...</p>
    ) : (
        <DustGraph data={history} />
    )}
</article>
        </section>
    );
}