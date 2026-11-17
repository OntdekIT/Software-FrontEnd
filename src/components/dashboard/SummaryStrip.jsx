import PropTypes from 'prop-types';
import { useMemo } from 'react';
import StatCard from './StatCard.jsx';
import { summarizeNetwork } from '../../utils/network-summary.js';

const NO_VALUE = '--';

function formatTemp(value) {
    return value != null ? value.toFixed(1) : NO_VALUE;
}

function formatMoment(time) {
    return new Date(time).toLocaleString('nl-NL', {
        day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit',
    });
}

// Summary strip at the top of the homepage: the headline numbers for the
// whole network. Everything is derived client side from the two lists the page
// already loads (stations with their latest measurement, and wijken with their
// average temperature), so it costs no extra request.
export default function SummaryStrip({ stations, regions, loading = false, failed = false, compact = false }) {
    const summary = useMemo(() => summarizeNetwork(stations, regions), [stations, regions]);
    const noData = !loading && summary.avgTemp == null && summary.totalCount === 0;

    // Compacte variant voor op de kaart: dezelfde cijfers, als een rij chips.
    if (compact) {
        if (loading || noData) return null;
        const chips = [
            { icon: 'bi-thermometer-half', text: `${formatTemp(summary.avgTemp)} \u00b0C gem.` },
            { icon: 'bi-cloud-haze2', text: `PM2.5 ${formatTemp(summary.avgPm25)}` },
            { icon: 'bi-broadcast', text: `${summary.activeCount} van ${summary.totalCount} stations` },
        ];
        return (
            <section
                aria-label="Kerncijfers meetnet"
                className="flex flex-wrap gap-1.5 rounded-lg border border-gray-300 bg-white/95 px-2 py-1.5 text-xs font-medium text-gray-900 shadow-md"
            >
                {chips.map(chip => (
                    <span key={chip.icon} className="inline-flex items-center gap-1 whitespace-nowrap">
                        <i className={`bi ${chip.icon}`} aria-hidden="true"></i>
                        {chip.text}
                    </span>
                ))}
            </section>
        );
    }

    if (failed && noData) {
        return (
            <section className="dashboard-kpis" aria-label="Kerncijfers meetnet">
                <p className="dashboard-kpis-empty" role="status">
                    De kerncijfers zijn nu niet beschikbaar.
                </p>
            </section>
        );
    }

    if (noData) {
        return (
            <section className="dashboard-kpis" aria-label="Kerncijfers meetnet">
                <p className="dashboard-kpis-empty" role="status">
                    Er zijn nog geen metingen beschikbaar.
                </p>
            </section>
        );
    }

    return (
        <section aria-label="Kerncijfers meetnet" className="mb-5">
            <div className="dashboard-kpis">
                <StatCard
                    icon="bi-thermometer-half"
                    accent="warning"
                    value={formatTemp(summary.avgTemp)}
                    unit="°C"
                    label="Gem. temperatuur"
                    loading={loading}
                />
                <StatCard
                    icon="bi-thermometer-sun"
                    accent="danger"
                    value={summary.warmest?.name ?? NO_VALUE}
                    label="Warmste wijk"
                    detail={summary.warmest ? `${formatTemp(summary.warmest.temp)} °C` : undefined}
                    loading={loading}
                />
                <StatCard
                    icon="bi-thermometer-snow"
                    accent="ink"
                    value={summary.coldest?.name ?? NO_VALUE}
                    label="Koudste wijk"
                    detail={summary.coldest ? `${formatTemp(summary.coldest.temp)} °C` : undefined}
                    loading={loading}
                />
                <StatCard
                    icon="bi-broadcast"
                    accent="success"
                    value={summary.activeCount}
                    label="Actieve stations"
                    detail={`van ${summary.totalCount} stations`}
                    loading={loading}
                />
                <StatCard
                    icon="bi-exclamation-triangle"
                    accent="danger"
                    value={summary.failingCount}
                    label="Uitgevallen / storing"
                    loading={loading}
                />
                <StatCard
                    icon="bi-cloud-haze2"
                    accent="ink"
                    value={formatTemp(summary.avgPm25)}
                    unit="µg/m³"
                    label="Gem. fijnstof (PM2.5)"
                    loading={loading}
                />
            </div>
            {!loading && (
                <p className="mt-2 text-sm text-gray-600">
                    {summary.lastUpdate != null
                        ? `Laatste update: ${formatMoment(summary.lastUpdate)}`
                        : 'Laatste update: onbekend (geen recente metingen)'}
                </p>
            )}
        </section>
    );
}

SummaryStrip.propTypes = {
    stations: PropTypes.array.isRequired,
    regions: PropTypes.array.isRequired,
    loading: PropTypes.bool,
    failed: PropTypes.bool,
    compact: PropTypes.bool,
};
