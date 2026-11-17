import PropTypes from "prop-types";
import {useMemo, useState} from "react";
import {Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";
import {cityAverageSeries} from "../../../utils/network-health.js";
import {AMBER, AMBER_STRONG, INK} from "../../../utils/theme-colors.js";
import Block from "./block-state.jsx";

const SERIES = {
    avgTemp: {label: "Temperatuur", unit: "°C"},
    avgPm25: {label: "Fijnstof PM2.5", unit: "µg/m³"},
};

const formatHour = (time) => new Date(time).toLocaleTimeString("nl-NL", {hour: "2-digit", minute: "2-digit"});

export default function CityChart({timelapse}) {
    const [key, setKey] = useState("avgTemp");
    const frames = timelapse.data?.frames;
    const points = useMemo(
        () => cityAverageSeries(frames, key).filter((p) => p.time !== null),
        [frames, key],
    );
    const hasData = points.some((p) => p.value !== null);
    const meta = SERIES[key];

    return (
        <Block
            title="Stadsgemiddelde, laatste 24 uur" icon="bi-graph-up" state={timelapse.state} onRetry={timelapse.reload}
            empty={timelapse.state === "ok" && !hasData && key === "avgTemp"} emptyText="Er zijn geen metingen van de afgelopen 24 uur."
            skeletonHeight="h-64"
        >
            <div role="group" aria-label="Kies een grootheid" className="mb-3 flex gap-2">
                {Object.entries(SERIES).map(([k, s]) => (
                    <button
                        key={k} type="button" onClick={() => setKey(k)} aria-pressed={key === k}
                        className={`rounded-full border px-3 py-1 text-sm font-medium ${key === k ? "border-brand-600 bg-brand-100 text-ink" : "border-line bg-white text-muted"}`}
                    >
                        {s.label}
                    </button>
                ))}
            </div>
            {hasData ? (
                <div className="h-64 w-full" role="img" aria-label={`Lijngrafiek van het stadsgemiddelde ${meta.label.toLowerCase()} over 24 uur`}>
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={points} margin={{top: 8, right: 12, bottom: 0, left: -12}}>
                            <CartesianGrid stroke="#e5e7eb" strokeDasharray="3 3" />
                            <XAxis dataKey="time" tickFormatter={formatHour} tick={{fontSize: 12, fill: "#4b5563"}} minTickGap={32} />
                            <YAxis tick={{fontSize: 12, fill: "#4b5563"}} domain={["auto", "auto"]} />
                            <Tooltip
                                labelFormatter={formatHour}
                                formatter={(v) => [`${Number(v).toFixed(1)} ${meta.unit}`, meta.label]}
                            />
                            <Area type="monotone" dataKey="value" stroke={INK} strokeWidth={2} fill={AMBER} fillOpacity={0.35} activeDot={{r: 4, fill: AMBER_STRONG, stroke: INK}} connectNulls={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            ) : (
                <p role="status" className="rounded-lg bg-sunken px-3 py-4 text-sm text-muted">
                    Geen {meta.label.toLowerCase()}metingen in de afgelopen 24 uur.
                </p>
            )}
            <p className="mt-2 text-xs text-muted">Gemiddelde van alle wijken per uur. Onderbrekingen in de lijn zijn uren zonder meting.</p>
        </Block>
    );
}

CityChart.propTypes = {
    timelapse: PropTypes.shape({state: PropTypes.string.isRequired, data: PropTypes.any, reload: PropTypes.func}).isRequired,
};
