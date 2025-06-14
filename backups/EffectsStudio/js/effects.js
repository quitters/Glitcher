// ========== Effects Library ==========
// This file contains all effect processors for the Effects Studio

// ========== Artistic Effects ==========

// Halftone Effect
function halftoneProcessor(imageData, params, globalIntensity) {
  const { width, height, data } = imageData;
  const dotSize = Math.max(1, Math.floor((params.dotSize || 8) * globalIntensity));
  const result = new ImageData(width, height);
  
  // Fill result with black
  for (let i = 0; i < result.data.length; i += 4) {
    result.data[i] = 0;
    result.data[i + 1] = 0;
    result.data[i + 2] = 0;
    result.data[i + 3] = 255;
  }
  
  // Create halftone pattern
  for (let y = 0; y < height; y += dotSize) {
    for (let x = 0; x < width; x += dotSize) {
      // Sample original pixel
      const i = (y * width + x) * 4;
      
      // Calculate brightness (0-255)
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      
      // Calculate dot radius based on brightness
      const radius = (dotSize / 2) * (brightness / 255);
      
      // Draw dot
      for (let dy = 0; dy < dotSize; dy++) {
        for (let dx = 0; dx < dotSize; dx++) {
          const distance = Math.sqrt(Math.pow(dx - dotSize / 2, 2) + Math.pow(dy - dotSize / 2, 2));
          
          if (distance <= radius) {
            const pixelX = x + dx;
            const pixelY = y + dy;
            
            if (pixelX < width && pixelY < height) {
              const idx = (pixelY * width + pixelX) * 4;
              result.data[idx] = 255;
              result.data[idx + 1] = 255;
              result.data[idx + 2] = 255;
              result.data[idx + 3] = 255;
            }
          }
        }
      }
    }
  }
  
  return result;
}

// Swirl Effect
function swirlProcessor(imageData, params, globalIntensity) {
  const { width, height, data } = imageData;
  const intensity = (params.intensity || 0.314) * globalIntensity;
  const result = new ImageData(width, height);
  
  const centerX = width / 2;
  const centerY = height / 2;
  const radius = Math.max(centerX, centerY);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Calculate distance from center
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate angle
      let angle = Math.atan2(dy, dx);
      
      // Apply swirl effect
      const swirl = intensity * (radius - distance) / radius;
      angle += swirl;
      
      // Calculate source coordinates
      const srcX = Math.floor(centerX + Math.cos(angle) * distance);
      const srcY = Math.floor(centerY + Math.sin(angle) * distance);
      
      // Copy pixel if source is within bounds
      const i = (y * width + x) * 4;
      
      if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
        const srcI = (srcY * width + srcX) * 4;
        result.data[i] = data[srcI];
        result.data[i + 1] = data[srcI + 1];
        result.data[i + 2] = data[srcI + 2];
        result.data[i + 3] = data[srcI + 3];
      } else {
        // Use black for out-of-bounds
        result.data[i] = 0;
        result.data[i + 1] = 0;
        result.data[i + 2] = 0;
        result.data[i + 3] = 255;
      }
    }
  }
  
  return result;
}

// Emboss Effect
function embossProcessor(imageData, params, globalIntensity) {
  const { width, height, data } = imageData;
  const strength = (params.strength || 1.0) * globalIntensity;
  const result = new ImageData(width, height);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const nextIdx = ((y + 1) * width + (x + 1)) * 4;
      
      const r = (data[idx] - data[nextIdx]) * strength;
      const g = (data[idx + 1] - data[nextIdx + 1]) * strength;
      const b = (data[idx + 2] - data[nextIdx + 2]) * strength;
      
      const gray = Math.max(0, Math.min(255, (r + g + b) / 3 + 128));
      
      result.data[idx] = gray;
      result.data[idx + 1] = gray;
      result.data[idx + 2] = gray;
      result.data[idx + 3] = data[idx + 3];
    }
  }
  
  return result;
}

