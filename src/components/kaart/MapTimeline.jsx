import { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { SPEEDS, formatFrameTime, isLive, nextPlaybackIndex } from '../../utils/timeline.js';

// RainViewer-achtige tijdlijn onder de kaart: afspeelknop, schuifbalk van 24
// uur geleden tot nu, snelheidschip en een LIVE-badge bij het laatste frame.
//
// De pagina bezit `index` en `playing`; deze balk meldt alleen wat de gebruiker
// doet. De afspeellus staat hier omdat hij alleen zin heeft zolang de balk er is.
export default function MapTimeline({ timestamps, index, onIndexChange, playing, onPlayingChange, speedIndex, onSpeedChange }) {
    const count = timestamps.length;
    const live = isLive(index, count);
    const speed = SPEEDS[speedIndex];

    const onIndexChangeRef = useRef(onIndexChange);
    useEffect(() => {
        onIndexChangeRef.current = onIndexChange;
    }, [onIndexChange]);

    useEffect(() => {
        if (!playing || count < 2) return undefined;
        const timer = setInterval(() => {
            onIndexChangeRef.current((current) => nextPlaybackIndex(current, count));
        }, speed.ms);
        return () => clearInterval(timer);
    }, [playing, speed.ms, count]);

    // Afspelen vanaf LIVE begint weer bij het oudste frame.
    function togglePlaying() {
        if (!playing && live) onIndexChange(0);
        onPlayingChange(!playing);
    }

    return (
        <section
            aria-label="Tijdlijn laatste 24 uur"
            className="pointer-events-auto rounded-xl border border-gray-300 bg-white/95 px-3 py-2 shadow-lg backdrop-blur"
        >
            <div className="flex items-center gap-3">
                <button
                    type="button"
                    onClick={togglePlaying}
                    aria-label={playing ? 'Pauzeren' : 'Afspelen'}
                    aria-pressed={playing}
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-brand-500 text-gray-900 shadow-sm transition-colors hover:bg-brand-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                >
                    <i className={`bi ${playing ? 'bi-pause-fill' : 'bi-play-fill'} text-xl`} aria-hidden="true"></i>
                </button>

                <div className="min-w-0 flex-1">
                    <input
                        type="range"
                        min={0}
                        max={count - 1}
                        step={1}
                        value={index}
                        onChange={(e) => {
                            // Zelf slepen pauzeert het afspelen, anders vecht de lus met de gebruiker.
                            onPlayingChange(false);
                            onIndexChange(Number(e.target.value));
                        }}
                        aria-label="Tijdstip"
                        aria-valuetext={live ? 'Live' : formatFrameTime(timestamps[index])}
                        className="block h-2 w-full cursor-pointer appearance-none rounded-full bg-gray-300 accent-gray-900"
                    />
                    <div className="mt-1 flex justify-between text-xs text-gray-700" aria-hidden="true">
                        <span>24 uur geleden</span>
                        <span>nu</span>
                    </div>
                </div>

                <div className="flex shrink-0 flex-col items-end gap-1">
                    {live ? (
                        <span className="inline-flex items-center gap-1 rounded-full bg-red-700 px-2 py-0.5 text-xs font-bold tracking-wide text-white">
                            <span className="h-1.5 w-1.5 rounded-full bg-white" aria-hidden="true"></span>
                            LIVE
                        </span>
                    ) : (
                        <button
                            type="button"
                            onClick={() => { onPlayingChange(false); onIndexChange(count - 1); }}
                            title="Terug naar live"
                            className="rounded-full border border-gray-400 bg-white px-2 py-0.5 text-xs font-semibold text-gray-900 hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                        >
                            {formatFrameTime(timestamps[index])}
                        </button>
                    )}
                    <button
                        type="button"
                        onClick={() => onSpeedChange((speedIndex + 1) % SPEEDS.length)}
                        aria-label={`Afspeelsnelheid ${speed.label}, kies volgende snelheid`}
                        className="rounded-full bg-gray-900 px-2 py-0.5 text-xs font-semibold text-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900"
                    >
                        {speed.label}
                    </button>
                </div>
            </div>
        </section>
    );
}

MapTimeline.propTypes = {
    /** ISO-tijdstippen van de frames, chronologisch. */
    timestamps: PropTypes.array.isRequired,
    index: PropTypes.number.isRequired,
    /** Accepteert een waarde of een updater, net als een state-setter. */
    onIndexChange: PropTypes.func.isRequired,
    playing: PropTypes.bool.isRequired,
    onPlayingChange: PropTypes.func.isRequired,
    speedIndex: PropTypes.number.isRequired,
    onSpeedChange: PropTypes.func.isRequired,
};
