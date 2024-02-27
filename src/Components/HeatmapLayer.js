import { useMap } from 'react-leaflet';
import HeatmapOverlay from 'leaflet-heatmap/leaflet-heatmap.js';
import { spectralColors } from '../Lib/Utility.js';

const HeatmapLayer = ({ data, visible, type }) => {
    let maxval = -1000;
    let minval = 1000;

    data.forEach(meting => {
        if (meting[type]) {
            if (meting[type] > maxval) {
                maxval = meting[type];
            }
            if (meting[type] < minval) {
                minval = meting[type];
            }
        }
    });

    //translates the relevant fields for the heatmap
    const heatmapReadyData = [];
    data.map(meting => {
        if (meting[type]) {
            heatmapReadyData.push(
                {
                    lat: meting.latitude,
                    lng: meting.longitude,
                    val: meting[type],
                    count: 1
                });
        }
    });

    //loads data into final object for heatmap
    data = {
        max: maxval,
        min: minval - ((maxval - minval) * 0.5),
        data: heatmapReadyData
    };

    const radius_preview = 0.015;
    // Gradient color should taper off exponentially towards the bottom and top
    const rainbow_gradient = {
        '.20': spectralColors[0],
        '.32': spectralColors[1],
        '.44': spectralColors[2],
        '.56': spectralColors[3],
        '.68': spectralColors[4],
        '.77': spectralColors[5],
        '.84': spectralColors[6],
        '.90': spectralColors[7],
        '.95': spectralColors[8],
        '1': spectralColors[9]
    }

    const tempConfig = {
        // radius should be small ONLY if scaleRadius is true (or small radius is intended)
        // if scaleRadius is false it will be the constant radius used in pixels
        "radius": radius_preview,
        "maxOpacity": .85,
        "minOpacity": .08,
        // scales the radius based on map zoom
        "scaleRadius": true,
        // if set to false the heatmap uses the global maximum for colorization
        // if activated: uses the data maximum within the current map boundaries
        //   (there will always be a red spot with useLocalExtremas true)
        "useLocalExtrema": false,
        // enter n keys between 0 and 1 here for gradient color customization
        "gradient": rainbow_gradient,
        // which field name in your data represents the latitude - default "lat"
        latField: 'lat',
        // which field name in your data represents the longitude - default "lng"
        lngField: 'lng',
        // which field name in your data represents the data value - default "value"
        valueField: 'val',
    };

    const map = useMap();
    const heatmapLayer = new HeatmapOverlay(tempConfig);
    heatmapLayer.setData(data);

    if (visible) {
        //looks for existing heatmap to update
        map.eachLayer(function (layer) {
            if (layer._heatmap)
                layer.remove();
        })
        map.addLayer(heatmapLayer);
    }
    else {
        map.eachLayer(function (layer) {
            if (layer._heatmap)
                layer.remove();
        })
    }
}

export default HeatmapLayer;