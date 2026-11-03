import PropTypes from "prop-types";

export default function NeighbourhoodSearch({ searchQuery, setSearchQuery }) {
    return (
        <div className="neighbourhood-search">
            <label htmlFor="neighbourhood-search">
                Zoeken
            </label>

            <input
                id="neighbourhood-search"
                type="text"
                placeholder="Zoek een wijk..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
            />
        </div>
    );
}

NeighbourhoodSearch.propTypes = {
    searchQuery: PropTypes.string,
    setSearchQuery: PropTypes.func.isRequired,
};