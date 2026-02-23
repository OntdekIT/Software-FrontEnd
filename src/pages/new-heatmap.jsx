import { useEffect, useRef, useState } from "react";
import PropTypes from 'prop-types';
import { backendApi } from "../utils/backend-api.jsx";
import { MapContainer, TileLayer, useMap, CircleMarker, Popup } from "react-leaflet";
import L from 'leaflet';
import { contours as d3Contours } from 'd3-contour';
import './new-heatmap.css';

function TemperatureCanvasLayer({ measurements, heatmapType, show, colorMode, relativeFactor, showContours }) {
    const map = useMap();
    const canvasLayerRef = useRef(null);
    const renderTimeoutRef = useRef(null);

    useEffect(() => {
        if (!show) {
            if (canvasLayerRef.current) {
                map.removeLayer(canvasLayerRef.current);
                canvasLayerRef.current = null;
            }
            return;
        }

        const CanvasLayer = L.Layer.extend({
            onAdd: function (map) {
                const size = map.getSize();
                this._canvas = L.DomUtil.create('canvas');
                this._canvas.width = size.x;
                this._canvas.height = size.y;
                this._canvas.style.position = 'absolute';
                this._canvas.style.zIndex = 400;
                this._canvas.style.pointerEvents = 'none';

                map.getPanes().overlayPane.appendChild(this._canvas);
                this._map = map;

                map.on('moveend', this._debouncedReset, this);
                map.on('zoomend', this._debouncedReset, this);
                this._reset();
            },

            onRemove: function (map) {
                L.DomUtil.remove(this._canvas);
                map.off('moveend', this._debouncedReset, this);
                map.off('zoomend', this._debouncedReset, this);
                if (renderTimeoutRef.current) {
                    clearTimeout(renderTimeoutRef.current);
                }
            },

            _debouncedReset: function () {
                if (renderTimeoutRef.current) {
                    clearTimeout(renderTimeoutRef.current);
                }
                renderTimeoutRef.current = setTimeout(() => {
                    this._reset();
                }, 100);
            },

            _reset: function () {
                const topLeft = this._map.containerPointToLayerPoint([0, 0]);
                L.DomUtil.setPosition(this._canvas, topLeft);
                this._render();
            },

            _render: function () {
                if (!measurements || measurements.length === 0) return;

                const canvas = this._canvas;
                const ctx = canvas.getContext('2d');
                const size = this._map.getSize();

                canvas.width = size.x;
                canvas.height = size.y;

                const validMeasurements = measurements.filter(m =>
                    m.latitude && m.longitude &&
                    m[heatmapType] !== null && m[heatmapType] !== undefined
                );

                if (validMeasurements.length === 0) return;

                let unit = '°C';
                if (heatmapType === 'humidity') unit = '%';
                else if (heatmapType === 'particulate') unit = 'μg/m³';

                const points = validMeasurements.map(m => {
                    const point = this._map.latLngToContainerPoint([m.latitude, m.longitude]);
                    return {
                        x: point.x,
                        y: point.y,
                        temp: m[heatmapType]
                    };
                });

                const temps = points.map(p => p.temp);
                let minTemp, maxTemp;

                if (colorMode === 'dynamic') {
                    minTemp = Math.min(...temps);
                    maxTemp = Math.max(...temps);
                } else if (colorMode === 'balanced') {
                    const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
                    if (heatmapType === 'particulate') {
                        minTemp = Math.max(0, avg - 10);
                        maxTemp = avg + 10;
                    } else if (heatmapType === 'humidity') {
                        minTemp = Math.max(0, avg - 20);
                        maxTemp = Math.min(100, avg + 20);
                    } else {
                        minTemp = avg - 5;
                        maxTemp = avg + 5;
                    }
                } else if (colorMode === 'relative') {
                    const avg = temps.reduce((a, b) => a + b, 0) / temps.length;
                    const stdDev = Math.sqrt(
                        temps.reduce((sum, temp) => sum + Math.pow(temp - avg, 2), 0) / temps.length
                    );
                    minTemp = avg - stdDev * relativeFactor;
                    maxTemp = avg + stdDev * relativeFactor;
                } else {
                    if (heatmapType === 'particulate') {
                        minTemp = 0;
                        maxTemp = 50;
                    } else if (heatmapType === 'humidity') {
                        minTemp = 0;
                        maxTemp = 100;
                    } else {
                        minTemp = 0;
                        maxTemp = 30;
                    }
                }

                const power = 2;
                const step = 2;

                const contourCell = 3;
                const gw = Math.ceil(size.x / contourCell);
                const gh = Math.ceil(size.y / contourCell);
                const tempGrid = new Float32Array(gw * gh);

                for (let gy = 0; gy < gh; gy++) {
                    const y = gy * contourCell;
                    for (let gx = 0; gx < gw; gx++) {
                        const x = gx * contourCell;
                        let weightedSum = 0;
                        let weightSum = 0;

                        for (const point of points) {
                            const dx = x - point.x;
                            const dy = y - point.y;
                            const dist = Math.sqrt(dx * dx + dy * dy);

                            if (dist < 1) {
                                weightedSum = point.temp;
                                weightSum = 1;
                                break;
                            }

                            const weight = 1 / Math.pow(dist, power);
                            weightedSum += point.temp * weight;
                            weightSum += weight;
                        }

                        tempGrid[gy * gw + gx] = weightSum > 0 ? (weightedSum / weightSum) : NaN;
                    }
                }

                const imageData = ctx.createImageData(size.x, size.y);
                const data = imageData.data;

                for (let y = 0; y < size.y; y += step) {
                    for (let x = 0; x < size.x; x += step) {
                        const gx = Math.floor(x / contourCell);
                        const gy = Math.floor(y / contourCell);
                        const interpolatedTemp = tempGrid[gy * gw + gx];

                        if (!isNaN(interpolatedTemp)) {
                            const normalized = Math.max(0, Math.min(1,
                                (interpolatedTemp - minTemp) / (maxTemp - minTemp)
                            ));
                            const color = this._getColor(normalized);

                            for (let dy = 0; dy < step && y + dy < size.y; dy++) {
                                for (let dx = 0; dx < step && x + dx < size.x; dx++) {
                                    const idx = ((y + dy) * size.x + (x + dx)) * 4;
                                    data[idx] = color.r;
                                    data[idx + 1] = color.g;
                                    data[idx + 2] = color.b;
                                    data[idx + 3] = 60;
                                }
                            }
                        }
                    }
                }

                ctx.putImageData(imageData, 0, 0);

                if (this._showContours) {
                    this._drawContours(ctx, { x: gw, y: gh }, contourCell, tempGrid, unit);
                }
            },

            _drawContours: function (ctx, gridSize, cell, values, unit) {
                 let dataMin = Infinity;
                 let dataMax = -Infinity;
                 for (let i = 0; i < values.length; i++) {
                     if (!isNaN(values[i])) {
                         dataMin = Math.min(dataMin, values[i]);
                         dataMax = Math.max(dataMax, values[i]);
                     }
                 }

                const levelCount = 20;
                const levels = [];
                 if (isFinite(dataMax) && isFinite(dataMin) && dataMax > dataMin) {
                     const stepVal = (dataMax - dataMin) / levelCount;
                     for (let i = 1; i <= levelCount; i++) {
                         levels.push(dataMin + i * stepVal);
                     }
                 } else {
                     levels.push((dataMin + dataMax) / 2);
                 }

                 const iso = d3Contours()
                     .size([gridSize.x, gridSize.y])
                     .smooth(true)
                     .thresholds(levels)(values);

                 ctx.save();
                 ctx.lineWidth = 0.8;
                 ctx.strokeStyle = 'rgba(0, 0, 0, 0.7)';
                 ctx.lineJoin = 'round';
                 ctx.lineCap = 'round';

                 for (const c of iso) {
                     for (const multi of c.coordinates) {
                         for (const ring of multi) {
                             ctx.beginPath();
                             for (let i = 0; i < ring.length; i++) {
                                 const px = ring[i][0] * cell;
                                 const py = ring[i][1] * cell;
                                 if (i === 0) ctx.moveTo(px, py);
                                 else ctx.lineTo(px, py);
                            }
                            ctx.closePath();
                            ctx.stroke();
                        }
                     }
                 }

                 ctx.font = 'bold 16px Arial';
                 ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
                 ctx.strokeStyle = 'white';
                 ctx.lineWidth = 3;
                 ctx.textAlign = 'center';
                 ctx.textBaseline = 'middle';

                 const placedLabels = [];

                 const hasCollision = (x, y, minDistance) => {
                     for (const label of placedLabels) {
                         const dx = x - label.x;
                         const dy = y - label.y;
                         const dist = Math.sqrt(dx * dx + dy * dy);
                         if (dist < minDistance) return true;
                     }
                     return false;
                 };

                 let minPos = { x: 0, y: 0 };
                 let maxPos = { x: 0, y: 0 };

                 for (let i = 0; i < values.length; i++) {
                     if (!isNaN(values[i])) {
                         if (values[i] === dataMin) {
                             const y = Math.floor(i / gridSize.x);
                             const x = i % gridSize.x;
                             minPos = { x: x * cell, y: y * cell };
                         }
                         if (values[i] === dataMax) {
                             const y = Math.floor(i / gridSize.x);
                             const x = i % gridSize.x;
                             maxPos = { x: x * cell, y: y * cell };
                         }
                     }
                 }

                 if (dataMin !== Infinity) {
                     const text = `${dataMin.toFixed(1)} ${unit}`;
                     ctx.strokeText(text, minPos.x, minPos.y);
                     ctx.fillText(text, minPos.x, minPos.y);
                     placedLabels.push({ x: minPos.x, y: minPos.y });
                 }

                 if (dataMax !== -Infinity) {
                     const text = `${dataMax.toFixed(1)} ${unit}`;
                     ctx.strokeText(text, maxPos.x, maxPos.y);
                     ctx.fillText(text, maxPos.x, maxPos.y);
                     placedLabels.push({ x: maxPos.x, y: maxPos.y });
                 }

                 const minLabelDistance = 60;

                 for (const c of iso) {
                     const temp = `${c.value.toFixed(1)} ${unit}`;

                     for (const multi of c.coordinates) {
                         for (const ring of multi) {
                             if (ring.length < 5) continue;

                            let sumX = 0, sumY = 0;
                            for (const point of ring) {
                                sumX += point[0];
                                sumY += point[1];
                            }
                            const centroidX = (sumX / ring.length) * cell;
                            const centroidY = (sumY / ring.length) * cell;

                            let minDistToEdge = Infinity;
                            for (const point of ring) {
                                const dx = (point[0] * cell) - centroidX;
                                const dy = (point[1] * cell) - centroidY;
                                const dist = Math.sqrt(dx * dx + dy * dy);
                                minDistToEdge = Math.min(minDistToEdge, dist);
                            }

                            if (minDistToEdge > 25 && !hasCollision(centroidX, centroidY, minLabelDistance)) {
                                ctx.strokeText(temp, centroidX, centroidY);
                                ctx.fillText(temp, centroidX, centroidY);
                                placedLabels.push({ x: centroidX, y: centroidY });
                            }
                         }
                     }
                 }

                 ctx.restore();
             },

            _getColor: function (value) {
                if (value < 0.25) {
                    const t = value / 0.25;
                    return { r: 0, g: Math.round(255 * t), b: 255 };
                } else if (value < 0.5) {
                    const t = (value - 0.25) / 0.25;
                    return { r: 0, g: 255, b: Math.round(255 * (1 - t)) };
                } else if (value < 0.75) {
                    const t = (value - 0.5) / 0.25;
                    return { r: Math.round(255 * t), g: 255, b: 0 };
                } else {
                    const t = (value - 0.75) / 0.25;
                    return { r: 255, g: Math.round(255 * (1 - t)), b: 0 };
                }
            }
        });

        if (!canvasLayerRef.current) {
            const layer = new CanvasLayer();
            layer._showContours = showContours;
            layer._heatmapType = heatmapType;
            canvasLayerRef.current = layer;
            map.addLayer(canvasLayerRef.current);
        } else {
            canvasLayerRef.current._showContours = showContours;
            canvasLayerRef.current._heatmapType = heatmapType;
            canvasLayerRef.current._reset();
        }

        return () => {
            if (canvasLayerRef.current) {
                map.removeLayer(canvasLayerRef.current);
                canvasLayerRef.current = null;
            }
        };
    }, [map, measurements, heatmapType, show, colorMode, relativeFactor, showContours]);

    return null;
}

