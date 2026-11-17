import { useCallback, useEffect, useRef, useState } from 'react';
import { Link, useMatch, useNavigate } from 'react-router-dom';
import { backendApi } from '../utils/backend-api.jsx';
import { useToast } from '../components/ui/toast.jsx';
import NewMap from '../components/newmap.jsx';
import MapControls from '../components/kaart/MapControls.jsx';
import MapPanel from '../components/kaart/MapPanel.jsx';
import RegionList from '../components/Home/RegionList.jsx';
import RegionDetails from '../components/Home/RegionDetails.jsx';
import SummaryStrip from '../components/dashboard/SummaryStrip.jsx';
import Button from '../components/ui/Button.jsx';
import { buildShareUrl, parseWijkId, wijkPath } from '../utils/wijk-link.js';
import { KAART_PATH } from '../utils/legacy-routes.js';
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
// is een zijpaneel (desktop) of bottom sheet (mobiel). /wijk/:id opent dezelfde
// pagina met het detailsheet van die wijk, zodat de link te delen is.
export default function Kaart() {
    const navigate = useNavigate();
    const toast = useToast();
    const idParam = useMatch('/wijk/:id')?.params.id;
    const wijkId = parseWijkId(idParam);

    const mapRef = useRef(null);
    const historyRequestId = useRef(0);
    // Wijk die via een klik op de kaart gekozen is: staat al in beeld, dus niet inzoomen.
    const skipZoomId = useRef(null);

    const [regionData, setRegionData] = useState([]);
    const [regionsLoading, setRegionsLoading] = useState(true);
    const [dataFailed, setDataFailed] = useState(false);
    const [stations, setStations] = useState([]);
    const [metric, setMetric] = useState('temperature');
    const [sheetOpen, setSheetOpen] = useState(idParam !== undefined);
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

    const regionExists = wijkId !== null && regionData.some(r => r.id === wijkId);
    const selectedRegion = wijkId !== null ? regionData.find(r => r.id === wijkId) ?? null : null;
    const unknownRegion = idParam !== undefined && !regionsLoading && !dataFailed && !regionExists;

    // Geschiedenis van de gekozen wijk; de teller voorkomt dat een trage vorige
    // respons de grafiek van een nieuwere keuze overschrijft.
    useEffect(() => {
        if (!regionExists) return undefined;
        const requestId = ++historyRequestId.current;
        setHistoryLoading(true);
        setHistory([]);
        backendApi.get(`/measurement/history/average/region/${wijkId}?granularity=half-hour`)
            .then(resp => {
                if (requestId === historyRequestId.current) setHistory(resp.data);
            })
            .catch(() => {
                if (requestId === historyRequestId.current) setHistory([]);
            })
            .finally(() => {
                if (requestId === historyRequestId.current) setHistoryLoading(false);
            });
        return undefined;
    }, [wijkId, regionExists]);

    // Inzoomen op de gekozen wijk, ook bij een directe link (de kaart bewaart het verzoek tot hij klaar is).
    const selectedId = selectedRegion?.id ?? null;
    const selectedForZoom = useRef(null);
    selectedForZoom.current = selectedRegion;
    useEffect(() => {
        if (selectedId === null || skipZoomId.current === selectedId) return;
        mapRef.current?.focusRegion(selectedForZoom.current, focusPadding());
    }, [selectedId]);

    const closeRegion = useCallback(() => {
        navigate(KAART_PATH);
    }, [navigate]);

    // Escape sluit het detailsheet.
    useEffect(() => {
        if (idParam === undefined) return undefined;
        const onKeyDown = (e) => { if (e.key === 'Escape') closeRegion(); };
        window.addEventListener('keydown', onKeyDown);
        return () => window.removeEventListener('keydown', onKeyDown);
    }, [idParam, closeRegion]);

    function selectRegion(region) {
        skipZoomId.current = null;
        setSheetOpen(true);
        navigate(wijkPath(region.id));
    }

    function selectRegionFromMap(properties) {
        skipZoomId.current = Number(properties.id);
        setSheetOpen(true);
        navigate(wijkPath(properties.id));
    }

    async function shareRegion() {
        if (!selectedRegion) return;
        const url = buildShareUrl(window.location.origin, selectedRegion.id);
        if (navigator.share) {
            try {
                await navigator.share({ title: `${selectedRegion.name} op de klimaatkaart`, url });
            } catch {
                // De gebruiker sloot het deelvenster: geen fout.
            }
            return;
        }
        try {
            await navigator.clipboard.writeText(url);
            toast.success('Link gekopieerd');
        } catch {
            toast.error(`Kopieren is niet gelukt. Link: ${url}`);
        }
    }

    async function locate() {
        setLocating(true);
        const result = await mapRef.current?.locate();
        setLocating(false);
        if (result === 'outside') toast.info('Je locatie ligt buiten het meetgebied.');
        else if (result !== 'ok') toast.error('Je locatie is niet beschikbaar. Controleer of locatietoegang is toegestaan.');
    }

    const showDetail = selectedRegion !== null;
    const showNotFound = unknownRegion;
    let panelTitle = `Wijken (${regionData.length})`;
    if (showDetail) panelTitle = selectedRegion.name;
    else if (showNotFound) panelTitle = 'Wijk niet gevonden';

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
                showTitleOnDesktop={!showDetail && !showNotFound}
                expanded={sheetOpen}
                onToggle={() => setSheetOpen(open => !open)}
            >
                {showDetail && (
                    <RegionDetails
                        region={selectedRegion}
                        onClose={closeRegion}
                        onShare={shareRegion}
                        loading={historyLoading}
                        history={history}
                        metric={metric}
                    />
                )}

                {showNotFound && (
                    <div role="alert" className="flex flex-col items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
                        <p className="m-0 flex items-start gap-2 font-medium">
                            <i className="bi bi-exclamation-triangle mt-0.5" aria-hidden="true"></i>
                            Deze wijk bestaat niet of is niet meer beschikbaar.
                        </p>
                        <Link to={KAART_PATH} className="font-semibold text-red-900 underline">Terug naar de kaart</Link>
                    </div>
                )}

                {!showDetail && !showNotFound && (
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
