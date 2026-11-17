import PropTypes from "prop-types";
import {useMemo} from "react";
import {Link} from "react-router-dom";
import {listStaleStations} from "../../../utils/network-health.js";
import {formatLastMeasurement} from "../../../utils/station-status.js";
import {formatTimeAgo} from "../../../utils/relative-time.js";
import Block from "./block-state.jsx";

const REASON_STYLE = {
    "uitval": "bg-danger/10 text-danger",
    "sensorfout": "bg-warning/15 text-ink",
    "late meting": "bg-sunken text-ink-soft",
};

export default function StaleStations({stations, backfill}) {
    const backfillIndex = backfill.state === "ok" ? backfill.data : undefined;
    const list = useMemo(
        () => (stations.state === "ok" ? listStaleStations(stations.data, Date.now(), undefined, backfillIndex) : []),
        [stations.state, stations.data, backfillIndex],
    );

    return (
        <Block
            title="Stations zonder recente meting" icon="bi-wifi-off" state={stations.state} onRetry={stations.reload}
            empty={stations.state === "ok" && list.length === 0} emptyText="Alle stations hebben in het afgelopen uur een meting doorgegeven."
        >
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <caption className="sr-only">Stations zonder meting in het afgelopen uur</caption>
                    <thead>
                        <tr className="border-b border-line text-xs uppercase tracking-wide text-muted">
                            <th scope="col" className="py-2 pr-3 font-semibold">Station</th>
                            <th scope="col" className="py-2 pr-3 font-semibold">Reden</th>
                            <th scope="col" className="py-2 font-semibold">Laatste meting</th>
                        </tr>
                    </thead>
                    <tbody>
                        {list.map((s) => (
                            <tr key={s.id} className="border-b border-line last:border-0 align-top">
                                <td className="py-2 pr-3 font-medium text-ink">
                                    <Link to={`/stations/${s.id}`} className="underline decoration-brand-600 underline-offset-2">{s.name}</Link>
                                </td>
                                <td className="py-2 pr-3">
                                    <span className={`inline-block rounded px-1.5 py-0.5 text-xs font-medium ${REASON_STYLE[s.reason]}`}>{s.reason}</span>
                                    {s.faults.length > 0 && <span className="mt-0.5 block text-xs text-muted">Sensor: {s.faults.join(", ")}</span>}
                                </td>
                                <td className="py-2 text-ink-soft">
                                    {s.lastSeen == null ? (
                                        backfill.state === "loading" ? "Zoeken..." : "Langer dan 7 dagen geleden"
                                    ) : (
                                        <>
                                            {formatLastMeasurement(s.lastSeen)}
                                            <span className="block text-xs text-muted">{formatTimeAgo(s.lastSeen)}</span>
                                        </>
                                    )}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            {backfill.state === "error" && (
                <p className="mt-2 text-xs text-muted">De tijd van de laatste meting van oudere uitval kon niet worden opgehaald.</p>
            )}
        </Block>
    );
}

const sourceShape = PropTypes.shape({state: PropTypes.string.isRequired, data: PropTypes.any, reload: PropTypes.func});
StaleStations.propTypes = {stations: sourceShape.isRequired, backfill: sourceShape.isRequired};
