import { useMap } from 'react-leaflet';
import HeatmapOverlay from 'leaflet-heatmap/leaflet-heatmap.js';
import { spectralColors } from "../../utils/map-utils.jsx";
import { useEffect, useState } from 'react';
import PropTypes from "prop-types";

//TODO: Fix crash when pressing heatmap radio button
export default function OldHeatmapLayer({ data, visible, type }) {
    const map = useMap();
    const [heatmapLayer, setHeatmapLayer] = useState(null);

    let maxval = Number.MIN_VALUE;
    let minval = Number.MAX_VALUE;

    // Calculate min and max values
    for (let measurement of data) {
        if (measurement[type]) {
            if (measurement[type] > maxval) {
                maxval = measurement[type];
            }
            if (measurement[type] < minval) {
                minval = measurement[type];
            }
        }
    }

    // Translates the relevant fields for the heatmap
    const heatmapReadyData = data
        .map(meting => {
            if (meting[type]) {
                return {
                    lat: meting.latitude,
                    lng: meting.longitude,
                    val: meting[type],
                    count: 1
                };
            }
            return null;
        })
        .filter(item => item !== null);

    const heatmapData = {
        max: maxval,
        min: minval - ((maxval - minval) * 0.5),
        data: heatmapReadyData
    };

    const rainbowGradient = {
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
    };

    const tempConfig = {
        radius: 0.015,
        maxOpacity: 0.85,
        minOpacity: 0.08,
        scaleRadius: true,
        useLocalExtrema: false,
        gradient: rainbowGradient,
        latField: 'lat',
        lngField: 'lng',
        valueField: 'val',
    };

    useEffect(() => {
        // Remove existing heatmap layers
        map.eachLayer(function (layer) {
            if (layer._heatmap) {
                map.removeLayer(layer);
            }
        });

        if (visible && heatmapReadyData.length > 0) {
            // Create new heatmap layer if it doesn't exist
            const newHeatmapLayer = new HeatmapOverlay(tempConfig);
            newHeatmapLayer.setData(heatmapData);
            map.addLayer(newHeatmapLayer);
            setHeatmapLayer(newHeatmapLayer);
        }

        return () => {
            // Cleanup the heatmap layer on unmount
            if (heatmapLayer) {
                map.removeLayer(heatmapLayer);
            }
        };
    }, [map, visible, heatmapData]);

    return null; // This component doesn't render any JSX
}

OldHeatmapLayer.propTypes = {
    data: PropTypes.arrayOf(PropTypes.object).isRequired,
    visible: PropTypes.bool.isRequired,
    type: PropTypes.string.isRequired,
};
