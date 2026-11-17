import { useCallback, useEffect, useRef, useState } from 'react';
import { backendApi } from '../utils/backend-api.jsx';
import NewMap from '../components/newmap.jsx';
import MapControls from '../components/kaart/MapControls.jsx';
import MapPanel from '../components/kaart/MapPanel.jsx';
import RegionList from '../components/Home/RegionList.jsx';
import RegionDetails from '../components/Home/RegionDetails.jsx';
import SummaryStrip from '../components/dashboard/SummaryStrip.jsx';
import Button from '../components/ui/Button.jsx';
import { useToast } from '../components/ui/toast.jsx';
import './kaart.css';

const MAP_CENTER = { x: 5.0913, y: 51.5555, zoom: 12 };

// Ruimte die het paneel van de kaart inneemt, voor het inzoomen op een wijk.
function focusPadding() {
    const desktop = window.matchMedia('(min-width: 1024px)').matches;
    return desktop
        ? { top: 48, left: 48, bottom: 48, right: 432 }
        : { top: 160, left: 32, right: 32, bottom: Math.round(window.innerHeight * 0.62) };
}

// Hoofdscherm: de kaart, volledig scherm, met zwevende bediening. De wijkenlijst
// is een zijpaneel (desktop) of bottom sheet (mobiel).
export default function Kaart() {
    const toast = useToast();
    const mapRef = useRef(null);
    const historyRequestId = useRef(0);

    const [regionData, setRegionData] = useState([]);
    const [regionsLoading, setRegionsLoading] = useState(true);
    const [dataFailed, setDataFailed] = useState(false);
    const [stations, setStations] = useState([]);
    const [metric, setMetric] = useState('temperature');
    const [selectedId, setSelectedId] = useState(null);
    const [sheetOpen, setSheetOpen] = useState(false);
    const [locating, setLocating] = useState(false);

    const [history, setHistory] = useState([]);
    const [historyLoading, setHistoryLoading] = useState(false);

    useEffect(() => {
        document.title = 'Kaart';
    }, []);

    const loadData = useCallback(() => {
        const now = new Date().toISOString();
        setRegionsLoading(true);
        setDataFailed(false);
        backendApi.get(`/Meetstation/stationsMetMeasurements?timestamp=${now}`)
            .then(resp => setStations(resp.data))
            .catch(() => setDataFailed(true));
        backendApi.get(`/neighbourhood/history?timestamp=${now}`)
            .then(resp => setRegionData(resp.data))
            .catch(() => setDataFailed(true))
            .finally(() => setRegionsLoading(false));
    }, []);

    useEffect(() => {
        loadData();
    }, [loadData]);

    const selectedRegion = selectedId !== null ? regionData.find(r => r.id === selectedId) ?? null : null;

    // Geschiedenis van de gekozen wijk; de teller voorkomt dat een trage vorige
    // respons de grafiek van een nieuwere keuze overschrijft.
    function fetchHistory(regionId) {
        const requestId = ++historyRequestId.current;
        setHistoryLoading(true);
        setHistory([]);
        backendApi.get(`/measurement/history/average/region/${regionId}?granularity=half-hour`)
            .then(resp => {
                if (requestId === historyRequestId.current) setHistory(resp.data);
            })
            .catch(() => {
                if (requestId === historyRequestId.current) setHistory([]);
            })
            .finally(() => {
                if (requestId === historyRequestId.current) setHistoryLoading(false);
            });
    }

    // Een klik in lijst of zoekveld laat de kaart inzoomen; bij een klik op de
    // kaart staat de wijk al in beeld.
    function selectRegion(region, { zoom = true } = {}) {
        setSelectedId(region.id);
        setSheetOpen(true);
        fetchHistory(region.id);
        if (zoom) mapRef.current?.focusRegion(region, focusPadding());
    }

    function selectRegionFromMap(properties) {
        const region = regionData.find(r => String(r.id) === String(properties.id)) ?? properties;
        selectRegion(region, { zoom: false });
    }

    const closeRegion = useCallback(() => {
        historyRequestId.current++;
        setSelectedId(null);
    }, []);

    // Escape sluit het detailsheet.
    useEffect(() => {
        if (selectedId === null) return undefined;
        const onKeyDown = (e) => { if (e.key === 'Escape') closeRegion(); };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [selectedId, closeRegion]);

    async function locate() {
        setLocating(true);
        const result = await mapRef.current?.locate();
        setLocating(false);
        if (result === 'outside') toast.info('Je locatie ligt buiten het meetgebied.');
        else if (result !== 'ok') toast.error('Je locatie is niet beschikbaar. Controleer of locatietoegang is toegestaan.');
    }

    const showDetail = selectedRegion !== null;
    const panelTitle = showDetail ? selectedRegion.name : `Wijken (${regionData.length})`;

    return (
        <div className="kaart">
            <NewMap
                ref={mapRef}
                centerX={MAP_CENTER.x}
                centerY={MAP_CENTER.y}
                zoom={MAP_CENTER.zoom}
                regionData={regionData}
                stations={stations}
                metric={metric}
                onMetricChange={setMetric}
                selectedRegionId={selectedId}
                onRegionClick={selectRegionFromMap}
                controls={
                    <div className="flex flex-col gap-2">
                        <MapControls
                            regions={regionData}
                            onSelectRegion={selectRegion}
                            onLocate={locate}
                            onZoomIn={() => mapRef.current?.zoomIn()}
                            onZoomOut={() => mapRef.current?.zoomOut()}
                            locating={locating}
                        />
                        <SummaryStrip stations={stations} regions={regionData} loading={regionsLoading} compact />
                    </div>
                }
                bottomInsetClassName="inset-x-3 bottom-[calc(var(--sheet-peek)+0.75rem)] lg:bottom-3 lg:right-[25.5rem]"
            />

            <MapPanel
                title={panelTitle}
                showTitleOnDesktop={!showDetail}
                expanded={sheetOpen}
                onToggle={() => setSheetOpen(open => !open)}
            >
                {showDetail ? (
                    <RegionDetails
                        region={selectedRegion}
                        onClose={closeRegion}
                        loading={historyLoading}
                        history={history}
                        metric={metric}
                    />
                ) : (
                    <>
                        {dataFailed && (
                            <div role="alert" className="mb-3 flex flex-col items-start gap-2 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-900">
                                <p className="m-0 flex items-center gap-2">
                                    <i className="bi bi-exclamation-triangle" aria-hidden="true"></i>
                                    Het ophalen van de gegevens is mislukt.
                                </p>
                                <Button variant="primary" onClick={loadData}>
                                    <i className="bi bi-arrow-clockwise" aria-hidden="true"></i>
                                    Opnieuw proberen
                                </Button>
                            </div>
                        )}
                        <RegionList
                            regionData={regionData}
                            loading={regionsLoading}
                            metric={metric}
                            selectedId={selectedId}
                            onRegionClick={selectRegion}
                        />
                    </>
                )}
            </MapPanel>
        </div>
    );
}
