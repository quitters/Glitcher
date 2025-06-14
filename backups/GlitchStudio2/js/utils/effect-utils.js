/**
 * Shared utility functions for effects
 * Common color conversions, math functions, and helpers
 */

/**
 * Clamp a value between min and max
 */
export function clamp(value, min = 0, max = 255) {
  return Math.max(min, Math.min(max, value));
}

/**
 * Convert RGB to HSL
 * @returns {Array} [h, s, l] where h is 0-1, s is 0-1, l is 0-1
 */
export function rgbToHsl(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h, s, l = (max + min) / 2;
  
  if (max === min) {
    h = s = 0;
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
 * Convert HSL to RGB
 * @param {number} h - Hue (0-1)
 * @param {number} s - Saturation (0-1)
 * @param {number} l - Lightness (0-1)
 * @returns {Array} [r, g, b] where values are 0-255
 */
export function hslToRgb(h, s, l) {
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
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
 * Convert RGB to Hue (0-360 degrees)
 */
export function rgbToHue(r, g, b) {
  r /= 255;
  g /= 255;
  b /= 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  
  if (max === min) {
    return 0;
  }
  
  const d = max - min;
  let h;
  
  switch (max) {
    case r:
      h = (g - b) / d + (g < b ? 6 : 0);
      break;
    case g:
      h = (b - r) / d + 2;
      break;
    case b:
      h = (r - g) / d + 4;
      break;
  }
  
  return (h / 6) * 360;
}

/**
 * Linear interpolation between two values
 */
export function lerp(a, b, t) {
  return a * (1 - t) + b * t;
}

/**
 * Map a value from one range to another
 */
export function map(value, inMin, inMax, outMin, outMax) {
  return ((value - inMin) / (inMax - inMin)) * (outMax - outMin) + outMin;
}

/**
 * Generate random integer between min and max (inclusive)
 */
export function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Generate random float between min and max
 */
export function randomFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/**
 * Calculate brightness/luminance of a color
 */
export function getBrightness(r, g, b) {
  // Using perceived brightness formula
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Apply a convolution kernel to image data
 * @param {ImageData} imageData - The image to process
 * @param {Array} kernel - Flattened convolution kernel
 * @param {number} kernelSize - Size of the kernel (e.g., 3 for 3x3)
 */
export function applyKernel(imageData, kernel, kernelSize = 3) {
  const { data, width, height } = imageData;
  const output = new Uint8ClampedArray(data);
  const halfSize = Math.floor(kernelSize / 2);
  
  for (let y = halfSize; y < height - halfSize; y++) {
    for (let x = halfSize; x < width - halfSize; x++) {
      let r = 0, g = 0, b = 0;
      
      for (let ky = 0; ky < kernelSize; ky++) {
        for (let kx = 0; kx < kernelSize; kx++) {
          const px = x + kx - halfSize;
          const py = y + ky - halfSize;
          const idx = (py * width + px) * 4;
          const kernelIdx = ky * kernelSize + kx;
          
          r += data[idx] * kernel[kernelIdx];
          g += data[idx + 1] * kernel[kernelIdx];
          b += data[idx + 2] * kernel[kernelIdx];
        }
      }
      
      const outputIdx = (y * width + x) * 4;
      output[outputIdx] = clamp(r);
      output[outputIdx + 1] = clamp(g);
      output[outputIdx + 2] = clamp(b);
    }
  }
  
  // Copy output back to original data
  for (let i = 0; i < data.length; i++) {
    data[i] = output[i];
  }
}

/**
 * Common convolution kernels
 */
export const kernels = {
  blur: [
    1/9, 1/9, 1/9,
    1/9, 1/9, 1/9,
    1/9, 1/9, 1/9
  ],
  sharpen: [
    0, -1, 0,
    -1, 5, -1,
    0, -1, 0
  ],
  emboss: [
    -2, -1, 0,
    -1, 1, 1,
    0, 1, 2
  ],
  edgeDetect: [
    -1, -1, -1,
    -1, 8, -1,
    -1, -1, -1
  ]
};