TemperatureCanvasLayer.propTypes = {
    measurements: PropTypes.arrayOf(PropTypes.shape({
        latitude: PropTypes.number,
        longitude: PropTypes.number,
        temperature: PropTypes.number
    })),
    heatmapType: PropTypes.string.isRequired,
    show: PropTypes.bool.isRequired,
    colorMode: PropTypes.oneOf(['dynamic', 'balanced', 'relative', 'absolute']).isRequired,
    relativeFactor: PropTypes.number.isRequired,
    showContours: PropTypes.bool.isRequired
};

function MeasurementMarkers({ measurements, heatmapType }) {
    const validMeasurements = measurements.filter(m =>
        m.latitude && m.longitude &&
        m[heatmapType] !== null && m[heatmapType] !== undefined
    );

    const getLabel = () => {
        switch(heatmapType) {
            case 'humidity': return 'Luchtvochtigheid';
            case 'particulate': return 'Fijnstof (PM2.5)';
            default: return 'Temperatuur';
        }
    };

    const getUnit = () => {
        switch(heatmapType) {
            case 'humidity': return '%';
            case 'particulate': return 'μg/m³';
            default: return '°C';
        }
    };

    return (
        <>
            {validMeasurements.map((m, idx) => (
                <CircleMarker
                    key={idx}
                    center={[m.latitude, m.longitude]}
                    radius={6}
                    fillColor="#ffffff"
                    color="#000000"
                    weight={2}
                    fillOpacity={0.9}
                >
                    <Popup>
                        <div>
                            <strong>Meetstation</strong><br />
                            {getLabel()}: {m[heatmapType].toFixed(1)} {getUnit()}<br />
                            Locatie: {m.latitude.toFixed(4)}, {m.longitude.toFixed(4)}
                        </div>
                    </Popup>
                </CircleMarker>
            ))}
        </>
    );
}


