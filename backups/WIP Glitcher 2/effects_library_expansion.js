// ========== Complete Effects Library ==========
// Add this to the existing Effects Studio implementation

// ========== Additional Effect Processors ==========

// Edge Detection Effect
function edgeDetectionProcessor(imageData, params, globalIntensity) {
  const { width, height, data } = imageData;
  const sensitivity = (params.sensitivity || 1.0) * globalIntensity;
  const result = new ImageData(width, height);
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = (y * width + x) * 4;
      const leftIdx = (y * width + (x - 1)) * 4;
      const rightIdx = (y * width + (x + 1)) * 4;
      const topIdx = ((y - 1) * width + x) * 4;
      const bottomIdx = ((y + 1) * width + x) * 4;
      
      const horizontalGradient = Math.abs(data[rightIdx] - data[leftIdx]) / 2;
      const verticalGradient = Math.abs(data[bottomIdx] - data[topIdx]) / 2;
      const edgeValue = Math.min(255, (horizontalGradient + verticalGradient) * sensitivity);
      
      result.data[idx] = edgeValue;
      result.data[idx + 1] = edgeValue;
      result.data[idx + 2] = edgeValue;
      result.data[idx + 3] = 255;
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
  const blurSize = Math.floor((params.blurSize || 10) * globalIntensity);
  const direction = params.direction || 'horizontal';
  const result = new ImageData(width, height);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sumR = 0, sumG = 0, sumB = 0, sumA = 0, count = 0;
      
      for (let i = -blurSize; i <= blurSize; i++) {
        let sampleX = x, sampleY = y;
        
        switch (direction) {
          case 'horizontal':
            sampleX = Math.max(0, Math.min(width - 1, x + i));
            break;
          case 'vertical':
            sampleY = Math.max(0, Math.min(height - 1, y + i));
            break;
          case 'diagonal':
            sampleX = Math.max(0, Math.min(width - 1, x + i));
            sampleY = Math.max(0, Math.min(height - 1, y + i));
            break;
        }
        
        const idx = (sampleY * width + sampleX) * 4;
        sumR += data[idx];
        sumG += data[idx + 1];
        sumB += data[idx + 2];
        sumA += data[idx + 3];
        count++;
      }
      
      const resultIdx = (y * width + x) * 4;
      result.data[resultIdx] = sumR / count;
      result.data[resultIdx + 1] = sumG / count;
      result.data[resultIdx + 2] = sumB / count;
      result.data[resultIdx + 3] = sumA / count;
    }
  }
  
  return result;
}

// Pixelization Effect
function pixelizationProcessor(imageData, params, globalIntensity) {
  const { width, height, data } = imageData;
  const pixelSize = Math.max(1, Math.floor((params.pixelSize || 10) * globalIntensity));
  const result = new ImageData(width, height);
  
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      if (x < width && y < height) {
        const idx = (y * width + x) * 4;
        const r = data[idx];
        const g = data[idx + 1];
        const b = data[idx + 2];
        const a = data[idx + 3];
        
        // Fill the pixel block
        for (let py = y; py < Math.min(y + pixelSize, height); py++) {
          for (let px = x; px < Math.min(x + pixelSize, width); px++) {
            const blockIdx = (py * width + px) * 4;
            result.data[blockIdx] = r;
            result.data[blockIdx + 1] = g;
            result.data[blockIdx + 2] = b;
            result.data[blockIdx + 3] = a;
          }
        }
      }
    }
  }
  
  return result;
}

// Noise Effect
function noiseProcessor(imageData, params, globalIntensity) {
  const { data } = imageData;
  const intensity = (params.intensity || 50) * globalIntensity;
  const result = new ImageData(new Uint8ClampedArray(data), imageData.width, imageData.height);
  
  for (let i = 0; i < result.data.length; i += 4) {
    const noise = (Math.random() - 0.5) * intensity * 2;
    result.data[i] = Math.max(0, Math.min(255, result.data[i] + noise));
    result.data[i + 1] = Math.max(0, Math.min(255, result.data[i + 1] + noise));
    result.data[i + 2] = Math.max(0, Math.min(255, result.data[i + 2] + noise));
  }
  
  return result;
}

// Invert Effect
function invertProcessor(imageData, params, globalIntensity) {
  const { data } = imageData;
  const result = new ImageData(new Uint8ClampedArray(data), imageData.width, imageData.height);
  
  for (let i = 0; i < result.data.length; i += 4) {
    const factor = globalIntensity;
    result.data[i] = result.data[i] * (1 - factor) + (255 - result.data[i]) * factor;
    result.data[i + 1] = result.data[i + 1] * (1 - factor) + (255 - result.data[i + 1]) * factor;
    result.data[i + 2] = result.data[i + 2] * (1 - factor) + (255 - result.data[i + 2]) * factor;
  }
  
  return result;
}

