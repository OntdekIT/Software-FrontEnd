import { Link } from "react-router-dom";

export default function NeighbourhoodListItem({ neighbourhood, isSelected }) {
    const avgTemp = Number(neighbourhood.avgTemp);
    const hasTemperature = Number.isFinite(avgTemp);

    return (
        <Link
            to={`/wijken/${neighbourhood.id}`}
            className={`neighbourhood-list-item ${isSelected ? "selected" : ""}`}
        >
            <span>{neighbourhood.name}</span>
            <span>{hasTemperature ? `${avgTemp.toFixed(1)}°C` : "-"}</span>
        </Link>
    );
}