// Pixel Sort Effect
function pixelSortProcessor(imageData, params, globalIntensity) {
  const { width, height, data } = imageData;
  const segmentHeight = Math.floor((params.segmentHeight || 10) * globalIntensity);
  const result = new ImageData(new Uint8ClampedArray(data), width, height);
  
  for (let y = 0; y < height; y += segmentHeight) {
    const pixels = [];
    
    for (let x = 0; x < width; x++) {
      for (let k = 0; k < segmentHeight && y + k < height; k++) {
        const idx = ((y + k) * width + x) * 4;
        const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        pixels.push({
          r: data[idx],
          g: data[idx + 1],
          b: data[idx + 2],
          a: data[idx + 3],
          brightness,
          originalX: x,
          originalY: y + k
        });
      }
    }
    
    pixels.sort((a, b) => a.brightness - b.brightness);
    
    pixels.forEach((pixel, i) => {
      const x = i % width;
      const segY = Math.floor(i / width);
      const targetY = y + segY;
      
      if (targetY < height) {
        const idx = (targetY * width + x) * 4;
        result.data[idx] = pixel.r;
        result.data[idx + 1] = pixel.g;
        result.data[idx + 2] = pixel.b;
        result.data[idx + 3] = pixel.a;
      }
    });
  }
  
  return result;
}

// ========== Distortion Effects ==========

// Liquify Effect
function liquifyProcessor(imageData, params, globalIntensity) {
  const { width, height, data } = imageData;
  const intensity = (params.intensity || 20) * globalIntensity;
  const result = new ImageData(width, height);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      // Create wave distortion
      const distX = Math.sin(y / 10) * intensity;
      const distY = Math.cos(x / 10) * intensity;
      
      // Calculate source coordinates with distortion
      const srcX = Math.floor(x + distX);
      const srcY = Math.floor(y + distY);
      
      // Copy pixel if source is within bounds
      const i = (y * width + x) * 4;
      
      if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
        const srcI = (srcY * width + srcX) * 4;
        result.data[i] = data[srcI];
        result.data[i + 1] = data[srcI + 1];
        result.data[i + 2] = data[srcI + 2];
        result.data[i + 3] = data[srcI + 3];
      } else {
        // Use black for out-of-bounds
        result.data[i] = 0;
        result.data[i + 1] = 0;
        result.data[i + 2] = 0;
        result.data[i + 3] = 255;
      }
    }
  }
  
  return result;
}

// Glitch Effect
function glitchProcessor(imageData, params, globalIntensity) {
  const { width, height, data } = imageData;
  const intensity = Math.floor((params.intensity || 1024) * globalIntensity);
  const result = new ImageData(new Uint8ClampedArray(data), width, height);
  
  for (let i = 0; i < intensity; i++) {
    const xStart = Math.floor(Math.random() * width);
    const yStart = Math.floor(Math.random() * height);
    const xEnd = Math.min(xStart + Math.floor(Math.random() * 100), width);
    const yEnd = Math.min(yStart + Math.floor(Math.random() * 30), height);
    const shiftX = Math.floor(Math.random() * 100 - 50);
    
    for (let y = yStart; y < yEnd; y++) {
      for (let x = xStart; x < xEnd; x++) {
        const newX = Math.max(0, Math.min(width - 1, x + shiftX));
        const srcIdx = (y * width + x) * 4;
        const dstIdx = (y * width + newX) * 4;
        
        result.data[dstIdx] = data[srcIdx];
        result.data[dstIdx + 1] = data[srcIdx + 1];
        result.data[dstIdx + 2] = data[srcIdx + 2];
        result.data[dstIdx + 3] = data[srcIdx + 3];
      }
    }
  }
  
  return result;
}

