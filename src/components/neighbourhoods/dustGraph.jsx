import PropTypes from "prop-types";
import ZoomableChart from "../charts/ZoomableChart";

export default function DustGraph({ data, zoom }) {
    if (!data || data.length === 0) {
        return <p>Geen historische fijnstofdata beschikbaar.</p>;
    }

    return (
        <div className="dust-graph">
            <ZoomableChart
                data={data}
                xKey="timestamp"
                height={300}
                yUnit=" µg/m³"
                zoom={zoom}
                lines={[
                    { key: "avgStof", name: "Gemiddelde fijnstof", color: "#8884d8" },
                ]}
            />
        </div>
    );
}

DustGraph.propTypes = {
    data: PropTypes.array,
    zoom: PropTypes.object,
};