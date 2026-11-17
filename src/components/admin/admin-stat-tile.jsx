import PropTypes from "prop-types";
import {Link} from "react-router-dom";
import {Skeleton} from "../ui/Skeleton.jsx";

// A counter on the admin dashboard. The whole tile links to the matching list.
// `state` is "loading", "error" or "ok"; an error only blanks this tile, the
// rest of the dashboard keeps working.
export default function AdminStatTile({to, icon, label, value, hint, tone = "neutral", state}) {
    const toneClass = tone === "warning" ? "border-amber-300 bg-amber-50" : "border-gray-200 bg-white";
    return (
        <Link
            to={to}
            className={`group flex flex-col rounded-xl border p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand-500 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-500 ${toneClass}`}
        >
            <span className="flex items-center justify-between text-sm font-medium text-gray-700">
                <span className="flex items-center gap-2">
                    <i className={`bi ${icon} text-lg text-brand-700`} aria-hidden="true"></i>
                    {label}
                </span>
                <i className="bi bi-arrow-right text-gray-400 group-hover:text-brand-700" aria-hidden="true"></i>
            </span>
            {state === "loading" ? (
                <Skeleton className="mt-3 h-8 w-16"/>
            ) : state === "error" ? (
                <span className="mt-2 text-sm text-gray-600">Niet beschikbaar</span>
            ) : (
                <>
                    <span className="mt-2 text-3xl font-bold leading-none text-gray-900">{value}</span>
                    {hint && <span className="mt-1 text-xs text-gray-600">{hint}</span>}
                </>
            )}
        </Link>
    );
}

AdminStatTile.propTypes = {
    to: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
    hint: PropTypes.string,
    tone: PropTypes.oneOf(["neutral", "warning"]),
    state: PropTypes.oneOf(["loading", "error", "ok"]).isRequired,
};
