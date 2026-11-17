import PropTypes from "prop-types";
import {Skeleton} from "../../ui/Skeleton.jsx";

// Shared frame for a dashboard block: title, then loading, error, empty or content.
export default function Block({title, icon, state, onRetry, empty, emptyText, className = "", children, skeletonHeight = "h-40"}) {
    let body;
    if (state === "loading") {
        body = <Skeleton className={`${skeletonHeight} w-full`} />;
    } else if (state === "error") {
        body = (
            <div role="alert" className="flex flex-wrap items-center gap-3 rounded-lg bg-danger/10 px-3 py-3 text-sm text-danger">
                <span>Dit blok kon niet geladen worden.</span>
                {onRetry && (
                    <button type="button" onClick={onRetry} className="rounded-md bg-secondary px-3 py-1 text-sm font-medium text-white">
                        Opnieuw proberen
                    </button>
                )}
            </div>
        );
    } else if (empty) {
        body = <p role="status" className="rounded-lg bg-sunken px-3 py-4 text-sm text-muted">{emptyText}</p>;
    } else {
        body = children;
    }

    return (
        <section aria-label={title} aria-busy={state === "loading"} className={`rounded-xl border border-line bg-white p-4 shadow-sm ${className}`}>
            <h2 className="mb-3 flex items-center gap-2 text-lg font-semibold text-ink">
                <i className={`bi ${icon} text-brand-700`} aria-hidden="true"></i>
                {title}
            </h2>
            {body}
        </section>
    );
}

Block.propTypes = {
    title: PropTypes.string.isRequired,
    icon: PropTypes.string.isRequired,
    state: PropTypes.oneOf(["loading", "ok", "error"]).isRequired,
    onRetry: PropTypes.func,
    empty: PropTypes.bool,
    emptyText: PropTypes.string,
    className: PropTypes.string,
    skeletonHeight: PropTypes.string,
    children: PropTypes.node,
};
