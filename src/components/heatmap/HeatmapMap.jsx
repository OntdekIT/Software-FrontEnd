import { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import '../../utils/maplibre-worker.js'; // moet draaien voordat een kaart bestaat
import * as maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { INK, WHITE } from '../../utils/theme-colors.js';
import { KM_PER_DEG_LAT, KM_PER_DEG_LNG_AT_EQUATOR, boundsAround, buildGrid } from '../../utils/interpolation.js';
import { SURFACE_OPACITY, gridToRgba } from '../../utils/heatmap-render.js';
import { METRICS, formatMetricValue } from '../../utils/map-metrics.js';

// Zelfde zichtbaar gebied als de kaart (newmap.jsx).
const MAP_BOUNDS = [[4.90, 51.44], [5.25, 51.68]];
const LIMIT = { west: MAP_BOUNDS[0][0], south: MAP_BOUNDS[0][1], east: MAP_BOUNDS[1][0], north: MAP_BOUNDS[1][1] };
const CELL_KM = 0.06;
const MAX_CELLS = 260;

function surfaceCanvas(points, range, metric) {
    const bounds = boundsAround(points, undefined, LIMIT);
    if (!bounds || !range) return null;
    const midLat = (bounds.north + bounds.south) / 2;
    const widthKm = (bounds.east - bounds.west) * KM_PER_DEG_LNG_AT_EQUATOR * Math.cos((midLat * Math.PI) / 180);
    const heightKm = (bounds.north - bounds.south) * KM_PER_DEG_LAT;
    const cols = Math.min(MAX_CELLS, Math.max(2, Math.round(widthKm / CELL_KM)));
    const rows = Math.min(MAX_CELLS, Math.max(2, Math.round(heightKm / CELL_KM)));
    const grid = buildGrid(points, bounds, cols, rows);
    const canvas = document.createElement('canvas');
    canvas.width = cols;
    canvas.height = rows;
    const image = new ImageData(gridToRgba(grid, range, METRICS[metric].palette), cols, rows);
    canvas.getContext('2d').putImageData(image, 0, 0);
    return { canvas, bounds };
}

function spotElement(kind, text) {
    const el = document.createElement('div');
    el.className = 'heatmap-spot';
    el.dataset.kind = kind;
    el.textContent = text;
    return el;
}

// De kaart van de heatmap: kleurvlak als beeldlaag, stations als kleine punten,
// labels voor de warmste en koudste plek en een markering op de aangeklikte plek.
export default function HeatmapMap({ points, metric, range, hot, cold, labels, picked, onPick }) {
    const containerRef = useRef(null);
    const mapRef = useRef(null);
    const markersRef = useRef([]);
    const pickRef = useRef(null);
    const onPickRef = useRef(onPick);
    const [ready, setReady] = useState(false);

    useEffect(() => {
        onPickRef.current = onPick;
    }, [onPick]);

    useEffect(() => {
        let cancelled = false;
        async function init() {
            const styleUrl = import.meta.env.VITE_MAP_STYLE_URL ?? 'https://tiles.openfreemap.org/styles/liberty';
            let style;
            try {
                style = await (await fetch(styleUrl)).json();
            } catch {
                return;
            }
            if (cancelled) return;
            const map = new maplibregl.Map({
                container: containerRef.current,
                style,
                center: [5.0913, 51.5555],
                zoom: 12,
                maxBounds: MAP_BOUNDS,
                attributionControl: { compact: true },
            });
            mapRef.current = map;
            map.on('load', () => {
                map.addSource('stations', { type: 'geojson', data: { type: 'FeatureCollection', features: [] } });
                map.addLayer({
                    id: 'stations-dots',
                    type: 'circle',
                    source: 'stations',
                    paint: {
                        'circle-radius': 3.5,
                        'circle-color': INK,
                        'circle-stroke-color': WHITE,
                        'circle-stroke-width': 1.5,
                    },
                });
                map.on('click', (e) => onPickRef.current?.({ lat: e.lngLat.lat, lng: e.lngLat.lng }));
                map.on('mouseenter', 'stations-dots', () => { map.getCanvas().style.cursor = 'pointer'; });
                map.on('mouseleave', 'stations-dots', () => { map.getCanvas().style.cursor = ''; });
                setReady(true);
            });
        }
        init();
        return () => {
            cancelled = true;
            markersRef.current.forEach((m) => m.remove());
            markersRef.current = [];
            pickRef.current?.remove();
            pickRef.current = null;
            mapRef.current?.remove();
            mapRef.current = null;
            setReady(false);
        };
    }, []);

    // Kleurvlak en stationspunten.
    useEffect(() => {
        const map = mapRef.current;
        if (!ready || !map) return;

        map.getSource('stations').setData({
            type: 'FeatureCollection',
            features: points.map((p) => ({
                type: 'Feature',
                properties: { id: p.id },
                geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
            })),
        });

        const surface = surfaceCanvas(points, range, metric);
        if (map.getLayer('surface')) map.removeLayer('surface');
        if (map.getSource('surface')) map.removeSource('surface');
        if (!surface) return;
        const { west, south, east, north } = surface.bounds;
        map.addSource('surface', {
            type: 'image',
            url: surface.canvas.toDataURL('image/png'),
            coordinates: [[west, north], [east, north], [east, south], [west, south]],
        });
        map.addLayer(
            { id: 'surface', type: 'raster', source: 'surface', paint: { 'raster-opacity': SURFACE_OPACITY, 'raster-fade-duration': 0 } },
            'stations-dots'
        );
    }, [ready, points, range, metric]);

    // Labels voor warmste en koudste plek.
    useEffect(() => {
        const map = mapRef.current;
        if (!ready || !map) return;
        markersRef.current.forEach((m) => m.remove());
        markersRef.current = [];
        [[hot, 'hot', labels.hot], [cold, 'cold', labels.cold]].forEach(([spot, kind, label]) => {
            if (!spot) return;
            const text = `${label}: ${formatMetricValue(metric, spot.value)}`;
            markersRef.current.push(
                new maplibregl.Marker({ element: spotElement(kind, text), anchor: 'bottom', offset: [0, -8] })
                    .setLngLat([spot.lng, spot.lat])
                    .addTo(map)
            );
        });
    }, [ready, hot, cold, labels, metric]);

    // Markering op de aangeklikte plek.
    useEffect(() => {
        const map = mapRef.current;
        if (!ready || !map) return;
        pickRef.current?.remove();
        pickRef.current = null;
        if (!picked) return;
        const el = document.createElement('div');
        el.className = 'heatmap-pick';
        el.setAttribute('role', 'img');
        el.setAttribute('aria-label', 'Gekozen plek');
        pickRef.current = new maplibregl.Marker({ element: el }).setLngLat([picked.lng, picked.lat]).addTo(map);
    }, [ready, picked]);

    return <div ref={containerRef} className="h-full w-full" data-testid="heatmap-map" />;
}

HeatmapMap.propTypes = {
    points: PropTypes.array.isRequired,
    metric: PropTypes.string.isRequired,
    range: PropTypes.shape({ min: PropTypes.number, max: PropTypes.number }),
    hot: PropTypes.object,
    cold: PropTypes.object,
    labels: PropTypes.shape({ hot: PropTypes.string, cold: PropTypes.string }).isRequired,
    picked: PropTypes.shape({ lat: PropTypes.number, lng: PropTypes.number }),
    onPick: PropTypes.func,
};
