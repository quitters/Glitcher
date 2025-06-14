/**
 * Image Processing Utilities
 * Common functions for image manipulation
 */

/**
 * Create a copy of image data
 * @param {ImageData} imageData - Source image data
 * @returns {ImageData} - Copy of the image data
 */
export function cloneImageData(imageData) {
  return new ImageData(
    new Uint8ClampedArray(imageData.data),
    imageData.width,
    imageData.height
  );
}

/**
 * Get pixel value at specific coordinates
 * @param {ImageData} imageData - Image data
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @returns {Array} - RGBA values [r, g, b, a]
 */
export function getPixel(imageData, x, y) {
  const { width, height, data } = imageData;
  
  // Ensure coordinates are within bounds
  if (x < 0) x = 0;
  if (y < 0) y = 0;
  if (x >= width) x = width - 1;
  if (y >= height) y = height - 1;
  
  const index = (y * width + x) * 4;
  return [
    data[index],
    data[index + 1],
    data[index + 2],
    data[index + 3]
  ];
}

/**
 * Set pixel value at specific coordinates
 * @param {ImageData} imageData - Image data
 * @param {number} x - X coordinate
 * @param {number} y - Y coordinate
 * @param {Array} rgba - RGBA values [r, g, b, a]
 */
export function setPixel(imageData, x, y, rgba) {
  const { width, height, data } = imageData;
  
  // Ensure coordinates are within bounds
  if (x < 0 || y < 0 || x >= width || y >= height) return;
  
  const index = (y * width + x) * 4;
  data[index] = rgba[0];
  data[index + 1] = rgba[1];
  data[index + 2] = rgba[2];
  data[index + 3] = rgba[3];
}

/**
 * Apply a convolution kernel to image data
 * @param {ImageData} imageData - Source image data
 * @param {Array} kernel - Convolution kernel matrix
 * @param {number} divisor - Divisor for normalization
 * @param {number} offset - Offset to add to result
 * @returns {ImageData} - Processed image data
 */
export function applyConvolution(imageData, kernel, divisor = 1, offset = 0) {
  const { width, height } = imageData;
  const result = cloneImageData(imageData);
  const kernelSize = Math.sqrt(kernel.length);
  const kernelHalfSize = Math.floor(kernelSize / 2);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0;
      
      // Apply convolution
      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const pixelX = Math.min(width - 1, Math.max(0, x + kx - kernelHalfSize));
          const pixelY = Math.min(height - 1, Math.max(0, y + ky - kernelHalfSize));
          
          const kernelValue = kernel[ky * kernelSize + kx];
          const [pixelR, pixelG, pixelB] = getPixel(imageData, pixelX, pixelY);
          
          r += pixelR * kernelValue;
          g += pixelG * kernelValue;
          b += pixelB * kernelValue;
        }
      }
      
      // Apply divisor and offset
      r = Math.min(255, Math.max(0, Math.round(r / divisor + offset)));
      g = Math.min(255, Math.max(0, Math.round(g / divisor + offset)));
      b = Math.min(255, Math.max(0, Math.round(b / divisor + offset)));
      
      // Get original alpha
      const [, , , a] = getPixel(imageData, x, y);
      
      // Set result pixel
      setPixel(result, x, y, [r, g, b, a]);
    }
  }
  
  return result;
}

/**
 * Convert RGB color to HSL
 * @param {number} r - Red (0-255)
 * @param {number} g - Green (0-255)
 * @param {number} b - Blue (0-255)
 * @returns {Array} - HSL values [h, s, l]
 */
export function rgbToHsl(r, g, b) {
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
export function hslToRgb(h, s, l) {
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

/**
 * Create a gradient map for color mapping effects
 * @param {Array} colors - Array of color stops [r, g, b]
 * @param {number} steps - Number of steps in the gradient
 * @returns {Array} - Array of RGB colors
 */
export function createGradientMap(colors, steps = 256) {
  const gradient = [];
  
  for (let i = 0; i < steps; i++) {
    const position = i / (steps - 1);
    const index = position * (colors.length - 1);
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.min(colors.length - 1, Math.ceil(index));
    
    const mixFactor = index - lowerIndex;
    
    const color1 = colors[lowerIndex];
    const color2 = colors[upperIndex];
    
    const r = Math.round(color1[0] + mixFactor * (color2[0] - color1[0]));
    const g = Math.round(color1[1] + mixFactor * (color2[1] - color1[1]));
    const b = Math.round(color1[2] + mixFactor * (color2[2] - color1[2]));
    
    gradient.push([r, g, b]);
  }
  
  return gradient;
}

/**
 * Calculate image histogram
 * @param {ImageData} imageData - Image data
 * @returns {Object} - Histogram data for each channel
 */
export function calculateHistogram(imageData) {
  const { data } = imageData;
  const histogram = {
    r: new Array(256).fill(0),
    g: new Array(256).fill(0),
    b: new Array(256).fill(0),
    luminance: new Array(256).fill(0)
  };
  
  for (let i = 0; i < data.length; i += 4) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    
    // Calculate luminance
    const luminance = Math.round(0.299 * r + 0.587 * g + 0.114 * b);
    
    histogram.r[r]++;
    histogram.g[g]++;
    histogram.b[b]++;
    histogram.luminance[luminance]++;
  }
  
  return histogram;
}

/**
 * Apply auto levels to image data
 * @param {ImageData} imageData - Image data
 * @param {number} blackPoint - Black point percentage (0-100)
 * @param {number} whitePoint - White point percentage (0-100)
 * @returns {ImageData} - Processed image data
 */
export function autoLevels(imageData, blackPoint = 1, whitePoint = 99) {
  const { data } = imageData;
  const result = cloneImageData(imageData);
  const resultData = result.data;
  
  // Calculate histogram
  const histogram = calculateHistogram(imageData);
  
  // Calculate black and white points for each channel
  const channels = ['r', 'g', 'b'];
  const levels = {};
  
  channels.forEach(channel => {
    const hist = histogram[channel];
    const total = hist.reduce((sum, val) => sum + val, 0);
    
    let blackLevel = 0;
    let whiteLevel = 255;
    
    // Find black point
    let sum = 0;
    for (let i = 0; i < 256; i++) {
      sum += hist[i];
      if (sum >= total * blackPoint / 100) {
        blackLevel = i;
        break;
      }
    }
    
    // Find white point
    sum = 0;
    for (let i = 255; i >= 0; i--) {
      sum += hist[i];
      if (sum >= total * (100 - whitePoint) / 100) {
        whiteLevel = i;
        break;
      }
    }
    
    levels[channel] = { black: blackLevel, white: whiteLevel };
  });
  
  // Apply levels adjustment
  for (let i = 0; i < data.length; i += 4) {
    channels.forEach((channel, idx) => {
      const value = data[i + idx];
      const { black, white } = levels[channel];
      
      // Normalize value between black and white points
      let newValue;
      if (value <= black) {
        newValue = 0;
      } else if (value >= white) {
        newValue = 255;
      } else {
        newValue = Math.round(255 * (value - black) / (white - black));
      }
      
      resultData[i + idx] = newValue;
    });
  }
  
  return result;
}
