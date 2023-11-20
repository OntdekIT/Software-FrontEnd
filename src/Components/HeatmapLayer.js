import { useMap } from 'react-leaflet';
import HeatmapOverlay from 'leaflet-heatmap/leaflet-heatmap.js';

const HeatmapLayer = ({ data, visible, type }) => {
    let maxval = 0;
    data.forEach(meting => {
        if (meting[type] > maxval) {
            maxval = meting[type];
        }
    });

    data = {
        max: maxval,
        min: 0,
        data: 
            data.map(meting => {
                return {
                    lat: meting.latitude,
                    lng: meting.longitude,
                    val: meting[type],
                    count: 1
                }
            })
    };

    const radius_preview = 0.015;
    // Gradient color should taper off exponentially towards the bottom and top
    const gradient_current = {
        '.05': 'blue',
        '.5': 'green',
        '.6': 'yellow',
        '.8': 'gold',
        '.9': 'orange',
        '.95': 'darkorange',
        '.99': 'orangered',
        '.995': 'red',
        '1': 'firebrick'
    }

    const tempConfig = {
        // radius should be small ONLY if scaleRadius is true (or small radius is intended)
        // if scaleRadius is false it will be the constant radius used in pixels
        "radius": radius_preview,
        "maxOpacity": .8,
        // scales the radius based on map zoom
        "scaleRadius": true,
        // if set to false the heatmap uses the global maximum for colorization
        // if activated: uses the data maximum within the current map boundaries
        //   (there will always be a red spot with useLocalExtremas true)
        "useLocalExtrema": false,
        // enter n keys between 0 and 1 here for gradient color customization
        "gradient": gradient_current,
        // which field name in your data represents the latitude - default "lat"
        latField: 'lat',
        // which field name in your data represents the longitude - default "lng"
        lngField: 'lng',
        // which field name in your data represents the data value - default "value"
        valueField: 'val'
    };
    
    const map = useMap();
    const heatmapLayer = new HeatmapOverlay(tempConfig);
    heatmapLayer.setData(data);

    if (visible) {
        map.eachLayer(function (layer) {
            if (layer._heatmap)
                layer.remove();
        })
        map.addLayer(heatmapLayer);
    } else {
        map.eachLayer(function (layer) {
            if (layer._heatmap)
                layer.remove();
        })
    }
}

export default HeatmapLayer;