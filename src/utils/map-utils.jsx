import {spectralColors} from "./color-scale.js";

// De kleurschaal staat in color-scale.js zodat kaart en legenda dezelfde bron gebruiken.
export {spectralColors};

export function roundToOneDecimal(meting) {
    return Math.round(meting * 10) / 10;
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