// Mirror Effect
function mirrorProcessor(imageData, params, globalIntensity) {
  const { width, height, data } = imageData;
  const mode = params.mode || 'horizontal';
  const result = new ImageData(new Uint8ClampedArray(data), width, height);
  
  if (mode === 'horizontal') {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width / 2; x++) {
        const leftIdx = (y * width + x) * 4;
        const rightIdx = (y * width + (width - 1 - x)) * 4;
        
        result.data[rightIdx] = data[leftIdx];
        result.data[rightIdx + 1] = data[leftIdx + 1];
        result.data[rightIdx + 2] = data[leftIdx + 2];
        result.data[rightIdx + 3] = data[leftIdx + 3];
      }
    }
  } else if (mode === 'vertical') {
    for (let y = 0; y < height / 2; y++) {
      for (let x = 0; x < width; x++) {
        const topIdx = (y * width + x) * 4;
        const bottomIdx = ((height - 1 - y) * width + x) * 4;
        
        result.data[bottomIdx] = data[topIdx];
        result.data[bottomIdx + 1] = data[topIdx + 1];
        result.data[bottomIdx + 2] = data[topIdx + 2];
        result.data[bottomIdx + 3] = data[topIdx + 3];
      }
    }
  }
  
  return result;
}

// Motion Blur Effect
function motionBlurProcessor(imageData, params, globalIntensity) {
  const { width, height, data } = imageData;
  const distance = Math.floor((params.distance || 10) * globalIntensity);
  const angle = (params.angle || 0) * Math.PI / 180;
  const result = new ImageData(width, height);
  
  const dx = Math.cos(angle);
  const dy = Math.sin(angle);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      
      for (let i = -distance; i <= distance; i++) {
        const srcX = Math.floor(x + dx * i);
        const srcY = Math.floor(y + dy * i);
        
        if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
          const srcIdx = (srcY * width + srcX) * 4;
          r += data[srcIdx];
          g += data[srcIdx + 1];
          b += data[srcIdx + 2];
          a += data[srcIdx + 3];
          count++;
        }
      }
      
      const idx = (y * width + x) * 4;
      result.data[idx] = r / count;
      result.data[idx + 1] = g / count;
      result.data[idx + 2] = b / count;
      result.data[idx + 3] = a / count;
    }
  }
  
  return result;
}

// Pixelate Effect
function pixelateProcessor(imageData, params, globalIntensity) {
  const { width, height, data } = imageData;
  const pixelSize = Math.max(1, Math.floor((params.pixelSize || 8) * globalIntensity));
  const result = new ImageData(width, height);
  
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      // Get the color of the first pixel in the block
      const idx = (y * width + x) * 4;
      const r = data[idx];
      const g = data[idx + 1];
      const b = data[idx + 2];
      const a = data[idx + 3];
      
      // Fill the block with this color
      for (let blockY = 0; blockY < pixelSize && y + blockY < height; blockY++) {
        for (let blockX = 0; blockX < pixelSize && x + blockX < width; blockX++) {
          const blockIdx = ((y + blockY) * width + (x + blockX)) * 4;
          result.data[blockIdx] = r;
          result.data[blockIdx + 1] = g;
          result.data[blockIdx + 2] = b;
          result.data[blockIdx + 3] = a;
        }
      }
    }
  }
  
  return result;
}

// ========== Color Effects ==========

// Invert Effect
function invertProcessor(imageData, params, globalIntensity) {
  const { width, height, data } = imageData;
  const result = new ImageData(width, height);
  const intensity = params.intensity || 1.0;
  const adjustedIntensity = intensity * globalIntensity;
  
  for (let i = 0; i < data.length; i += 4) {
    // Invert colors with intensity adjustment
    result.data[i] = 255 - data[i] * adjustedIntensity - (1 - adjustedIntensity) * data[i];
    result.data[i + 1] = 255 - data[i + 1] * adjustedIntensity - (1 - adjustedIntensity) * data[i + 1];
    result.data[i + 2] = 255 - data[i + 2] * adjustedIntensity - (1 - adjustedIntensity) * data[i + 2];
    result.data[i + 3] = data[i + 3]; // Keep alpha unchanged
  }
  
  return result;
}

