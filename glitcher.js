// Canvas & context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasPlaceholder = document.getElementById('canvas-placeholder');

// File input
const fileInput = document.getElementById('image-input');

// Dropdowns
const directionSelect    = document.getElementById('direction-select');
const spiralSelect       = document.getElementById('spiral-select');
const sliceSelect        = document.getElementById('slice-select');
const pixelSortSelect    = document.getElementById('pixel-sort-select');
const intensitySelect    = document.getElementById('intensity-select');
const colorEffectSelect  = document.getElementById('color-effect-select');
const datamoshSelect     = document.getElementById('datamosh-select');
const presetSelect       = document.getElementById('preset-select');

// Sliders & their display
const speedRange         = document.getElementById('speed-range');
const speedValue         = document.getElementById('speed-value');
const swirlRange         = document.getElementById('swirl-range');
const swirlValue         = document.getElementById('swirl-value');
const colorOffsetRange   = document.getElementById('color-offset-range');
const colorOffsetValue   = document.getElementById('color-offset-value');
const minLifetimeRange   = document.getElementById('min-lifetime');
const minLifetimeValue   = document.getElementById('min-lifetime-value');
const maxLifetimeRange   = document.getElementById('max-lifetime');
const maxLifetimeValue   = document.getElementById('max-lifetime-value');
const recordRange        = document.getElementById('record-range');
const recordValue        = document.getElementById('record-value');
const sortFrequencyRange = document.getElementById('sort-frequency-range');
const sortFrequencyValue = document.getElementById('sort-frequency-value');
const colorIntensityRange = document.getElementById('color-intensity-range');
const colorIntensityValue = document.getElementById('color-intensity-value');
const datamoshIntensityRange = document.getElementById('datamosh-intensity-range');
const datamoshIntensityValue = document.getElementById('datamosh-intensity-value');
const audioSensitivityRange = document.getElementById('audio-sensitivity-range');
const audioSensitivityValue = document.getElementById('audio-sensitivity-value');

// NEW Chromatic Aberration UI Elements
const chromaticAberrationParamsContainer = document.getElementById('chromatic-aberration-params-container');
const chromaticAberrationModeSelect = document.getElementById('chromaticAberrationModeSelect');
const chromaticAberrationAngleControlContainer = document.getElementById('chromatic-aberration-angle-control-container');
const chromaticAberrationAngleRange = document.getElementById('chromaticAberrationAngleRange');
const chromaticAberrationAngleValue = document.getElementById('chromaticAberrationAngleValue');

// NEW Invert Color UI Elements
const invertColorParamsContainer = document.getElementById('invert-color-params-container');
const invertColorTypeSelect = document.getElementById('invertColorTypeSelect');

// Container for the general color intensity slider to easily show/hide it
const colorIntensityContainer = document.getElementById('color-intensity-range')?.parentElement;

// Buttons
const randomizeBtn       = document.getElementById('randomize-btn');
const playPauseBtn       = document.getElementById('play-pause-btn');
const resetBtn           = document.getElementById('reset-btn');
const snapshotBtn        = document.getElementById('snapshot-btn');
const recordBtn          = document.getElementById('record-btn');
const spiralDirectionBtn = document.getElementById('spiral-direction-btn');
const savePresetBtn      = document.getElementById('save-preset-btn');
const loadPresetBtn      = document.getElementById('load-preset-btn');
const batchExportBtn     = document.getElementById('batch-export-btn');

// Checkboxes
const reverseCheckbox    = document.getElementById('reverse-checkbox');
const audioReactiveCheckbox = document.getElementById('audio-reactive-checkbox');

// File inputs
const presetFileInput    = document.getElementById('preset-file-input');

// NEW Selection Method UI Elements
const selectionMethodSelect = document.getElementById('selection-method');
const colorRangeControls = document.getElementById('color-range-controls');
const brightnessControls = document.getElementById('brightness-controls');
const edgeDetectionControls = document.getElementById('edge-detection-controls');
const organicShapeControls = document.getElementById('organic-shape-controls');

// Color range sliders
const targetHueRange = document.getElementById('target-hue');
const targetHueValue = document.getElementById('target-hue-value');
const colorToleranceRange = document.getElementById('color-tolerance');
const colorToleranceValue = document.getElementById('color-tolerance-value');
const minRegionSizeRange = document.getElementById('min-region-size');
const minRegionSizeValue = document.getElementById('min-region-size-value');

// Brightness controls
const brightnessZoneSelect = document.getElementById('brightness-zone');

// Edge detection controls
const edgeThresholdRange = document.getElementById('edge-threshold');
const edgeThresholdValue = document.getElementById('edge-threshold-value');

// Organic shape controls
const shapeRandomnessRange = document.getElementById('shape-randomness');
const shapeRandomnessValue = document.getElementById('shape-randomness-value');
const shapeCountRange = document.getElementById('shape-count');
const shapeCountValue = document.getElementById('shape-count-value');

// Selection preview
const selectionPreviewCheckbox = document.getElementById('selection-preview-checkbox');

// Combined method controls
const combinedControls = document.getElementById('combined-controls');
const combineColorCheckbox = document.getElementById('combine-color');
const combineBrightnessCheckbox = document.getElementById('combine-brightness');
const combineEdgesCheckbox = document.getElementById('combine-edges');

// Selection sensitivity
const selectionSensitivityRange = document.getElementById('selection-sensitivity');
const selectionSensitivityValue = document.getElementById('selection-sensitivity-value');

// Interactive tools
const selectTool = document.getElementById('select-tool');
const brushTool = document.getElementById('brush-tool');
const wandTool = document.getElementById('wand-tool');
const lassoTool = document.getElementById('lasso-tool');
const brushSizeRange = document.getElementById('brush-size');
const brushSizeValue = document.getElementById('brush-size-value');
const clearSelectionsBtn = document.getElementById('clear-selections');
const invertSelectionBtn = document.getElementById('invert-selection');
const manualSelectionMode = document.getElementById('manual-selection-mode');

// ========== Global State ==========

let originalImageData  = null;
let glitchImageData    = null;
let imgWidth = 0, imgHeight = 0;

let animationId = null;
let isPaused    = false;
let frameCount = 0;

// Active pixel clumps
let activeClumps = [];

// Track spiral direction (CW/CCW) via a toggle button
let spiralDirection = 'cw';  // defaults to CW

// Audio context for reactive effects
let audioContext = null;
let analyser = null;
let microphone = null;
let audioData = null;

// Performance tracking
let lastFrameTime = 0;
let targetFrameRate = 60;

// Recording state
let mediaRecorder = null;
let recordedChunks = [];

// Selection Engine instance
let selectionEngine = null;

// Selection preview
let showSelectionPreview = false;
let selectionPreviewOpacity = 0.3;

// Selection history
let selectionHistory = [];
let maxHistorySize = 10;

// Interactive tool state
let currentTool = 'none';
let isDrawing = false;
let selectionMask = null;
let tempSelection = null;
let lastMousePos = { x: 0, y: 0 };
let lassoPath = [];
let brushCursorPos = { x: 0, y: 0 };

// ========== Advanced Selection Engine ==========

class SelectionEngine {
  constructor(imageData, width, height) {
    this.imageData = imageData;
    this.width = width;
    this.height = height;
    this.regions = [];
    this.cache = {
      colorAnalysis: null,
      brightnessMap: null,
      edgeMap: null
    };
  }

  // Generate selections based on method
  generateSelections(method, config) {
    const selections = [];
    
    // Check cache if applicable
    const cacheKey = this.getCacheKey(method, config);
    if (this.cache[cacheKey] && this.isCacheValid(method)) {
      return this.cache[cacheKey];
    }
    
    switch(method) {
      case 'random':
        // Use existing random selection
        return [pickRandomClump(config.intensity, this.width, this.height)];
        
      case 'colorRange':
        selections.push(...this.selectByColorRange(config));
        break;
        
      case 'brightness':
        selections.push(...this.selectByBrightness(config));
        break;
        
      case 'edgeDetection':
        selections.push(...this.selectByEdges(config));
        break;
        
      case 'organicShapes':
        selections.push(...this.generateOrganicShapes(config));
        break;
        
      case 'contentAware':
        selections.push(...this.selectContentAware(config));
        break;
        
      case 'combined':
        selections.push(...this.selectCombined(config));
        break;
    }
    
    // Cache results for static methods
    if (this.shouldCache(method)) {
      this.cache[cacheKey] = selections;
    }
    
    return selections;
  }
  
  // Generate cache key
  getCacheKey(method, config) {
    return `${method}_${JSON.stringify(config)}`;
  }
  
  // Check if cache should be used for this method
  shouldCache(method) {
    // Don't cache random or organic shapes as they should vary
    return method !== 'random' && method !== 'organicShapes';
  }
  
  // Check if cache is still valid
  isCacheValid(method) {
    // For now, cache is always valid unless cleared
    return true;
  }
  
  // Clear cache when image changes
  clearCache() {
    this.cache = {
      colorAnalysis: null,
      brightnessMap: null,
      edgeMap: null
    };
  }

  // Select regions by color range
  selectByColorRange(config) {
    const {
      targetHue = 180,
      hueTolerance = 30,
      saturationMin = 0.2,
      lightnessMin = 0.2,
      lightnessMax = 0.8,
      minRegionSize = 100,
      maxRegions = 5
    } = config;

    const regions = [];
    const visited = new Uint8Array(this.width * this.height);
    
    // Scan for matching pixels
    for (let y = 0; y < this.height; y += 4) {
      for (let x = 0; x < this.width; x += 4) {
        const idx = y * this.width + x;
        if (visited[idx]) continue;
        
        const pixelIdx = idx * 4;
        const r = this.imageData.data[pixelIdx];
        const g = this.imageData.data[pixelIdx + 1];
        const b = this.imageData.data[pixelIdx + 2];
        
        const [h, s, l] = rgbToHsl(r, g, b);
        
        // Check if pixel matches criteria
        const hueDiff = Math.abs(h - targetHue);
        const hueMatch = hueDiff < hueTolerance || hueDiff > (360 - hueTolerance);
        
        if (hueMatch && s >= saturationMin && l >= lightnessMin && l <= lightnessMax) {
          // Flood fill to find connected region
          const region = this.floodFill(x, y, visited, config);
          if (region.pixels >= minRegionSize) {
            regions.push(region);
            if (regions.length >= maxRegions) break;
          }
        }
      }
      if (regions.length >= maxRegions) break;
    }
    
    // Convert regions to bounding boxes
    return regions.map(r => ({
      x: r.minX,
      y: r.minY,
      w: r.maxX - r.minX,
      h: r.maxY - r.minY
    }));
  }

  // Flood fill algorithm
  floodFill(startX, startY, visited, config) {
    const stack = [[startX, startY]];
    const region = {
      pixels: 0,
      minX: startX,
      maxX: startX,
      minY: startY,
      maxY: startY
    };
    
    const targetIdx = (startY * this.width + startX) * 4;
    const targetR = this.imageData.data[targetIdx];
    const targetG = this.imageData.data[targetIdx + 1];
    const targetB = this.imageData.data[targetIdx + 2];
    const [targetH, targetS, targetL] = rgbToHsl(targetR, targetG, targetB);
    
    while (stack.length > 0) {
      const [x, y] = stack.pop();
      const idx = y * this.width + x;
      
      if (x < 0 || x >= this.width || y < 0 || y >= this.height || visited[idx]) {
        continue;
      }
      
      const pixelIdx = idx * 4;
      const r = this.imageData.data[pixelIdx];
      const g = this.imageData.data[pixelIdx + 1];
      const b = this.imageData.data[pixelIdx + 2];
      const [h, s, l] = rgbToHsl(r, g, b);
      
      // Check color similarity
      const hueDiff = Math.abs(h - targetH);
      const hueMatch = hueDiff < config.hueTolerance || hueDiff > (360 - config.hueTolerance);
      const satMatch = Math.abs(s - targetS) < 0.3;
      const lightMatch = Math.abs(l - targetL) < 0.3;
      
      if (hueMatch && satMatch && lightMatch) {
        visited[idx] = 1;
        region.pixels++;
        region.minX = Math.min(region.minX, x);
        region.maxX = Math.max(region.maxX, x);
        region.minY = Math.min(region.minY, y);
        region.maxY = Math.max(region.maxY, y);
        
        // Add neighbors
        stack.push([x + 1, y]);
        stack.push([x - 1, y]);
        stack.push([x, y + 1]);
        stack.push([x, y - 1]);
      }
    }
    
    return region;
  }

  // Select by brightness zones
  selectByBrightness(config) {
    const {
      zone = 'shadows', // 'shadows', 'midtones', 'highlights'
      threshold = 0.5,
      minRegionSize = 100,
      maxRegions = 5
    } = config;

    const regions = [];
    const blockSize = 16;
    
    for (let y = 0; y < this.height; y += blockSize) {
      for (let x = 0; x < this.width; x += blockSize) {
        const brightness = this.getBlockBrightness(x, y, blockSize);
        
        let inZone = false;
        if (zone === 'shadows' && brightness < 0.3) inZone = true;
        else if (zone === 'midtones' && brightness >= 0.3 && brightness <= 0.7) inZone = true;
        else if (zone === 'highlights' && brightness > 0.7) inZone = true;
        
        if (inZone) {
          regions.push({
            x: x,
            y: y,
            w: Math.min(blockSize * 2, this.width - x),
            h: Math.min(blockSize * 2, this.height - y)
          });
          
          if (regions.length >= maxRegions) return regions;
        }
      }
    }
    
    return regions;
  }

  // Get average brightness of a block
  getBlockBrightness(x, y, size) {
    let totalBrightness = 0;
    let pixelCount = 0;
    
    for (let dy = 0; dy < size && (y + dy) < this.height; dy++) {
      for (let dx = 0; dx < size && (x + dx) < this.width; dx++) {
        const idx = ((y + dy) * this.width + (x + dx)) * 4;
        const r = this.imageData.data[idx];
        const g = this.imageData.data[idx + 1];
        const b = this.imageData.data[idx + 2];
        totalBrightness += (0.2126 * r + 0.7152 * g + 0.0722 * b) / 255;
        pixelCount++;
      }
    }
    
    return totalBrightness / pixelCount;
  }

