import { useEffect, useRef } from "react";
import PropTypes from "prop-types";
import { PLAYBACK_SPEEDS, formatStepLabel } from "../../utils/timelapse-utils.jsx";

/**
 * Bedieningsbalk om de heatmap als tijdreeks af te spelen.
 *
 * De component houdt zelf geen tijdstap bij: de pagina bezit `index` en
 * `playing`, en deze balk meldt alleen wat de gebruiker doet. Daardoor kan de
 * pagina de kaart aansturen zonder dat twee plekken dezelfde toestand bijhouden.
 *
 * De afspeellus staat hier omdat hij alleen zin heeft zolang de balk zichtbaar
 * is; bij unmount wordt het interval opgeruimd.
 */
export default function TimeSlider({
    timestamps,
    index,
    onIndexChange,
    playing,
    onPlayingChange,
    speedMs,
    onSpeedChange,
    loading = false,
    stationCount = null,
}) {
    const lastIndex = Math.max(timestamps.length - 1, 0);

    // onIndexChange in een ref zodat het interval niet opnieuw opgezet hoeft te
    // worden telkens als de pagina een nieuwe callback meegeeft.
    const onIndexChangeRef = useRef(onIndexChange);
    useEffect(() => {
        onIndexChangeRef.current = onIndexChange;
    }, [onIndexChange]);

    useEffect(() => {
        if (!playing || timestamps.length < 2) return;

        const timer = setInterval(() => {
            // Aan het eind weer vooraan beginnen, zodat de reeks blijft lopen.
            onIndexChangeRef.current((current) => (current >= lastIndex ? 0 : current + 1));
        }, speedMs);

        return () => clearInterval(timer);
    }, [playing, speedMs, lastIndex, timestamps.length]);

    const disabled = timestamps.length < 2;
    const step = (delta) => {
        onPlayingChange(false);
        onIndexChange((current) => Math.min(Math.max(current + delta, 0), lastIndex));
    };

    return (
        <div className="pointer-events-auto rounded-xl border border-gray-200 bg-white/95 p-3 shadow-lg backdrop-blur">
            {/* Actief tijdstip: het belangrijkste wat je tijdens afspelen wilt zien. */}
            <div className="mb-2 flex flex-wrap items-baseline justify-between gap-x-3 gap-y-1">
                <div className="flex items-baseline gap-2">
                    <span className="text-sm font-semibold text-gray-900">
                        {formatStepLabel(timestamps[index])}
                    </span>
                    {!disabled && (
                        <span className="text-xs text-gray-500">
                            stap {index + 1} van {timestamps.length}
                        </span>
                    )}
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                    {stationCount != null && <span>{stationCount} stations</span>}
                    {loading && <span>laden…</span>}
                </div>
            </div>

            {/* Op smalle schermen zakt de slider naar een eigen regel (order-last
                + w-full); naast de knoppen en de snelheidskeuze blijft er anders
                te weinig sleepruimte over. */}
            <div className="flex flex-wrap items-center gap-2">
                <button
                    type="button"
                    onClick={() => step(-1)}
                    disabled={disabled || index === 0}
                    aria-label="Vorige tijdstap"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <i className="bi bi-skip-start-fill" aria-hidden="true"></i>
                </button>

                <button
                    type="button"
                    onClick={() => onPlayingChange(!playing)}
                    disabled={disabled}
                    aria-label={playing ? "Pauzeren" : "Afspelen"}
                    aria-pressed={playing}
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-500 text-white shadow-sm transition-colors hover:bg-brand-600 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <i className={`bi ${playing ? "bi-pause-fill" : "bi-play-fill"} text-lg`} aria-hidden="true"></i>
                </button>

                <button
                    type="button"
                    onClick={() => step(1)}
                    disabled={disabled || index === lastIndex}
                    aria-label="Volgende tijdstap"
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-gray-200 text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
                >
                    <i className="bi bi-skip-end-fill" aria-hidden="true"></i>
                </button>

                <input
                    type="range"
                    min={0}
                    max={lastIndex}
                    step={1}
                    value={index}
                    disabled={disabled}
                    onChange={(e) => {
                        // Zelf slepen pauzeert het afspelen, anders vecht de lus
                        // met de gebruiker om dezelfde slider.
                        onPlayingChange(false);
                        onIndexChange(Number(e.target.value));
                    }}
                    aria-label="Tijdstap"
                    aria-valuetext={formatStepLabel(timestamps[index])}
                    className="order-last h-1.5 w-full min-w-0 cursor-pointer appearance-none rounded-full bg-gray-200 accent-brand-500 disabled:cursor-not-allowed disabled:opacity-40 sm:order-none sm:w-auto sm:flex-1"
                />

                <div className="flex shrink-0 overflow-hidden rounded-lg border border-gray-200">
                    {PLAYBACK_SPEEDS.map((option) => (
                        <button
                            key={option.label}
                            type="button"
                            onClick={() => onSpeedChange(option.ms)}
                            aria-pressed={speedMs === option.ms}
                            title={`Afspeelsnelheid ${option.label}`}
                            className={`px-2 py-1 text-xs font-medium transition-colors ${
                                speedMs === option.ms
                                    ? "bg-brand-500 text-white"
                                    : "bg-transparent text-gray-600 hover:bg-brand-50"
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
}

TimeSlider.propTypes = {
    /** ISO-tijdstippen van de tijdstappen, chronologisch. */
    timestamps: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired,
    /** Accepteert zowel een waarde als een updater, net als een state-setter. */
    onIndexChange: PropTypes.func.isRequired,
    playing: PropTypes.bool.isRequired,
    onPlayingChange: PropTypes.func.isRequired,
    speedMs: PropTypes.number.isRequired,
    onSpeedChange: PropTypes.func.isRequired,
    loading: PropTypes.bool,
    stationCount: PropTypes.number,
};
