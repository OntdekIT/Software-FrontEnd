import { useCallback, useEffect, useMemo, useState } from "react";
import { backendApi } from "../utils/backend-api.jsx";
import { useToast } from "../components/ui/toast.jsx";
import Preloader from "../components/ui/Preloader.jsx";
import NewMap from "../components/newmap.jsx";
import TimeSlider from "../components/map/time-slider.jsx";
import { PLAYBACK_SPEEDS, computeColorRange } from "../utils/timelapse-utils.jsx";
import './new-heatmap.css';

/** Keuzes voor de lengte van de time-lapse, met het aantal stappen erbij. */
const RANGE_OPTIONS = [
    { label: "6 uur", hours: 6, steps: 12 },
    { label: "24 uur", hours: 24, steps: 24 },
    { label: "7 dagen", hours: 168, steps: 28 },
];

export default function Heatmap() {
    const [neighbourhoods, setNeighbourhoods] = useState([]);
    const [frames, setFrames] = useState([]);
    const [stations, setStations] = useState([]);
    const [loading, setLoading] = useState(true);

    const [rangeIndex, setRangeIndex] = useState(1); // standaard 24 uur
    const [stepIndex, setStepIndex] = useState(0);
    const [playing, setPlaying] = useState(false);
    const [speedMs, setSpeedMs] = useState(PLAYBACK_SPEEDS[1].ms);

    const toast = useToast();
    const range = RANGE_OPTIONS[rangeIndex];

    // Time-lapse ophalen. Eén call voor alle tijdstappen: het endpoint per
    // tijdstip aanroepen zou per stap het hele meetvenster opnieuw ophalen.
    useEffect(() => {
        let active = true;
        setLoading(true);
        setPlaying(false);

        const to = new Date();
        const from = new Date(to.getTime() - range.hours * 3600 * 1000);

        Promise.allSettled([
            backendApi.get("/neighbourhood/history/timelapse", {
                params: {
                    from: from.toISOString(),
                    to: to.toISOString(),
                    steps: range.steps,
                },
                // De backend haalt het hele meetvenster in één keer op; dat duurt
                // langer dan een gewone call.
                timeout: 60000,
            }),
            backendApi.get(`/Meetstation/stationsMetMeasurements?timestamp=${to.toISOString()}`),
        ]).then(([timelapseRes, stationsRes]) => {
            if (!active) return;

            if (timelapseRes.status === 'fulfilled') {
                const data = timelapseRes.value.data ?? {};
                const loadedFrames = Array.isArray(data.frames) ? data.frames : [];
                setNeighbourhoods(Array.isArray(data.neighbourhoods) ? data.neighbourhoods : []);
                setFrames(loadedFrames);
                // Begin bij het meest recente beeld: dat is wat je verwacht te
                // zien als de kaart opent.
                setStepIndex(Math.max(loadedFrames.length - 1, 0));
            } else {
                console.error("error: ", timelapseRes.reason);
                setNeighbourhoods([]);
                setFrames([]);
                toast.error('Kon de tijdreeks niet ophalen.');
            }

            if (stationsRes.status === 'fulfilled') setStations(stationsRes.value.data);
            setLoading(false);
        });

        return () => { active = false; };
    }, [range, toast]);

    // Eén kleurschaal voor de hele reeks, zodat de kleuren tussen tijdstappen
    // dezelfde betekenis houden.
    const colorRange = useMemo(() => computeColorRange(frames, 'avgTemp'), [frames]);

    // De kaart verwacht wijken met coordinaten én waarden in één object; de
    // backend stuurt die bewust gescheiden om de payload klein te houden.
    const regionData = useMemo(() => {
        const frame = frames[stepIndex];
        if (!frame) return [];

        const valueById = new Map(frame.values.map((value) => [value.id, value]));
        return neighbourhoods.map((neighbourhood) => {
            const value = valueById.get(neighbourhood.id);
            return {
                id: neighbourhood.id,
                name: neighbourhood.name,
                coordinates: neighbourhood.coordinates,
                // NaN in plaats van null: createRegionGeoJSON kleurt een wijk
                // zonder meting dan grijs in plaats van als koudste waarde.
                avgTemp: value && value.avgTemp != null ? value.avgTemp : NaN,
                avgPm25: value && value.avgPm25 != null ? value.avgPm25 : null,
            };
        });
    }, [frames, stepIndex, neighbourhoods]);

    const timestamps = useMemo(() => frames.map((frame) => frame.timestamp), [frames]);
    const currentFrame = frames[stepIndex];

    const handleIndexChange = useCallback((next) => {
        setStepIndex((current) => {
            const value = typeof next === 'function' ? next(current) : next;
            return Math.min(Math.max(value, 0), Math.max(frames.length - 1, 0));
        });
    }, [frames.length]);

    return (
        <>
            <title>Heatmap</title>
            <div className="heatmap-container relative">
                {loading && (
                    <div className="absolute inset-0 z-20 flex items-center justify-center bg-white/70">
                        <Preloader message="Tijdreeks laden…" />
                    </div>
                )}

                {/* Periodekeuze: bepaalt hoe ver de time-lapse terugkijkt. */}
                <div className="pointer-events-auto absolute right-3 top-3 z-10 flex overflow-hidden rounded-lg border border-gray-200 bg-white/95 shadow-md backdrop-blur">
                    {RANGE_OPTIONS.map((option, i) => (
                        <button
                            key={option.label}
                            type="button"
                            onClick={() => setRangeIndex(i)}
                            aria-pressed={rangeIndex === i}
                            className={`px-3 py-1.5 text-sm font-medium transition-colors ${
                                rangeIndex === i
                                    ? 'bg-brand-500 text-white'
                                    : 'bg-transparent text-gray-700 hover:bg-brand-50'
                            }`}
                        >
                            {option.label}
                        </button>
                    ))}
                </div>

                <NewMap
                    centerX={5.0913}
                    centerY={51.5555}
                    zoom={12}
                    regionData={regionData}
                    stations={stations}
                    colorRange={colorRange}
                    overlay={
                        <TimeSlider
                            timestamps={timestamps}
                            index={stepIndex}
                            onIndexChange={handleIndexChange}
                            playing={playing}
                            onPlayingChange={setPlaying}
                            speedMs={speedMs}
                            onSpeedChange={setSpeedMs}
                            loading={loading}
                            stationCount={currentFrame ? currentFrame.stationCount : null}
                        />
                    }
                />
            </div>
        </>
    );
}
