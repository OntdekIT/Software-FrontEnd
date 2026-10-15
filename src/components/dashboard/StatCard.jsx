import PropTypes from 'prop-types';

// A single KPI tile for the dashboard strip: a coloured icon, a big value and
// a short label underneath. Accent drives the icon colour and left border so
// the four tiles read as a related set while still being distinguishable.
const ACCENTS = {
    success: { icon: 'text-success', border: 'border-success' },
    danger: { icon: 'text-danger', border: 'border-danger' },
    secondary: { icon: 'text-secondary', border: 'border-secondary' },
    warning: { icon: 'text-warning', border: 'border-warning' },
};

export default function StatCard({ icon, value, unit, label, accent = 'secondary', loading = false }) {
    const theme = ACCENTS[accent] ?? ACCENTS.secondary;

    return (
        <div className={`flex items-center gap-3 rounded-xl border-l-4 ${theme.border} bg-white p-4 shadow-sm`}>
            <i className={`bi ${icon} text-3xl ${theme.icon}`} aria-hidden="true"></i>
            <div className="min-w-0">
                {loading ? (
                    <div className="animate-skeleton h-7 w-16 rounded-md" aria-hidden="true" />
                ) : (
                    <p className="text-2xl font-bold leading-none text-dark">
                        {value}
                        {unit && <span className="ml-1 text-base font-medium text-gray-500">{unit}</span>}
                    </p>
                )}
                <p className="mt-1 truncate text-sm text-gray-500">{label}</p>
            </div>
        </div>
    );
}

StatCard.propTypes = {
    icon: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    unit: PropTypes.string,
    label: PropTypes.string.isRequired,
    accent: PropTypes.oneOf(['success', 'danger', 'secondary', 'warning']),
    loading: PropTypes.bool,
};