  // Simple edge detection
  selectByEdges(config) {
    const {
      threshold = 30,
      minRegionSize = 50,
      maxRegions = 8
    } = config;

    const regions = [];
    const edgeStrength = this.detectEdges(threshold);
    
    // Find high edge areas
    const blockSize = 32;
    for (let y = 0; y < this.height; y += blockSize) {
      for (let x = 0; x < this.width; x += blockSize) {
        let edgeCount = 0;
        
        for (let dy = 0; dy < blockSize && (y + dy) < this.height; dy++) {
          for (let dx = 0; dx < blockSize && (x + dx) < this.width; dx++) {
            if (edgeStrength[(y + dy) * this.width + (x + dx)] > 0) {
              edgeCount++;
            }
          }
        }
        
        if (edgeCount > minRegionSize) {
          regions.push({
            x: x,
            y: y,
            w: Math.min(blockSize, this.width - x),
            h: Math.min(blockSize, this.height - y)
          });
          
          if (regions.length >= maxRegions) return regions;
        }
      }
    }
    
    return regions;
  }

  // Simple Sobel edge detection
  detectEdges(threshold) {
    const edges = new Uint8Array(this.width * this.height);
    
    for (let y = 1; y < this.height - 1; y++) {
      for (let x = 1; x < this.width - 1; x++) {
        const idx = (y * this.width + x) * 4;
        
        // Get surrounding pixels
        const tl = this.getPixelBrightness(x-1, y-1);
        const tm = this.getPixelBrightness(x, y-1);
        const tr = this.getPixelBrightness(x+1, y-1);
        const ml = this.getPixelBrightness(x-1, y);
        const mr = this.getPixelBrightness(x+1, y);
        const bl = this.getPixelBrightness(x-1, y+1);
        const bm = this.getPixelBrightness(x, y+1);
        const br = this.getPixelBrightness(x+1, y+1);
        
        // Sobel operators
        const gx = -tl - 2*ml - bl + tr + 2*mr + br;
        const gy = -tl - 2*tm - tr + bl + 2*bm + br;
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        edges[y * this.width + x] = magnitude > threshold ? 1 : 0;
      }
    }
    
    return edges;
  }

  // Get pixel brightness
  getPixelBrightness(x, y) {
    const idx = (y * this.width + x) * 4;
    const r = this.imageData.data[idx];
    const g = this.imageData.data[idx + 1];
    const b = this.imageData.data[idx + 2];
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }

  // Generate organic shapes
  generateOrganicShapes(config) {
    const {
      count = 3,
      baseSize = 50,
      randomness = 0.3,
      smoothness = 0.7
    } = config;

    const shapes = [];
    
    for (let i = 0; i < count; i++) {
      const centerX = randomInt(baseSize, this.width - baseSize);
      const centerY = randomInt(baseSize, this.height - baseSize);
      
      // Generate blob shape
      const shape = this.generateBlob(centerX, centerY, baseSize, randomness);
      
      // Convert to bounding box for now
      shapes.push({
        x: Math.max(0, centerX - baseSize),
        y: Math.max(0, centerY - baseSize),
        w: Math.min(baseSize * 2, this.width - centerX + baseSize),
        h: Math.min(baseSize * 2, this.height - centerY + baseSize)
      });
    }
    
    return shapes;
  }

  // Generate a blob shape
  generateBlob(centerX, centerY, radius, randomness) {
    const points = [];
    const numPoints = 16;
    
    for (let i = 0; i < numPoints; i++) {
      const angle = (i / numPoints) * Math.PI * 2;
      const r = radius * (1 + (Math.random() - 0.5) * randomness);
      
      points.push({
        x: centerX + Math.cos(angle) * r,
        y: centerY + Math.sin(angle) * r
      });
    }
    
    return points;
  }

  // Content-aware selection
  selectContentAware(config) {
    // For now, combine edge detection and color variance
    const edges = this.selectByEdges({ ...config, maxRegions: 3 });
    const colors = this.selectByColorRange({ ...config, maxRegions: 2 });
    
    return [...edges, ...colors];
  }
  
  // Combined selection method
  selectCombined(config) {
    const selections = [];
    const maxPerMethod = Math.ceil(config.maxRegions / 3);
    
    // Check which methods are enabled
    const useColor = combineColorCheckbox ? combineColorCheckbox.checked : true;
    const useBrightness = combineBrightnessCheckbox ? combineBrightnessCheckbox.checked : false;
    const useEdges = combineEdgesCheckbox ? combineEdgesCheckbox.checked : true;
    
    if (useColor) {
      selections.push(...this.selectByColorRange({ ...config, maxRegions: maxPerMethod }));
    }
    
    if (useBrightness) {
      selections.push(...this.selectByBrightness({ ...config, maxRegions: maxPerMethod }));
    }
    
    if (useEdges) {
      selections.push(...this.selectByEdges({ ...config, maxRegions: maxPerMethod }));
    }
    
    // Remove overlapping selections
    return this.mergeOverlappingSelections(selections).slice(0, config.maxRegions);
  }
  
  // Merge overlapping selections
  mergeOverlappingSelections(selections) {
    const merged = [];
    
    selections.forEach(sel => {
      let overlap = false;
      
      for (let i = 0; i < merged.length; i++) {
        const existing = merged[i];
        
        // Check for overlap
        if (sel.x < existing.x + existing.w &&
            sel.x + sel.w > existing.x &&
            sel.y < existing.y + existing.h &&
            sel.y + sel.h > existing.y) {
          
          // Merge by expanding the existing selection
          existing.x = Math.min(existing.x, sel.x);
          existing.y = Math.min(existing.y, sel.y);
          existing.w = Math.max(existing.x + existing.w, sel.x + sel.w) - existing.x;
          existing.h = Math.max(existing.y + existing.h, sel.y + sel.h) - existing.y;
          overlap = true;
          break;
        }
      }
      
      if (!overlap) {
        merged.push({ ...sel });
      }
    });
    
    return merged;
  }
}

// ========== Setup Event Listeners ==========

// File load
fileInput.addEventListener('change', handleFileSelect);

// Drag and drop for file upload area
document.querySelector('.file-upload-area').addEventListener('dragover', (e) => {
  e.preventDefault();
  e.target.style.borderColor = '#4ecdc4';
});

document.querySelector('.file-upload-area').addEventListener('dragleave', (e) => {
  e.preventDefault();
  e.target.style.borderColor = 'rgba(255,255,255,0.3)';
});

document.querySelector('.file-upload-area').addEventListener('drop', (e) => {
  e.preventDefault();
  e.target.style.borderColor = 'rgba(255,255,255,0.3)';
  const files = e.dataTransfer.files;
  if (files.length > 0 && files[0].type.startsWith('image/')) {
    fileInput.files = files;
    handleFileSelect();
  }
});

// Slider display updates
speedRange.addEventListener('input', () => {
  speedValue.textContent = speedRange.value;
});
swirlRange.addEventListener('input', () => {
  swirlValue.textContent = swirlRange.value;
});
colorOffsetRange.addEventListener('input', () => {
  colorOffsetValue.textContent = colorOffsetRange.value;
});
minLifetimeRange.addEventListener('input', () => {
  minLifetimeValue.textContent = minLifetimeRange.value;
});
maxLifetimeRange.addEventListener('input', () => {
  maxLifetimeValue.textContent = maxLifetimeRange.value;
});
recordRange.addEventListener('input', () => {
  recordValue.textContent = recordRange.value;
});
sortFrequencyRange.addEventListener('input', () => {
  sortFrequencyValue.textContent = sortFrequencyRange.value;
});
colorIntensityRange.addEventListener('input', () => {
  colorIntensityValue.textContent = colorIntensityRange.value;
});
datamoshIntensityRange.addEventListener('input', () => {
  datamoshIntensityValue.textContent = datamoshIntensityRange.value;
});

// NEW Event Listeners for Chromatic Aberration Controls
if (colorEffectSelect) {
  colorEffectSelect.addEventListener('change', () => {
    const selectedEffect = colorEffectSelect.value;

    // Hide all specific param containers by default
    if (chromaticAberrationParamsContainer) chromaticAberrationParamsContainer.style.display = 'none';
    if (invertColorParamsContainer) invertColorParamsContainer.style.display = 'none';

    // Manage visibility of the general intensity slider
    if (colorIntensityContainer) {
        // Hide intensity for 'invert' or if no effect ('off') is selected
        if (selectedEffect === 'invert' || selectedEffect === 'off') {
            colorIntensityContainer.style.display = 'none';
        } else {
            colorIntensityContainer.style.display = 'block';
        }
    }

    if (selectedEffect === 'chromaticAberration') {
      if (chromaticAberrationParamsContainer) chromaticAberrationParamsContainer.style.display = 'block';
      // Trigger mode select's change handler for angle control visibility
      if (chromaticAberrationModeSelect) {
        chromaticAberrationModeSelect.dispatchEvent(new Event('change'));
      }
    } else if (selectedEffect === 'invert') {
      if (invertColorParamsContainer) invertColorParamsContainer.style.display = 'block';
    }
    // For other effects or 'off', specific containers remain hidden, intensity visibility handled above
  });

  // Initialize UI state based on the default selected color effect
  // Ensure this runs after all DOM elements are available and listeners attached.
  // A common practice is to put such calls at the end of the script or in a DOMContentLoaded listener.
  // For now, dispatching event directly here assuming elements are parsed.
  // colorEffectSelect.dispatchEvent(new Event('change')); // This will be added at the end of the file.
}

if (chromaticAberrationModeSelect && chromaticAberrationAngleControlContainer) {
  chromaticAberrationModeSelect.addEventListener('change', () => {
    if (chromaticAberrationModeSelect.value === 'custom') {
      chromaticAberrationAngleControlContainer.style.display = 'block';
    } else {
      chromaticAberrationAngleControlContainer.style.display = 'none';
    }
  });
}

if (chromaticAberrationAngleRange && chromaticAberrationAngleValue) {
  chromaticAberrationAngleRange.addEventListener('input', () => {
    chromaticAberrationAngleValue.textContent = chromaticAberrationAngleRange.value;
  });
}

// Initialize visibility based on current selections (e.g., on page load/script run)
// This ensures the UI is correct if the page is reloaded with 'chromaticAberration' selected.
if (colorEffectSelect && chromaticAberrationParamsContainer && chromaticAberrationModeSelect && chromaticAberrationAngleControlContainer) {
    if (colorEffectSelect.value === 'chromaticAberration') {
        chromaticAberrationParamsContainer.style.display = 'block';
        if (chromaticAberrationModeSelect.value === 'custom') {
            chromaticAberrationAngleControlContainer.style.display = 'block';
        } else {
            chromaticAberrationAngleControlContainer.style.display = 'none';
        }
    } else {
        chromaticAberrationParamsContainer.style.display = 'none';
    }
} else {
    // Fallback if elements aren't found, hide them to prevent errors or partial UI
    if(chromaticAberrationParamsContainer) chromaticAberrationParamsContainer.style.display = 'none';
    if(chromaticAberrationAngleControlContainer) chromaticAberrationAngleControlContainer.style.display = 'none';
}
audioSensitivityRange.addEventListener('input', () => {
  audioSensitivityValue.textContent = audioSensitivityRange.value;
});

// NEW Selection Method Event Listeners
if (selectionMethodSelect) {
  selectionMethodSelect.addEventListener('change', () => {
    const method = selectionMethodSelect.value;
    
    // Hide all control groups
    if (colorRangeControls) colorRangeControls.style.display = 'none';
    if (brightnessControls) brightnessControls.style.display = 'none';
    if (edgeDetectionControls) edgeDetectionControls.style.display = 'none';
    if (organicShapeControls) organicShapeControls.style.display = 'none';
    if (combinedControls) combinedControls.style.display = 'none';
    
    // Show relevant controls
    switch(method) {
      case 'colorRange':
        if (colorRangeControls) colorRangeControls.style.display = 'block';
        break;
      case 'brightness':
        if (brightnessControls) brightnessControls.style.display = 'block';
        break;
      case 'edgeDetection':
        if (edgeDetectionControls) edgeDetectionControls.style.display = 'block';
        break;
      case 'organicShapes':
        if (organicShapeControls) organicShapeControls.style.display = 'block';
        break;
      case 'combined':
        if (combinedControls) combinedControls.style.display = 'block';
        break;
    }
  });
}

// Color range slider updates
if (targetHueRange) {
  targetHueRange.addEventListener('input', () => {
    targetHueValue.textContent = targetHueRange.value;
  });
}
if (colorToleranceRange) {
  colorToleranceRange.addEventListener('input', () => {
    colorToleranceValue.textContent = colorToleranceRange.value;
  });
}
if (minRegionSizeRange) {
  minRegionSizeRange.addEventListener('input', () => {
    minRegionSizeValue.textContent = minRegionSizeRange.value;
  });
}

// Edge detection slider
if (edgeThresholdRange) {
  edgeThresholdRange.addEventListener('input', () => {
    edgeThresholdValue.textContent = edgeThresholdRange.value;
  });
}

// Organic shape sliders
if (shapeRandomnessRange) {
  shapeRandomnessRange.addEventListener('input', () => {
    shapeRandomnessValue.textContent = shapeRandomnessRange.value;
  });
}
if (shapeCountRange) {
  shapeCountRange.addEventListener('input', () => {
    shapeCountValue.textContent = shapeCountRange.value;
  });
}

// Selection preview checkbox
if (selectionPreviewCheckbox) {
  selectionPreviewCheckbox.addEventListener('change', () => {
    showSelectionPreview = selectionPreviewCheckbox.checked;
  });
}

// Selection sensitivity
if (selectionSensitivityRange) {
  selectionSensitivityRange.addEventListener('input', () => {
    selectionSensitivityValue.textContent = selectionSensitivityRange.value;
  });
}

// Interactive tool buttons
const toolButtons = [selectTool, brushTool, wandTool, lassoTool];

toolButtons.forEach(button => {
  if (button) {
    button.addEventListener('click', () => {
      const tool = button.getAttribute('data-tool');
      
      // Remove active class from all buttons
      toolButtons.forEach(btn => btn?.classList.remove('active'));
      
      // Toggle tool
      if (currentTool === tool) {
        currentTool = 'none';
        canvas.className = '';
      } else {
        currentTool = tool;
        button.classList.add('active');
        canvas.className = `${tool}-cursor`;
      }
      
      // Initialize selection mask if needed
      if (currentTool !== 'none' && !selectionMask) {
        initializeSelectionMask();
      }
    });
  }
});

// Brush size
if (brushSizeRange) {
  brushSizeRange.addEventListener('input', () => {
    brushSizeValue.textContent = brushSizeRange.value;
  });
}

// Clear selections
if (clearSelectionsBtn) {
  clearSelectionsBtn.addEventListener('click', () => {
    clearSelectionMask();
    activeClumps = [];
  });
}

// Invert selection
if (invertSelectionBtn) {
  invertSelectionBtn.addEventListener('click', () => {
    invertSelectionMask();
  });
}

