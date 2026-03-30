import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function NewMap() {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current) return;

    const map = new maplibregl.Map({
      container: mapRef.current,
      style: 'https://tiles.openfreemap.org/styles/liberty',
      center: [5.0913, 51.5555],
      zoom: 12,
    });

    return () => map.remove();
  }, []);

  return <div ref={mapRef} style={{ width: '100%', height: '100vh' }} />;
}