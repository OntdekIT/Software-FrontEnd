import PropTypes from 'prop-types';

// Full-page preloader used as the Suspense fallback for lazy routes and as a
// generic "whole screen is loading" state. Replaces the plain "Loading..." text
// and the old fullscreen Oval spinner.
export default function Preloader({ message = 'Laden…' }) {
    return (
        <div className="flex min-h-[60vh] w-full flex-col items-center justify-center gap-4">
            <span
                className="h-10 w-10 animate-spin rounded-full border-4 border-brand-200 border-t-brand-500"
                role="status"
                aria-label="Laden"
            />
            {message && <p className="text-sm text-gray-500">{message}</p>}
        </div>
    );
}

Preloader.propTypes = { message: PropTypes.string };

// Small inline spinner for buttons / tight spaces.
export function Spinner({ className = 'h-5 w-5' }) {
    return (
        <span
            className={`inline-block animate-spin rounded-full border-2 border-current/30 border-t-current ${className}`}
            role="status"
            aria-label="Laden"
        />
    );
}

Spinner.propTypes = { className: PropTypes.string };
