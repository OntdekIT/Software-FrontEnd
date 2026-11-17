import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Skeleton } from '../ui/Skeleton.jsx';

// Lists the stations that currently need attention: either marked inactive or
// reporting a sensor/location error. The backend snapshot has no per-failure
// timestamp, so the moment shown is the time of the latest measurement the
// station delivered (measurementDtoList), labelled as such. Each sensor flag is
// translated to a short Dutch tag.
function faultTags(station) {
    const tags = [];
    if (station.isActive === false) tags.push('offline');
    if (station.tempError) tags.push('temp');
    if (station.humError) tags.push('vocht');
    if (station.stofError) tags.push('fijnstof');
    if (station.locError) tags.push('locatie');
    return tags;
}

// Timestamp (ms) of the newest measurement of a station, or null when it has none.
function lastMeasurementTime(station) {
    const times = (station.measurementDtoList ?? [])
        .map((m) => new Date(m.timestamp).getTime())
        .filter((t) => Number.isFinite(t));
    return times.length > 0 ? Math.max(...times) : null;
}

function formatLastSeen(time) {
    if (time == null) return 'Geen recente meting';
    return `Laatste meting: ${new Date(time).toLocaleString('nl-NL', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    })}`;
}

export default function OutageList({ stations, loading = false }) {
    if (loading) {
        return (
            <div className="space-y-2" aria-busy="true" aria-label="Uitval laden">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div key={i} className="flex items-center justify-between rounded-lg border border-gray-100 px-3 py-2">
                        <Skeleton className="h-4 w-1/2" />
                        <Skeleton className="h-4 w-16" />
                    </div>
                ))}
            </div>
        );
    }

    // Most recent last measurement first; stations without any measurement last.
    const failing = stations
        .filter((s) => s.isActive === false || s.tempError || s.humError || s.stofError || s.locError)
        .map((s) => ({ station: s, lastSeen: lastMeasurementTime(s) }))
        .sort((a, b) => (b.lastSeen ?? -Infinity) - (a.lastSeen ?? -Infinity));

    if (failing.length === 0) {
        return (
            <div className="flex items-center gap-2 rounded-lg bg-success/10 px-3 py-4 text-success">
                <i className="bi bi-check-circle-fill text-lg" aria-hidden="true"></i>
                <span className="text-sm font-medium">Alle stations werken naar behoren.</span>
            </div>
        );
    }

    return (
        <ul className="space-y-2">
            {failing.map(({ station, lastSeen }) => {
                const id = station.id ?? station.stationid;
                return (
                    <li key={id}>
                        <Link
                            to={`/stations/${id}`}
                            className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 transition-colors hover:bg-gray-50"
                        >
                            <span className="min-w-0">
                                <span className="flex items-center gap-2 truncate text-sm font-medium text-dark">
                                    <i
                                        className={`bi ${station.isActive === false ? 'bi-x-circle-fill text-danger' : 'bi-exclamation-triangle-fill text-warning'}`}
                                        aria-hidden="true"
                                    ></i>
                                    <span className="truncate">{station.name ?? `Station ${id}`}</span>
                                </span>
                                <span className="block truncate pl-6 text-xs text-gray-500">{formatLastSeen(lastSeen)}</span>
                            </span>
                            <span className="flex flex-shrink-0 flex-wrap justify-end gap-1">
                                {faultTags(station).map((tag) => (
                                    <span
                                        key={tag}
                                        className="rounded bg-gray-100 px-1.5 py-0.5 text-xs font-medium text-gray-600"
                                    >
                                        {tag}
                                    </span>
                                ))}
                            </span>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}

OutageList.propTypes = {
    stations: PropTypes.array.isRequired,
    loading: PropTypes.bool,
};
