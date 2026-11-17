import PropTypes from 'prop-types';
import RegionChart from './RegionChart.jsx';
import RegionMiniChart from './RegionMiniChart.jsx';
import RegionMeasurementList from './RegionMeasurementList.jsx';
import Button from '../ui/Button.jsx';
import { Skeleton } from '../ui/Skeleton.jsx';
import { NO_RECENT_DATA_LABEL, lastMeasurementTimestamp } from '../../utils/region-status.js';

export default function RegionDetails({
                                          selectedRegion,
                                          setSelectedRegion,
                                          regionLoading,
                                          regionHistoryData,
                                          dataView,
                                          setDataView,
                                          showMin,
                                          showMax,
                                          showGem,
                                          handleRegionLegendChange,
                                          formatTimestamp,
                                          parseTemp
                                      }) {
    return (
        <section className="region-details-card" aria-label={`Details van ${selectedRegion.name}`}>
            <div className="region-details-header">
                <h3 className="region-details-title">{selectedRegion.name}</h3>
                <Button variant="outline" size="sm" onClick={() => setSelectedRegion(null)} aria-label="Sluit details">
                    <i className="bi bi-x-lg" aria-hidden="true"></i> Sluiten
                </Button>
            </div>
            {parseTemp(selectedRegion.avgTemp) !== null ? (
                <div className="region-current-temp">
                    <span className="rct-label">Gem. temperatuur nu:</span>
                    <span className="rct-value">
                        {`${parseTemp(selectedRegion.avgTemp).toFixed(1)}°C`}
                    </span>
                </div>
            ) : (
                <div className="region-current-temp region-current-nodata">
                    <span className="rct-nodata">
                        <i className="bi bi-clock-history" aria-hidden="true"></i>
                        {NO_RECENT_DATA_LABEL}
                    </span>
                    {!regionLoading && (
                        <span className="rct-label">
                            {lastMeasurementTimestamp(regionHistoryData)
                                ? `Laatste meting: ${formatTimestamp(lastMeasurementTimestamp(regionHistoryData))}`
                                : 'Geen meting in de afgelopen 24 uur.'}
                        </span>
                    )}
                </div>
            )}
            {regionLoading ? (
                <div className="space-y-3" aria-busy="true" aria-label="Historische data ophalen">
                    <Skeleton className="h-24 w-full" rounded="rounded-xl" />
                </div>
            ) : regionHistoryData.length > 0 ? (
                <>
                    <RegionMiniChart regionHistoryData={regionHistoryData} formatTimestamp={formatTimestamp} />
                    <details className="region-more">
                        <summary>Alle metingen en grafiek</summary>
                        <div className="region-data-layout">
                            <RegionChart
                                regionHistoryData={regionHistoryData}
                                dataView={dataView}
                                setDataView={setDataView}
                                showMin={showMin}
                                showMax={showMax}
                                showGem={showGem}
                                handleRegionLegendChange={handleRegionLegendChange}
                                formatTimestamp={formatTimestamp}
                            />
                            <RegionMeasurementList
                                regionHistoryData={regionHistoryData}
                                dataView={dataView}
                                formatTimestamp={formatTimestamp}
                            />
                        </div>
                    </details>
                </>
            ) : (
                <p className="text-gray-600 region-no-data">Geen historische data beschikbaar.</p>
            )}
        </section>
    );
}

RegionDetails.propTypes = {
    selectedRegion: PropTypes.object.isRequired,
    setSelectedRegion: PropTypes.func.isRequired,
    regionLoading: PropTypes.bool.isRequired,
    regionHistoryData: PropTypes.array.isRequired,
    dataView: PropTypes.string.isRequired,
    setDataView: PropTypes.func.isRequired,
    showMin: PropTypes.bool.isRequired,
    showMax: PropTypes.bool.isRequired,
    showGem: PropTypes.bool.isRequired,
    handleRegionLegendChange: PropTypes.func.isRequired,
    formatTimestamp: PropTypes.func.isRequired,
    parseTemp: PropTypes.func.isRequired
};