// Manual selection mode toggle
if (manualSelectionMode) {
  manualSelectionMode.addEventListener('change', () => {
    const isManual = manualSelectionMode.checked;
    
    // Show/hide automatic selection controls
    const methodElements = [
      selectionMethodSelect,
      colorRangeControls,
      brightnessControls,
      edgeDetectionControls,
      organicShapeControls,
      combinedControls,
      selectionSensitivityRange?.parentElement
    ];
    
    methodElements.forEach(el => {
      if (el) {
        el.style.display = isManual ? 'none' : '';
      }
    });
    
    // Show/hide interactive tools
    const interactiveToolsTitle = Array.from(document.querySelectorAll('.group-title')).find(
      el => el.textContent.includes('Interactive Tools')
    );
    const toolsContainer = interactiveToolsTitle?.parentElement;
    if (toolsContainer) {
      toolsContainer.style.display = isManual ? 'block' : 'none';
    }
    
    // Clear current selections when switching modes
    if (isManual) {
      activeClumps = [];
      if (!selectionMask) {
        initializeSelectionMask();
      }
    } else {
      currentTool = 'none';
      canvas.className = '';
      toolButtons.forEach(btn => btn?.classList.remove('active'));
    }
  });
}

// Initial UI setup based on default selections
if (colorEffectSelect) {
  colorEffectSelect.dispatchEvent(new Event('change'));
}
if (chromaticAberrationModeSelect) {
    chromaticAberrationModeSelect.dispatchEvent(new Event('change'));
}

// Toggle spiral direction
spiralDirectionBtn.addEventListener('click', () => {
  spiralDirection = (spiralDirection === 'cw') ? 'ccw' : 'cw';
  spiralDirectionBtn.textContent = spiralDirection.toUpperCase();
});

// Randomize settings
randomizeBtn.addEventListener('click', randomizeSettings);

// Play/Pause & Reset
playPauseBtn.addEventListener('click', togglePlayPause);
resetBtn.addEventListener('click', resetImage);

// Record
recordBtn.addEventListener('click', startRecording);

// Snapshot
snapshotBtn.addEventListener('click', downloadSnapshot);

// Presets
savePresetBtn.addEventListener('click', savePreset);
loadPresetBtn.addEventListener('click', () => presetFileInput.click());
presetFileInput.addEventListener('change', loadPresetFromFile);
presetSelect.addEventListener('change', loadBuiltInPreset);

// Audio reactive
audioReactiveCheckbox.addEventListener('change', toggleAudioReactive);

// Batch export
batchExportBtn.addEventListener('click', batchExport);

// Canvas mouse events for interactive tools
canvas.addEventListener('mousedown', handleCanvasMouseDown);
canvas.addEventListener('mousemove', handleCanvasMouseMove);
canvas.addEventListener('mouseup', handleCanvasMouseUp);
canvas.addEventListener('mouseleave', handleCanvasMouseLeave);

// Touch events for mobile
canvas.addEventListener('touchstart', handleCanvasTouchStart, { passive: false });
canvas.addEventListener('touchmove', handleCanvasTouchMove, { passive: false });
canvas.addEventListener('touchend', handleCanvasTouchEnd, { passive: false });

// ========== Image Resizing Logic ==========

function calculateAspectError(newWidth, newHeight, originalAspectRatio) {
  // originalAspectRatio can be a positive number, 0 (for zero width), or Infinity (for zero height).

  if (originalAspectRatio === Infinity) { // Original: width > 0, height = 0
    return newHeight === 0 && newWidth > 0 ? 0 : Infinity; // Match if new is also zero height, positive width
  }

  if (originalAspectRatio === 0) { // Original: width = 0, height > 0
    return newWidth === 0 && newHeight > 0 ? 0 : Infinity; // Match if new is also zero width, positive height
  }

  // At this point, originalAspectRatio is a finite positive number.

  if (newHeight === 0) { // New: height = 0. Cannot match finite positive original AR.
    return Infinity;
  }
  const newAspectRatio = newWidth / newHeight;
  if (newWidth === 0) { // New: width = 0, height > 0. newAspectRatio is 0. Cannot match finite positive original AR.
    return Infinity;
  }

  // Both original and new aspect ratios are finite, positive numbers.
  return Math.abs(newAspectRatio - originalAspectRatio) / originalAspectRatio;
}

function calculateOptimalDimensions(originalWidth, originalHeight) {
  const TARGET_PIXELS = 1048576; // 1MP
  const MAX_PIXELS = 2097152;    // 2MP
  const BASE_UNIT = 64;

  const MAX_WH_BLOCK_PRODUCT = MAX_PIXELS / (BASE_UNIT * BASE_UNIT); // Should be 512

  let safeOriginalWidth = originalWidth;
  let safeOriginalHeight = originalHeight;

  if (safeOriginalWidth <= 0 || safeOriginalHeight <= 0) {
    // Default to a 1:1 aspect ratio if original dimensions are invalid for ratio calculation
    safeOriginalWidth = BASE_UNIT; 
    safeOriginalHeight = BASE_UNIT;
  }
  const originalAspectRatio = safeOriginalWidth / safeOriginalHeight;

  let bestSolution = {
    W_block: -1, H_block: -1, pixel_score: Infinity, aspect_error: Infinity, meets_aspect_criteria: false
  };
  const MAX_ACCEPTABLE_ASPECT_ERROR = 0.20; // 20% tolerance

  // Initialize bestSolution with a default (e.g., 1x1 block) if possible
  if (MAX_WH_BLOCK_PRODUCT >= 1) {
    const initialWBlock = 1, initialHBlock = 1;
    const initialPixels = (initialWBlock * initialHBlock) * BASE_UNIT * BASE_UNIT;
    const initialAspectError = calculateAspectError(initialWBlock * BASE_UNIT, initialHBlock * BASE_UNIT, originalAspectRatio);
    bestSolution = {
        W_block: initialWBlock,
        H_block: initialHBlock,
        pixel_score: Math.abs(initialPixels - TARGET_PIXELS),
        aspect_error: initialAspectError,
        meets_aspect_criteria: initialAspectError <= MAX_ACCEPTABLE_ASPECT_ERROR
    };
  } else {
    // Not even a 1x1 block is possible within MAX_PIXELS, return smallest possible (or error)
    return { width: BASE_UNIT, height: BASE_UNIT }; // Or handle error appropriately
  }

  for (let currentWBlock = 1; currentWBlock <= MAX_WH_BLOCK_PRODUCT; currentWBlock++) {
    for (let currentHBlock = 1; (currentWBlock * currentHBlock) <= MAX_WH_BLOCK_PRODUCT; currentHBlock++) {
      const currentPixels = (currentWBlock * currentHBlock) * BASE_UNIT * BASE_UNIT;
      const currentPixelScore = Math.abs(currentPixels - TARGET_PIXELS);
      const candidateAspectError = calculateAspectError(currentWBlock * BASE_UNIT, currentHBlock * BASE_UNIT, originalAspectRatio);

      const candidateMeetsAspectCriteria = candidateAspectError <= MAX_ACCEPTABLE_ASPECT_ERROR;
      let updateSolution = false;

      if (bestSolution.W_block === -1) { // Should only happen if MAX_WH_BLOCK_PRODUCT was < 1 initially
          updateSolution = true;
      } else if (candidateMeetsAspectCriteria && bestSolution.meets_aspect_criteria) {
          // Both current candidate and best solution meet the aspect threshold.
          // Prioritize *better aspect ratio first*.
          if (candidateAspectError < bestSolution.aspect_error) {
              updateSolution = true;
          } else if (candidateAspectError === bestSolution.aspect_error && currentPixelScore < bestSolution.pixel_score) {
              // If aspect ratios are equally good, then pick based on pixel score.
              updateSolution = true;
          }
      } else if (candidateMeetsAspectCriteria && !bestSolution.meets_aspect_criteria) {
          // Candidate meets aspect criteria, but current best does not: prefer candidate.
          updateSolution = true;
      } else if (!candidateMeetsAspectCriteria && !bestSolution.meets_aspect_criteria) {
          // Neither candidate nor current best meet aspect criteria: fallback to prioritizing pixel score, then aspect error.
          if (currentPixelScore < bestSolution.pixel_score) {
              updateSolution = true;
          } else if (currentPixelScore === bestSolution.pixel_score && candidateAspectError < bestSolution.aspect_error) {
              updateSolution = true;
          }
      } // else: !candidateMeetsAspectCriteria && bestSolution.meets_aspect_criteria 
        // (Candidate is bad aspect-wise, current best is good aspect-wise - do not update bestSolution)
      
      if (updateSolution) {
        bestSolution.W_block = currentWBlock;
        bestSolution.H_block = currentHBlock;
        bestSolution.pixel_score = currentPixelScore;
        bestSolution.aspect_error = candidateAspectError;
        bestSolution.meets_aspect_criteria = candidateMeetsAspectCriteria;
      }
    }
  }
  
  // If bestSolution.W_block is still -1 (e.g., MAX_WH_BLOCK_PRODUCT was < 1), 
  // the initialization already returned. Otherwise, W_block will be at least 1.
  // So, this check might be redundant if initialization is robust.
  if (bestSolution.W_block === -1) { 
      // This case should ideally be handled by the initialization logic for MAX_WH_BLOCK_PRODUCT < 1
      return { width: BASE_UNIT, height: BASE_UNIT }; 
  }

  return {
    width: bestSolution.W_block * BASE_UNIT,
    height: bestSolution.H_block * BASE_UNIT,
  };
}

// ========== Load Image & Start ==========

