import PropTypes from 'prop-types';

// Base shimmer block. Compose it (or the helpers below) to build skeleton
// placeholders that match the real content's layout.
export function Skeleton({ className = '', rounded = 'rounded-md' }) {
    return <div className={`animate-skeleton ${rounded} ${className}`} aria-hidden="true" />;
}

Skeleton.propTypes = {
    className: PropTypes.string,
    rounded: PropTypes.string,
};

// A few lines of text of decreasing width.
export function SkeletonText({ lines = 3, className = '' }) {
    return (
        <div className={`space-y-2 ${className}`} aria-hidden="true">
            {Array.from({ length: lines }).map((_, i) => (
                <Skeleton key={i} className={`h-3 ${i === lines - 1 ? 'w-2/3' : 'w-full'}`} />
            ))}
        </div>
    );
}

SkeletonText.propTypes = {
    lines: PropTypes.number,
    className: PropTypes.string,
};

// Card-shaped placeholder (title + text block).
export function SkeletonCard({ className = '' }) {
    return (
        <div className={`rounded-xl border border-gray-200 bg-white p-4 ${className}`} aria-hidden="true">
            <Skeleton className="mb-3 h-5 w-1/2" />
            <SkeletonText lines={3} />
        </div>
    );
}

SkeletonCard.propTypes = { className: PropTypes.string };

// A table with skeleton rows. Use while a list/overview is loading.
export function SkeletonTable({ rows = 5, columns = 4, className = '' }) {
    return (
        <div className={`overflow-hidden rounded-lg border border-gray-200 ${className}`} aria-hidden="true">
            {Array.from({ length: rows }).map((_, r) => (
                <div key={r} className="flex items-center gap-4 border-b border-gray-100 px-4 py-3 last:border-b-0">
                    {Array.from({ length: columns }).map((_, c) => (
                        <Skeleton key={c} className={`h-4 ${c === 0 ? 'w-1/4' : 'flex-1'}`} />
                    ))}
                </div>
            ))}
        </div>
    );
}

SkeletonTable.propTypes = {
    rows: PropTypes.number,
    columns: PropTypes.number,
    className: PropTypes.string,
};

export default Skeleton;
