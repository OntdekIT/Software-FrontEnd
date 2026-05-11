export default function NeighbourhoodSort() {
    return (
        <div className="neighbourhood-sort">
            <label htmlFor="neighbourhood-sort">Sorteren</label>
            <select id="neighbourhood-sort" disabled>
                <option>Sorteer op...</option>
                <option>Naam A-Z</option>
                <option>Warmste eerst</option>
                <option>Koudste eerst</option>
            </select>
        </div>
    );
}