function handleFileSelect() {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      const originalW = img.width;
      const originalH = img.height;
      const { width: newCalculatedWidth, height: newCalculatedHeight } = calculateOptimalDimensions(originalW, originalH);

      imgWidth  = newCalculatedWidth;
      imgHeight = newCalculatedHeight;
      canvas.width  = imgWidth;
      canvas.height = imgHeight;

      // Ensure the image is drawn filling the new canvas dimensions
      ctx.drawImage(img, 0, 0, imgWidth, imgHeight); 
      originalImageData = ctx.getImageData(0, 0, imgWidth, imgHeight);

      glitchImageData = new ImageData(
        new Uint8ClampedArray(originalImageData.data),
        imgWidth,
        imgHeight
      );

      // Show canvas, hide placeholder
      canvas.style.display = 'block';
      canvasPlaceholder.style.display = 'none';

      // Initialize selection engine
      selectionEngine = new SelectionEngine(originalImageData, imgWidth, imgHeight);

      startAnimation();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function startAnimation() {
  if (animationId) cancelAnimationFrame(animationId);
  if (!glitchImageData) return;

  isPaused = false;
  updatePlayPauseButton();
  activeClumps = [];
  frameCount = 0;
  lastFrameTime = 0;
  animate(0);
}

function updatePlayPauseButton() {
  if (isPaused) {
    playPauseBtn.innerHTML = `
      <div class=\"flex-row\">
        <div class=\"status-indicator paused\" id=\"status-indicator\"></div>
        <span>▶️ Play</span>
      </div>
    `;
  } else {
    playPauseBtn.innerHTML = `
      <div class=\"flex-row\">
        <div class=\"status-indicator\" id=\"status-indicator\"></div>
        <span>⏸️ Pause</span>
      </div>
    `;
  }
}

// ========== Animation Loop ==========

function animate(currentTime) {
  // Frame rate limiting
  if (currentTime - lastFrameTime < 1000 / targetFrameRate) {
    animationId = requestAnimationFrame(animate);
    return;
  }
  lastFrameTime = currentTime;

  if (isPaused) {
    animationId = requestAnimationFrame(animate);
    return;
  }

  frameCount++;

  // Read current UI states
  const direction   = directionSelect.value;
  const spiral      = spiralSelect.value;
  const slice       = sliceSelect.value;
  const pixelSort   = pixelSortSelect.value;
  const colorEffect = colorEffectSelect.value;
  const datamosh    = datamoshSelect.value;
  const intensity   = intensitySelect.value;
  const shiftSpeed  = parseInt(speedRange.value, 10);
  const swirlStr    = parseFloat(swirlRange.value);
  const colorMax    = parseInt(colorOffsetRange.value, 10);
  const minLife     = parseInt(minLifetimeRange.value, 10);
  const maxLife     = parseInt(maxLifetimeRange.value, 10);
  const sortFreq    = parseInt(sortFrequencyRange.value, 10);
  const colorIntensity = parseInt(colorIntensityRange.value, 10);
  const datamoshIntensity = parseInt(datamoshIntensityRange.value, 10);

  // Get audio data if audio reactive is enabled
  let audioLevel = 0;
  if (audioReactiveCheckbox && audioReactiveCheckbox.checked && analyser && audioData) {
    analyser.getByteFrequencyData(audioData);
    audioLevel = audioData.reduce((sum, value) => sum + value, 0) / audioData.length / 255;
  }

  // Apply effects with audio reactivity
  const audioMultiplier = (audioReactiveCheckbox && audioReactiveCheckbox.checked) ? (1 + audioLevel * 2) : 1;

  // Manage clumps
  if (activeClumps.length === 0) {
    spawnNewClumps(intensity, minLife, maxLife);
  }

  // For each clump, do direction + swirl
  activeClumps.forEach(clump => {
    if (direction !== 'off') {
      applyDirectionShift(glitchImageData, clump, Math.floor(shiftSpeed * audioMultiplier), direction);
    }
    if (spiral !== 'off') {
      let swirlType = spiral;
      if (spiral === 'spiral') {
        swirlType = spiralDirection;
      }
      swirlRectangle(glitchImageData, clump, swirlStr * audioMultiplier, swirlType);
    }
    clump.framesRemaining--;
  });
  activeClumps = activeClumps.filter(c => c.framesRemaining > 0);

  // Slice glitch
  if (slice !== 'off') {
    applySliceGlitch(glitchImageData, slice, Math.floor(colorMax * audioMultiplier));
  }

  // Pixel sort with frequency control
  if (pixelSort !== 'off' && frameCount % Math.max(1, 101 - sortFreq) === 0) {
    applyPixelSort(glitchImageData, pixelSort);
  }

  // Color effects
  if (colorEffect !== 'off') {
    const newPixelData = applyColorEffect(glitchImageData, colorEffect, colorIntensity * audioMultiplier);
    if (newPixelData && newPixelData !== glitchImageData.data) {
      // Ensure glitchImageData.data is updated with the new pixel data.
      // Create a new Uint8ClampedArray from the returned data to be safe,
      // as ImageData.data expects this type.
      glitchImageData.data.set(new Uint8ClampedArray(newPixelData));
    }
  }

  // Datamoshing
  if (datamosh !== 'off') {
    applyDatamosh(glitchImageData, datamosh, datamoshIntensity * audioMultiplier);
  }

  // Draw updated
  ctx.putImageData(glitchImageData, 0, 0);
  
  // Draw selection preview if enabled
  if (showSelectionPreview && activeClumps.length > 0) {
    drawSelectionPreview();
  }
  
  // Draw interactive selection overlay
  if (currentTool !== 'none') {
    drawInteractiveSelectionOverlay();
  }

  animationId = requestAnimationFrame(animate);
}

// ========== Selection Preview Drawing ==========

function drawSelectionPreview() {
  ctx.save();
  ctx.fillStyle = `rgba(78, 205, 196, ${selectionPreviewOpacity})`;
  ctx.strokeStyle = 'rgba(78, 205, 196, 0.8)';
  ctx.lineWidth = 2;
  
  activeClumps.forEach(clump => {
    // Fill with semi-transparent color
    ctx.fillRect(clump.x, clump.y, clump.w, clump.h);
    
    // Draw border
    ctx.strokeRect(clump.x, clump.y, clump.w, clump.h);
  });
  
  ctx.restore();
}

function drawInteractiveSelectionOverlay() {
  ctx.save();
  
  // Draw selection mask
  if (selectionMask) {
    ctx.fillStyle = 'rgba(78, 205, 196, 0.3)';
    
    // Find connected regions and draw rectangles
    const visited = new Uint8Array(imgWidth * imgHeight);
    
    for (let y = 0; y < imgHeight; y++) {
      for (let x = 0; x < imgWidth; x++) {
        const idx = y * imgWidth + x;
        
        if (selectionMask[idx] && !visited[idx]) {
          // Find the extent of this selection region
          const region = findSelectionRegionBounds(x, y, visited);
          
          // Draw rectangle for this region
          ctx.fillRect(region.x, region.y, region.w, region.h);
        }
      }
    }
  }
  
  // Draw temp selection (for select tool)
  if (tempSelection && currentTool === 'select' && isDrawing) {
    ctx.strokeStyle = 'rgba(78, 205, 196, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    const x = Math.min(tempSelection.startX, tempSelection.endX);
    const y = Math.min(tempSelection.startY, tempSelection.endY);
    const w = Math.abs(tempSelection.endX - tempSelection.startX);
    const h = Math.abs(tempSelection.endY - tempSelection.startY);
    
    ctx.strokeRect(x, y, w, h);
    ctx.setLineDash([]);
  }
  
  // Draw lasso path
  if (lassoPath.length > 1 && currentTool === 'lasso' && isDrawing) {
    ctx.strokeStyle = 'rgba(78, 205, 196, 0.8)';
    ctx.lineWidth = 2;
    ctx.setLineDash([5, 5]);
    
    ctx.beginPath();
    ctx.moveTo(lassoPath[0].x, lassoPath[0].y);
    
    for (let i = 1; i < lassoPath.length; i++) {
      ctx.lineTo(lassoPath[i].x, lassoPath[i].y);
    }
    
    ctx.stroke();
    ctx.setLineDash([]);
  }
  
  // Draw brush cursor
  if (currentTool === 'brush' && brushCursorPos.x >= 0 && brushCursorPos.y >= 0) {
    const brushSize = parseInt(brushSizeRange.value);
    ctx.strokeStyle = 'rgba(78, 205, 196, 0.6)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.arc(brushCursorPos.x, brushCursorPos.y, brushSize / 2, 0, Math.PI * 2);
    ctx.stroke();
  }
  
  ctx.restore();
}

// Helper function to find bounds of a selection region
function findSelectionRegionBounds(startX, startY, visited) {
  const stack = [[startX, startY]];
  const region = {
    x: startX,
    y: startY,
    w: 1,
    h: 1,
    minX: startX,
    maxX: startX,
    minY: startY,
    maxY: startY
  };
  
  while (stack.length > 0) {
    const [x, y] = stack.pop();
    const idx = y * imgWidth + x;
    
    if (x < 0 || x >= imgWidth || y < 0 || y >= imgHeight || 
        visited[idx] || !selectionMask[idx]) {
      continue;
    }
    
    visited[idx] = 1;
    region.minX = Math.min(region.minX, x);
    region.maxX = Math.max(region.maxX, x);
    region.minY = Math.min(region.minY, y);
    region.maxY = Math.max(region.maxY, y);
    
    // Add neighbors
    stack.push([x + 1, y]);
    stack.push([x - 1, y]);
    stack.push([x, y + 1]);
    stack.push([x, y - 1]);
  }
  
  region.x = region.minX;
  region.y = region.minY;
  region.w = region.maxX - region.minX + 1;
  region.h = region.maxY - region.minY + 1;
  
  return region;
}

// ========== Selection History Functions ==========

function saveSelectionHistory(selections, method, config) {
  selectionHistory.push({
    timestamp: Date.now(),
    method: method,
    config: { ...config },
    selections: selections.map(s => ({ ...s }))
  });
  
  // Keep history size limited
  if (selectionHistory.length > maxHistorySize) {
    selectionHistory.shift();
  }
}

function getLastSelection() {
  if (selectionHistory.length > 0) {
    return selectionHistory[selectionHistory.length - 1];
  }
  return null;
}

function replayLastSelection() {
  const lastSelection = getLastSelection();
  if (lastSelection && selectionEngine) {
    activeClumps = [];
    
    lastSelection.selections.forEach(selection => {
      const framesRemaining = randomInt(
        parseInt(minLifetimeRange.value),
        parseInt(maxLifetimeRange.value)
      );
      
      let clumpDirection = null;
      if (directionSelect.value === 'random') {
        const dirs = ['down','up','left','right'];
        clumpDirection = dirs[randomInt(0, dirs.length - 1)];
      }
      
      activeClumps.push({
        x: selection.x,
        y: selection.y,
        w: selection.w,
        h: selection.h,
        framesRemaining,
        clumpDirection
      });
    });
  }
}

// ========== Interactive Selection Functions ==========

function initializeSelectionMask() {
  if (imgWidth > 0 && imgHeight > 0) {
    selectionMask = new Uint8Array(imgWidth * imgHeight);
  }
}

function clearSelectionMask() {
  if (selectionMask) {
    selectionMask.fill(0);
  }
}

function invertSelectionMask() {
  if (selectionMask) {
    for (let i = 0; i < selectionMask.length; i++) {
      selectionMask[i] = selectionMask[i] ? 0 : 255;
    }
    updateSelectionsFromMask();
  }
}

function updateSelectionsFromMask() {
  if (!selectionMask || !selectionEngine) return;
  
  // Convert mask to rectangular regions
  const regions = [];
  const visited = new Uint8Array(imgWidth * imgHeight);
  
  for (let y = 0; y < imgHeight; y++) {
    for (let x = 0; x < imgWidth; x++) {
      const idx = y * imgWidth + x;
      
      if (selectionMask[idx] && !visited[idx]) {
        // Find connected region
        const region = findConnectedRegion(x, y, visited);
        if (region.pixels > 50) { // Minimum size threshold
          regions.push({
            x: region.minX,
            y: region.minY,
            w: region.maxX - region.minX,
            h: region.maxY - region.minY
          });
        }
      }
    }
  }
  
  // Update active clumps
  activeClumps = [];
  regions.forEach(region => {
    const framesRemaining = randomInt(
      parseInt(minLifetimeRange.value),
      parseInt(maxLifetimeRange.value)
    );
    
    let clumpDirection = null;
    if (directionSelect.value === 'random') {
      const dirs = ['down','up','left','right'];
      clumpDirection = dirs[randomInt(0, dirs.length - 1)];
    }
    
    activeClumps.push({
      ...region,
      framesRemaining,
      clumpDirection
    });
  });
}

function findConnectedRegion(startX, startY, visited) {
  const stack = [[startX, startY]];
  const region = {
    pixels: 0,
    minX: startX,
    maxX: startX,
    minY: startY,
    maxY: startY
  };
  
  while (stack.length > 0) {
    const [x, y] = stack.pop();
    const idx = y * imgWidth + x;
    
    if (x < 0 || x >= imgWidth || y < 0 || y >= imgHeight || 
        visited[idx] || !selectionMask[idx]) {
      continue;
    }
    
    visited[idx] = 1;
    region.pixels++;
    region.minX = Math.min(region.minX, x);
    region.maxX = Math.max(region.maxX, x);
    region.minY = Math.min(region.minY, y);
    region.maxY = Math.max(region.maxY, y);
    
    // Add neighbors
    stack.push([x + 1, y]);
    stack.push([x - 1, y]);
    stack.push([x, y + 1]);
    stack.push([x, y - 1]);
  }
  
  return region;
}

// ========== Canvas Interaction Handlers ==========

function getCanvasCoordinates(e) {
  const rect = canvas.getBoundingClientRect();
  const scaleX = imgWidth / rect.width;
  const scaleY = imgHeight / rect.height;
  
  return {
    x: Math.floor((e.clientX - rect.left) * scaleX),
    y: Math.floor((e.clientY - rect.top) * scaleY)
  };
}

function handleCanvasMouseDown(e) {
  if (currentTool === 'none' || !selectionMask) return;
  
  const coords = getCanvasCoordinates(e);
  isDrawing = true;
  lastMousePos = coords;
  
  switch (currentTool) {
    case 'select':
      tempSelection = { startX: coords.x, startY: coords.y, endX: coords.x, endY: coords.y };
      break;
      
    case 'brush':
      drawBrush(coords.x, coords.y);
      break;
      
    case 'wand':
      selectSimilarColors(coords.x, coords.y);
      updateSelectionsFromMask();
      break;
      
    case 'lasso':
      lassoPath = [coords];
      break;
  }
}

function handleCanvasMouseMove(e) {
  const coords = getCanvasCoordinates(e);
  
  // Update brush cursor
  if (currentTool === 'brush') {
    drawBrushCursor(coords.x, coords.y);
  }
  
  if (!isDrawing) return;
  
  switch (currentTool) {
    case 'select':
      if (tempSelection) {
        tempSelection.endX = coords.x;
        tempSelection.endY = coords.y;
      }
      break;
      
    case 'brush':
      drawLine(lastMousePos.x, lastMousePos.y, coords.x, coords.y);
      lastMousePos = coords;
      break;
      
    case 'lasso':
      lassoPath.push(coords);
      break;
  }
}

function handleCanvasMouseUp(e) {
  if (!isDrawing) return;
  
  isDrawing = false;
  
  switch (currentTool) {
    case 'select':
      if (tempSelection) {
        applyRectSelection(tempSelection);
        tempSelection = null;
        updateSelectionsFromMask();
      }
      break;
      
    case 'lasso':
      if (lassoPath.length > 2) {
        applyLassoSelection(lassoPath);
        updateSelectionsFromMask();
      }
      lassoPath = [];
      break;
  }
}

function handleCanvasMouseLeave(e) {
  isDrawing = false;
}

// Touch event handlers
function handleCanvasTouchStart(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent('mousedown', {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
}

function handleCanvasTouchMove(e) {
  e.preventDefault();
  const touch = e.touches[0];
  const mouseEvent = new MouseEvent('mousemove', {
    clientX: touch.clientX,
    clientY: touch.clientY
  });
  canvas.dispatchEvent(mouseEvent);
}

function handleCanvasTouchEnd(e) {
  e.preventDefault();
  const mouseEvent = new MouseEvent('mouseup');
  canvas.dispatchEvent(mouseEvent);
}

// ========== Tool-specific Functions ==========

function drawBrush(x, y) {
  if (!selectionMask) return;
  
  const brushSize = parseInt(brushSizeRange.value);
  const radius = brushSize / 2;
  
  for (let dy = -radius; dy <= radius; dy++) {
    for (let dx = -radius; dx <= radius; dx++) {
      if (dx * dx + dy * dy <= radius * radius) {
        const px = Math.floor(x + dx);
        const py = Math.floor(y + dy);
        
        if (px >= 0 && px < imgWidth && py >= 0 && py < imgHeight) {
          selectionMask[py * imgWidth + px] = 255;
        }
      }
    }
  }
}

function drawLine(x1, y1, x2, y2) {
  const dx = Math.abs(x2 - x1);
  const dy = Math.abs(y2 - y1);
  const sx = x1 < x2 ? 1 : -1;
  const sy = y1 < y2 ? 1 : -1;
  let err = dx - dy;
  
  while (true) {
    drawBrush(x1, y1);
    
    if (x1 === x2 && y1 === y2) break;
    
    const e2 = 2 * err;
    if (e2 > -dy) {
      err -= dy;
      x1 += sx;
    }
    if (e2 < dx) {
      err += dx;
      y1 += sy;
    }
  }
}

function applyRectSelection(selection) {
  if (!selectionMask) return;
  
  const minX = Math.min(selection.startX, selection.endX);
  const maxX = Math.max(selection.startX, selection.endX);
  const minY = Math.min(selection.startY, selection.endY);
  const maxY = Math.max(selection.startY, selection.endY);
  
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (x >= 0 && x < imgWidth && y >= 0 && y < imgHeight) {
        selectionMask[y * imgWidth + x] = 255;
      }
    }
  }
}

function selectSimilarColors(x, y) {
  if (!selectionMask || !glitchImageData) return;
  
  const idx = (y * imgWidth + x) * 4;
  const targetR = glitchImageData.data[idx];
  const targetG = glitchImageData.data[idx + 1];
  const targetB = glitchImageData.data[idx + 2];
  
  const tolerance = 30; // Color tolerance
  const visited = new Uint8Array(imgWidth * imgHeight);
  const stack = [[x, y]];
  
  while (stack.length > 0) {
    const [cx, cy] = stack.pop();
    const cidx = cy * imgWidth + cx;
    
    if (cx < 0 || cx >= imgWidth || cy < 0 || cy >= imgHeight || visited[cidx]) {
      continue;
    }
    
    visited[cidx] = 1;
    
    const pidx = cidx * 4;
    const r = glitchImageData.data[pidx];
    const g = glitchImageData.data[pidx + 1];
    const b = glitchImageData.data[pidx + 2];
    
    const colorDiff = Math.sqrt(
      (r - targetR) ** 2 + 
      (g - targetG) ** 2 + 
      (b - targetB) ** 2
    );
    
    if (colorDiff <= tolerance) {
      selectionMask[cidx] = 255;
      
      // Add neighbors
      stack.push([cx + 1, cy]);
      stack.push([cx - 1, cy]);
      stack.push([cx, cy + 1]);
      stack.push([cx, cy - 1]);
    }
  }
}

function applyLassoSelection(path) {
  if (!selectionMask || path.length < 3) return;
  
  // Find bounding box
  let minX = imgWidth, maxX = 0, minY = imgHeight, maxY = 0;
  
  path.forEach(point => {
    minX = Math.min(minX, point.x);
    maxX = Math.max(maxX, point.x);
    minY = Math.min(minY, point.y);
    maxY = Math.max(maxY, point.y);
  });
  
  // Check each point in bounding box
  for (let y = minY; y <= maxY; y++) {
    for (let x = minX; x <= maxX; x++) {
      if (isPointInPolygon(x, y, path)) {
        if (x >= 0 && x < imgWidth && y >= 0 && y < imgHeight) {
          selectionMask[y * imgWidth + x] = 255;
        }
      }
    }
  }
}

function isPointInPolygon(x, y, polygon) {
  let inside = false;
  
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i++) {
    const xi = polygon[i].x, yi = polygon[i].y;
    const xj = polygon[j].x, yj = polygon[j].y;
    
    const intersect = ((yi > y) !== (yj > y)) && 
                     (x < (xj - xi) * (y - yi) / (yj - yi) + xi);
    
    if (intersect) inside = !inside;
  }
  
  return inside;
}

