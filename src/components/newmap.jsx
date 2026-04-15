import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { spectralColors } from '../utils/map-utils.jsx'; // Adjust path if needed

// 1. Helper function to format your API data into GeoJSON
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
      let color = "rgba(136,136,136,0.5)"; // Default gray for NaN
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
          color: color
        },
        geometry: {
          type: 'Polygon',
          // Swap Leaflet [Lat, Lng] to MapLibre [Lng, Lat]
          coordinates: [region.coordinates.map(c => [c[1], c[0]])]
        }
      };
    })
  };
}


export default function NewMap({ centerX, centerY, zoom, regionData, onRegionClick }) {
  const mapRef = useRef(null);
  const mapInstance = useRef(null);

  // Initialize the map and load the style
  useEffect(() => {
    if (!mapRef.current || mapInstance.current) return;

    async function initMap() {
      try {
        // Fetch the style EXACTLY like your original code did
        const res = await fetch('https://tiles.openfreemap.org/styles/liberty');
        const styleJson = await res.json();

        mapInstance.current = new maplibregl.Map({
          container: mapRef.current,
          style: styleJson, // Pass the actual JSON object here!
          center: [centerX, centerY],
          zoom: zoom,
        });

        // Wait for the map to finish drawing the base style
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

          // Handle clicks
          mapInstance.current.on('click', 'regions-fill', (e) => {
            if (e.features.length > 0 && onRegionClick) {
              onRegionClick(e.features[0].properties);
            }
          });

          // Cursor effects
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

  // Watch for data changes and update the map layer
  useEffect(() => {
    if (!mapInstance.current || !regionData || regionData.length === 0) return;

    const updateMapData = () => {
      const source = mapInstance.current.getSource('regions');
      if (source) {
        source.setData(createRegionGeoJSON(regionData));
      }
    };

    // Because the map initialization is now async, we must ensure it's fully loaded
    if (mapInstance.current.isStyleLoaded()) {
      updateMapData();
    } else {
      mapInstance.current.once('load', updateMapData);
    }
  }, [regionData]);

  return <div ref={mapRef} style={{ width: '100%', height: '100%' }} />;
}