MeasurementMarkers.propTypes = {
    measurements: PropTypes.arrayOf(PropTypes.shape({
        latitude: PropTypes.number,
        longitude: PropTypes.number,
        temperature: PropTypes.number
    })),
    heatmapType: PropTypes.string.isRequired
};

function getColorString(value) {
    let r, g, b;
    if (value < 0.25) {
        const t = value / 0.25;
        r = 0; g = Math.round(255 * t); b = 255;
    } else if (value < 0.5) {
        const t = (value - 0.25) / 0.25;
        r = 0; g = 255; b = Math.round(255 * (1 - t));
    } else if (value < 0.75) {
        const t = (value - 0.5) / 0.25;
        r = Math.round(255 * t); g = 255; b = 0;
    } else {
        const t = (value - 0.75) / 0.25;
        r = 255; g = Math.round(255 * (1 - t)); b = 0;
    }
    return `rgb(${r}, ${g}, ${b})`;
}

const Legend = ({ measurements, heatmapType, relativeFactor = 1.0, inline = true }) => {
    const valid = (measurements || []).filter(m => m.latitude && m.longitude && m[heatmapType] !== null && m[heatmapType] !== undefined);
    const values = valid.map(m => m[heatmapType]);

    let unit = '°C';
    if (heatmapType === 'humidity') unit = '%';
    else if (heatmapType === 'particulate') unit = 'μg/m³';

    let minVal, maxVal;
    if (values.length === 0) {
        if (heatmapType === 'particulate') { minVal = 0; maxVal = 50; }
        else if (heatmapType === 'humidity') { minVal = 0; maxVal = 100; }
        else { minVal = 0; maxVal = 30; }
    } else {
        const avg = values.reduce((a,b)=>a+b,0)/values.length;
        const stdDev = Math.sqrt(values.reduce((s,v)=>s+Math.pow(v-avg,2),0)/values.length);
        minVal = avg - stdDev * relativeFactor;
        maxVal = avg + stdDev * relativeFactor;
    }

    if (maxVal <= minVal) { const c = (maxVal + minVal)/2 || 0; minVal = c - 1; maxVal = c + 1; }

    const stops = [0, 0.25, 0.5, 0.75, 1];
    const colorStops = stops.map(s => `${getColorString(s)} ${Math.round(s*100)}%`).join(', ');
    const gradientStyle = { background: `linear-gradient(to right, ${colorStops})`, height: inline ? '10px' : '12px', borderRadius: '6px' };

    const container = inline ? { padding: 0 } : { position: 'absolute', right: 12, bottom: 12, zIndex: 1000 };

    const label = heatmapType === 'humidity' ? 'Luchtvochtigheid' : (heatmapType === 'particulate' ? 'Fijnstof (PM2.5)' : 'Temperatuur');

    return (
        <div style={container} className={inline ? 'legend-inline' : ''} aria-label={`${label} legenda`}>
            <div style={{ fontWeight: 600, marginBottom: inline ? 4 : 6 }}>{label} <span style={{ fontWeight: 400, marginLeft: 6 }}>({unit})</span></div>
            <div style={gradientStyle} aria-hidden="true" />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 6, fontSize: inline ? 12 : 13 }}>
                <div>{minVal.toFixed(1)} {unit}</div>
                <div>{maxVal.toFixed(1)} {unit}</div>
            </div>
        </div>
    );
};

