export default function NeighbourhoodSearch() {
    return (
        <div className="neighbourhood-search">
            <label htmlFor="neighbourhood-search">Zoeken</label>
            <input
                id="neighbourhood-search"
                type="text"
                placeholder="Zoek een wijk..."
                disabled
            />
        </div>
    );
}