function drawBrushCursor(x, y) {
  // Update brush cursor position for drawing in the animation loop
  brushCursorPos.x = x;
  brushCursorPos.y = y;
}

// ========== Core Glitch Functions ==========
// [Including all the functions from the beta version - clumps, direction shift, spiral, slice, pixel sort]

// Helper function to check if we're in manual selection mode
function isManualSelectionMode() {
  return manualSelectionMode && manualSelectionMode.checked;
}

function spawnNewClumps(intensity, minLife, maxLife) {
  // Check if manual selection mode is active
  if (manualSelectionMode && manualSelectionMode.checked) {
    // In manual mode, selections come from the selection mask
    if (selectionMask && activeClumps.length === 0) {
      updateSelectionsFromMask();
    }
    return;
  }
  
  if (!selectionEngine) {
    // Fallback to random if no selection engine
    const n = getNumClumps(intensity);
    for (let i = 0; i < n; i++) {
      const { x, y, w, h } = pickRandomClump(intensity, imgWidth, imgHeight);
      const framesRemaining = randomInt(minLife, maxLife);

      let clumpDirection = null;
      if (directionSelect.value === 'random') {
        const dirs = ['down','up','left','right'];
        clumpDirection = dirs[randomInt(0, dirs.length - 1)];
      }

      activeClumps.push({ x, y, w, h, framesRemaining, clumpDirection });
    }
    return;
  }

  // Use selection engine
  const method = selectionMethodSelect ? selectionMethodSelect.value : 'random';
  const sensitivity = selectionSensitivityRange ? parseFloat(selectionSensitivityRange.value) : 1.0;
  
  const config = {
    intensity: intensity,
    targetHue: targetHueRange ? parseInt(targetHueRange.value) : 180,
    hueTolerance: colorToleranceRange ? parseInt(colorToleranceRange.value) * sensitivity : 30,
    minRegionSize: minRegionSizeRange ? parseInt(minRegionSizeRange.value) / sensitivity : 100,
    zone: brightnessZoneSelect ? brightnessZoneSelect.value : 'shadows',
    threshold: edgeThresholdRange ? parseInt(edgeThresholdRange.value) / sensitivity : 30,
    count: shapeCountRange ? parseInt(shapeCountRange.value) : 3,
    randomness: shapeRandomnessRange ? parseFloat(shapeRandomnessRange.value) : 0.3,
    maxRegions: Math.ceil(getNumClumps(intensity) * sensitivity)
  };

  const selections = selectionEngine.generateSelections(method, config);
  
  // Save to history
  if (selections.length > 0) {
    saveSelectionHistory(selections, method, config);
  }
  
  // Convert selections to active clumps
  selections.forEach(selection => {
    const framesRemaining = randomInt(minLife, maxLife);
    
    let clumpDirection = null;
    if (directionSelect.value === 'random') {
      const dirs = ['down','up','left','right'];
      clumpDirection = dirs[randomInt(0, dirs.length - 1)];
    }
    
    activeClumps.push({
      x: selection.x,
      y: selection.y,
      w: selection.w,
      h: selection.h,
      framesRemaining,
      clumpDirection
    });
  });
  
  // If no selections were found, fall back to random
  if (selections.length === 0) {
    const { x, y, w, h } = pickRandomClump(intensity, imgWidth, imgHeight);
    const framesRemaining = randomInt(minLife, maxLife);
    
    let clumpDirection = null;
    if (directionSelect.value === 'random') {
      const dirs = ['down','up','left','right'];
      clumpDirection = dirs[randomInt(0, dirs.length - 1)];
    }
    
    activeClumps.push({ x, y, w, h, framesRemaining, clumpDirection });
  }
}

function getNumClumps(intensity) {
  switch (intensity) {
    case 'medium':     return 2;
    case 'large':      return 4;
    case 'extraLarge': return 6;
    default:           return 2;
  }
}

function pickRandomClump(intensity, width, height) {
  let maxW, maxH;
  switch (intensity) {
    case 'medium':
      maxW = Math.floor(width / 6);
      maxH = Math.floor(height / 6);
      break;
    case 'large':
      maxW = Math.floor(width / 3);
      maxH = Math.floor(height / 3);
      break;
    case 'extraLarge':
      maxW = Math.floor(width / 2);
      maxH = Math.floor(height / 2);
      break;
    default:
      maxW = Math.floor(width / 6);
      maxH = Math.floor(height / 6);
  }
  const w = randomInt(10, maxW);
  const h = randomInt(10, maxH);
  const x = randomInt(0, width - w);
  const y = randomInt(0, height - h);

  return { x, y, w, h };
}

// ========== Direction Shift Functions ==========

function applyDirectionShift(imageData, clump, speed, globalDir) {
  let dir = globalDir;
  if (globalDir === 'random') {
    dir = clump.clumpDirection;
  } else if (globalDir === 'jitter') {
    const dirs = ['up','down','left','right'];
    dir = dirs[randomInt(0, dirs.length - 1)];
  }

  switch (dir) {
    case 'down':  shiftRectDown(imageData, clump, speed);  break;
    case 'up':    shiftRectUp(imageData, clump, speed);    break;
    case 'left':  shiftRectLeft(imageData, clump, speed);  break;
    case 'right': shiftRectRight(imageData, clump, speed); break;
  }
}

function shiftRectDown(imageData, {x,y,w,h}, shift) {
  const { data, width, height } = imageData;
  const mask = isManualSelectionMode() ? selectionMask : null;
  
  for (let row = y + h - 1; row >= y; row--) {
    const destRow = row + shift;
    if (destRow >= height) continue;
    for (let col = x; col < x + w; col++) {
      const maskIdx = row * width + col;
      
      // Only shift if pixel is selected (or no mask)
      if (!mask || mask[maskIdx] === 255) {
        const srcIdx = (row * width + col) * 4;
        const dstIdx = (destRow * width + col) * 4;
        data[dstIdx]   = data[srcIdx];
        data[dstIdx+1] = data[srcIdx+1];
        data[dstIdx+2] = data[srcIdx+2];
        data[dstIdx+3] = data[srcIdx+3];
      }
    }
  }
}

function shiftRectUp(imageData, {x,y,w,h}, shift) {
  const { data, width } = imageData;
  const mask = isManualSelectionMode() ? selectionMask : null;
  
  for (let row = y; row < y + h; row++) {
    const destRow = row - shift;
    if (destRow < 0) continue;
    for (let col = x; col < x + w; col++) {
      const maskIdx = row * width + col;
      
      // Only shift if pixel is selected (or no mask)
      if (!mask || mask[maskIdx] === 255) {
        const srcIdx = (row * width + col) * 4;
        const dstIdx = (destRow * width + col) * 4;
        data[dstIdx]   = data[srcIdx];
        data[dstIdx+1] = data[srcIdx+1];
        data[dstIdx+2] = data[srcIdx+2];
        data[dstIdx+3] = data[srcIdx+3];
      }
    }
  }
}

function shiftRectLeft(imageData, {x,y,w,h}, shift) {
  const { data, width } = imageData;
  const mask = isManualSelectionMode() ? selectionMask : null;
  
  for (let row = y; row < y + h; row++) {
    for (let col = x; col < x + w; col++) {
      const maskIdx = row * width + col;
      
      // Only shift if pixel is selected (or no mask)
      if (!mask || mask[maskIdx] === 255) {
        const destCol = col - shift;
        if (destCol < 0) continue;
        const srcIdx  = (row * width + col) * 4;
        const dstIdx  = (row * width + destCol) * 4;
        data[dstIdx]   = data[srcIdx];
        data[dstIdx+1] = data[srcIdx+1];
        data[dstIdx+2] = data[srcIdx+2];
        data[dstIdx+3] = data[srcIdx+3];
      }
    }
  }
}

function shiftRectRight(imageData, {x,y,w,h}, shift) {
  const { data, width } = imageData;
  const mask = isManualSelectionMode() ? selectionMask : null;
  
  for (let row = y; row < y + h; row++) {
    for (let col = x + w - 1; col >= x; col--) {
      const maskIdx = row * width + col;
      
      // Only shift if pixel is selected (or no mask)
      if (!mask || mask[maskIdx] === 255) {
        const destCol = col + shift;
        if (destCol >= width) continue;
        const srcIdx  = (row * width + col) * 4;
        const dstIdx  = (row * width + destCol) * 4;
        data[dstIdx]   = data[srcIdx];
        data[dstIdx+1] = data[srcIdx+1];
        data[dstIdx+2] = data[srcIdx+2];
        data[dstIdx+3] = data[srcIdx+3];
      }
    }
  }
}

// ========== Spiral (Swirl) Functions ==========

function swirlRectangle(imageData, rect, swirlStrength, swirlType) {
  // swirlType: 'spiral', 'insideOut', 'outsideIn', 'random'

  const { x, y, w, h } = rect;
  const { data, width, height } = imageData;
  if (x<0 || y<0 || x+w>width || y+h>height) return;

  const mask = isManualSelectionMode() ? selectionMask : null;
  const subregion = new Uint8ClampedArray(w * h * 4);
  
  // Copy only selected pixels to subregion
  for (let row=0; row<h; row++) {
    for (let col=0; col<w; col++) {
      const srcX = x + col;
      const srcY = y + row;
      const maskIdx = srcY * width + srcX;
      
      if (!mask || mask[maskIdx] === 255) {
        const srcIdx = (srcY * width + srcX) * 4;
        const dstIdx = (row * w + col) * 4;
        subregion[dstIdx]   = data[srcIdx];
        subregion[dstIdx+1] = data[srcIdx+1];
        subregion[dstIdx+2] = data[srcIdx+2];
        subregion[dstIdx+3] = data[srcIdx+3];
      }
    }
  }

  const centerX = w/2, centerY = h/2;
  const maxR = Math.sqrt(centerX*centerX + centerY*centerY);
  const swirlBuffer = new Uint8ClampedArray(subregion);

  for (let row=0; row<h; row++) {
    for (let col=0; col<w; col++) {
      const srcX = x + col;
      const srcY = y + row;
      const maskIdx = srcY * width + srcX;
      
      if (!mask || mask[maskIdx] === 255) {
        const dx = col - centerX;
        const dy = row - centerY;
        const r  = Math.sqrt(dx*dx + dy*dy);
        const theta = Math.atan2(dy, dx);

        const swirlAngle = computeSwirlAngle(r, maxR, swirlStrength, swirlType);
        const newTheta   = theta + swirlAngle;

        const nx = Math.round(centerX + r*Math.cos(newTheta));
        const ny = Math.round(centerY + r*Math.sin(newTheta));
        if (nx>=0 && nx<w && ny>=0 && ny<h) {
          const srcIdx  = (row*w + col)*4;
          const dstIdx  = (ny*w + nx)*4;
          swirlBuffer[dstIdx]   = subregion[srcIdx];
          swirlBuffer[dstIdx+1] = subregion[srcIdx+1];
          swirlBuffer[dstIdx+2] = subregion[srcIdx+2];
          swirlBuffer[dstIdx+3] = subregion[srcIdx+3];
        }
      }
    }
  }

  // Write back only to selected pixels
  for (let row=0; row<h; row++) {
    for (let col=0; col<w; col++) {
      const dstX = x + col;
      const dstY = y + row;
      const maskIdx = dstY * width + dstX;
      
      if (!mask || mask[maskIdx] === 255) {
        const srcIdx = (row*w + col)*4;
        const dstIdx = (dstY * width + dstX)*4;
        data[dstIdx]   = swirlBuffer[srcIdx];
        data[dstIdx+1] = swirlBuffer[srcIdx+1];
        data[dstIdx+2] = swirlBuffer[srcIdx+2];
        data[dstIdx+3] = swirlBuffer[srcIdx+3];
      }
    }
  }
}

function computeSwirlAngle(r, maxR, strength, type) {
  let angle = 0;
  // Determine the multiplier based on the global spiralDirection
  const directionMultiplier = (spiralDirection === 'cw' ? 1 : -1);

  switch (type) {
    case 'cw': // Explicit clockwise selection from UI
      angle = +strength * (r / maxR);
      break;
    case 'ccw': // Explicit counter-clockwise selection from UI
      angle = -strength * (r / maxR);
      break;
    case 'insideOut':
      // Apply global direction to the base 'insideOut' effect
      angle = strength * (1 - r / maxR) * directionMultiplier;
      break;
    case 'outsideIn':
      // Apply global direction to the base 'outsideIn' effect
      angle = strength * (r / maxR) * directionMultiplier;
      break;
    case 'random':
      // Random mode determines its own directionality, not affected by global toggle for now
      angle = (Math.random() * 2 - 1) * strength * (r / maxR);
      break;
    default:
      angle = 0;
      break;
  }
  return angle;
}

// ========== Slice Glitch Functions ==========

function applySliceGlitch(imageData, sliceType, colorMax) {
  if (sliceType === 'horizontal' || sliceType === 'both') {
    horizontalSliceGlitch(imageData, colorMax);
  }
  if (sliceType === 'vertical' || sliceType === 'both') {
    verticalSliceGlitch(imageData, colorMax);
  }
}

