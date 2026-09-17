import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import '../utils/maplibre-worker.js'; // must run before any map is created
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { spectralColors } from '../utils/map-utils.jsx';

function computeColor(value, min, dif) {
  if (isNaN(value)) return 'rgba(136,136,136,0.5)';
  const contrastValue = (value - min) / dif;
  const colorIndex = Math.round(contrastValue * (Object.keys(spectralColors).length - 1));
  return spectralColors[colorIndex] ?? 'rgba(136,136,136,0.5)';
}

function createRegionGeoJSON(data, metric = 'temperature') {
  const key = metric === 'pm25' ? 'avgPm25' : 'avgTemp';

  let min = 1000, max = -1000;
  data.forEach(d => {
    const v = parseFloat(d[key]);
    if (!isNaN(v)) {
      if (v < min) min = v;
      if (v > max) max = v;
    }
  });
  const dif = max - min !== 0 ? max - min : 1;

  return {
    type: 'FeatureCollection',
    features: data.map(region => {
      const value = parseFloat(region[key]);
      const color = computeColor(value, min, dif);

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

export default function NewMap({ centerX, centerY, zoom, regionData, onRegionClick, pmRegionIds = [], stations = [] }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);
  const popupRef = useRef(null);
  const markersRef = useRef([]);
  const metricRef = useRef('temperature');
  const [metric, setMetric] = useState('temperature');

  // keep the ref in sync so map event closures read the current metric
  metricRef.current = metric;

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
                'fill-opacity': 0.6,
                'fill-outline-color': '#ffffff'
              }
            });

            mapInstance.current.addLayer({
              id: 'regions-pm-highlight',
              type: 'line',
              source: 'regions',
              paint: {
                'line-color': '#ff8800',
                'line-width': 3,
                'line-dasharray': [2, 1]
              },
              filter: ['==', 'id', -1]
            });
          }

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
      const temp = regionProps.avgTemp != null && regionProps.avgTemp !== '' ? `${regionProps.avgTemp} °C` : '—';
      const rows = [
        `<div style="font-weight:600;margin-bottom:2px;">${name}</div>`,
        `<div>Gem. temperatuur: <strong>${temp}</strong></div>`
      ];
      if (regionProps.avgPm25 != null && regionProps.avgPm25 !== '') {
        rows.push(`<div>Gem. PM2.5: <strong>${regionProps.avgPm25} µg/m³</strong></div>`);
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
    };
    // onRegionClick intentionally omitted: including it would re-create the
    // whole map on every parent render. The click handler reads the latest
    // prop via closure at call time.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [centerX, centerY, zoom]);

  useEffect(() => {
    if (!mapInstance.current || !regionData || regionData.length === 0) return;

    const updateMapData = () => {
      const source = mapInstance.current.getSource('regions');
      if (source) {
        source.setData(createRegionGeoJSON(regionData, metric));
      }
    };

    if (mapInstance.current.isStyleLoaded()) {
      updateMapData();
    } else {
      mapInstance.current.once('load', updateMapData);
    }
  }, [regionData, metric]);

  useEffect(() => {
    if (!mapInstance.current) return;

    const updateFilter = () => {
      if (!mapInstance.current.getLayer('regions-pm-highlight')) return;

      if (pmRegionIds.length === 0) {
        mapInstance.current.setFilter('regions-pm-highlight', ['==', 'id', -1]);
      } else {
        mapInstance.current.setFilter('regions-pm-highlight', [
          'in', ['get', 'id'], ['literal', pmRegionIds]
        ]);
      }
    };

    if (mapInstance.current.isStyleLoaded()) {
      updateFilter();
    } else {
      mapInstance.current.once('load', updateFilter);
    }
  }, [pmRegionIds]);

  // Render one maplibre marker per station. Rebuilds on every stations change
  // (clears old markers first) and guards against stations without coords.
  useEffect(() => {
    if (!mapInstance.current) return;

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

    if (mapInstance.current.isStyleLoaded()) {
      renderMarkers();
    } else {
      mapInstance.current.once('load', renderMarkers);
    }
  }, [stations]);

  // does the data carry any pm2.5 readings? controls the toggle affordance
  const hasPm25 = Array.isArray(regionData)
    && regionData.some(r => r && r.avgPm25 != null && r.avgPm25 !== '');

  const scaleStops = Object.keys(spectralColors)
    .map(Number)
    .sort((a, b) => a - b);

  const legendLabel = metric === 'pm25' ? 'PM2.5 (µg/m³)' : 'Temperatuur (°C)';

  return (
    <div className="relative h-full w-full">
      <div ref={mapRef} className="h-full w-full" />

      {/* layer toggle (top-left overlay) */}
      <div className="absolute left-3 top-3 z-10 flex overflow-hidden rounded-lg border border-gray-200 bg-white/95 shadow-md backdrop-blur">
        <button
          type="button"
          onClick={() => setMetric('temperature')}
          aria-pressed={metric === 'temperature'}
          className={`px-3 py-1.5 text-sm font-medium transition-colors ${
            metric === 'temperature'
              ? 'bg-brand-500 text-white'
              : 'bg-transparent text-gray-700 hover:bg-brand-50'
          }`}
        >
          Temperatuur
        </button>
        <button
          type="button"
          onClick={() => hasPm25 && setMetric('pm25')}
          aria-pressed={metric === 'pm25'}
          disabled={!hasPm25}
          title={hasPm25 ? 'Toon PM2.5' : 'Geen PM2.5-data beschikbaar'}
          className={`px-3 py-1.5 text-sm font-medium transition-colors ${
            metric === 'pm25'
              ? 'bg-brand-500 text-white'
              : 'bg-transparent text-gray-700 hover:bg-brand-50'
          } ${!hasPm25 ? 'cursor-not-allowed opacity-50 hover:bg-transparent' : ''}`}
        >
          PM2.5
        </button>
      </div>

      {/* temperature/pm2.5 colour legend (bottom-left overlay) */}
      <div className="absolute bottom-3 left-3 z-10 rounded-lg border border-gray-200 bg-white/95 p-3 shadow-md backdrop-blur">
        <div className="mb-1.5 text-xs font-semibold text-gray-700">{legendLabel}</div>
        <div className="flex h-3 w-40 overflow-hidden rounded">
          {scaleStops.map((stop) => (
            <div
              key={stop}
              className="h-full flex-1"
              style={{ backgroundColor: spectralColors[stop] }}
            />
          ))}
        </div>
        <div className="mt-1 flex justify-between text-[10px] text-gray-500">
          <span>Laag</span>
          <span>Hoog</span>
        </div>
      </div>
    </div>
  );
}

NewMap.propTypes = {
  centerX: PropTypes.number,
  centerY: PropTypes.number,
  zoom: PropTypes.number,
  regionData: PropTypes.array,
  onRegionClick: PropTypes.func,
  pmRegionIds: PropTypes.array,
  stations: PropTypes.array,
};