// Hue Shift Effect
function hueShiftProcessor(imageData, params, globalIntensity) {
  const { width, height, data } = imageData;
  const result = new ImageData(width, height);
  const shift = (params.shift || 180) * globalIntensity;
  
  for (let i = 0; i < data.length; i += 4) {
    // Convert RGB to HSL
    const r = data[i] / 255;
    const g = data[i + 1] / 255;
    const b = data[i + 2] / 255;
    
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
    
    // Shift hue
    h = (h + shift / 360) % 1;
    
    // Convert back to RGB
    let r1, g1, b1;
    
    if (s === 0) {
      r1 = g1 = b1 = l; // achromatic
    } else {
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r1 = hueToRgb(p, q, h + 1/3);
      g1 = hueToRgb(p, q, h);
      b1 = hueToRgb(p, q, h - 1/3);
    }
    
    result.data[i] = Math.round(r1 * 255);
    result.data[i + 1] = Math.round(g1 * 255);
    result.data[i + 2] = Math.round(b1 * 255);
    result.data[i + 3] = data[i + 3]; // Keep alpha unchanged
  }
  
  return result;
}

// Helper function for hue shift
function hueToRgb(p, q, t) {
  if (t < 0) t += 1;
  if (t > 1) t -= 1;
  if (t < 1/6) return p + (q - p) * 6 * t;
  if (t < 1/2) return q;
  if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
  return p;
}

// Threshold Effect
function thresholdProcessor(imageData, params, globalIntensity) {
  const { width, height, data } = imageData;
  const result = new ImageData(width, height);
  const threshold = (params.threshold || 128) * globalIntensity / 100;
  
  for (let i = 0; i < data.length; i += 4) {
    const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
    const value = brightness > threshold * 255 ? 255 : 0;
    
    result.data[i] = value;
    result.data[i + 1] = value;
    result.data[i + 2] = value;
    result.data[i + 3] = data[i + 3]; // Keep alpha unchanged
  }
  
  return result;
}

// Posterize Effect
function posterizeProcessor(imageData, params, globalIntensity) {
  const { width, height, data } = imageData;
  const result = new ImageData(width, height);
  const levels = Math.max(2, Math.floor((params.levels || 4) * globalIntensity));
  
  for (let i = 0; i < data.length; i += 4) {
    result.data[i] = Math.floor(data[i] / 255 * (levels - 1)) / (levels - 1) * 255;
    result.data[i + 1] = Math.floor(data[i + 1] / 255 * (levels - 1)) / (levels - 1) * 255;
    result.data[i + 2] = Math.floor(data[i + 2] / 255 * (levels - 1)) / (levels - 1) * 255;
    result.data[i + 3] = data[i + 3]; // Keep alpha unchanged
  }
  
  return result;
}

// ========== Filter Effects ==========

// Blur Effect
function blurProcessor(imageData, params, globalIntensity) {
  const { width, height, data } = imageData;
  const result = new ImageData(width, height);
  const radius = Math.floor((params.radius || 5) * globalIntensity);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0, count = 0;
      
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const srcX = x + dx;
          const srcY = y + dy;
          
          if (srcX >= 0 && srcX < width && srcY >= 0 && srcY < height) {
            const srcIdx = (srcY * width + srcX) * 4;
            r += data[srcIdx];
            g += data[srcIdx + 1];
            b += data[srcIdx + 2];
            a += data[srcIdx + 3];
            count++;
          }
        }
      }
      
      const idx = (y * width + x) * 4;
      result.data[idx] = r / count;
      result.data[idx + 1] = g / count;
      result.data[idx + 2] = b / count;
      result.data[idx + 3] = a / count;
    }
  }
  
  return result;
}

// Edge Detection Effect
function edgeDetectionProcessor(imageData, params, globalIntensity) {
  const { width, height, data } = imageData;
  const result = new ImageData(width, height);
  const threshold = (params.threshold || 30) * globalIntensity;
  
  // Sobel operators
  const sobelX = [-1, 0, 1, -2, 0, 2, -1, 0, 1];
  const sobelY = [-1, -2, -1, 0, 0, 0, 1, 2, 1];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      let gx = 0, gy = 0;
      
      // Apply Sobel operators
      for (let ky = -1; ky <= 1; ky++) {
        for (let kx = -1; kx <= 1; kx++) {
          const idx = ((y + ky) * width + (x + kx)) * 4;
          const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          
          gx += brightness * sobelX[(ky + 1) * 3 + (kx + 1)];
          gy += brightness * sobelY[(ky + 1) * 3 + (kx + 1)];
        }
      }
      
      // Calculate gradient magnitude
      const magnitude = Math.sqrt(gx * gx + gy * gy);
      
      // Apply threshold
      const value = magnitude > threshold ? 255 : 0;
      
      const idx = (y * width + x) * 4;
      result.data[idx] = value;
      result.data[idx + 1] = value;
      result.data[idx + 2] = value;
      result.data[idx + 3] = data[idx + 3]; // Keep alpha unchanged
    }
  }
  
  return result;
}

