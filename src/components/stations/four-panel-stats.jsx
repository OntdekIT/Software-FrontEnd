import PropTypes from "prop-types";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Spinner } from "../ui/Preloader.jsx";

/**
 * Vier panelen naast elkaar: het netwerkminimum, het netwerkmaximum, de
 * netwerkmediaan en het geselecteerde station, allemaal over dezelfde periode.
 *
 * De vier grafieken delen bewust één y-as-bereik. Zonder dat schaalt recharts
 * elk paneel apart en lijkt een vlakke reeks net zo grillig als een reeks met
 * grote uitschieters, waardoor de panelen juist niet meer te vergelijken zijn.
 */

const PANEL_COLORS = {
    min: "#2563eb",
    max: "#dc2626",
    median: "#7c3aed",
    station: "#0f766e",
};

/** Getallen netjes tonen; ontbrekende waarden worden een streepje. */
const formatValue = (value, unit = "") => {
    if (value === null || value === undefined || Number.isNaN(Number(value))) {
        return "—";
    }
    return `${Number(value).toFixed(1)}${unit}`;
};

/** Haalt de bruikbare getallen uit een reeks op onder een bepaalde sleutel. */
const numericValues = (data, key) =>
    data
        .map((point) => Number(point[key]))
        .filter((value) => Number.isFinite(value));

/**
 * Berekent één y-as-bereik dat alle vier de reeksen omvat, met wat lucht erboven
 * en eronder zodat lijnen niet tegen de rand plakken.
 */
const sharedDomain = (series) => {
    const all = series.flatMap(({ data, dataKey }) => numericValues(data, dataKey));
    if (!all.length) {
        return ["auto", "auto"];
    }
    const low = Math.min(...all);
    const high = Math.max(...all);
    // Bij een vlakke reeks (low === high) zou de marge 0 worden en valt de lijn
    // samen met de as; daarom een minimum van 1 eenheid.
    const padding = Math.max((high - low) * 0.1, 1);
    return [Math.floor(low - padding), Math.ceil(high + padding)];
};

function StatPanel({ title, subtitle, data, dataKey, color, unit, domain }) {
    const values = numericValues(data, dataKey);
    const latest = values.length ? values[values.length - 1] : null;
    const average = values.length
        ? values.reduce((total, value) => total + value, 0) / values.length
        : null;

    return (
        <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            <div className="mb-2">
                <h3 className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                    <span
                        className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                        style={{ backgroundColor: color }}
                        aria-hidden="true"
                    />
                    <span className="truncate" title={title}>{title}</span>
                </h3>
                <p className="mt-0.5 truncate text-xs text-gray-500" title={subtitle}>{subtitle}</p>
            </div>

            <div className="mb-3 flex items-baseline gap-3">
                <span className="text-2xl font-bold text-gray-900">{formatValue(latest, ` ${unit}`)}</span>
                <span className="text-xs text-gray-500">gem. {formatValue(average, ` ${unit}`)}</span>
            </div>

            {values.length === 0 ? (
                <div className="flex h-[120px] items-center justify-center rounded-md bg-gray-50 text-xs text-gray-400">
                    Geen metingen in deze periode
                </div>
            ) : (
                <ResponsiveContainer width="100%" height={120}>
                    <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
                        <CartesianGrid stroke="#eee" vertical={false} />
                        <XAxis dataKey="timestamp" tick={{ fontSize: 9 }} minTickGap={16} />
                        <YAxis domain={domain} width={30} tick={{ fontSize: 9 }} />
                        <Tooltip
                            formatter={(value) => [formatValue(value, ` ${unit}`), title]}
                            labelFormatter={(label) => `Datum: ${label}`}
                            contentStyle={{ fontSize: "12px" }}
                        />
                        <Line
                            type="monotone"
                            dataKey={dataKey}
                            name={title}
                            stroke={color}
                            strokeWidth={2}
                            dot={false}
                            isAnimationActive={false}
                            connectNulls
                        />
                    </LineChart>
                </ResponsiveContainer>
            )}
        </div>
    );
}

StatPanel.propTypes = {
    title: PropTypes.string.isRequired,
    subtitle: PropTypes.string.isRequired,
    data: PropTypes.array.isRequired,
    dataKey: PropTypes.string.isRequired,
    color: PropTypes.string.isRequired,
    unit: PropTypes.string.isRequired,
    domain: PropTypes.array.isRequired,
};

export default function FourPanelStats({
    networkData,
    stationData,
    stationName,
    unit = "°C",
    loading = false,
    error = null,
}) {
    const panels = [
        {
            key: "min",
            title: "Netwerk minimum",
            subtitle: "Koudste meting in Tilburg",
            data: networkData,
            dataKey: "minTemp",
            color: PANEL_COLORS.min,
        },
        {
            key: "max",
            title: "Netwerk maximum",
            subtitle: "Warmste meting in Tilburg",
            data: networkData,
            dataKey: "maxTemp",
            color: PANEL_COLORS.max,
        },
        {
            key: "median",
            title: "Netwerk mediaan",
            subtitle: "Middelste meting in Tilburg",
            data: networkData,
            dataKey: "medianTemp",
            color: PANEL_COLORS.median,
        },
        {
            key: "station",
            title: stationName,
            subtitle: "Gemiddelde van dit station",
            data: stationData,
            dataKey: "avg",
            color: PANEL_COLORS.station,
        },
    ];

    const domain = sharedDomain(panels);

    // Het aantal stations komt uit de laatste bucket met metingen, zodat het
    // getal klopt met wat er daadwerkelijk getoond wordt.
    const lastBucketWithStations = [...networkData]
        .reverse()
        .find((bucket) => Number(bucket.stationCount) > 0);
    const stationCount = lastBucketWithStations ? Number(lastBucketWithStations.stationCount) : 0;

    return (
        <section className="mb-6" aria-label="Statistiek over het meetnetwerk">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <h2 className="flex items-center gap-2 font-semibold text-gray-800">
                    <i className="bi bi-bar-chart-line text-brand-500" aria-hidden="true"></i>
                    Vergelijking met het netwerk
                </h2>
                <div className="flex items-center gap-3 text-xs text-gray-500">
                    {stationCount > 0 && <span>{stationCount} stations</span>}
                    {loading && (
                        <span className="inline-flex items-center gap-1.5">
                            <Spinner className="h-3 w-3" /> bijwerken…
                        </span>
                    )}
                </div>
            </div>

            {error ? (
                <div className="rounded-xl border border-gray-200 bg-white p-4 text-sm text-gray-500 shadow-sm">
                    <i className="bi bi-exclamation-triangle mr-2 text-warning" aria-hidden="true"></i>
                    De netwerkgegevens konden niet worden opgehaald. Het paneel van dit station
                    hieronder werkt gewoon; probeer een kortere periode te kiezen.
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    {panels.map((panel) => (
                        <StatPanel
                            key={panel.key}
                            title={panel.title}
                            subtitle={panel.subtitle}
                            data={panel.data}
                            dataKey={panel.dataKey}
                            color={panel.color}
                            unit={unit}
                            domain={domain}
                        />
                    ))}
                </div>
            )}
        </section>
    );
}

FourPanelStats.propTypes = {
    /** Netwerkbuckets uit /measurement/history/network */
    networkData: PropTypes.array.isRequired,
    /** Dagbuckets van het geselecteerde station uit /measurement/history/average/{id} */
    stationData: PropTypes.array.isRequired,
    stationName: PropTypes.string.isRequired,
    unit: PropTypes.string,
    loading: PropTypes.bool,
    error: PropTypes.any,
};
