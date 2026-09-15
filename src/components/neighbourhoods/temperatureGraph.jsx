import {
    ResponsiveContainer,
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
} from "recharts";

export default function TemperatureGraph({ data }) {
    if (!data || data.length === 0) {
        return <p>Geen historische temperatuurdata beschikbaar.</p>;
    }

    return (
        <div className="temperature-graph">
            <ResponsiveContainer width="100%" height={330}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />

                    <XAxis dataKey="timestamp" />

                    <YAxis unit="°C" />

                    <Tooltip />

                    <Legend
                        verticalAlign="top"
                        align="right"
                        height={36}
                    />

                    <Line
                        type="monotone"
                        dataKey="avgTemp"
                        name="Gemiddelde temperatuur"
                    />

                    <Line
                        type="monotone"
                        dataKey="minTemp"
                        name="Minimum temperatuur"
                    />

                    <Line
                        type="monotone"
                        dataKey="maxTemp"
                        name="Maximum temperatuur"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}