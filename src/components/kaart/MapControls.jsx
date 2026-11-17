import { useId, useState } from 'react';
import PropTypes from 'prop-types';
import { searchRegions } from '../../utils/region-search.js';

const ROUND_BUTTON = 'pointer-events-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-300 bg-white text-gray-800 shadow-md transition-colors hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-gray-900 disabled:cursor-wait disabled:opacity-60';

// Zwevende bediening linksboven op de kaart: zoeken, mijn locatie en zoomen.
// De laagkeuze staat eronder en is onderdeel van de kaart zelf.
export default function MapControls({ regions, onSelectRegion, onLocate, onZoomIn, onZoomOut, locating = false }) {
    const [query, setQuery] = useState('');
    const [open, setOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(0);
    const listId = useId();

    const results = searchRegions(regions, query);
    const showList = open && query.trim() !== '';

    function choose(region) {
        setQuery('');
        setOpen(false);
        onSelectRegion(region);
    }

    function onKeyDown(e) {
        if (e.key === 'ArrowDown' && results.length > 0) {
            e.preventDefault();
            setActiveIndex(i => Math.min(i + 1, results.length - 1));
        } else if (e.key === 'ArrowUp' && results.length > 0) {
            e.preventDefault();
            setActiveIndex(i => Math.max(i - 1, 0));
        } else if (e.key === 'Enter' && results[activeIndex]) {
            e.preventDefault();
            choose(results[activeIndex]);
        } else if (e.key === 'Escape' && showList) {
            // Sluit alleen de resultaten; de pagina sluit anders de wijk.
            e.stopPropagation();
            setOpen(false);
        }
    }

    return (
        <div className="flex w-full items-start gap-2">
            <div className="pointer-events-auto relative min-w-0 flex-1">
                <div className="flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 shadow-md focus-within:outline focus-within:outline-2 focus-within:outline-gray-900">
                    <i className="bi bi-search text-gray-600" aria-hidden="true"></i>
                    <input
                        type="search"
                        role="combobox"
                        aria-label="Zoek een wijk"
                        aria-expanded={showList}
                        aria-controls={listId}
                        aria-autocomplete="list"
                        aria-activedescendant={showList && results[activeIndex] ? `${listId}-${results[activeIndex].id}` : undefined}
                        placeholder="Zoek een wijk"
                        autoComplete="off"
                        value={query}
                        onChange={(e) => { setQuery(e.target.value); setOpen(true); setActiveIndex(0); }}
                        onFocus={() => setOpen(true)}
                        onBlur={() => setOpen(false)}
                        onKeyDown={onKeyDown}
                        className="h-10 min-w-0 flex-1 bg-transparent text-sm text-gray-900 placeholder-gray-600 outline-none"
                    />
                </div>
                {showList && (
                    <ul
                        id={listId}
                        role="listbox"
                        aria-label="Gevonden wijken"
                        className="absolute left-0 right-0 top-full z-10 mt-1 max-h-64 overflow-y-auto rounded-lg border border-gray-300 bg-white py-1 shadow-lg"
                    >
                        {results.length === 0 && (
                            <li className="px-3 py-2 text-sm text-gray-700" role="status">Geen wijk gevonden</li>
                        )}
                        {results.map((region, i) => (
                            <li
                                key={region.id}
                                id={`${listId}-${region.id}`}
                                role="option"
                                aria-selected={i === activeIndex}
                                // mousedown i.p.v. click: de blur van het veld sluit de lijst anders eerst.
                                onMouseDown={(e) => { e.preventDefault(); choose(region); }}
                                className={`cursor-pointer px-3 py-2 text-sm text-gray-900 ${i === activeIndex ? 'bg-brand-100' : 'hover:bg-brand-50'}`}
                            >
                                {region.name}
                            </li>
                        ))}
                    </ul>
                )}
            </div>
            <button type="button" className={ROUND_BUTTON} onClick={onLocate} disabled={locating} aria-label="Mijn locatie" title="Mijn locatie">
                <i className={`bi ${locating ? 'bi-arrow-repeat' : 'bi-crosshair'}`} aria-hidden="true"></i>
            </button>
            <div className="pointer-events-auto hidden shrink-0 flex-col overflow-hidden rounded-lg border border-gray-300 bg-white shadow-md sm:flex">
                <button type="button" onClick={onZoomIn} aria-label="Inzoomen" title="Inzoomen" className="flex h-5 w-10 items-center justify-center text-gray-800 hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gray-900">
                    <i className="bi bi-plus-lg text-xs" aria-hidden="true"></i>
                </button>
                <button type="button" onClick={onZoomOut} aria-label="Uitzoomen" title="Uitzoomen" className="flex h-5 w-10 items-center justify-center border-t border-gray-300 text-gray-800 hover:bg-brand-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gray-900">
                    <i className="bi bi-dash-lg text-xs" aria-hidden="true"></i>
                </button>
            </div>
        </div>
    );
}

MapControls.propTypes = {
    regions: PropTypes.array.isRequired,
    onSelectRegion: PropTypes.func.isRequired,
    onLocate: PropTypes.func.isRequired,
    onZoomIn: PropTypes.func.isRequired,
    onZoomOut: PropTypes.func.isRequired,
    locating: PropTypes.bool,
};
