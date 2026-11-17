import PropTypes from "prop-types";
import {Link} from "react-router-dom";
import {formatLastMeasurement, getStationStatus} from "../../utils/station-status.js";

// Compact overview of the user's own stations: status (online/offline) and the
// time of the latest measurement. `lastMeasurements` maps station id to a time
// in ms; while it is null (not loaded, or the request failed) the moment is
// shown as unknown instead of blocking the list.
export default function MyStationStatusList({stations, lastMeasurements}) {
    return (
        <ul className="mb-6 divide-y divide-gray-100 rounded-xl border border-gray-200 bg-white shadow-sm" aria-label="Status per station">
            {stations.map((station) => {
                const status = getStationStatus(station);
                const time = lastMeasurements?.get(Number(station.stationid)) ?? null;
                return (
                    <li key={station.stationid}>
                        <Link
                            to={`/stations/${station.stationid}`}
                            className="flex flex-wrap items-center justify-between gap-x-4 gap-y-1 px-4 py-3 hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-brand-500"
                        >
                            <span className="flex min-w-0 items-center gap-3">
                                <span
                                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${status.online ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"}`}
                                >
                                    <i className={`bi ${status.online ? "bi-wifi" : "bi-wifi-off"}`} aria-hidden="true"></i>
                                    {status.label}
                                </span>
                                <span className="truncate font-medium text-gray-900">
                                    {station.name || `Station ${station.stationid}`}
                                </span>
                            </span>
                            <span className="text-sm text-gray-600">
                                {status.faults.length > 0 && (
                                    <span className="mr-3 text-amber-800">
                                        <i className="bi bi-exclamation-triangle" aria-hidden="true"></i> Storing: {status.faults.join(", ")}
                                    </span>
                                )}
                                Laatste meting: {formatLastMeasurement(time)}
                            </span>
                        </Link>
                    </li>
                );
            })}
        </ul>
    );
}

MyStationStatusList.propTypes = {
    stations: PropTypes.array.isRequired,
    lastMeasurements: PropTypes.instanceOf(Map),
};
