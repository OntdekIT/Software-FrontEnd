// Replace the entire <MapContainer>...</MapContainer> block with:
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';

const mapRef = useRef(null);
const mapInstanceRef = useRef(null);

useEffect(() => {
  mapInstanceRef.current = new maplibregl.Map({
    container: mapRef.current,
    style: 'https://tiles.openfreemap.org/styles/liberty',
    center: [5.08772, 51.57898], // note: MapLibre is [lng, lat]
    zoom: 12,
  });
  return () => mapInstanceRef.current.remove();
}, []);

// Your canvas heatmap becomes a maplibregl.CustomLayerInterface
// — same canvas logic, just plugged into MapLibre's render cycle