function horizontalSliceGlitch(imageData, colorMax) {
  const { data, width, height } = imageData;
  const mask = isManualSelectionMode() ? selectionMask : null;
  const sliceHeight = randomInt(1, Math.floor(height/6));
  const startY = randomInt(0, height - sliceHeight);
  const direction = Math.random()<0.5 ? -1 : 1;
  const offset = randomInt(1, 5);
  const colorOffset = randomInt(-colorMax, colorMax);

  for (let row=startY; row<startY+sliceHeight; row++) {
    if (direction === 1) {
      for (let col=width-1; col>=0; col--) {
        const maskIdx = row * width + col;
        
        if (!mask || mask[maskIdx] === 255) {
          const srcIdx  = (row*width + col)*4;
          const dstCol  = col + offset;
          if (dstCol>=width) continue;
          const dstIdx  = (row*width + dstCol)*4;

          data[dstIdx]   = clampColor(data[srcIdx] + colorOffset);
          data[dstIdx+1] = clampColor(data[srcIdx+1] + colorOffset);
          data[dstIdx+2] = clampColor(data[srcIdx+2] + colorOffset);
          data[dstIdx+3] = data[srcIdx+3];
        }
      }
    } else {
      for (let col=0; col<width; col++) {
        const maskIdx = row * width + col;
        
        if (!mask || mask[maskIdx] === 255) {
          const srcIdx  = (row*width + col)*4;
          const dstCol  = col - offset;
          if (dstCol<0) continue;
          const dstIdx  = (row*width + dstCol)*4;

          data[dstIdx]   = clampColor(data[srcIdx] + colorOffset);
          data[dstIdx+1] = clampColor(data[srcIdx+1] + colorOffset);
          data[dstIdx+2] = clampColor(data[srcIdx+2] + colorOffset);
          data[dstIdx+3] = data[srcIdx+3];
        }
      }
    }
  }
}

function verticalSliceGlitch(imageData, colorMax) {
  const { data, width, height } = imageData;
  const mask = isManualSelectionMode() ? selectionMask : null;
  const sliceWidth = randomInt(1, Math.floor(width/6));
  const startX = randomInt(0, width - sliceWidth);
  const direction = Math.random()<0.5 ? -1 : 1;
  const offset = randomInt(1, 5);
  const colorOffset = randomInt(-colorMax, colorMax);

  for (let col=startX; col<startX+sliceWidth; col++) {
    if (direction === 1) {
      for (let row=height-1; row>=0; row--) {
        const maskIdx = row * width + col;
        
        if (!mask || mask[maskIdx] === 255) {
          const srcIdx  = (row*width + col)*4;
          const dstRow  = row + offset;
          if (dstRow>=height) continue;
          const dstIdx  = (dstRow*width + col)*4;

          data[dstIdx]   = clampColor(data[srcIdx] + colorOffset);
          data[dstIdx+1] = clampColor(data[srcIdx+1] + colorOffset);
          data[dstIdx+2] = clampColor(data[srcIdx+2] + colorOffset);
          data[dstIdx+3] = data[srcIdx+3];
        }
      }
    } else {
      for (let row=0; row<height; row++) {
        const maskIdx = row * width + col;
        
        if (!mask || mask[maskIdx] === 255) {
          const srcIdx  = (row*width + col)*4;
          const dstRow  = row - offset;
          if (dstRow<0) continue;
          const dstIdx  = (dstRow*width + col)*4;

          data[dstIdx]   = clampColor(data[srcIdx] + colorOffset);
          data[dstIdx+1] = clampColor(data[srcIdx+1] + colorOffset);
          data[dstIdx+2] = clampColor(data[srcIdx+2] + colorOffset);
          data[dstIdx+3] = data[srcIdx+3];
        }
      }
    }
  }
}

// ========== Enhanced Pixel Sort Functions ==========

function applyPixelSort(imageData, sortType) {
  switch (sortType) {
    case 'columnBrightness':
      sortColumnsByBrightness(imageData);
      break;
    case 'rowBrightness':
      sortRowsByBrightness(imageData);
      break;
    case 'columnHue':
      sortColumnsByHue(imageData);
      break;
    case 'rowHue':
      sortRowsByHue(imageData);
      break;
    case 'randomLines':
      randomLineSort(imageData);
      break;
    case 'diagonal':
      diagonalSort(imageData);
      break;
    case 'circular':
      circularSort(imageData);
      break;
    default:
      break;
  }
}

function sortColumnsByBrightness(imageData) {
  const { data, width, height } = imageData;
  const mask = isManualSelectionMode() ? selectionMask : null;
  
  for (let x=0; x<width; x++) {
    const column = [];
    
    // Collect only selected pixels
    for (let y=0; y<height; y++) {
      const maskIdx = y * width + x;
      
      if (!mask || mask[maskIdx] === 255) {
        const idx = (y*width + x)*4;
        const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
        const bright = 0.2126*r + 0.7152*g + 0.0722*b;
        column.push({ r, g, b, a, value: bright, y: y });
      }
    }
    
    // Sort and write back only to selected positions
    column.sort((p,q) => p.value - q.value);
    column.forEach((pixel, i) => {
      const idx = (pixel.y*width + x)*4;
      data[idx]   = column[i].r;
      data[idx+1] = column[i].g;
      data[idx+2] = column[i].b;
      data[idx+3] = column[i].a;
    });
  }
}

function sortColumnsByHue(imageData) {
  const { data, width, height } = imageData;
  const mask = isManualSelectionMode() ? selectionMask : null;
  
  for (let x=0; x<width; x++) {
    const column = [];
    
    // Collect only selected pixels
    for (let y=0; y<height; y++) {
      const maskIdx = y * width + x;
      
      if (!mask || mask[maskIdx] === 255) {
        const idx = (y*width + x)*4;
        const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
        const hue = rgbToHue(r, g, b);
        column.push({ r, g, b, a, value: hue, y: y });
      }
    }
    
    // Sort and write back only to selected positions
    column.sort((p,q) => p.value - q.value);
    column.forEach((pixel, i) => {
      const idx = (pixel.y*width + x)*4;
      data[idx]   = column[i].r;
      data[idx+1] = column[i].g;
      data[idx+2] = column[i].b;
      data[idx+3] = column[i].a;
    });
  }
}

function sortRowsByBrightness(imageData) {
  const { data, width, height } = imageData;
  const mask = isManualSelectionMode() ? selectionMask : null;
  
  for (let y=0; y<height; y++) {
    const rowPixels = [];
    const rowStart = y * width * 4;
    
    // Collect only selected pixels
    for (let x=0; x<width; x++) {
      const maskIdx = y * width + x;
      
      if (!mask || mask[maskIdx] === 255) {
        const idx = rowStart + x*4;
        const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
        const bright = 0.2126*r + 0.7152*g + 0.0722*b;
        rowPixels.push({ r, g, b, a, value: bright, x: x });
      }
    }
    
    // Sort and write back only to selected positions
    rowPixels.sort((p,q) => p.value - q.value);
    rowPixels.forEach((pixel, i) => {
      const idx = (y * width + pixel.x)*4;
      data[idx]   = rowPixels[i].r;
      data[idx+1] = rowPixels[i].g;
      data[idx+2] = rowPixels[i].b;
      data[idx+3] = rowPixels[i].a;
    });
  }
}

function sortRowsByHue(imageData) {
  const { data, width, height } = imageData;
  const mask = isManualSelectionMode() ? selectionMask : null;
  
  for (let y=0; y<height; y++) {
    const rowPixels = [];
    const rowStart = y * width * 4;
    
    // Collect only selected pixels
    for (let x=0; x<width; x++) {
      const maskIdx = y * width + x;
      
      if (!mask || mask[maskIdx] === 255) {
        const idx = rowStart + x*4;
        const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
        const hue = rgbToHue(r, g, b);
        rowPixels.push({ r, g, b, a, value: hue, x: x });
      }
    }
    
    // Sort and write back only to selected positions
    rowPixels.sort((p,q) => p.value - q.value);
    rowPixels.forEach((pixel, i) => {
      const idx = (y * width + pixel.x)*4;
      data[idx]   = rowPixels[i].r;
      data[idx+1] = rowPixels[i].g;
      data[idx+2] = rowPixels[i].b;
      data[idx+3] = rowPixels[i].a;
    });
  }
}

function randomLineSort(imageData) {
  const { width, height } = imageData;
  const linesToSort = 3;
  for (let i=0; i<linesToSort; i++) {
    const horizontal = Math.random() < 0.5;
    if (horizontal) {
      const row = randomInt(0, height-1);
      sortOneRowByBrightness(imageData, row);
    } else {
      const col = randomInt(0, width-1);
      sortOneColumnByBrightness(imageData, col);
    }
  }
}

function sortOneRowByBrightness(imageData, y) {
  const { data, width } = imageData;
  const mask = isManualSelectionMode() ? selectionMask : null;
  const rowStart = y * width * 4;
  const rowPixels = [];
  
  // Collect only selected pixels
  for (let x=0; x<width; x++) {
    const maskIdx = y * width + x;
    
    if (!mask || mask[maskIdx] === 255) {
      const idx = rowStart + x*4;
      const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
      const bright = 0.2126*r + 0.7152*g + 0.0722*b;
      rowPixels.push({ r, g, b, a, bright, x: x });
    }
  }
  
  // Sort and write back only to selected positions
  rowPixels.sort((p,q) => p.bright - q.bright);
  rowPixels.forEach((pixel, i) => {
    const idx = (y * width + pixel.x)*4;
    data[idx]   = rowPixels[i].r;
    data[idx+1] = rowPixels[i].g;
    data[idx+2] = rowPixels[i].b;
    data[idx+3] = rowPixels[i].a;
  });
}

function sortOneColumnByBrightness(imageData, col) {
  const { data, width, height } = imageData;
  const mask = isManualSelectionMode() ? selectionMask : null;
  const column = [];
  
  // Collect only selected pixels
  for (let y=0; y<height; y++) {
    const maskIdx = y * width + col;
    
    if (!mask || mask[maskIdx] === 255) {
      const idx = (y*width + col)*4;
      const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
      const bright = 0.2126*r + 0.7152*g + 0.0722*b;
      column.push({ r, g, b, a, bright, y: y });
    }
  }
  
  // Sort and write back only to selected positions
  column.sort((p,q) => p.bright - q.bright);
  column.forEach((pixel, i) => {
    const idx = (pixel.y*width + col)*4;
    data[idx]   = column[i].r;
    data[idx+1] = column[i].g;
    data[idx+2] = column[i].b;
    data[idx+3] = column[i].a;
  });
}

function diagonalSort(imageData) {
  const { data, width, height } = imageData;
  // Shuffle pixels along each diagonal for a strong, fast glitch effect
  for (let k = 0; k < width + height - 1; k++) {
    const diagonal = [];
    let startX = k < height ? 0 : k - height + 1;
    let startY = k < height ? k : height - 1;
    let x = startX, y = startY;
    while (x < width && y >= 0) {
      const idx = (y * width + x) * 4;
      diagonal.push({
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2],
        a: data[idx + 3],
        x, y
      });
      x++;
      y--;
    }
    // Shuffle the diagonal pixels
    for (let i = diagonal.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [diagonal[i], diagonal[j]] = [diagonal[j], diagonal[i]];
    }
    diagonal.forEach((pixel, i) => {
      const idx = (diagonal[i].y * width + diagonal[i].x) * 4;
      data[idx] = pixel.r;
      data[idx + 1] = pixel.g;
      data[idx + 2] = pixel.b;
      data[idx + 3] = pixel.a;
    });
  }
}

function circularSort(imageData) {
  const { data, width, height } = imageData;
  const centerX = width / 2;
  const centerY = height / 2;
  const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
  const step = 1;
  for (let r = 0; r < maxRadius; r += step) {
    const circle = [];
    const circumference = 2 * Math.PI * r;
    const steps = Math.max(8, Math.floor(circumference));
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * 2 * Math.PI;
      const x = Math.round(centerX + r * Math.cos(angle));
      const y = Math.round(centerY + r * Math.sin(angle));
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const idx = (y * width + x) * 4;
        const rVal = data[idx], g = data[idx + 1], b = data[idx + 2], a = data[idx + 3];
        const bright = 0.2126 * rVal + 0.7152 * g + 0.0722 * b;
        circle.push({ r: rVal, g, b, a, bright, x, y });
      }
    }
    circle.sort((a, b) => a.bright - b.bright);
    circle.forEach((pixel, i) => {
      const angle = (i / steps) * 2 * Math.PI;
      const x = Math.round(centerX + r * Math.cos(angle));
      const y = Math.round(centerY + r * Math.sin(angle));
      if (x >= 0 && x < width && y >= 0 && y < height) {
        const idx = (y * width + x) * 4;
        data[idx] = pixel.r;
        data[idx + 1] = pixel.g;
        data[idx + 2] = pixel.b;
        data[idx + 3] = pixel.a;
      }
    });
  }
}

// ========== New Color Effects ==========

// New applyColorEffect function
function applyColorEffect(imageData, effectType, intensity) {
  const { data: srcPixelData, width, height } = imageData;
  const strengthFactor = intensity / 100; // Strength for effects (0-1)

  let outputPixelData = null; // Will be assigned based on effect type

  switch (effectType) {
    case 'chromaticAberration':
      const modeDropdown = document.getElementById('chromaticAberrationModeSelect');
      const angleSlider = document.getElementById('chromaticAberrationAngleRange');
      const currentMode = modeDropdown ? modeDropdown.value : 'horizontal';
      const currentAngle = angleSlider ? parseFloat(angleSlider.value) : 0;
      // Chromatic Aberration is non-destructive as per previous implementation
      outputPixelData = chromaticAberration(srcPixelData, width, height, currentMode, strengthFactor, currentAngle);
      break;
    case 'hueShift':
      hueShift(srcPixelData, width, height, strengthFactor); // Destructive
      outputPixelData = srcPixelData;
      break;
    case 'saturation':
      saturationBoost(srcPixelData, width, height, strengthFactor); // Destructive
      outputPixelData = srcPixelData;
      break;
    case 'vintage':
      vintageEffect(srcPixelData, width, height, strengthFactor); // Destructive
      outputPixelData = srcPixelData;
      break;
    case 'invert': // NEW CASE
      const invertTypeDropdown = document.getElementById('invertColorTypeSelect'); // UI element to be added
      const currentInvertType = invertTypeDropdown ? invertTypeDropdown.value : 'full_rgb';
      invertColors(srcPixelData, width, height, currentInvertType); // Destructive
      outputPixelData = srcPixelData;
      break;
    default:
      // If no effect type matches, return the original pixel data
      // This also handles the 'none' case implicitly if srcPixelData is the original image data.
      return srcPixelData;
  }
  
  return outputPixelData;
}