// Noise Effect
function noiseProcessor(imageData, params, globalIntensity) {
  const { width, height, data } = imageData;
  const result = new ImageData(new Uint8ClampedArray(data), width, height);
  const amount = (params.amount || 50) * globalIntensity;
  
  for (let i = 0; i < data.length; i += 4) {
    // Add random noise to each channel
    result.data[i] = Math.max(0, Math.min(255, data[i] + (Math.random() * 2 - 1) * amount));
    result.data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + (Math.random() * 2 - 1) * amount));
    result.data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + (Math.random() * 2 - 1) * amount));
  }
  
  return result;
}

// ========== Experimental Effects ==========

// Datamosh Effect
function datamoshProcessor(imageData, params, globalIntensity) {
  const { width, height, data } = imageData;
  const result = new ImageData(new Uint8ClampedArray(data), width, height);
  const intensity = Math.floor((params.intensity || 20) * globalIntensity);
  
  // Corrupt random chunks of the image data
  for (let i = 0; i < intensity; i++) {
    const startPos = Math.floor(Math.random() * (data.length / 4 - 100)) * 4;
    const length = Math.floor(Math.random() * 100) * 4;
    
    // Shift data
    for (let j = 0; j < length; j += 4) {
      if (startPos + j + 4 < data.length) {
        result.data[startPos + j] = data[startPos + j + 4];
        result.data[startPos + j + 1] = data[startPos + j + 5];
        result.data[startPos + j + 2] = data[startPos + j + 6];
      }
    }
  }
  
  return result;
}

// RGB Split Effect
function rgbSplitProcessor(imageData, params, globalIntensity) {
  const { width, height, data } = imageData;
  const result = new ImageData(width, height);
  const distance = Math.floor((params.distance || 10) * globalIntensity);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const i = (y * width + x) * 4;
      
      // Get RGB from different positions
      const rX = Math.max(0, Math.min(width - 1, x - distance));
      const rI = (y * width + rX) * 4;
      
      const gI = i;
      
      const bX = Math.max(0, Math.min(width - 1, x + distance));
      const bI = (y * width + bX) * 4;
      
      // Combine channels
      result.data[i] = data[rI];
      result.data[i + 1] = data[gI + 1];
      result.data[i + 2] = data[bI + 2];
      result.data[i + 3] = data[i + 3];
    }
  }
  
  return result;
}

// Vignette Effect
function vignetteProcessor(imageData, params, globalIntensity) {
  const { width, height, data } = imageData;
  const result = new ImageData(new Uint8ClampedArray(data), width, height);
  const amount = (params.amount || 0.5) * globalIntensity;
  
  const centerX = width / 2;
  const centerY = height / 2;
  const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const dx = x - centerX;
      const dy = y - centerY;
      const distance = Math.sqrt(dx * dx + dy * dy);
      
      // Calculate vignette factor (1 at center, 0 at edges)
      const factor = Math.max(0, 1 - (distance / maxDistance) * amount);
      
      const i = (y * width + x) * 4;
      result.data[i] = data[i] * factor;
      result.data[i + 1] = data[i + 1] * factor;
      result.data[i + 2] = data[i + 2] * factor;
    }
  }
  
  return result;
}

// ========== Effect Registration ==========

