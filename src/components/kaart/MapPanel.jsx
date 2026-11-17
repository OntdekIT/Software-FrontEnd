import PropTypes from 'prop-types';

// Paneel naast of onder de kaart. Op desktop een vast zijpaneel rechts; op
// mobiel een bottom sheet die als kop onderaan staat en omhoog schuift.
// De hoogte van de kop op mobiel is --sheet-peek (zie kaart.css).
export default function MapPanel({ title, showTitleOnDesktop = true, expanded, onToggle, children }) {
    return (
        <aside
            aria-label="Wijken en details"
            className={`absolute inset-x-0 bottom-0 z-20 flex flex-col overflow-hidden rounded-t-2xl border border-gray-300 bg-gray-50 shadow-2xl transition-[height] duration-200 lg:inset-x-auto lg:bottom-3 lg:right-3 lg:top-3 lg:h-auto lg:w-96 lg:rounded-2xl ${
                expanded ? 'h-[62%]' : 'h-[var(--sheet-peek)]'
            }`}
        >
            {/* Mobiel: de kop is de knop waarmee de sheet open en dicht gaat. */}
            <button
                type="button"
                onClick={onToggle}
                aria-expanded={expanded}
                className="flex h-[var(--sheet-peek)] w-full shrink-0 flex-col items-center justify-center gap-1 bg-white px-4 text-gray-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gray-900 lg:hidden"
            >
                <span className="h-1 w-10 rounded-full bg-gray-400" aria-hidden="true"></span>
                <span className="flex items-center gap-2 text-sm font-semibold">
                    {title}
                    <i className={`bi ${expanded ? 'bi-chevron-down' : 'bi-chevron-up'}`} aria-hidden="true"></i>
                </span>
            </button>
            {showTitleOnDesktop && (
                <h2 className="m-0 hidden shrink-0 items-center gap-2 border-b border-gray-200 bg-white px-4 py-3 text-base font-bold text-gray-900 lg:flex">
                    <i className="bi bi-geo-alt" aria-hidden="true"></i>
                    {title}
                </h2>
            )}
            <div className="min-h-0 flex-1 overflow-y-auto p-3">{children}</div>
        </aside>
    );
}

MapPanel.propTypes = {
    title: PropTypes.string.isRequired,
    showTitleOnDesktop: PropTypes.bool,
    expanded: PropTypes.bool.isRequired,
    onToggle: PropTypes.func.isRequired,
    children: PropTypes.node,
};
