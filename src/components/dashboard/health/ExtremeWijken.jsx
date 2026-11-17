import PropTypes from "prop-types";
import {useMemo} from "react";
import {Link} from "react-router-dom";
import {pickWarmestAndColdest} from "../../../utils/network-health.js";
import {wijkPath} from "../../../utils/wijk-link.js";
import Block from "./block-state.jsx";

function WijkCard({label, icon, wijk}) {
    return (
        <Link to={wijkPath(wijk.id)} className="block rounded-lg border border-line bg-white p-3 hover:border-brand-600 hover:bg-brand-50">
            <p className="flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-muted">
                <i className={`bi ${icon}`} aria-hidden="true"></i>{label}
            </p>
            <p className="mt-1 truncate text-lg font-bold text-ink">{wijk.name}</p>
            <p className="text-2xl font-bold text-ink">{wijk.temp.toFixed(1)} <span className="text-base font-medium text-muted">°C</span></p>
            <p className="mt-1 text-xs text-muted">Bekijk op de kaart</p>
        </Link>
    );
}

WijkCard.propTypes = {
    label: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    wijk: PropTypes.shape({id: PropTypes.number, name: PropTypes.string, temp: PropTypes.number}).isRequired,
};

export default function ExtremeWijken({regions}) {
    const {warmest, coldest} = useMemo(() => pickWarmestAndColdest(regions.data), [regions.data]);
    const empty = regions.state === "ok" && !warmest;

    return (
        <Block
            title="Warmste en koudste wijk" icon="bi-thermometer-half" state={regions.state} onRetry={regions.reload}
            empty={empty} emptyText="Er zijn nu geen wijktemperaturen beschikbaar."
        >
            {warmest && coldest && (
                <div className="grid gap-3 sm:grid-cols-2">
                    <WijkCard label="Warmste wijk" icon="bi-thermometer-sun" wijk={warmest} />
                    <WijkCard label="Koudste wijk" icon="bi-thermometer-snow" wijk={coldest} />
                </div>
            )}
        </Block>
    );
}

ExtremeWijken.propTypes = {
    regions: PropTypes.shape({state: PropTypes.string.isRequired, data: PropTypes.any, reload: PropTypes.func}).isRequired,
};
