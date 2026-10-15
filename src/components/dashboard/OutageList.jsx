import PropTypes from 'prop-types';
import { Link } from 'react-router-dom';
import { Skeleton } from '../ui/Skeleton.jsx';

// Lists the stations that currently need attention: either marked inactive or
// reporting a sensor/location error. The backend snapshot has no per-failure
// timestamp, so this shows the current state rather than inventing moments.
// Each sensor flag is translated to a short Dutch tag.
function faultTags(station) {
    const tags = [];
    if (station.isActive === false) tags.push('offline');
    if (station.tempError) tags.push('temp');
    if (station.humError) tags.push('vocht');
    if (station.stofError) tags.push('fijnstof');
    if (station.locError) tags.push('locatie');
    return tags;
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

    const failing = stations.filter(
        (s) => s.isActive === false || s.tempError || s.humError || s.stofError || s.locError
    );

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
            {failing.map((station) => {
                const id = station.id ?? station.stationid;
                return (
                    <li key={id}>
                        <Link
                            to={`/stations/${id}`}
                            className="flex items-center justify-between gap-2 rounded-lg border border-gray-100 px-3 py-2 transition-colors hover:bg-gray-50"
                        >
                            <span className="flex items-center gap-2 truncate text-sm font-medium text-dark">
                                <i
                                    className={`bi ${station.isActive === false ? 'bi-x-circle-fill text-danger' : 'bi-exclamation-triangle-fill text-warning'}`}
                                    aria-hidden="true"
                                ></i>
                                <span className="truncate">{station.name ?? `Station ${id}`}</span>
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
