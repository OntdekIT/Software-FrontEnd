import PropTypes from 'prop-types';
import RegionChart from './RegionChart.jsx';
import RegionMeasurementList from './RegionMeasurementList.jsx';

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
                <button className="btn btn-sm btn-outline-secondary" onClick={() => setSelectedRegion(null)}>← Terug</button>
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
                <p className="region-loading">Historische data ophalen...</p>
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
                <p className="text-muted region-no-data">Geen historische data beschikbaar.</p>
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