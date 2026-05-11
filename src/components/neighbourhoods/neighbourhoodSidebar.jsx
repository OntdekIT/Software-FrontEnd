import NeighbourhoodSearch from "./neighbourhoodSearch";
import NeighbourhoodSort from "./neighbourhoodSort";
import NeighbourhoodList from "./neighbourhoodList";

export default function NeighbourhoodSidebar({ neighbourhoods, selectedId }) {
    return (
        <aside className="neighbourhood-sidebar">
            <h2>Wijken</h2>

            <NeighbourhoodSearch />
            <NeighbourhoodSort />

            <NeighbourhoodList
                neighbourhoods={neighbourhoods}
                selectedId={selectedId}
            />
        </aside>
    );
}