// Hue Shift Effect
function hueShiftProcessor(imageData, params, globalIntensity) {
  const { data } = imageData;
  const shift = (params.shift || 45) * globalIntensity;
  const result = new ImageData(new Uint8ClampedArray(data), imageData.width, imageData.height);
  
  for (let i = 0; i < result.data.length; i += 4) {
    const [h, s, l] = rgbToHsl(result.data[i], result.data[i + 1], result.data[i + 2]);
    const newH = (h + shift) % 360;
    const [r, g, b] = hslToRgb(newH, s, l);
    
    result.data[i] = r;
    result.data[i + 1] = g;
    result.data[i + 2] = b;
  }
  
  return result;
}

// Threshold Effect
function thresholdProcessor(imageData, params, globalIntensity) {
  const { data } = imageData;
  const threshold = (params.threshold || 127) * globalIntensity;
  const result = new ImageData(new Uint8ClampedArray(data), imageData.width, imageData.height);
  
  for (let i = 0; i < result.data.length; i += 4) {
    const brightness = (result.data[i] + result.data[i + 1] + result.data[i + 2]) / 3;
    const value = brightness > threshold ? 255 : 0;
    result.data[i] = value;
    result.data[i + 1] = value;
    result.data[i + 2] = value;
  }
  
  return result;
}

// Posterize Effect
function posterizeProcessor(imageData, params, globalIntensity) {
  const { data } = imageData;
  const levels = Math.max(2, Math.floor((params.levels || 5) * globalIntensity));
  const result = new ImageData(new Uint8ClampedArray(data), imageData.width, imageData.height);
  
  for (let i = 0; i < result.data.length; i += 4) {
    result.data[i] = Math.floor(result.data[i] / 255 * (levels - 1)) * (255 / (levels - 1));
    result.data[i + 1] = Math.floor(result.data[i + 1] / 255 * (levels - 1)) * (255 / (levels - 1));
    result.data[i + 2] = Math.floor(result.data[i + 2] / 255 * (levels - 1)) * (255 / (levels - 1));
  }
  
  return result;
}

// Blur Effect
function blurProcessor(imageData, params, globalIntensity) {
  const { width, height, data } = imageData;
  const radius = Math.floor((params.radius || 3) * globalIntensity);
  const result = new ImageData(width, height);
  
  // Simple box blur
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let sumR = 0, sumG = 0, sumB = 0, sumA = 0, count = 0;
      
      for (let dy = -radius; dy <= radius; dy++) {
        for (let dx = -radius; dx <= radius; dx++) {
          const sampleX = Math.max(0, Math.min(width - 1, x + dx));
          const sampleY = Math.max(0, Math.min(height - 1, y + dy));
          const idx = (sampleY * width + sampleX) * 4;
          
          sumR += data[idx];
          sumG += data[idx + 1];
          sumB += data[idx + 2];
          sumA += data[idx + 3];
          count++;
        }
      }
      
      const resultIdx = (y * width + x) * 4;
      result.data[resultIdx] = sumR / count;
      result.data[resultIdx + 1] = sumG / count;
      result.data[resultIdx + 2] = sumB / count;
      result.data[resultIdx + 3] = sumA / count;
    }
  }
  
  return result;
}

// ========== Utility Functions ==========

function rgbToHsl(r, g, b) {
  r /= 255; g /= 255; b /= 255;
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
  return [h * 360, s, l];
}

function hslToRgb(h, s, l) {
  h /= 360;
  const hue2rgb = (p, q, t) => {
    if (t < 0) t += 1;
    if (t > 1) t -= 1;
    if (t < 1/6) return p + (q - p) * 6 * t;
    if (t < 1/2) return q;
    if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
    return p;
  };

  if (s === 0) {
    return [l * 255, l * 255, l * 255];
  } else {
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    const r = hue2rgb(p, q, h + 1/3);
    const g = hue2rgb(p, q, h);
    const b = hue2rgb(p, q, h - 1/3);
    return [Math.round(r * 255), Math.round(g * 255), Math.round(b * 255)];
  }
}

// ========== Effect Registration ==========
// Add these registrations to your existing Effects Studio

// Register all the new effects with their default parameters
const additionalEffects = [
  ['edgeDetection', 'filter', edgeDetectionProcessor, { sensitivity: 1.0 }],
  ['emboss', 'artistic', embossProcessor, { strength: 1.0 }],
  ['glitch', 'distortion', glitchProcessor, { intensity: 1024 }],
  ['pixelSort', 'experimental', pixelSortProcessor, { segmentHeight: 10 }],
  ['mirror', 'distortion', mirrorProcessor, { mode: 'horizontal' }],
  ['motionBlur', 'filter', motionBlurProcessor, { blurSize: 10, direction: 'horizontal' }],
  ['pixelization', 'experimental', pixelizationProcessor, { pixelSize: 10 }],
  ['noise', 'experimental', noiseProcessor, { intensity: 50 }],
  ['invert', 'color', invertProcessor, {}],
  ['hueShift', 'color', hueShiftProcessor, { shift: 45 }],
  ['threshold', 'experimental', thresholdProcessor, { threshold: 127 }],
  ['posterize', 'experimental', posterizeProcessor, { levels: 5 }],
  ['blur', 'filter', blurProcessor, { radius: 3 }]
];

