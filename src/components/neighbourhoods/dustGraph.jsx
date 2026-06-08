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

export default function DustGraph({ data }) {
    if (!data || data.length === 0) {
        return <p>Geen historische fijnstofdata beschikbaar.</p>;
    }

    return (
        <div className="dust-graph">
            <ResponsiveContainer width="100%" height={300}>
                <LineChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="timestamp" />
                    <YAxis />
                    <Tooltip />
                    <Legend
                        verticalAlign="top"
                        align="right"
                        height={36}
                    />

                    <Line
                        type="monotone"
                        dataKey="avgStof"
                        name="Gemiddelde fijnstof"
                    />
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}