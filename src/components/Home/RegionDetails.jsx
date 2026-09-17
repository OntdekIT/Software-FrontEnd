import PropTypes from 'prop-types';
import RegionChart from './RegionChart.jsx';
import RegionMeasurementList from './RegionMeasurementList.jsx';
import Button from '../ui/Button.jsx';
import { Skeleton } from '../ui/Skeleton.jsx';

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
        <div className="region-details-card">
            <div className="region-details-header">
                <h3 className="region-details-title">{selectedRegion.name}</h3>
                <Button variant="outline" size="sm" onClick={() => setSelectedRegion(null)}>← Terug</Button>
            </div>
            <div className="region-current-temp">
                <span className="rct-label">Gem. temperatuur nu:</span>
                <span className="rct-value">
                    {parseTemp(selectedRegion.avgTemp) !== null
                        ? `${parseTemp(selectedRegion.avgTemp).toFixed(1)}°C`
                        : '--'}
                </span>
            </div>
            {regionLoading ? (
                <div className="region-data-layout" aria-busy="true" aria-label="Historische data ophalen">
                    {/* Chart placeholder: legend row + chart body */}
                    <div className="space-y-3">
                        <div className="flex gap-2">
                            <Skeleton className="h-6 w-20" rounded="rounded-full" />
                            <Skeleton className="h-6 w-20" rounded="rounded-full" />
                            <Skeleton className="h-6 w-20" rounded="rounded-full" />
                        </div>
                        <Skeleton className="h-48 w-full" rounded="rounded-xl" />
                    </div>
                    {/* Measurement list placeholder: title + rows */}
                    <div className="space-y-3">
                        <Skeleton className="h-5 w-1/3" />
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between gap-4">
                                <Skeleton className="h-4 w-2/5" />
                                <Skeleton className="h-4 w-16" />
                            </div>
                        ))}
                    </div>
                </div>
            ) : regionHistoryData.length > 0 ? (
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
            ) : (
                <p className="text-gray-500 region-no-data">Geen historische data beschikbaar.</p>
            )}
        </div>
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