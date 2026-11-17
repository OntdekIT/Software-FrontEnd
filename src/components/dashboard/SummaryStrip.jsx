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
export default function SummaryStrip({ stations, regions, loading = false, failed = false }) {
    const summary = useMemo(() => summarizeNetwork(stations, regions), [stations, regions]);
    const noData = !loading && summary.avgTemp == null && summary.totalCount === 0;

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
                    accent="secondary"
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
                    accent="secondary"
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
};
