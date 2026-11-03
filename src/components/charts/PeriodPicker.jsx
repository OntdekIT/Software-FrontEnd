import { useState } from "react";
import PropTypes from "prop-types";

const PRESETS = [
    { id: "day", label: "Dag", days: 1 },
    { id: "week", label: "Week", days: 7 },
    { id: "month", label: "Maand", days: 30 },
];

export default function PeriodPicker({ onChange, initial = "week" }) {
    const [mode, setMode] = useState(initial);
    const [from, setFrom] = useState("");
    const [to, setTo] = useState("");
    const today = new Date().toISOString().slice(0, 10);

    const choosePreset = (preset) => {
        setMode(preset.id);
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(startDate.getDate() - preset.days);
        onChange({ startDate, endDate });
    };

    const applyCustom = () => {
        onChange({
            startDate: new Date(`${from}T00:00`),
            endDate: new Date(`${to}T23:59`),
        });
    };

    const tabClass = (active) =>
        `px-4 py-2 text-sm font-medium transition ${
            active ? "bg-brand-500 text-white" : "bg-white text-gray-700 hover:bg-gray-50"
        }`;

    const inputClass =
        "mt-1 rounded-lg border border-gray-300 px-3 py-2 text-sm focus:border-brand-500 focus:outline-none focus:ring-1 focus:ring-brand-500";

    return (
        <div className="space-y-3">
            <div className="inline-flex divide-x divide-gray-300 overflow-hidden rounded-lg border border-gray-300">
                {PRESETS.map((p) => (
                    <button key={p.id} type="button" className={tabClass(mode === p.id)} onClick={() => choosePreset(p)}>
                        {p.label}
                    </button>
                ))}
                <button type="button" className={tabClass(mode === "custom")} onClick={() => setMode("custom")}>
                    Eigen
                </button>
            </div>

            {mode === "custom" && (
                <div className="flex flex-wrap items-end gap-3">
                    <label className="flex flex-col text-sm text-gray-600">
                        Van
                        <input type="date" className={inputClass} value={from} max={to || today}
                               onChange={(e) => setFrom(e.target.value)} />
                    </label>
                    <label className="flex flex-col text-sm text-gray-600">
                        Tot
                        <input type="date" className={inputClass} value={to} min={from} max={today}
                               onChange={(e) => setTo(e.target.value)} />
                    </label>
                    <button
                        type="button"
                        onClick={applyCustom}
                        disabled={!from || !to || from > to}
                        className="rounded-lg bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                        Toepassen
                    </button>
                </div>
            )}
        </div>
    );
}

PeriodPicker.propTypes = {
    onChange: PropTypes.func.isRequired,
    initial: PropTypes.string,
};