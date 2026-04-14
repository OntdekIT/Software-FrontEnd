import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function NewMap({ centerX, centerY, zoom }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    let map;

    async function initMap() {
      try {
        const res = await fetch('https://tiles.openfreemap.org/styles/liberty');
        const style = await res.json();

        map = new maplibregl.Map({
          container: mapRef.current,
          style: style,
          center: [centerX, centerY],
          zoom: zoom,
          pitch: 0,
          maxPitch: 0,
          bearing: 0,
          maxBearing: 0,
          dragRotate: false,
          pitchWithRotate: false,
          touchZoomRotate: false,
        });
      } azatch (err) {
        console.error('Error loading map style:', err);
      }
    }

    initMap();

    return () => {
      if (map) map.remove();
    };
  }, [centerX, centerY, zoom]);

  return <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />;
}