// New combined Chromatic Aberration function (non-destructive)
function chromaticAberration(srcData, width, height, mode, strength, angleDegrees = 0) {
  const outputData = new Uint8ClampedArray(srcData.length);
  // Initialize outputData by copying all of srcData.
  // Effect logic will then overwrite specific channels from their shifted source locations.
  // Alpha is preserved unless a pixel is shifted from out-of-bounds (then R,G,B become 0).
  for (let i = 0; i < srcData.length; i++) {
    outputData[i] = srcData[i];
  }

  const baseOffset = Math.floor(strength * 10); // For H, V, R modes (derived from old chromaticAberration)
  const customDistance = Math.floor(strength * 15); // For custom mode (derived from old rgbSeparation)

  if (mode === 'horizontal') {
    if (baseOffset === 0) return srcData; // No change, return original data reference
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        
        const redX = Math.min(x + baseOffset, width - 1);
        const redSrcIdx = (y * width + redX) * 4;
        outputData[idx] = srcData[redSrcIdx]; // Red
        // Green is taken from the initial full copy of srcData
        
        const blueX = Math.max(x - baseOffset, 0);
        const blueSrcIdx = (y * width + blueX) * 4;
        outputData[idx + 2] = srcData[blueSrcIdx + 2]; // Blue
      }
    }
  } else if (mode === 'vertical') {
    if (baseOffset === 0) return srcData;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;

        const redY = Math.min(y + baseOffset, height - 1);
        const redSrcIdx = (redY * width + x) * 4;
        outputData[idx] = srcData[redSrcIdx]; // Red

        const blueY = Math.max(y - baseOffset, 0);
        const blueSrcIdx = (blueY * width + x) * 4;
        outputData[idx + 2] = srcData[blueSrcIdx + 2]; // Blue
      }
    }
  } else if (mode === 'radial') {
    if (baseOffset === 0) return srcData;
    const centerX = width / 2;
    const centerY = height / 2;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const dx = x - centerX;
        const dy = y - centerY;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);

        if (distFromCenter === 0) continue; 

        const normalizedDx = dx / distFromCenter;
        const normalizedDy = dy / distFromCenter;

        const rSrcX = Math.round(x + normalizedDx * baseOffset);
        const rSrcY = Math.round(y + normalizedDy * baseOffset);
        if (rSrcX >= 0 && rSrcX < width && rSrcY >= 0 && rSrcY < height) {
          outputData[idx] = srcData[(rSrcY * width + rSrcX) * 4];
        } else { outputData[idx] = 0; } // Black if out of bounds

        const bSrcX = Math.round(x - normalizedDx * baseOffset);
        const bSrcY = Math.round(y - normalizedDy * baseOffset);
        if (bSrcX >= 0 && bSrcX < width && bSrcY >= 0 && bSrcY < height) {
          outputData[idx + 2] = srcData[(bSrcY * width + bSrcX) * 4 + 2];
        } else { outputData[idx + 2] = 0; } // Black if out of bounds
      }
    }
  } else if (mode === 'custom') {
    if (customDistance === 0) return srcData;

    const angleRad = angleDegrees * Math.PI / 180;
    // Offsets for R, G, B channels based on angle & distance
    const rOffX = Math.cos(angleRad) * customDistance;
    const rOffY = Math.sin(angleRad) * customDistance;
    const gOffX = Math.cos(angleRad + (2 * Math.PI / 3)) * customDistance; // G shifted +120 deg
    const gOffY = Math.sin(angleRad + (2 * Math.PI / 3)) * customDistance;
    const bOffX = Math.cos(angleRad + (4 * Math.PI / 3)) * customDistance; // B shifted +240 deg
    const bOffY = Math.sin(angleRad + (4 * Math.PI / 3)) * customDistance;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const baseIdx = (y * width + x) * 4;

        // Sample Red channel
        const rSrcX_custom = Math.round(x + rOffX);
        const rSrcY_custom = Math.round(y + rOffY);
        if (rSrcX_custom >= 0 && rSrcX_custom < width && rSrcY_custom >= 0 && rSrcY_custom < height) {
          outputData[baseIdx] = srcData[(rSrcY_custom * width + rSrcX_custom) * 4];
        } else { outputData[baseIdx] = 0; }

        // Sample Green channel
        const gSrcX_custom = Math.round(x + gOffX);
        const gSrcY_custom = Math.round(y + gOffY);
        if (gSrcX_custom >= 0 && gSrcX_custom < width && gSrcY_custom >= 0 && gSrcY_custom < height) {
          outputData[baseIdx + 1] = srcData[(gSrcY_custom * width + gSrcX_custom) * 4 + 1];
        } else { outputData[baseIdx + 1] = 0; }

        // Sample Blue channel
        const bSrcX_custom = Math.round(x + bOffX);
        const bSrcY_custom = Math.round(y + bOffY);
        if (bSrcX_custom >= 0 && bSrcX_custom < width && bSrcY_custom >= 0 && bSrcY_custom < height) {
          outputData[baseIdx + 2] = srcData[(bSrcY_custom * width + bSrcX_custom) * 4 + 2];
        } else { outputData[baseIdx + 2] = 0; }
      }
    }
  } else { 
    // Unknown mode or no effective change from parameters
    return srcData; // Return original data reference
  }
  return outputData;
}

function hueShift(data, width, height, strength) {
  // Scale down the strength so that 100 (max) equals what 8 used to be
  // 8/100 = 0.08, so we multiply by 0.08 to get the same effect at max
  const scaledStrength = strength * 0.08;
  const shift = scaledStrength * 360;
  const mask = isManualSelectionMode() ? selectionMask : null;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const maskIdx = y * width + x;
      
      if (!mask || mask[maskIdx] === 255) {
        const i = (y * width + x) * 4;
        const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
        const newH = (h + shift) % 360;
        const [r, g, b] = hslToRgb(newH, s, l);
        
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }
    }
  }
}

function saturationBoost(data, width, height, strength) {
  const boost = 1 + strength * 2;
  const mask = isManualSelectionMode() ? selectionMask : null;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const maskIdx = y * width + x;
      
      if (!mask || mask[maskIdx] === 255) {
        const i = (y * width + x) * 4;
        const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
        const newS = Math.min(s * boost, 1);
        const [r, g, b] = hslToRgb(h, newS, l);
        
        data[i] = r;
        data[i + 1] = g;
        data[i + 2] = b;
      }
    }
  }
}



function vintageEffect(data, width, height, strength) {
  const mask = isManualSelectionMode() ? selectionMask : null;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const maskIdx = y * width + x;
      
      if (!mask || mask[maskIdx] === 255) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        const newR = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
        const newG = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
        const newB = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
        
        data[i] = r * (1 - strength) + newR * strength;
        data[i + 1] = g * (1 - strength) + newG * strength;
        data[i + 2] = b * (1 - strength) + newB * strength;
      }
    }
  }
}

function invertColors(data, width, height, inversionType) {
  const mask = isManualSelectionMode() ? selectionMask : null;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const maskIdx = y * width + x;
      
      if (!mask || mask[maskIdx] === 255) {
        const i = (y * width + x) * 4;
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        // Alpha channel (data[i+3]) is usually not inverted

        switch (inversionType) {
          case 'full_rgb':
            data[i] = 255 - r;
            data[i + 1] = 255 - g;
            data[i + 2] = 255 - b;
            break;
          case 'red_only':
            data[i] = 255 - r;
            break;
          case 'green_only':
            data[i + 1] = 255 - g;
            break;
          case 'blue_only':
            data[i + 2] = 255 - b;
            break;
          default: // Default to full RGB if type is unknown
            data[i] = 255 - r;
            data[i + 1] = 255 - g;
            data[i + 2] = 255 - b;
            break;
        }
      }
    }
  }
}

// ========== Datamoshing Effects ==========

function applyDatamosh(imageData, effectType, intensity) {
  const { data, width, height } = imageData;
  const factor = intensity / 100;

  switch (effectType) {
    case 'randomBytes':
      randomByteCorruption(data, factor);
      break;
    case 'bitShift':
      bitShiftCorruption(data, factor);
      break;
    case 'compression':
      compressionArtifacts(data, width, height, factor);
      break;
    case 'scanlines':
      scanlineEffect(data, width, height, factor);
      break;
  }
}

function randomByteCorruption(data, strength) {
  const corruptionRate = strength * 0.01;
  const mask = isManualSelectionMode() ? selectionMask : null;
  const width = imgWidth;
  const height = imgHeight;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const maskIdx = y * width + x;
      
      if (!mask || mask[maskIdx] === 255) {
        const i = (y * width + x) * 4;
        if (Math.random() < corruptionRate) {
          data[i] = Math.random() * 255;
          data[i + 1] = Math.random() * 255;
          data[i + 2] = Math.random() * 255;
        }
      }
    }
  }
}

function bitShiftCorruption(data, strength) {
  // New: strength 0 = no effect, strength 1 = full 1-bit shift
  // For 0 < strength < 1, blend original and shifted values
  const mask = isManualSelectionMode() ? selectionMask : null;
  const width = imgWidth;
  const height = imgHeight;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const maskIdx = y * width + x;
      
      if (!mask || mask[maskIdx] === 255) {
        const i = (y * width + x) * 4;
        if (strength >= 1) {
          // Full 1-bit shift
          data[i]     = ((data[i] << 1) | (data[i] >> 7)) & 255; // Red
          data[i + 1] = ((data[i + 1] >> 1) | (data[i + 1] << 7)) & 255; // Green
          data[i + 2] = ((data[i + 2] << 1) | (data[i + 2] >> 7)) & 255; // Blue
        } else if (strength > 0) {
          // Blend original and shifted for subtle effect
          const r = data[i], g = data[i+1], b = data[i+2];
          const rShift = ((r << 1) | (r >> 7)) & 255;
          const gShift = ((g >> 1) | (g << 7)) & 255;
          const bShift = ((b << 1) | (b >> 7)) & 255;
          data[i]     = Math.round(r * (1 - strength) + rShift * strength);
          data[i + 1] = Math.round(g * (1 - strength) + gShift * strength);
          data[i + 2] = Math.round(b * (1 - strength) + bShift * strength);
        }
        // else, strength == 0: do nothing
      }
    }
  }
}

function compressionArtifacts(data, width, height, strength) {
  const blockSize = Math.max(2, Math.floor(8 * strength));
  const mask = isManualSelectionMode() ? selectionMask : null;
  
  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      let r = 0, g = 0, b = 0, count = 0;
      let hasMaskedPixel = false;
      
      // First pass: check if any pixel in this block is selected
      for (let by = y; by < Math.min(y + blockSize, height); by++) {
        for (let bx = x; bx < Math.min(x + blockSize, width); bx++) {
          const maskIdx = by * width + bx;
          if (!mask || mask[maskIdx] === 255) {
            hasMaskedPixel = true;
            const idx = (by * width + bx) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            count++;
          }
        }
      }
      
      // Only process if block contains selected pixels
      if (hasMaskedPixel && count > 0) {
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
        
        // Second pass: apply averaged color only to selected pixels
        for (let by = y; by < Math.min(y + blockSize, height); by++) {
          for (let bx = x; bx < Math.min(x + blockSize, width); bx++) {
            const maskIdx = by * width + bx;
            if (!mask || mask[maskIdx] === 255) {
              const idx = (by * width + bx) * 4;
              data[idx] = r;
              data[idx + 1] = g;
              data[idx + 2] = b;
            }
          }
        }
      }
    }
  }
}

function scanlineEffect(data, width, height, strength) {
  const lineSpacing = Math.max(1, Math.floor(10 - strength * 8));
  const mask = isManualSelectionMode() ? selectionMask : null;
  
  for (let y = 0; y < height; y += lineSpacing * 2) {
    for (let x = 0; x < width; x++) {
      const maskIdx = y * width + x;
      
      if (!mask || mask[maskIdx] === 255) {
        const idx = (y * width + x) * 4;
        data[idx] *= 0.3;
        data[idx + 1] *= 0.3;
        data[idx + 2] *= 0.3;
      }
    }
  }
}

// ========== Utility Functions ==========

function rgbToHue(r, g, b) {
  let rf = r / 255;
  let gf = g / 255;
  let bf = b / 255;
  let max = Math.max(rf, gf, bf), min = Math.min(rf, gf, bf);
  let h = 0;
  if (max === min) {
    h = 0;
  } else {
    const d = max - min;
    switch (max) {
      case rf:
        h = (gf - bf) / d + (gf < bf ? 6 : 0);
        break;
      case gf:
        h = (bf - rf) / d + 2;
        break;
      case bf:
        h = (rf - gf) / d + 4;
        break;
    }
    h /= 6;
  }
  return h * 360;
}

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

function randomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals=2) {
  const val = Math.random() * (max - min) + min;
  return parseFloat(val.toFixed(decimals));
}

function clampColor(value) {
  return Math.max(0, Math.min(255, value));
}

// ========== Play/Pause & Reset ==========

function togglePlayPause() {
  isPaused = !isPaused;
  updatePlayPauseButton();
  if (!isPaused) {
    animate(performance.now());
  }
}

function resetImage() {
  if (!originalImageData) return;
  glitchImageData = new ImageData(
    new Uint8ClampedArray(originalImageData.data),
    imgWidth,
    imgHeight
  );
  ctx.putImageData(glitchImageData, 0, 0);
  activeClumps = [];
  
  // Update selection engine with reset image data
  if (selectionEngine) {
    selectionEngine.imageData = glitchImageData;
  }
  
  resetBtn.style.transform = 'scale(0.95)';
  setTimeout(() => {
    resetBtn.style.transform = '';
  }, 150);
}

// ========== Recording Functions ==========

function startRecording() {
  if (!glitchImageData) return;

  const duration = parseInt(recordRange.value, 10);
  const doReverse = reverseCheckbox.checked;

  recordedChunks = [];

  let options = {
    mimeType: 'video/mp4; codecs=avc1.42E01E',
    videoBitsPerSecond: 15_000_000
  };

  if (!MediaRecorder.isTypeSupported(options.mimeType)) {
    options = {
      mimeType: 'video/webm; codecs=vp9',
      videoBitsPerSecond: 10_000_000
    };
  }

  const stream = canvas.captureStream(30);
  mediaRecorder = new MediaRecorder(stream, options);

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  mediaRecorder.onstop = () => {
    if (doReverse) {
      recordedChunks.reverse();
    }

    const blob = new Blob(recordedChunks, { type: options.mimeType });
    const url = URL.createObjectURL(blob);

    const link = document.createElement('a');
    link.href = url;
    if (options.mimeType.includes('mp4')) {
      link.download = 'glitch_recording.mp4';
    } else {
      link.download = 'glitch_recording.webm';
    }
    link.click();
    URL.revokeObjectURL(url);
    
    recordBtn.innerHTML = '🎥 Record';
  };

  recordBtn.innerHTML = '🔴 Recording...';
  
  mediaRecorder.start();
  setTimeout(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  }, duration * 1000);
}

function downloadSnapshot() {
  if (!glitchImageData) return;
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'glitch_snapshot.png';
  link.click();
  
  snapshotBtn.innerHTML = '📸 Saved!';
  setTimeout(() => {
    snapshotBtn.innerHTML = '📷 Snapshot';
  }, 1500);
}

// ========== Audio Reactive Functions ==========

