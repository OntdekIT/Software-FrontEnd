export function RoundToOneDecimal(meting) {
    return Math.round(meting * 10) / 10;
}

// when adding and removing colors to this, also manually change the colors and distribution in src/Components/HeatmapLayer.js
export const spectralColors = {
    0: '#5568B8',
    1: '#4E96BC',
    2: '#60AB9E',
    3: '#77B77D',
    4: '#A6BE54',
    5: '#D1B541',
    6: '#E49C39',
    7: '#E67932',
    8: '#DF4828',
    9: '#B8221E'
}