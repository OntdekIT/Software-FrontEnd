export default function NeighbourhoodSort({ sortOption, setSortOption }) {
    return (
        <div className="neighbourhood-sort">
            <label htmlFor="neighbourhood-sort">Sorteren</label>

            <select
                id="neighbourhood-sort"
                value={sortOption}
                onChange={(e) => setSortOption(e.target.value)}
            >
                <option value="az">Naam A-Z</option>
                <option value="za">Naam Z-A</option>
                <option value="temp-desc">Temperatuur hoog-laag</option>
                <option value="temp-asc">Temperatuur laag-hoog</option>
            </select>
        </div>
    );
}