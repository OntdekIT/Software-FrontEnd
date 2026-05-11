import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { spectralColors } from '../utils/map-utils.jsx';

function createRegionGeoJSON(data) {
  let minT = 1000, maxT = -1000;
  data.forEach(d => {
    const t = parseFloat(d.avgTemp);
    if (!isNaN(t)) {
      if (t < minT) minT = t;
      if (t > maxT) maxT = t;
    }
  });
  let tempDif = maxT - minT !== 0 ? maxT - minT : 1;

  return {
    type: 'FeatureCollection',
    features: data.map(region => {
      let color = "rgba(136,136,136,0.5)";
      const avgTemp = parseFloat(region.avgTemp);
      if (!isNaN(avgTemp)) {
        let contrastValue = (avgTemp - minT) / tempDif;
        let colorIndex = Math.round(contrastValue * (Object.keys(spectralColors).length - 1));
        color = spectralColors[colorIndex];
      }

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

export default function NewMap({ centerX, centerY, zoom, regionData, onRegionClick, pmRegionIds = [] }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    async function initMap() {
      try {
        const res = await fetch('https://tiles.openfreemap.org/styles/liberty');
        const styleJson = await res.json();

        mapInstance.current = new maplibregl.Map({
          container: mapRef.current,
          style: styleJson,
          center: [centerX, centerY],
          zoom: zoom,
          bounds: [
            [4.98, 51.48],
            [5.16, 51.62]
          ],
        });

        mapInstance.current.on('load', () => {
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

          mapInstance.current.on('click', 'regions-fill', (e) => {
            if (e.features.length > 0 && onRegionClick) {
              onRegionClick(e.features[0].properties);
            }
          });

          mapInstance.current.on('mouseenter', 'regions-fill', () => {
            mapInstance.current.getCanvas().style.cursor = 'pointer';
          });
          mapInstance.current.on('mouseleave', 'regions-fill', () => {
            mapInstance.current.getCanvas().style.cursor = '';
          });
        });

      } catch (err) {
        console.error('Error loading map style:', err);
      }
    }

    initMap();

    return () => {
      if (mapInstance.current) {
        mapInstance.current.remove();
        mapInstance.current = null;
      }
    };
  }, [centerX, centerY, zoom]);

  useEffect(() => {
    if (!mapInstance.current || !regionData || regionData.length === 0) return;

    const updateMapData = () => {
      const source = mapInstance.current.getSource('regions');
      if (source) {
        source.setData(createRegionGeoJSON(regionData));
      }
    };

    if (mapInstance.current.isStyleLoaded()) {
      updateMapData();
    } else {
      mapInstance.current.once('load', updateMapData);
    }
  }, [regionData]);

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

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}