Legend.propTypes = { measurements: PropTypes.array, heatmapType: PropTypes.string.isRequired, relativeFactor: PropTypes.number, inline: PropTypes.bool };

function MapControls({
                         showTemp, setShowTemp,
                         showContours, setShowContours,
                         dateTime, setDateTime,
                         toLocalInput, fromLocalInput,
                         heatmapType, setHeatmapType,
                         measurements, colorMode, relativeFactor
                     }) {
    const [open, setOpen] = useState(true);

    return (
        <div className={`map-controls compact ${open ? 'open' : 'collapsed'}`} aria-hidden={!open && undefined}>
            <button
                className="mc-collapse"
                onClick={() => setOpen(v => !v)}
                title={open ? 'Sluit' : 'Open'}
                aria-label="Toggle controls"
            >
                {open ? '✕' : '☰'}
            </button>

            <div className="mc-group">
                <button
                    className={`icon-btn ${showTemp ? 'active' : ''}`}
                    onClick={() => setShowTemp(v => !v)}
                    title={showTemp ? 'Verberg heatmap' : 'Toon heatmap'}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M12 3v10" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/><path d="M8 7c0-2.2 1.8-4 4-4s4 1.8 4 4v10c0 2.2-1.8 4-4 4s-4-1.8-4-4V7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                    <span className="mc-label">{showTemp ? 'Verberg' : 'Toon'}</span>
                </button>

                <button
                    className={`icon-btn ${showContours ? 'active' : ''}`}
                    onClick={() => setShowContours(v => !v)}
                    title={showContours ? 'Verberg contourlijnen' : 'Toon contourlijnen'}
                >
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M3 12s4-6 9-6 9 6 9 6-4 6-9 6S3 12 3 12z" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/><path d="M12 6v12" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg>
                    <span className="mc-label">Contouren</span>
                </button>
            </div>

            <div className="mc-block">
                <div className="mc-row">
                    <strong className="mc-title">Type</strong>
                </div>
                <div className="segmented">
                    <button
                        className={`seg-btn ${heatmapType === 'temperature' ? 'active' : ''}`}
                        onClick={() => setHeatmapType('temperature')}
                        title="Temperatuur"
                    >Temp</button>
                    <button
                        className={`seg-btn ${heatmapType === 'humidity' ? 'active' : ''}`}
                        onClick={() => setHeatmapType('humidity')}
                        title="Luchtvochtigheid"
                    >Humidity</button>
                    <button
                        className={`seg-btn ${heatmapType === 'particulate' ? 'active' : ''}`}
                        onClick={() => setHeatmapType('particulate')}
                        title="Fijnstof"
                    >PM2.5</button>
                </div>
            </div>

            <div className="mc-block">
                <div className="mc-row">
                    <strong className="mc-title">Legenda</strong>
                </div>
                <div style={{ paddingTop: 6 }}>
                    <Legend measurements={measurements} heatmapType={heatmapType} relativeFactor={relativeFactor} inline />
                </div>
            </div>

            <div className="mc-block">
                <div className="mc-row">
                    <strong className="mc-title">Tijd</strong>
                    <button
                        className="btn-small"
                        onClick={() => setDateTime(new Date())}
                        title="Nu"
                    >Nu</button>
                </div>
                <input
                    className="mc-datetime"
                    type="datetime-local"
                    value={toLocalInput(dateTime)}
                    onChange={(e) => setDateTime(fromLocalInput(e.target.value))}
                    aria-label="Kies tijdstip voor kaart"
                />
            </div>
        </div>
    );
}


