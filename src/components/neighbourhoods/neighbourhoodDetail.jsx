import { useEffect, useState } from "react";
import PropTypes from "prop-types";
import TemperatureGraph from "./temperatureGraph";
import DustGraph from "./dustGraph";
import PeriodPicker from "../charts/PeriodPicker";
import { useChartZoom } from "../charts/UseChartZoom";
import { backendApi } from "../../utils/backend-api.jsx";

function formatDateForApi(date, time) {
    return `${String(date.getDate()).padStart(2, "0")}-${String(date.getMonth() + 1).padStart(2, "0")}-${date.getFullYear()} ${time}`;
}

function defaultPeriod() {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    return { startDate, endDate };
}

export default function NeighbourhoodDetail({ neighbourhood }) {
    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);
    const [period, setPeriod] = useState(defaultPeriod);

    // De zoom staat hier, niet in de grafiek zelf. Dit component blijft bestaan
    // als je van wijk wisselt, dus de zoom blijft ook bewaard.
    const tempZoom = useChartZoom();
    const dustZoom = useChartZoom();

    useEffect(() => {
        if (!neighbourhood?.id) {
            setHistory([]);
            return;
        }

        setHistoryLoading(true);

        backendApi
            .get(`/neighbourhood/history/average/${neighbourhood.id}`, {
                params: {
                    startDate: formatDateForApi(period.startDate, "00:00"),
                    endDate: formatDateForApi(period.endDate, "23:59"),
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
    }, [neighbourhood?.id, period]);

    // Nieuwe periode gekozen: oude zoom past niet meer, dus wissen.
    const handlePeriodChange = (newPeriod) => {
        setPeriod(newPeriod);
        tempZoom.clearRange();
        dustZoom.clearRange();
    };

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
                <h2>Periode</h2>
                <PeriodPicker onChange={handlePeriodChange} />
            </article>

            <article>
                <h2>Historische temperatuur</h2>
                {historyLoading ? (
                    <p>Historische temperatuurdata wordt geladen...</p>
                ) : (
                    <TemperatureGraph data={history} zoom={tempZoom} />
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
                    <DustGraph data={history} zoom={dustZoom} />
                )}
            </article>
        </section>
    );
}

NeighbourhoodDetail.propTypes = {
    neighbourhood: PropTypes.shape({
        id: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        name: PropTypes.string,
        avgTemp: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
        avgPm25: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    }),
};