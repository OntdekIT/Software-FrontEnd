import { forwardRef, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import '../utils/maplibre-worker.js'; // must run before any map is created
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { NO_DATA_COLOR, colorFor, computeValueRange, legendSteps } from '../utils/color-scale.js';
import { METRICS, METRIC_IDS, formatMetricValue } from '../utils/map-metrics.js';
import { NO_RECENT_DATA_LABEL } from '../utils/region-status.js';

// Effectieve kleurschaal voor een metriek: de vaste schaal van de pagina
// (time-lapse) of anders min/max van de huidige dataset. Kaart en legenda
// gebruiken dezelfde functie, zodat ze niet uit elkaar kunnen lopen.
function resolveColorRange(data, key, colorRange) {
  // Normaal wordt de kleurschaal per dataset bepaald. Bij een time-lapse mag dat
  // niet: als elk frame zich op zijn eigen min/max schaalt, ziet een koude nacht
  // er net zo bont uit als een warme middag en zie je juist geen verandering.
  // De pagina geeft dan via colorRange één schaal mee voor de hele reeks.
  if (colorRange && isFinite(colorRange.min) && isFinite(colorRange.max)) {
    return { min: colorRange.min, max: colorRange.max };
  }
  return computeValueRange(data, key);
}

function createRegionGeoJSON(data, metricId = 'temperature', colorRange = null) {
  const { key, palette } = METRICS[metricId];
  const range = resolveColorRange(data, key, colorRange);

  return {
    type: 'FeatureCollection',
    features: data.map(region => {
      const value = parseFloat(region[key]);
      const color = colorFor(value, range, palette);

      return {
        type: 'Feature',
        properties: {
          id: region.id,
          name: region.name,
          avgTemp: region.avgTemp,
          avgPm25: region.avgPm25 ?? null,
          color: color
        },
        geometry: {
          type: 'Polygon',
          coordinates: [region.coordinates.map(c => [c[1], c[0]])]
        }
      };
    })
  };
}

// Pull [lng, lat] out of a station regardless of the exact field names the
// backend uses (latitude/longitude, lat/lng, lat/lon). Returns null when the
// coords are missing or not finite so callers can skip that station.
function getStationLngLat(station) {
  const lat = parseFloat(station.latitude ?? station.lat);
  const lng = parseFloat(station.longitude ?? station.lng ?? station.lon);
  if (!isFinite(lat) || !isFinite(lng)) return null;
  return [lng, lat];
}

// Small Tailwind-styled DOM node used as the maplibre marker glyph.
function createStationMarkerElement() {
  const el = document.createElement('div');
  el.className =
    'h-3.5 w-3.5 cursor-pointer rounded-full border-2 border-white bg-brand-500 shadow-md ' +
    'ring-1 ring-brand-600/40 transition-transform hover:scale-125';
  el.setAttribute('role', 'button');
  el.setAttribute('aria-label', 'Meetstation');
  return el;
}

// Popup body for a station: name + a brand-styled link to its details page.
function buildStationPopupHtml(station) {
  const name = station.name ?? 'Meetstation';
  const id = station.id ?? station.stationid;
  const link = id != null
    ? `<a href="/stations/${id}" style="display:inline-block;margin-top:6px;padding:4px 10px;border-radius:8px;background:#4fa94d;color:#fff;font-size:12px;font-weight:500;text-decoration:none;">Bekijk details</a>`
    : '';
  return `<div style="font-size:12px;line-height:1.4;color:#1f2937;">`
    + `<div style="font-weight:600;margin-bottom:2px;">${name}</div>`
    + link
    + `</div>`;
}

// Bounding box [[west, south], [east, north]] van een wijk. coordinates komt als
// [lat, lng]-paren uit de backend.
function regionBounds(region) {
  const points = Array.isArray(region?.coordinates) ? region.coordinates : [];
  if (points.length === 0) return null;
  const lats = points.map(c => c[0]);
  const lngs = points.map(c => c[1]);
  return [
    [Math.min(...lngs), Math.min(...lats)],
    [Math.max(...lngs), Math.max(...lats)]
  ];
}

const NewMap = forwardRef(function NewMap({ centerX, centerY, zoom, regionData, onRegionClick, metric = 'temperature', onMetricChange, selectedRegionId = null, stations = [], colorRange = null, overlay = null }, ref) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const popupRef = useRef(null);
  const markersRef = useRef([]);
  const metricRef = useRef(metric);
  // Pas true als de bronnen en lagen bestaan. Effecten die de kaart vullen wachten
  // hierop, zodat data die sneller binnenkomt dan de kaartstijl niet verloren gaat.
  const [mapLoaded, setMapLoaded] = useState(false);

  // keep the ref in sync so map event closures read the current metric
  metricRef.current = metric;

  // Laat de pagina (bijvoorbeeld de wijkenlijst) de kaart naar een wijk sturen.
  useImperativeHandle(ref, () => ({
    focusRegion(region) {
      const bounds = regionBounds(region);
      if (!mapInstance.current || !bounds) return;
      mapInstance.current.fitBounds(bounds, { padding: 48, maxZoom: 15, duration: 600 });
    }
  }), []);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    async function initMap() {
      try {
        const styleUrl = import.meta.env.VITE_MAP_STYLE_URL ?? 'https://tiles.openfreemap.org/styles/liberty';
        const res = await fetch(styleUrl);
        const styleJson = await res.json();

        mapInstance.current = new maplibregl.Map({
          container: mapRef.current,
          style: styleJson,
          center: [centerX, centerY],
          zoom: zoom,
          maxBounds: [
              [4.90, 51.44],
              [5.25, 51.68]
            ]
        });

        // navigation, geolocate ("mijn locatie") and fullscreen controls
        mapInstance.current.addControl(new maplibregl.NavigationControl(), 'top-right');
        mapInstance.current.addControl(
          new maplibregl.GeolocateControl({
            positionOptions: { enableHighAccuracy: true },
            trackUserLocation: true,
            showUserLocation: true
          }),
          'top-right'
        );
        mapInstance.current.addControl(new maplibregl.FullscreenControl(), 'top-right');

        mapInstance.current.on('load', () => {
          if (!mapInstance.current.getSource('regions')) {
            mapInstance.current.addSource('regions', {
              type: 'geojson',
              data: { type: 'FeatureCollection', features: [] }
            });

            mapInstance.current.addLayer({
              id: 'regions-fill',
              type: 'fill',
              source: 'regions',
              paint: {
                'fill-color': ['get', 'color'],
                'fill-opacity': 0.7,
                // Donkere rand: de lichte kleurstappen (bijna wit) blijven zo
                // afleesbaar tegen de kaartondergrond.
                'fill-outline-color': '#4b5563'
              }
            });

            // Geselecteerde wijk: witte rand met een donkere lijn erbovenop, zodat
            // de markering op elke kleur en op de kaartondergrond zichtbaar blijft.
            ['regions-selected-casing', 'regions-selected'].forEach((id, i) => {
              mapInstance.current.addLayer({
                id,
                type: 'line',
                source: 'regions',
                layout: { 'line-join': 'round' },
                paint: {
                  'line-color': i === 0 ? '#ffffff' : '#111827',
                  'line-width': i === 0 ? 6 : 3
                },
                filter: ['==', ['get', 'id'], -1]
              });
            });
          }

          setMapLoaded(true);

          mapInstance.current.on('click', 'regions-fill', (e) => {
            if (e.features.length > 0 && onRegionClick) {
              onRegionClick(e.features[0].properties);
            }
          });

          mapInstance.current.on('mouseenter', 'regions-fill', (e) => {
            mapInstance.current.getCanvas().style.cursor = 'pointer';

            if (!popupRef.current) {
              popupRef.current = new maplibregl.Popup({
                closeButton: false,
                closeOnClick: false,
                className: 'region-hover-popup'
              });
            }

            const feature = e.features && e.features[0];
            if (feature) {
              popupRef.current
                .setLngLat(e.lngLat)
                .setHTML(buildPopupHtml(feature.properties))
                .addTo(mapInstance.current);
            }
          });

          mapInstance.current.on('mousemove', 'regions-fill', (e) => {
            if (popupRef.current && e.features && e.features[0]) {
              popupRef.current
                .setLngLat(e.lngLat)
                .setHTML(buildPopupHtml(e.features[0].properties));
            }
          });

          mapInstance.current.on('mouseleave', 'regions-fill', () => {
            mapInstance.current.getCanvas().style.cursor = '';
            if (popupRef.current) {
              popupRef.current.remove();
            }
          });
        });

      } catch (err) {
        console.error('Error loading map style:', err);
      }
    }

    function buildPopupHtml(regionProps) {
      const name = regionProps.name ?? 'Onbekend gebied';
      const temp = formatMetricValue('temperature', regionProps.avgTemp);
      const pm25 = formatMetricValue('pm25', regionProps.avgPm25);
      const rows = [`<div style="font-weight:600;margin-bottom:2px;">${name}</div>`];
      const noData = `<div style="color:#4b5563;">${NO_RECENT_DATA_LABEL}</div>`;
      if (temp === null && pm25 === null) {
        rows.push(noData);
      } else {
        rows.push(temp !== null
          ? `<div>Gem. temperatuur: <strong>${temp}</strong></div>`
          : `<div style="color:#4b5563;">Temperatuur: ${NO_RECENT_DATA_LABEL}</div>`);
        if (pm25 !== null) {
          rows.push(`<div>Gem. PM2.5: <strong>${pm25}</strong></div>`);
        } else if (metricRef.current === 'pm25') {
          rows.push(`<div style="color:#4b5563;">PM2.5: ${NO_RECENT_DATA_LABEL}</div>`);
        }
      }
      return `<div style="font-size:12px;line-height:1.4;color:#1f2937;">${rows.join('')}</div>`;
    }

    initMap();

    return () => {
      if (popupRef.current) {
        popupRef.current.remove();
        popupRef.current = null;
      }
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
      setMapLoaded(false);
    };
    // onRegionClick intentionally omitted: including it would re-create the
    // whole map on every parent render. The click handler reads the latest
    // prop via closure at call time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerX, centerY, zoom]);

  useEffect(() => {
    if (!mapLoaded || !regionData || regionData.length === 0) return;

    const source = mapInstance.current.getSource('regions');
    if (source) {
      source.setData(createRegionGeoJSON(regionData, metric, colorRange));
    }
  }, [mapLoaded, regionData, metric, colorRange]);

  useEffect(() => {
    if (!mapLoaded) return;

    const filter = ['==', ['get', 'id'], selectedRegionId ?? -1];
    ['regions-selected-casing', 'regions-selected'].forEach(id => {
      if (mapInstance.current.getLayer(id)) mapInstance.current.setFilter(id, filter);
    });
  }, [mapLoaded, selectedRegionId]);

  // Render one maplibre marker per station. Rebuilds on every stations change
  // (clears old markers first) and guards against stations without coords.
  useEffect(() => {
    if (!mapLoaded) return;

    const renderMarkers = () => {
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      if (!Array.isArray(stations)) return;

      stations.forEach(station => {
        const lngLat = getStationLngLat(station);
        if (!lngLat) return; // skip stations with missing/invalid coords

        const popup = new maplibregl.Popup({ offset: 16, closeButton: true })
          .setHTML(buildStationPopupHtml(station));

        const marker = new maplibregl.Marker({ element: createStationMarkerElement() })
          .setLngLat(lngLat)
          .setPopup(popup)
          .addTo(mapInstance.current);

        markersRef.current.push(marker);
      });
    };

    renderMarkers();
  }, [mapLoaded, stations]);

  // does the data carry any pm2.5 readings? controls the toggle affordance
  const hasPm25 = Array.isArray(regionData)
    && regionData.some(r => r && r.avgPm25 != null && r.avgPm25 !== '');

  const activeMetric = METRICS[metric] ?? METRICS.temperature;
  const legendRange = useMemo(
    () => resolveColorRange(regionData ?? [], activeMetric.key, colorRange),
    [regionData, activeMetric, colorRange]
  );
  const scaleSteps = legendRange ? legendSteps(legendRange, activeMetric.palette) : [];
  const legendMid = legendRange ? (legendRange.min + legendRange.max) / 2 : null;

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />

      {/* Laagkeuze: één plek voor temperatuur en fijnstof (linksboven) */}
      <div
        role="radiogroup"
        aria-label="Kaartlaag"
        className="absolute left-3 top-3 z-10 flex overflow-hidden rounded-lg border border-gray-300 bg-white shadow-md"
      >
        {METRIC_IDS.map((id) => {
          const option = METRICS[id];
          const unavailable = id === 'pm25' && !hasPm25;
          const active = metric === id;
          return (
            <button
              key={id}
              type="button"
              role="radio"
              aria-checked={active}
              disabled={unavailable}
              onClick={() => onMetricChange?.(id)}
              title={unavailable ? 'Geen PM2.5-data beschikbaar' : `Toon ${option.label.toLowerCase()}`}
              className={`px-3 py-1.5 text-sm font-medium transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-gray-900 ${
                active
                  ? 'bg-brand-500 font-semibold text-gray-900'
                  : 'bg-white text-gray-800 hover:bg-brand-50'
              } ${unavailable ? 'cursor-not-allowed text-gray-500 hover:bg-white' : ''}`}
            >
              {option.label}
            </button>
          );
        })}
      </div>

      {/* Legenda: eenheid, schaal en kleur voor wijken zonder meting */}
      <div
        className="absolute bottom-3 left-3 z-10 rounded-lg border border-gray-300 bg-white p-3 shadow-md"
        role="group"
        aria-label={`Legenda ${activeMetric.label}`}
      >
        <div className="mb-1.5 text-xs font-semibold text-gray-900">
          {activeMetric.label} ({activeMetric.unit})
        </div>
        <div className="flex h-3 w-44 overflow-hidden rounded border border-gray-400">
          {scaleSteps.map((step) => (
            <div
              key={step.color}
              className="h-full flex-1"
              style={{ backgroundColor: step.color }}
              title={`${step.from.toFixed(1)} tot ${step.to.toFixed(1)} ${activeMetric.unit}`}
            />
          ))}
        </div>
        <div className="mt-1 flex w-44 justify-between text-xs text-gray-700">
          <span>{legendRange ? legendRange.min.toFixed(1) : '-'}</span>
          <span>{legendMid !== null ? legendMid.toFixed(1) : ''}</span>
          <span>{legendRange ? legendRange.max.toFixed(1) : '-'}</span>
        </div>
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-700">
          <span
            className="inline-block h-3 w-5 rounded border border-gray-400"
            style={{ backgroundColor: NO_DATA_COLOR }}
            aria-hidden="true"
          />
          {NO_RECENT_DATA_LABEL}
        </div>
      </div>

      {/* Ruimte voor bediening van de pagina, bijvoorbeeld de tijdslider.
          pointer-events-none op de wrapper zodat de kaart eromheen sleepbaar
          blijft; de inhoud zet hem zelf weer aan. */}
      {overlay && (
        <div className="pointer-events-none absolute bottom-3 left-1/2 z-10 w-[min(42rem,calc(100%-1.5rem))] -translate-x-1/2">
          {overlay}
        </div>
      )}
    </div>
  );
});

export default NewMap;

NewMap.propTypes = {
  centerX: PropTypes.number,
  centerY: PropTypes.number,
  zoom: PropTypes.number,
  regionData: PropTypes.array,
  onRegionClick: PropTypes.func,
  /** Actieve laag: 'temperature' of 'pm25'. */
  metric: PropTypes.oneOf(METRIC_IDS),
  onMetricChange: PropTypes.func,
  /** Id van de gemarkeerde wijk (omlijnd op de kaart). */
  selectedRegionId: PropTypes.number,
  stations: PropTypes.array,
  /** Vaste kleurschaal {min, max}; zonder deze wordt per dataset geschaald. */
  colorRange: PropTypes.shape({
    min: PropTypes.number,
    max: PropTypes.number,
  }),
  /** Bediening die over de kaart heen getoond wordt, onderaan gecentreerd. */
  overlay: PropTypes.node,
};