MapControls.propTypes = {
    showTemp: PropTypes.bool.isRequired,
    setShowTemp: PropTypes.func.isRequired,
    showContours: PropTypes.bool.isRequired,
    setShowContours: PropTypes.func.isRequired,
    dateTime: PropTypes.instanceOf(Date).isRequired,
    setDateTime: PropTypes.func.isRequired,
    toLocalInput: PropTypes.func.isRequired,
    fromLocalInput: PropTypes.func.isRequired,
    heatmapType: PropTypes.string.isRequired,
    setHeatmapType: PropTypes.func.isRequired,
    measurements: PropTypes.array,
    colorMode: PropTypes.string,
    relativeFactor: PropTypes.number
};


export default function Home() {
    const errRef = useRef();
    const [errMsg, setErrMsg] = useState('');
    const [measurements, setMeasurements] = useState([]);
    const [showTemp, setShowTemp] = useState(true);
    const [heatmapType, setHeatmapType] = useState('temperature');
    const colorMode = 'relative';
    const relativeFactor = 1.0;
    const [dateTime, setDateTime] = useState(new Date());
    const [showContours, setShowContours] = useState(false);

    const toLocalInput = (d) => {
        const off = d.getTimezoneOffset();
        const local = new Date(d.getTime() - off * 60000);
        return local.toISOString().slice(0, 16);
    };

    const fromLocalInput = (s) => {
        return new Date(s);
    };

    useEffect(() => {
        backendApi.get(`/measurement/history?timestamp=${dateTime.toISOString()}`)
            .then(resp => {
                console.log('Measurement data:', resp.data[0]);
                setMeasurements(resp.data);
            })
            .catch(() => setErrMsg('Het ophalen van de gegevens is mislukt'));
    }, [dateTime]);


    return (
        <>
            <title>Heatmap</title>
            {errMsg && (
                <div className="error-overlay">
                    <p ref={errRef} aria-live="assertive">{errMsg}</p>
                    <button className="btn btn-primary" onClick={() => window.location.reload(false)}>
                        Opnieuw proberen
                    </button>
                </div>
            )}

            <div className="heatmap-container">
                <MapContainer
                    center={[51.57898, 5.08772]}
                    zoom={12}
                    maxZoom={13}
                    minZoom={11}
                    zoomSnap={0.5}
                    zoomDelta={0.5}
                    wheelPxPerZoomLevel={120}
                    style={{ width: '100%', height: '100%' }}
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    <TemperatureCanvasLayer
                        measurements={measurements}
                        heatmapType={heatmapType}
                        show={showTemp}
                        colorMode={colorMode}
                        relativeFactor={relativeFactor}
                        showContours={showContours}
                    />
                    <MeasurementMarkers
                        measurements={measurements}
                        heatmapType={heatmapType}
                    />
                </MapContainer>
            </div>

            <MapControls
                showTemp={showTemp} setShowTemp={setShowTemp}
                showContours={showContours} setShowContours={setShowContours}
                dateTime={dateTime} setDateTime={setDateTime}
                toLocalInput={toLocalInput} fromLocalInput={fromLocalInput}
                heatmapType={heatmapType} setHeatmapType={setHeatmapType}
                measurements={measurements}
                colorMode={colorMode}
                relativeFactor={relativeFactor}
            />
        </>
    );
}
