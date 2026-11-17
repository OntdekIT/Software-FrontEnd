import PropTypes from "prop-types";
import {Link} from "react-router-dom";

// Warnings list on the admin dashboard: every item names the problem and links
// to the list where it can be fixed. Renders nothing special when all is well.
export default function AdminWarnings({warnings, loading}) {
    return (
        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm" aria-labelledby="admin-warnings-title">
            <h2 id="admin-warnings-title" className="flex items-center gap-2 text-base font-semibold text-gray-900">
                <i className="bi bi-exclamation-triangle text-amber-700" aria-hidden="true"></i>
                Aandacht nodig
            </h2>
            {loading ? (
                <p className="mt-2 text-sm text-gray-600" role="status">Controleren...</p>
            ) : warnings.length === 0 ? (
                <p className="mt-2 flex items-center gap-2 text-sm text-green-800" role="status">
                    <i className="bi bi-check-circle-fill" aria-hidden="true"></i>
                    Geen openstaande waarschuwingen.
                </p>
            ) : (
                <ul className="mt-2 divide-y divide-gray-100">
                    {warnings.map((warning) => (
                        <li key={warning.key}>
                            <Link
                                to={warning.to}
                                className="flex items-center justify-between gap-3 py-2 text-sm text-gray-800 hover:text-brand-800 focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500"
                            >
                                <span className="flex items-center gap-2">
                                    <i
                                        className={`bi ${warning.severity === "danger" ? "bi-x-octagon-fill text-red-700" : "bi-exclamation-triangle-fill text-amber-700"}`}
                                        aria-hidden="true"
                                    ></i>
                                    {warning.text}
                                </span>
                                <i className="bi bi-arrow-right text-gray-400" aria-hidden="true"></i>
                            </Link>
                        </li>
                    ))}
                </ul>
            )}
        </section>
    );
}

AdminWarnings.propTypes = {
    warnings: PropTypes.arrayOf(PropTypes.shape({
        key: PropTypes.string.isRequired,
        to: PropTypes.string.isRequired,
        text: PropTypes.string.isRequired,
        severity: PropTypes.oneOf(["danger", "warning"]),
    })).isRequired,
    loading: PropTypes.bool,
};
