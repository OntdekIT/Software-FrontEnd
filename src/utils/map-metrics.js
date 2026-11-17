import { parseMeasurement } from './region-status.js';
import { pmColors, spectralColors } from './color-scale.js';

// Welke lagen de kaart kent en hoe elke laag eruitziet. Kaart, legenda, lijst en
// detailsheet lezen allemaal uit deze tabel, zodat eenheid en kleurschaal overal
// hetzelfde zijn.
export const METRICS = {
    temperature: {
        id: 'temperature',
        label: 'Temperatuur',
        unit: '°C',
        // veld in /neighbourhood/history en in de timelapse-frames
        key: 'avgTemp',
        // veld in /measurement/history/average/region/{id}
        historyKey: 'avg',
        nowLabel: 'Gem. temperatuur nu',
        palette: spectralColors,
    },
    pm25: {
        id: 'pm25',
        label: 'Fijnstof (PM2.5)',
        unit: '\u00b5g/m\u00b3',
        key: 'avgPm25',
        historyKey: 'pm25',
        nowLabel: 'Gem. PM2.5 nu',
        palette: pmColors,
    },
};

export const METRIC_IDS = Object.keys(METRICS);

/** Waarde met eenheid, bijvoorbeeld "12.3\u00b0C", of null als er geen echte meting is. */
export function formatMetricValue(metricId, value) {
    const n = parseMeasurement(value);
    if (n === null) return null;
    const metric = METRICS[metricId] ?? METRICS.temperature;
    return metric.unit === '\u00b0C' ? `${n.toFixed(1)}${metric.unit}` : `${n.toFixed(1)} ${metric.unit}`;
}

/** Waarde en eenheid apart, voor een groot getal met een kleine eenheid; null zonder echte meting. */
export function formatMetricParts(metricId, value) {
    const n = parseMeasurement(value);
    if (n === null) return null;
    const metric = METRICS[metricId] ?? METRICS.temperature;
    return { number: n.toFixed(1), unit: metric.unit };
}
