import PropTypes from "prop-types";
import NeighbourhoodSearch from "./neighbourhoodSearch";
import NeighbourhoodSort from "./neighbourhoodSort";
import NeighbourhoodList from "./neighbourhoodList";

export default function NeighbourhoodSidebar({
                                                 neighbourhoods,
                                                 selectedId,
                                                 searchQuery,
                                                 setSearchQuery,
                                                 sortOption,
                                                 setSortOption
                                             }) {
    return (
        <aside className="neighbourhood-sidebar">
            <h2>Wijken</h2>

            <NeighbourhoodSearch
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
            />

            <NeighbourhoodSort
                sortOption={sortOption}
                setSortOption={setSortOption}
            />

            <NeighbourhoodList
                neighbourhoods={neighbourhoods}
                selectedId={selectedId}
            />
        </aside>
    );
}

NeighbourhoodSidebar.propTypes = {
    neighbourhoods: PropTypes.array,
    selectedId: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    searchQuery: PropTypes.string,
    setSearchQuery: PropTypes.func.isRequired,
    sortOption: PropTypes.string,
    setSortOption: PropTypes.func.isRequired,
};