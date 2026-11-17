// Zoeken in de wijkenlijst voor het zoekveld op de kaart.

/** Wijken waarvan de naam de zoekterm bevat; wijken die ermee beginnen eerst. */
export function searchRegions(regions, query, limit = 6) {
    const term = (query ?? '').trim().toLowerCase();
    if (term === '') return [];

    return (regions ?? [])
        .filter(r => typeof r.name === 'string' && r.name.toLowerCase().includes(term))
        .sort((a, b) => {
            const aStarts = a.name.toLowerCase().startsWith(term);
            const bStarts = b.name.toLowerCase().startsWith(term);
            if (aStarts !== bStarts) return aStarts ? -1 : 1;
            return a.name.localeCompare(b.name, 'nl');
        })
        .slice(0, limit);
}
