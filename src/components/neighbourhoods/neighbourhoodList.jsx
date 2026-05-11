import NeighbourhoodListItem from "./neighbourhoodListItem";

export default function NeighbourhoodList({ neighbourhoods, selectedId }) {
    if (!neighbourhoods || neighbourhoods.length === 0) {
        return <p>Geen wijken gevonden.</p>;
    }

    return (
        <nav className="neighbourhood-list">
            {neighbourhoods.map((neighbourhood) => (
                <NeighbourhoodListItem
                    key={neighbourhood.id}
                    neighbourhood={neighbourhood}
                    isSelected={Number(selectedId) === Number(neighbourhood.id)}
                />
            ))}
        </nav>
    );
}