export default function TemperatureGraph({ data }) {
    if (!data || data.length === 0) {
        return <p>Geen historische temperatuurdata beschikbaar.</p>;
    }

    return (
        <div className="temperature-graph">
            <p>Temperatuurgrafiek komt hier.</p>
        </div>
    );
}