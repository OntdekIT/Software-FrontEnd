import PropTypes from "prop-types";
import {useMemo} from "react";
import StatCard from "../StatCard.jsx";
import {cityAverage} from "../../../utils/current-values.js";
import {
    countStationHealth,
    coverageFromFrames,
} from "../../../utils/network-health.js";

const NO_VALUE = "--";
const UNAVAILABLE = "Niet beschikbaar";

const fixed = (value, digits = 1) => (value == null ? NO_VALUE : value.toFixed(digits));

// The headline numbers. Stations and timelapse load independently, so a card
// only waits for (or fails on) its own source.
export default function KeyNumbers({stations, regions, timelapse, pmCoverage}) {
    const stationsOk = stations.state === "ok";
    const health = useMemo(() => (stationsOk ? countStationHealth(stations.data) : null), [stationsOk, stations.data]);
    // Same city average as the map strip: mean of the wijk averages now (current-values.js).
    const regionsOk = regions.state === "ok";
    const avgTemp = useMemo(() => (regionsOk ? cityAverage(regions.data, "avgTemp") : null), [regionsOk, regions.data]);
    const avgPm25 = useMemo(() => (regionsOk ? cityAverage(regions.data, "avgPm25") : null), [regionsOk, regions.data]);
    const coverage = useMemo(
        () => (timelapse.state === "ok" && stationsOk ? coverageFromFrames(timelapse.data?.frames, stations.data.length) : null),
        [timelapse.state, timelapse.data, stationsOk, stations.data],
    );

    const stationsLoading = stations.state === "loading";
    const stationsDetail = stations.state === "error" ? UNAVAILABLE : undefined;
    const regionsLoading = regions.state === "loading";
    const regionsDetail = regions.state === "error" ? UNAVAILABLE : undefined;
    const coverageLoading = stationsLoading || timelapse.state === "loading";
    const coverageFailed = stations.state === "error" || timelapse.state === "error";

    let coverageDetail = coverageFailed ? UNAVAILABLE : "stations met een meting per uur";
    if (pmCoverage?.state === "ok" && pmCoverage.data != null) {
        coverageDetail = `Fijnstof: ${Math.round(pmCoverage.data * 100)}% (beheer)`;
    }

    return (
        <section aria-label="Kerncijfers meetnet" className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <StatCard
                icon="bi-broadcast" accent="success" label="Actieve stations" loading={stationsLoading}
                value={health ? health.active : NO_VALUE}
                detail={health ? `van ${health.total} stations` : stationsDetail}
            />
            <StatCard
                icon="bi-exclamation-triangle" accent="danger" label="Uitgevallen of storing" loading={stationsLoading}
                value={health ? health.failing : NO_VALUE}
                detail={health ? "offline of een sensorfout" : stationsDetail}
            />
            <StatCard
                icon="bi-reception-4" accent="ink" label="Dekking laatste 24 uur" loading={coverageLoading}
                value={coverage == null ? NO_VALUE : Math.round(coverage)} unit={coverage == null ? undefined : "%"}
                detail={coverageDetail}
            />
            <StatCard
                icon="bi-thermometer-half" accent="warning" label="Gem. temperatuur stad" loading={regionsLoading}
                value={fixed(avgTemp)} unit={avgTemp == null ? undefined : "°C"}
                detail={regionsDetail ?? (avgTemp == null ? "geen recente metingen" : "gemiddelde van de wijken, nu")}
            />
            <StatCard
                icon="bi-cloud-haze2" accent="ink" label="Gem. fijnstof (PM2.5)" loading={regionsLoading}
                value={fixed(avgPm25)} unit={avgPm25 == null ? undefined : "µg/m³"}
                detail={regionsDetail ?? (avgPm25 == null ? "geen recente fijnstofmeting" : "gemiddelde van de wijken, nu")}
            />
        </section>
    );
}

const sourceShape = PropTypes.shape({state: PropTypes.string.isRequired, data: PropTypes.any});
KeyNumbers.propTypes = {
    stations: sourceShape.isRequired,
    regions: sourceShape.isRequired,
    timelapse: sourceShape.isRequired,
    pmCoverage: sourceShape,
};