async function toggleAudioReactive() {
  if (audioReactiveCheckbox.checked) {
    try {
      audioContext = new (window.AudioContext || window.webkitAudioContext)();
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      microphone = audioContext.createMediaStreamSource(stream);
      analyser = audioContext.createAnalyser();
      analyser.fftSize = 256;
      audioData = new Uint8Array(analyser.frequencyBinCount);
      microphone.connect(analyser);
    } catch (error) {
      console.error('Audio access denied:', error);
      audioReactiveCheckbox.checked = false;
      alert('Microphone access denied. Please allow microphone access to use audio reactive features.');
    }
  } else {
    if (audioContext) {
      audioContext.close();
      audioContext = null;
      analyser = null;
      microphone = null;
      audioData = null;
    }
  }
}

// ========== Preset System ==========

function savePreset() {
  const preset = {
    direction: directionSelect.value,
    spiral: spiralSelect.value,
    spiralDirection: spiralDirection,
    slice: sliceSelect.value,
    pixelSort: pixelSortSelect.value,
    colorEffect: colorEffectSelect.value,
    datamosh: datamoshSelect.value,
    intensity: intensitySelect.value,
    speed: speedRange.value,
    swirl: swirlRange.value,
    colorOffset: colorOffsetRange.value,
    minLifetime: minLifetimeRange.value,
    maxLifetime: maxLifetimeRange.value,
    sortFrequency: sortFrequencyRange.value,
    colorIntensity: colorIntensityRange.value,
    datamoshIntensity: datamoshIntensityRange.value,
    audioSensitivity: audioSensitivityRange.value,
    // New selection method settings
    selectionMethod: selectionMethodSelect ? selectionMethodSelect.value : 'random',
    targetHue: targetHueRange ? targetHueRange.value : '180',
    colorTolerance: colorToleranceRange ? colorToleranceRange.value : '30',
    minRegionSize: minRegionSizeRange ? minRegionSizeRange.value : '100',
    brightnessZone: brightnessZoneSelect ? brightnessZoneSelect.value : 'shadows',
    edgeThreshold: edgeThresholdRange ? edgeThresholdRange.value : '30',
    shapeRandomness: shapeRandomnessRange ? shapeRandomnessRange.value : '0.3',
    shapeCount: shapeCountRange ? shapeCountRange.value : '3'
  };
  
  const dataStr = JSON.stringify(preset, null, 2);
  const dataBlob = new Blob([dataStr], {type: 'application/json'});
  const url = URL.createObjectURL(dataBlob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'glitch_preset.json';
  link.click();
  URL.revokeObjectURL(url);
  
  savePresetBtn.innerHTML = '💾 Saved!';
  setTimeout(() => {
    savePresetBtn.innerHTML = '💾 Save Preset';
  }, 1500);
}

function loadPresetFromFile() {
  const file = presetFileInput.files[0];
  if (!file) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    try {
      const preset = JSON.parse(e.target.result);
      applyPreset(preset);
    } catch (error) {
      alert('Invalid preset file!');
    }
  };
  reader.readAsText(file);
}

function loadBuiltInPreset() {
  const presetName = presetSelect.value;
  if (!presetName) return;
  
  const presets = {
    'vintage-tv': {
      direction: 'jitter',
      spiral: 'off',
      slice: 'horizontal',
      pixelSort: 'randomLines',
      colorEffect: 'vintage',
      datamosh: 'scanlines',
      intensity: 'medium',
      speed: '2',
      colorOffset: '30',
      colorIntensity: '70',
      datamoshIntensity: '40',
      selectionMethod: 'brightness',
      brightnessZone: 'highlights'
    },
    'digital-chaos': {
      direction: 'random',
      spiral: 'random',
      slice: 'both',
      pixelSort: 'columnBrightness',
      colorEffect: 'chromaticAberration',
      datamosh: 'randomBytes',
      intensity: 'extraLarge',
      speed: '5',
      colorOffset: '50',
      colorIntensity: '90',
      datamoshIntensity: '30',
      selectionMethod: 'edgeDetection',
      edgeThreshold: '40'
    },
    'rainbow-sort': {
      direction: 'off',
      spiral: 'off',
      slice: 'off',
      pixelSort: 'columnHue',
      colorEffect: 'hueShift',
      datamosh: 'off',
      intensity: 'large',
      colorIntensity: '60',
      selectionMethod: 'colorRange',
      targetHue: '240',
      colorTolerance: '45'
    },
    'cyberpunk': {
      direction: 'right',
      spiral: 'off',
      slice: 'vertical',
      pixelSort: 'off',
      colorEffect: 'colorSeparation',
      datamosh: 'bitShift',
      intensity: 'large',
      speed: '3',
      colorOffset: '40',
      colorIntensity: '80',
      datamoshIntensity: '20'
    },
    'film-burn': {
      direction: 'up',
      spiral: 'insideOut',
      slice: 'off',
      pixelSort: 'randomLines',
      colorEffect: 'vintage',
      datamosh: 'compression',
      intensity: 'medium',
      speed: '1',
      colorIntensity: '50',
      datamoshIntensity: '60'
    }
  };
  
  if (presets[presetName]) {
    applyPreset(presets[presetName]);
  }
}

function applyPreset(preset) {
  Object.keys(preset).forEach(key => {
    const element = document.getElementById(key + '-select') || 
                   document.getElementById(key + '-range') || 
                   document.getElementById(key + '-checkbox');
    if (element) {
      if (element.type === 'checkbox') {
        element.checked = preset[key];
      } else {
        element.value = preset[key];
        const valueDisplay = document.getElementById(key + '-value');
        if (valueDisplay) {
          valueDisplay.textContent = preset[key];
        }
      }
    }
  });
  
  if (preset.spiralDirection) {
    spiralDirection = preset.spiralDirection;
    spiralDirectionBtn.textContent = spiralDirection.toUpperCase();
  }
  
  // Apply selection method preset
  if (preset.selectionMethod && selectionMethodSelect) {
    selectionMethodSelect.value = preset.selectionMethod;
    selectionMethodSelect.dispatchEvent(new Event('change'));
  }
}

// ========== Batch Export ==========

async function batchExport() {
  if (!originalImageData) {
    alert('Please upload an image first!');
    return;
  }
  
  batchExportBtn.innerHTML = '⏳ Exporting...';
  batchExportBtn.disabled = true;
  
  const originalSettings = getCurrentSettings();
  
  for (let i = 0; i < 10; i++) {
    randomizeSettingsQuiet();
    
    glitchImageData = new ImageData(
      new Uint8ClampedArray(originalImageData.data),
      imgWidth,
      imgHeight
    );
    
    for (let j = 0; j < 5; j++) {
      applyAllEffects();
    }
    
    ctx.putImageData(glitchImageData, 0, 0);
    
    const dataURL = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `glitch_variation_${String(i + 1).padStart(2, '0')}.png`;
    
    setTimeout(() => {
      link.click();
    }, i * 500);
    
    await new Promise(resolve => setTimeout(resolve, 200));
  }
  
  applyPreset(originalSettings);
  
  glitchImageData = new ImageData(
    new Uint8ClampedArray(originalImageData.data),
    imgWidth,
    imgHeight
  );
  ctx.putImageData(glitchImageData, 0, 0);
  
  batchExportBtn.innerHTML = '📦 Batch Export (10 variations)';
  batchExportBtn.disabled = false;
}

function applyAllEffects() {
  if (!glitchImageData) return;
  
  const direction = directionSelect.value;
  const spiral = spiralSelect.value;
  const slice = sliceSelect.value;
  const pixelSort = pixelSortSelect.value;
  const colorEffect = colorEffectSelect.value;
  const datamosh = datamoshSelect.value;
  const intensity = intensitySelect.value;
  const shiftSpeed = parseInt(speedRange.value, 10);
  const swirlStr = parseFloat(swirlRange.value);
  const colorMax = parseInt(colorOffsetRange.value, 10);
  const colorIntensity = parseInt(colorIntensityRange.value, 10);
  const datamoshIntensity = parseInt(datamoshIntensityRange.value, 10);

  const tempClumps = [];
  const numClumps = getNumClumps(intensity);
  for (let i = 0; i < numClumps; i++) {
    tempClumps.push(pickRandomClump(intensity, imgWidth, imgHeight));
  }
  
  if (direction !== 'off') {
    tempClumps.forEach(clump => {
      applyDirectionShift(glitchImageData, clump, shiftSpeed, direction);
    });
  }
  
  if (spiral !== 'off') {
    tempClumps.forEach(clump => {
      let swirlType = spiral;
      if (spiral === 'spiral') {
        swirlType = spiralDirection;
      }
      swirlRectangle(glitchImageData, clump, swirlStr, swirlType);
    });
  }
  
  if (slice !== 'off') {
    applySliceGlitch(glitchImageData, slice, colorMax);
  }
  
  if (pixelSort !== 'off') {
    applyPixelSort(glitchImageData, pixelSort);
  }
  
  if (colorEffect !== 'off') {
    applyColorEffect(glitchImageData, colorEffect, colorIntensity);
  }
  
  if (datamosh !== 'off') {
    applyDatamosh(glitchImageData, datamosh, datamoshIntensity);
  }
}

function getCurrentSettings() {
  return {
    direction: directionSelect.value,
    spiral: spiralSelect.value,
    spiralDirection: spiralDirection,
    slice: sliceSelect.value,
    pixelSort: pixelSortSelect.value,
    colorEffect: colorEffectSelect.value,
    datamosh: datamoshSelect.value,
    intensity: intensitySelect.value,
    speed: speedRange.value,
    swirl: swirlRange.value,
    colorOffset: colorOffsetRange.value,
    minLifetime: minLifetimeRange.value,
    maxLifetime: maxLifetimeRange.value,
    sortFrequency: sortFrequencyRange.value,
    colorIntensity: colorIntensityRange.value,
    datamoshIntensity: datamoshIntensityRange.value,
    // New selection method settings
    selectionMethod: selectionMethodSelect ? selectionMethodSelect.value : 'random',
    targetHue: targetHueRange ? targetHueRange.value : '180',
    colorTolerance: colorToleranceRange ? colorToleranceRange.value : '30',
    minRegionSize: minRegionSizeRange ? minRegionSizeRange.value : '100',
    brightnessZone: brightnessZoneSelect ? brightnessZoneSelect.value : 'shadows',
    edgeThreshold: edgeThresholdRange ? edgeThresholdRange.value : '30',
    shapeRandomness: shapeRandomnessRange ? shapeRandomnessRange.value : '0.3',
    shapeCount: shapeCountRange ? shapeCountRange.value : '3'
  };
}

// ========== Randomize Settings ==========

function randomizeSettings() {
  randomizeSettingsQuiet();
  
  randomizeBtn.innerHTML = '🎉 Randomized!';
  randomizeBtn.style.transform = 'scale(1.05)';
  setTimeout(() => {
    randomizeBtn.innerHTML = '🎲 Randomize All';
    randomizeBtn.style.transform = '';
  }, 1000);
}

function randomizeSettingsQuiet() {
  const dirVals = ['off','down','up','right','left','random','jitter'];
  directionSelect.value = dirVals[randomInt(0, dirVals.length-1)];

  const spVals = ['off','spiral','insideOut','outsideIn','random'];
  spiralSelect.value = spVals[randomInt(0, spVals.length-1)];

  const slVals = ['off','horizontal','vertical','both'];
  sliceSelect.value = slVals[randomInt(0, slVals.length-1)];

  const pxVals = ['off','columnBrightness','rowBrightness','columnHue','rowHue','randomLines','diagonal','circular'];
  pixelSortSelect.value = pxVals[randomInt(0, pxVals.length-1)];
  
  const colorVals = ['off','chromaticAberration','colorSeparation','hueShift','saturation','invert','vintage'];
  colorEffectSelect.value = colorVals[randomInt(0, colorVals.length-1)];
  
  const datamoshVals = ['off','randomBytes','bitShift','compression','scanlines'];
  datamoshSelect.value = datamoshVals[randomInt(0, datamoshVals.length-1)];

  const intVals = ['medium','large','extraLarge'];
  intensitySelect.value = intVals[randomInt(0, intVals.length-1)];

  const spd = randomInt(1,5);
  speedRange.value = spd;
  speedValue.textContent = spd;

  const swirl = randomFloat(0.01,0.15,2);
  swirlRange.value = swirl;
  swirlValue.textContent = swirl.toString();

  const cOff = randomInt(0,50);
  colorOffsetRange.value = cOff;
  colorOffsetValue.textContent = cOff;
  
  const colorInt = randomInt(20,100);
  colorIntensityRange.value = colorInt;
  colorIntensityValue.textContent = colorInt;
  
  const datamoshInt = randomInt(10,80);
  datamoshIntensityRange.value = datamoshInt;
  datamoshIntensityValue.textContent = datamoshInt;

  const sortFreq = randomInt(10,90);
  sortFrequencyRange.value = sortFreq;
  sortFrequencyValue.textContent = sortFreq;

  const minLifetime = randomInt(1,300);
  const maxLifetime = randomInt(minLifetime,300);
  minLifetimeRange.value = minLifetime;
  minLifetimeValue.textContent = minLifetime;
  maxLifetimeRange.value = maxLifetime;
  maxLifetimeValue.textContent = maxLifetime;

  spiralDirection = Math.random() < 0.5 ? 'cw' : 'ccw';
  spiralDirectionBtn.textContent = spiralDirection.toUpperCase();
  
  // Randomize selection method
  if (selectionMethodSelect) {
    const selectionMethods = ['random', 'colorRange', 'brightness', 'edgeDetection', 'organicShapes', 'contentAware'];
    selectionMethodSelect.value = selectionMethods[randomInt(0, selectionMethods.length - 1)];
    selectionMethodSelect.dispatchEvent(new Event('change'));
    
    // Randomize method-specific settings
    if (targetHueRange) targetHueRange.value = randomInt(0, 360);
    if (colorToleranceRange) colorToleranceRange.value = randomInt(10, 50);
    if (edgeThresholdRange) edgeThresholdRange.value = randomInt(20, 80);
    if (shapeRandomnessRange) shapeRandomnessRange.value = randomFloat(0.1, 0.8, 1);
    if (shapeCountRange) shapeCountRange.value = randomInt(1, 6);
  }
}

// ========== Initialize ==========
// Set default color offset for Slice Glitch effect to 0
if(colorOffsetRange) colorOffsetRange.value = 0;
if(colorOffsetValue) colorOffsetValue.textContent = 0;

// Set initial button states
updatePlayPauseButton();

// Startup animations
document.addEventListener('DOMContentLoaded', () => {
  const controlGroups = document.querySelectorAll('.control-group');
  controlGroups.forEach((group, index) => {
    group.style.opacity = '0';
    group.style.transform = 'translateY(20px)';
    setTimeout(() => {
      group.style.transition = 'all 0.5s ease';
      group.style.opacity = '1';
      group.style.transform = 'translateY(0)';
    }, index * 100);
  });
});