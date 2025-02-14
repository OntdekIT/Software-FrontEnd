export function roundToOneDecimal(meting) {
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

export const gradient = {
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