// Register all effects when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Artistic Effects
  EffectRegistry.register('halftone', 'artistic', halftoneProcessor, { dotSize: 8 });
  EffectRegistry.register('swirl', 'artistic', swirlProcessor, { intensity: 0.314 });
  EffectRegistry.register('emboss', 'artistic', embossProcessor, { strength: 1.0 });
  EffectRegistry.register('pixelSort', 'artistic', pixelSortProcessor, { segmentHeight: 10 });
  
  // Distortion Effects
  EffectRegistry.register('liquify', 'distortion', liquifyProcessor, { intensity: 20 });
  EffectRegistry.register('glitch', 'distortion', glitchProcessor, { intensity: 1024 });
  EffectRegistry.register('mirror', 'distortion', mirrorProcessor, { mode: 'horizontal' });
  EffectRegistry.register('motionBlur', 'distortion', motionBlurProcessor, { distance: 10, angle: 0 });
  EffectRegistry.register('pixelate', 'distortion', pixelateProcessor, { pixelSize: 8 });
  
  // Color Effects
  EffectRegistry.register('invert', 'color', invertProcessor, { intensity: 1.0 });
  EffectRegistry.register('hueShift', 'color', hueShiftProcessor, { shift: 180 });
  EffectRegistry.register('threshold', 'color', thresholdProcessor, { threshold: 128 });
  EffectRegistry.register('posterize', 'color', posterizeProcessor, { levels: 4 });
  
  // Filter Effects
  EffectRegistry.register('blur', 'filter', blurProcessor, { radius: 5 });
  EffectRegistry.register('edgeDetection', 'filter', edgeDetectionProcessor, { threshold: 30 });
  EffectRegistry.register('noise', 'filter', noiseProcessor, { amount: 50 });
  
  // Experimental Effects
  EffectRegistry.register('datamosh', 'experimental', datamoshProcessor, { intensity: 20 });
  EffectRegistry.register('rgbSplit', 'experimental', rgbSplitProcessor, { distance: 10 });
  EffectRegistry.register('vignette', 'experimental', vignetteProcessor, { amount: 0.5 });
  
  console.log('Effects Studio: All effects registered successfully');
});

// Create effect controls in the UI
window.createEffectControls = function() {
  const categories = ['artistic', 'distortion', 'color', 'filter', 'experimental'];
  
  categories.forEach(category => {
    const categoryEffects = Object.entries(EffectRegistry.effects).filter(([_, effect]) => effect.category === category);
    const container = document.getElementById(`${category}-effects`);
    
    if (!container) {
      console.warn(`Container for ${category} effects not found`);
      return;
    }
    
    categoryEffects.forEach(([effectName, effect]) => {
      const effectDiv = document.createElement('div');
      effectDiv.className = 'effect-item';
      effectDiv.innerHTML = `
        <div class="effect-header">
          <label class="toggle-container">
            <input type="checkbox" id="${effectName}-toggle" onchange="toggleEffect('${effectName}')">
            <span class="toggle-slider"></span>
          </label>
          <span class="effect-name">${effectName}</span>
          <button class="expand-button" onclick="event.stopPropagation(); toggleControls('${effectName}')">▼</button>
        </div>
        <div id="${effectName}-controls" class="effect-controls collapsed">
          ${Object.entries(effect.params).map(([param, value]) => {
              // Determine appropriate scale based on parameter value
              let scale = 1;
              let max = 100;
              
              if (value > 10) {
                scale = 0.1; // For values > 10, each slider unit = 10
                max = 200;
              } else if (value > 1) {
                scale = 1; // For values between 1-10, each slider unit = 1
                max = 100;
              } else {
                scale = 10; // For small values < 1, each slider unit = 0.1
                max = 100;
              }
              
              const sliderValue = Math.round(value / scale);
              return `
                <div class="control-row">
                  <label for="${effectName}-${param}">${param}:</label>
                  <input type="range" id="${effectName}-${param}" min="0" max="${max}" value="${sliderValue}" 
                    oninput="document.getElementById('${effectName}-${param}-value').textContent = this.value * ${scale}; EffectRegistry.updateParam('${effectName}', '${param}', parseFloat(this.value) * ${scale});">
                  <span id="${effectName}-${param}-value">${value}</span>
                </div>
              `;
            }).join('')}
        </div>
      `;
      
      container.appendChild(effectDiv);
    });
  });
}

// Initialize effect controls when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(createEffectControls, 100); // Small delay to ensure EffectRegistry is populated
});

