import PropTypes from 'prop-types';
import { legendSteps } from '../../utils/color-scale.js';
import { METRICS } from '../../utils/map-metrics.js';

// Legenda van de heatmap: dezelfde stappen, eenheid en opmaak als de legenda op
// de kaart, plus een vak voor gebied waar geen station in de buurt is.
export default function HeatmapLegend({ metric, range }) {
    const active = METRICS[metric] ?? METRICS.temperature;
    const steps = range ? legendSteps(range, active.palette) : [];
    const mid = range ? (range.min + range.max) / 2 : null;

    return (
        <div className="pointer-events-auto rounded-lg border border-gray-300 bg-white p-3 shadow-md" role="group" aria-label={`Legenda ${active.label}`}>
            <div className="mb-1.5 text-xs font-semibold text-gray-900">{active.label} ({active.unit})</div>
            <div className="flex h-3 w-44 overflow-hidden rounded border border-gray-400">
                {steps.map((step) => (
                    <div
                        key={step.color}
                        className="h-full flex-1"
                        style={{ backgroundColor: step.color }}
                        title={`${step.from.toFixed(1)} tot ${step.to.toFixed(1)} ${active.unit}`}
                    />
                ))}
            </div>
            <div className="mt-1 flex w-44 justify-between text-xs text-gray-700">
                <span>{range ? range.min.toFixed(1) : '-'}</span>
                <span>{mid !== null ? mid.toFixed(1) : ''}</span>
                <span>{range ? range.max.toFixed(1) : '-'}</span>
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-gray-700">
                <span
                    className="inline-block h-3 w-5 rounded border border-dashed border-gray-500 bg-white"
                    aria-hidden="true"
                />
                Geen station in de buurt
            </div>
        </div>
    );
}

HeatmapLegend.propTypes = {
    metric: PropTypes.string.isRequired,
    range: PropTypes.shape({ min: PropTypes.number, max: PropTypes.number }),
};
