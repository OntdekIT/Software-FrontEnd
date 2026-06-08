import { Link } from "react-router-dom";

export default function NeighbourhoodListItem({ neighbourhood, isSelected }) {
    const avgTemp = Number(neighbourhood.avgTemp);
    const hasTemperature = Number.isFinite(avgTemp);

    const avgPm25 = Number(neighbourhood.avgPm25);
    const hasPm25 = Number.isFinite(avgPm25);

    return (
        <Link
            to={`/wijken/${neighbourhood.id}`}
            className={`neighbourhood-list-item ${isSelected ? "selected" : ""}`}
        >
            <span>{neighbourhood.name}</span>

            <div className="neighbourhood-list-values">
                <span className="neighbourhood-list-temp">
                    {hasTemperature ? `${avgTemp.toFixed(1)}°C` : "-"}
                </span>

                <span className="neighbourhood-list-pm25">
                    {hasPm25 ? `${avgPm25.toFixed(1)} µg/m³` : "-"}
                </span>
            </div>
        </Link>
    );
}