import PropTypes from "prop-types";
import ZoomableChart from "../charts/ZoomableChart";

export default function TemperatureGraph({ data, zoom }) {
    if (!data || data.length === 0) {
        return <p>Geen historische temperatuurdata beschikbaar.</p>;
    }

    return (
        <div className="temperature-graph">
            <ZoomableChart
                data={data}
                xKey="timestamp"
                height={330}
                yUnit="°C"
                zoom={zoom}
                lines={[
                    { key: "avgTemp", name: "Gemiddelde temperatuur", color: "#16a34a" },
                    { key: "minTemp", name: "Minimum temperatuur", color: "#2563eb" },
                    { key: "maxTemp", name: "Maximum temperatuur", color: "#dc2626" },
                ]}
            />
        </div>
    );
}

TemperatureGraph.propTypes = {
    data: PropTypes.array,
    zoom: PropTypes.object,
};