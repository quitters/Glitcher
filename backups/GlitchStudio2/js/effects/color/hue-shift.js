/**
 * Color Effect: Hue Shift
 * Shifts the hue of the image
 */

export const hueShiftEffect = {
  name: 'hueShift',
  displayName: 'Hue Shift',
  category: 'color',
  
  // Clear parameter definitions with UI metadata
  params: {
    shift: {
      value: 180,
      min: 0,
      max: 360,
      step: 1,
      displayName: 'Shift Amount',
      tooltip: 'Amount to shift hue in degrees'
    }
  },
  
  // Process function that modifies ImageData in-place
  process(imageData, params, globalIntensity) {
    const { data } = imageData;
    const shiftAmount = (params.shift * globalIntensity) % 360;
    
    // Skip processing if shift is 0
    if (shiftAmount === 0) return;
    
    // Process each pixel in-place
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Convert RGB to HSL
      const hsl = rgbToHsl(r, g, b);
      
      // Shift the hue
      hsl[0] = (hsl[0] + shiftAmount / 360) % 1;
      
      // Convert back to RGB
      const rgb = hslToRgb(hsl[0], hsl[1], hsl[2]);
      
      // Update pixel data in-place
      data[i] = rgb[0];
      data[i + 1] = rgb[1];
      data[i + 2] = rgb[2];
      // Alpha remains unchanged
    }
  }
};

/**
 * Convert RGB color to HSL
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {Array} - HSL values [h, s, l]
 */
function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0; // achromatic
  } else {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h /= 6;
  }
  
  return [h, s, l];
}

/**
 * Convert HSL color to RGB
 * @param {number} h - Hue (0-1)
 * @param {number} s - Saturation (0-1)
 * @param {number} l - Lightness (0-1)
 * @returns {Array} - RGB values [r, g, b]
 */
function hslToRgb(h, s, l) {
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l; // achromatic
  } else {
    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  return [
    Math.round(r * 255),
    Math.round(g * 255),
    Math.round(b * 255)
  ];
}
