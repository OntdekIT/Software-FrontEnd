// This is your "Paint Brush" for regions
export const regionFillLayer = {
  id: 'regions-fill-layer',
  type: 'fill',
  paint: {
    // Look at the 'color' property in the GeoJSON to determine the fill color
    'fill-color': ['get', 'color'], 
    'fill-opacity': 0.6,
    'fill-outline-color': '#ffffff'
  }
};

// You can add a second brush for hover effects!
export const regionHoverLayer = {
  id: 'regions-hover-layer',
  type: 'line',
  paint: {
    'line-color': '#009ee3',
    'line-width': 3
  }
};