// ========== HTML Templates for Additional Effects ==========
const additionalEffectHTML = {
  edgeDetection: `
    <div class="control-group" data-category="filter">
      <div class="group-title" onclick="toggleEffect('edgeDetection')">
        <input type="checkbox" class="effect-toggle" id="edgeDetection-toggle">
        🔍 Edge Detection
        <button class="expand-btn" onclick="event.stopPropagation(); toggleControls('edgeDetection')">▼</button>
      </div>
      <div class="effect-controls collapsed" id="edgeDetection-controls">
        <div class="slider-container">
          <div class="slider-label">
            <span>Sensitivity</span>
            <span id="edgeDetection-sensitivity-value" class="slider-value">1.0</span>
          </div>
          <input type="range" id="edgeDetection-sensitivity" class="control-slider" min="0.5" max="3.0" step="0.1" value="1.0">
        </div>
      </div>
    </div>
  `,
  
  emboss: `
    <div class="control-group" data-category="artistic">
      <div class="group-title" onclick="toggleEffect('emboss')">
        <input type="checkbox" class="effect-toggle" id="emboss-toggle">
        🏺 Emboss
        <button class="expand-btn" onclick="event.stopPropagation(); toggleControls('emboss')">▼</button>
      </div>
      <div class="effect-controls collapsed" id="emboss-controls">
        <div class="slider-container">
          <div class="slider-label">
            <span>Strength</span>
            <span id="emboss-strength-value" class="slider-value">1.0</span>
          </div>
          <input type="range" id="emboss-strength" class="control-slider" min="0.5" max="3.0" step="0.1" value="1.0">
        </div>
      </div>
    </div>
  `,
  
  glitch: `
    <div class="control-group" data-category="distortion">
      <div class="group-title" onclick="toggleEffect('glitch')">
        <input type="checkbox" class="effect-toggle" id="glitch-toggle">
        ⚡ Glitch
        <button class="expand-btn" onclick="event.stopPropagation(); toggleControls('glitch')">▼</button>
      </div>
      <div class="effect-controls collapsed" id="glitch-controls">
        <div class="slider-container">
          <div class="slider-label">
            <span>Intensity</span>
            <span id="glitch-intensity-value" class="slider-value">1024</span>
          </div>
          <input type="range" id="glitch-intensity" class="control-slider" min="100" max="2000" value="1024">
        </div>
      </div>
    </div>
  `,
  
  motionBlur: `
    <div class="control-group" data-category="filter">
      <div class="group-title" onclick="toggleEffect('motionBlur')">
        <input type="checkbox" class="effect-toggle" id="motionBlur-toggle">
        💨 Motion Blur
        <button class="expand-btn" onclick="event.stopPropagation(); toggleControls('motionBlur')">▼</button>
      </div>
      <div class="effect-controls collapsed" id="motionBlur-controls">
        <div class="slider-container">
          <div class="slider-label">
            <span>Blur Size</span>
            <span id="motionBlur-blurSize-value" class="slider-value">10</span>
          </div>
          <input type="range" id="motionBlur-blurSize" class="control-slider" min="2" max="30" value="10">
        </div>
        <select id="motionBlur-direction" class="control-select" style="margin-top: 10px;">
          <option value="horizontal">Horizontal</option>
          <option value="vertical">Vertical</option>
          <option value="diagonal">Diagonal</option>
        </select>
      </div>
    </div>
  `
};

// ========== Integration Instructions ==========
/*
To integrate these effects into your Effects Studio:

1. Add the effect processors above to your main JavaScript file
2. Register the additional effects using the additionalEffects array
3. Add the HTML templates to your effects container
4. Update your category filtering to include the new effects
5. Ensure parameter event listeners are set up for the new controls

Example integration code:

// Register additional effects
additionalEffects.forEach(([name, category, processor, params]) => {
  EffectRegistry.register(name, category, processor, params);
});

// Add HTML templates to effects container
const effectsContainer = document.getElementById('effects-container');
Object.values(additionalEffectHTML).forEach(html => {
  effectsContainer.insertAdjacentHTML('beforeend', html);
});

// Set up event listeners for new parameter controls
document.querySelectorAll('.control-slider').forEach(slider => {
  if (!slider.hasEventListener) {
    slider.addEventListener('input', handleSliderChange);
    slider.hasEventListener = true;
  }
});

// Add support for select controls
document.querySelectorAll('.control-select').forEach(select => {
  select.addEventListener('change', (e) => {
    const parts = e.target.id.split('-');
    if (parts.length >= 2) {
      const effectName = parts[0];
      const paramName = parts[1];
      EffectRegistry.updateParam(effectName, paramName, e.target.value);
      if (originalImageData) {
        processImage();
      }
    }
  });
});
*/