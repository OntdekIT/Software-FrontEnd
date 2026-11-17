import PropTypes from "prop-types";
import {useMemo} from "react";
import {REASON_LATE, REASON_OUTAGE, REASON_SENSOR, countByReason, listStaleStations} from "../../../utils/network-health.js";

const REASONS = [
    {
        key: REASON_OUTAGE, icon: "bi-plug", title: "Uitval",
        text: "Het station is offline: geen stroom, geen wifi of het apparaat is uitgezet. Er komen dan helemaal geen metingen binnen.",
    },
    {
        key: REASON_SENSOR, icon: "bi-cpu", title: "Sensorfout",
        text: "Het station is online, maar een sensor (temperatuur, luchtvochtigheid, fijnstof of locatie) geeft een fout. Alleen die waarde ontbreekt.",
    },
    {
        key: REASON_LATE, icon: "bi-hourglass-split", title: "Late meting",
        text: "Een station stuurt zijn meting soms later door, bijvoorbeeld na een slechte verbinding. De waarde verschijnt dan pas achteraf in de grafieken.",
    },
];

// Static explanation of why data goes missing. When the station list is
// loaded, it also shows how many stations are affected per reason right now.
export default function MissingDataExplainer({stations}) {
    const counts = useMemo(
        () => (stations.state === "ok" ? countByReason(listStaleStations(stations.data)) : null),
        [stations.state, stations.data],
    );

    return (
        <section aria-label="Waarom ontbreekt data" className="rounded-xl border border-line bg-white p-4 shadow-sm">
            <h2 className="mb-1 flex items-center gap-2 text-lg font-semibold text-ink">
                <i className="bi bi-question-circle text-brand-700" aria-hidden="true"></i>
                Waarom ontbreekt er soms data?
            </h2>
            <p className="mb-3 text-sm text-muted">
                Een gat in de grafiek betekent meestal niet dat het klimaat niets doet, maar dat een station niet kon meten of doorsturen.
            </p>
            <ul className="space-y-3">
                {REASONS.map((r) => (
                    <li key={r.key} className="flex gap-3">
                        <i className={`bi ${r.icon} mt-0.5 text-xl text-ink`} aria-hidden="true"></i>
                        <div>
                            <p className="text-sm font-semibold text-ink">
                                {r.title}
                                {counts && <span className="ml-2 rounded bg-sunken px-1.5 py-0.5 text-xs font-medium text-ink-soft">nu {counts[r.key]}</span>}
                            </p>
                            <p className="text-sm text-ink-soft">{r.text}</p>
                        </div>
                    </li>
                ))}
            </ul>
        </section>
    );
}

MissingDataExplainer.propTypes = {
    stations: PropTypes.shape({state: PropTypes.string.isRequired, data: PropTypes.any}).isRequired,
};
