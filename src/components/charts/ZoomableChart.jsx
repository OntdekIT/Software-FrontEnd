import PropTypes from "prop-types";
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis,
  Tooltip, Brush, CartesianGrid,
} from "recharts";
import { useChartZoom } from "./UseChartZoom";

const DEFAULT_COLORS = ["#16a34a", "#2563eb", "#dc2626", "#8884d8", "#f59e0b"];

const BrushHandle = ({ x, y, width, height }) => (
  <rect x={x} y={y + 3} width={width} height={height - 6} rx={3} fill="#94a3b8" />
);
export default function ZoomableChart({
  data, lines, xKey = "timestamp", zoom: zoomFromParent, yAxes, height = 350, yUnit = "",
}) {
  const localZoom = useChartZoom();
  const zoom = zoomFromParent ?? localZoom;
  const { range, setRange, hidden, toggleLine, reset, version } = zoom;

  if (!data || data.length === 0) {
    return <div className="py-4 text-center text-sm text-gray-500">Geen data voor deze periode</div>;
  }

  const colored = lines.map((l, i) => ({ ...l, color: l.color ?? DEFAULT_COLORS[i % DEFAULT_COLORS.length] }));
  

  const last = data.length - 1;
  let startIndex = 0;
  let endIndex = last;
  if (range) {
    const s = data.findIndex((d) => d[xKey] === range.from);
    const e = data.findIndex((d) => d[xKey] === range.to);
    if (s !== -1) startIndex = s;
    if (e !== -1 && e >= startIndex) endIndex = e;
  }

  const handleBrush = ({ startIndex: s, endIndex: e }) => {
    if (s == null || e == null || !data[s] || !data[e]) return;
    if (s === 0 && e === last) {
      setRange(null);
      return;
    }
    setRange({ from: data[s][xKey], to: data[e][xKey] });
  };

  const isDirty = range !== null || hidden.size > 0;
  const axisTick = { fontSize: 12, fill: "#6b7280" };

  return (
    <div className="space-y-3">
      {/* Lijnen kiezen + reset */}
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
          {colored.map((l) => {
            const active = !hidden.has(l.key);
            return (
              <button
                key={l.key}
                type="button"
                onClick={() => toggleLine(l.key)}
                aria-pressed={active}
                className={`inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition ${
                  active
                    ? "border-gray-300 bg-white text-gray-800 shadow-sm hover:bg-gray-50"
                    : "border-gray-200 bg-gray-50 text-gray-400"
                }`}
              >
                <span
                  className="h-2.5 w-2.5 rounded-full"
                  style={{ backgroundColor: active ? l.color : "#d1d5db" }}
                />
                {l.name}
              </button>
            );
          })}
        </div>
        <button
          type="button"
          onClick={reset}
          disabled={!isDirty}
          className="inline-flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 disabled:cursor-default disabled:opacity-40 disabled:hover:bg-transparent"
        >
          <i className="bi bi-arrow-counterclockwise" aria-hidden="true"></i>
          Reset
        </button>
      </div>

      <ResponsiveContainer width="100%" height={height}>
        <LineChart key={version} data={data} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="#e5e7eb" vertical={false} />
          <XAxis dataKey={xKey} tick={axisTick} tickLine={false} axisLine={{ stroke: "#e5e7eb" }} />
          {yAxes ? (
            yAxes.map((a) => (
              <YAxis
                key={a.id}
                yAxisId={a.id}
                orientation={a.orientation}
                stroke={a.stroke}
                tick={axisTick}
                tickLine={false}
                axisLine={false}
              />
            ))
          ) : (
            <YAxis
              tickFormatter={(v) => `${v}${yUnit}`}
              tick={axisTick}
              tickLine={false}
              axisLine={false}
              width={48}
            />
          )}
          <Tooltip
            contentStyle={{ borderRadius: 8, border: "1px solid #e5e7eb", fontSize: 13 }}
            formatter={(v) => (typeof v === "number" ? `${v.toFixed(1)}${yUnit}` : v)}
          />
          {colored.map((l) => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.name}
              stroke={l.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4 }}
              hide={hidden.has(l.key)}
              {...(l.yAxisId ? { yAxisId: l.yAxisId } : {})}
            />
          ))}
                    <Brush
            dataKey={xKey}
            height={18}
            stroke="#cbd5e1"
            fill="transparent"
            travellerWidth={6}
            traveller={BrushHandle}
            tickFormatter={() => ""}
            startIndex={startIndex}
            endIndex={endIndex}
            onChange={handleBrush}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

ZoomableChart.propTypes = {
  data: PropTypes.array,
  lines: PropTypes.array.isRequired,
  xKey: PropTypes.string,
  zoom: PropTypes.object,
  yAxes: PropTypes.array,
  height: PropTypes.number,
  yUnit: PropTypes.string,
};