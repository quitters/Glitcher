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
audioSensitivityRange.addEventListener('input', () => {
  audioSensitivityValue.textContent = audioSensitivityRange.value;
});

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

// ========== Load Image & Start ==========

function handleFileSelect() {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      imgWidth  = img.width;
      imgHeight = img.height;
      canvas.width  = imgWidth;
      canvas.height = imgHeight;

      ctx.drawImage(img, 0, 0);
      originalImageData = ctx.getImageData(0, 0, imgWidth, imgHeight);

      glitchImageData = new ImageData(
        new Uint8ClampedArray(originalImageData.data),
        imgWidth,
        imgHeight
      );

      // Show canvas, hide placeholder
      canvas.style.display = 'block';
      canvasPlaceholder.style.display = 'none';

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
    applyColorEffect(glitchImageData, colorEffect, colorIntensity * audioMultiplier);
  }

  // Datamoshing
  if (datamosh !== 'off') {
    applyDatamosh(glitchImageData, datamosh, datamoshIntensity * audioMultiplier);
  }

  // Draw updated
  ctx.putImageData(glitchImageData, 0, 0);

  animationId = requestAnimationFrame(animate);
}

// ========== Core Glitch Functions ==========
// [Including all the functions from the beta version - clumps, direction shift, spiral, slice, pixel sort]

function spawnNewClumps(intensity, minLife, maxLife) {
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
  for (let row = y + h - 1; row >= y; row--) {
    const destRow = row + shift;
    if (destRow >= height) continue;
    for (let col = x; col < x + w; col++) {
      const srcIdx = (row * width + col) * 4;
      const dstIdx = (destRow * width + col) * 4;
      data[dstIdx]   = data[srcIdx];
      data[dstIdx+1] = data[srcIdx+1];
      data[dstIdx+2] = data[srcIdx+2];
      data[dstIdx+3] = data[srcIdx+3];
    }
  }
}

function shiftRectUp(imageData, {x,y,w,h}, shift) {
  const { data, width } = imageData;
  for (let row = y; row < y + h; row++) {
    const destRow = row - shift;
    if (destRow < 0) continue;
    for (let col = x; col < x + w; col++) {
      const srcIdx = (row * width + col) * 4;
      const dstIdx = (destRow * width + col) * 4;
      data[dstIdx]   = data[srcIdx];
      data[dstIdx+1] = data[srcIdx+1];
      data[dstIdx+2] = data[srcIdx+2];
      data[dstIdx+3] = data[srcIdx+3];
    }
  }
}

function shiftRectLeft(imageData, {x,y,w,h}, shift) {
  const { data, width } = imageData;
  for (let row = y; row < y + h; row++) {
    for (let col = x; col < x + w; col++) {
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

function shiftRectRight(imageData, {x,y,w,h}, shift) {
  const { data, width } = imageData;
  for (let row = y; row < y + h; row++) {
    for (let col = x + w - 1; col >= x; col--) {
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

// ========== Spiral (Swirl) Functions ==========

function swirlRectangle(imageData, rect, swirlStrength, swirlType) {
  // swirlType: 'spiral', 'insideOut', 'outsideIn', 'random'

  const { x, y, w, h } = rect;
  const { data, width, height } = imageData;
  if (x<0 || y<0 || x+w>width || y+h>height) return;

  const subregion = new Uint8ClampedArray(w * h * 4);
  for (let row=0; row<h; row++) {
    for (let col=0; col<w; col++) {
      const srcX = x + col;
      const srcY = y + row;
      const srcIdx = (srcY * width + srcX) * 4;
      const dstIdx = (row * w + col) * 4;
      subregion[dstIdx]   = data[srcIdx];
      subregion[dstIdx+1] = data[srcIdx+1];
      subregion[dstIdx+2] = data[srcIdx+2];
      subregion[dstIdx+3] = data[srcIdx+3];
    }
  }

  const centerX = w/2, centerY = h/2;
  const maxR = Math.sqrt(centerX*centerX + centerY*centerY);
  const swirlBuffer = new Uint8ClampedArray(subregion);

  for (let row=0; row<h; row++) {
    for (let col=0; col<w; col++) {
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

  for (let row=0; row<h; row++) {
    for (let col=0; col<w; col++) {
      const srcIdx = (row*w + col)*4;
      const dstX = x + col;
      const dstY = y + row;
      const dstIdx = (dstY * width + dstX)*4;
      data[dstIdx]   = swirlBuffer[srcIdx];
      data[dstIdx+1] = swirlBuffer[srcIdx+1];
      data[dstIdx+2] = swirlBuffer[srcIdx+2];
      data[dstIdx+3] = swirlBuffer[srcIdx+3];
    }
  }
}

function computeSwirlAngle(r, maxR, strength, type) {
  switch (type) {
    case 'cw':
      return +strength * (r / maxR);
    case 'ccw':
      return -strength * (r / maxR);
    case 'insideOut':
      return +strength * (1 - r/maxR);
    case 'outsideIn':
      return +strength * (r/maxR);
    case 'random':
      return (Math.random()*2 - 1)*strength * (r/maxR);
    default:
      return 0;
  }
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
  const sliceHeight = randomInt(1, Math.floor(height/6));
  const startY = randomInt(0, height - sliceHeight);
  const direction = Math.random()<0.5 ? -1 : 1;
  const offset = randomInt(1, 5);
  const colorOffset = randomInt(-colorMax, colorMax);

  for (let row=startY; row<startY+sliceHeight; row++) {
    if (direction === 1) {
      for (let col=width-1; col>=0; col--) {
        const srcIdx  = (row*width + col)*4;
        const dstCol  = col + offset;
        if (dstCol>=width) continue;
        const dstIdx  = (row*width + dstCol)*4;

        data[dstIdx]   = clampColor(data[srcIdx] + colorOffset);
        data[dstIdx+1] = clampColor(data[srcIdx+1] + colorOffset);
        data[dstIdx+2] = clampColor(data[srcIdx+2] + colorOffset);
        data[dstIdx+3] = data[srcIdx+3];
      }
    } else {
      for (let col=0; col<width; col++) {
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

function verticalSliceGlitch(imageData, colorMax) {
  const { data, width, height } = imageData;
  const sliceWidth = randomInt(1, Math.floor(width/6));
  const startX = randomInt(0, width - sliceWidth);
  const direction = Math.random()<0.5 ? -1 : 1;
  const offset = randomInt(1, 5);
  const colorOffset = randomInt(-colorMax, colorMax);

  for (let col=startX; col<startX+sliceWidth; col++) {
    if (direction === 1) {
      for (let row=height-1; row>=0; row--) {
        const srcIdx  = (row*width + col)*4;
        const dstRow  = row + offset;
        if (dstRow>=height) continue;
        const dstIdx  = (dstRow*width + col)*4;

        data[dstIdx]   = clampColor(data[srcIdx] + colorOffset);
        data[dstIdx+1] = clampColor(data[srcIdx+1] + colorOffset);
        data[dstIdx+2] = clampColor(data[srcIdx+2] + colorOffset);
        data[dstIdx+3] = data[srcIdx+3];
      }
    } else {
      for (let row=0; row<height; row++) {
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
  for (let x=0; x<width; x++) {
    const column = [];
    for (let y=0; y<height; y++) {
      const idx = (y*width + x)*4;
      const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
      const bright = 0.2126*r + 0.7152*g + 0.0722*b;
      column.push({ r, g, b, a, value: bright });
    }
    column.sort((p,q) => p.value - q.value);
    for (let y=0; y<height; y++) {
      const idx = (y*width + x)*4;
      data[idx]   = column[y].r;
      data[idx+1] = column[y].g;
      data[idx+2] = column[y].b;
      data[idx+3] = column[y].a;
    }
  }
}

function sortColumnsByHue(imageData) {
  const { data, width, height } = imageData;
  for (let x=0; x<width; x++) {
    const column = [];
    for (let y=0; y<height; y++) {
      const idx = (y*width + x)*4;
      const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
      const hue = rgbToHue(r, g, b);
      column.push({ r, g, b, a, value: hue });
    }
    column.sort((p,q) => p.value - q.value);
    for (let y=0; y<height; y++) {
      const idx = (y*width + x)*4;
      data[idx]   = column[y].r;
      data[idx+1] = column[y].g;
      data[idx+2] = column[y].b;
      data[idx+3] = column[y].a;
    }
  }
}

function sortRowsByBrightness(imageData) {
  const { data, width, height } = imageData;
  for (let y=0; y<height; y++) {
    const rowPixels = [];
    const rowStart = y * width * 4;
    for (let x=0; x<width; x++) {
      const idx = rowStart + x*4;
      const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
      const bright = 0.2126*r + 0.7152*g + 0.0722*b;
      rowPixels.push({ r, g, b, a, value: bright });
    }
    rowPixels.sort((p,q) => p.value - q.value);
    for (let x=0; x<width; x++) {
      const idx = rowStart + x*4;
      data[idx]   = rowPixels[x].r;
      data[idx+1] = rowPixels[x].g;
      data[idx+2] = rowPixels[x].b;
      data[idx+3] = rowPixels[x].a;
    }
  }
}

function sortRowsByHue(imageData) {
  const { data, width, height } = imageData;
  for (let y=0; y<height; y++) {
    const rowPixels = [];
    const rowStart = y * width * 4;
    for (let x=0; x<width; x++) {
      const idx = rowStart + x*4;
      const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
      const hue = rgbToHue(r, g, b);
      rowPixels.push({ r, g, b, a, value: hue });
    }
    rowPixels.sort((p,q) => p.value - q.value);
    for (let x=0; x<width; x++) {
      const idx = rowStart + x*4;
      data[idx]   = rowPixels[x].r;
      data[idx+1] = rowPixels[x].g;
      data[idx+2] = rowPixels[x].b;
      data[idx+3] = rowPixels[x].a;
    }
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
  const rowStart = y * width * 4;
  const rowPixels = [];
  for (let x=0; x<width; x++) {
    const idx = rowStart + x*4;
    const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
    const bright = 0.2126*r + 0.7152*g + 0.0722*b;
    rowPixels.push({ r, g, b, a, bright });
  }
  rowPixels.sort((p,q) => p.bright - q.bright);
  for (let x=0; x<width; x++) {
    const idx = rowStart + x*4;
    data[idx]   = rowPixels[x].r;
    data[idx+1] = rowPixels[x].g;
    data[idx+2] = rowPixels[x].b;
    data[idx+3] = rowPixels[x].a;
  }
}

function sortOneColumnByBrightness(imageData, col) {
  const { data, width, height } = imageData;
  const column = [];
  for (let y=0; y<height; y++) {
    const idx = (y*width + col)*4;
    const r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
    const bright = 0.2126*r + 0.7152*g + 0.0722*b;
    column.push({ r, g, b, a, bright });
  }
  column.sort((p,q) => p.bright - q.bright);
  for (let y=0; y<height; y++) {
    const idx = (y*width + col)*4;
    data[idx]   = column[y].r;
    data[idx+1] = column[y].g;
    data[idx+2] = column[y].b;
    data[idx+3] = column[y].a;
  }
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

function applyColorEffect(imageData, effectType, intensity) {
  const { data, width, height } = imageData;
  const factor = intensity / 100;

  switch (effectType) {
    case 'chromaticAberration':
      chromaticAberration(data, width, height, factor);
      break;
    case 'colorSeparation':
      rgbSeparation(data, width, height, factor);
      break;
    case 'hueShift':
      hueShift(data, width, height, factor);
      break;
    case 'saturation':
      saturationBoost(data, width, height, factor);
      break;

    case 'vintage':
      vintageEffect(data, width, height, factor);
      break;
  }
}

function chromaticAberration(data, width, height, strength) {
  const offset = Math.floor(strength * 10);
  const temp = new Uint8ClampedArray(data);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      const redX = Math.min(x + offset, width - 1);
      const redIdx = (y * width + redX) * 4;
      data[idx] = temp[redIdx];
      
      const blueX = Math.max(x - offset, 0);
      const blueIdx = (y * width + blueX) * 4;
      data[idx + 2] = temp[blueIdx + 2];
    }
  }
}

function rgbSeparation(data, width, height, strength) {
  const offset = Math.floor(strength * 15);
  const temp = new Uint8ClampedArray(data);
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      const rX = Math.min(x + offset, width - 1);
      const rIdx = (y * width + rX) * 4;
      data[idx] = temp[rIdx];
      
      data[idx + 1] = temp[idx + 1];
      
      const bX = Math.max(x - offset, 0);
      const bIdx = (y * width + bX) * 4;
      data[idx + 2] = temp[bIdx + 2];
    }
  }
}

function hueShift(data, width, height, strength) {
  // Scale down the strength so that 100 (max) equals what 8 used to be
  // 8/100 = 0.08, so we multiply by 0.08 to get the same effect at max
  const scaledStrength = strength * 0.08;
  const shift = scaledStrength * 360;
  
  for (let i = 0; i < data.length; i += 4) {
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    const newH = (h + shift) % 360;
    const [r, g, b] = hslToRgb(newH, s, l);
    
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
}

function saturationBoost(data, width, height, strength) {
  const boost = 1 + strength * 2;
  
  for (let i = 0; i < data.length; i += 4) {
    const [h, s, l] = rgbToHsl(data[i], data[i + 1], data[i + 2]);
    const newS = Math.min(s * boost, 1);
    const [r, g, b] = hslToRgb(h, newS, l);
    
    data[i] = r;
    data[i + 1] = g;
    data[i + 2] = b;
  }
}



function vintageEffect(data, width, height, strength) {
  for (let i = 0; i < data.length; i += 4) {
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
  for (let i = 0; i < data.length; i += 4) {
    if (Math.random() < corruptionRate) {
      data[i] = Math.random() * 255;
      data[i + 1] = Math.random() * 255;
      data[i + 2] = Math.random() * 255;
    }
  }
}

function bitShiftCorruption(data, strength) {
  // New: strength 0 = no effect, strength 1 = full 1-bit shift
  // For 0 < strength < 1, blend original and shifted values
  for (let i = 0; i < data.length; i += 4) {
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

function compressionArtifacts(data, width, height, strength) {
  const blockSize = Math.max(2, Math.floor(8 * strength));
  
  for (let y = 0; y < height; y += blockSize) {
    for (let x = 0; x < width; x += blockSize) {
      let r = 0, g = 0, b = 0, count = 0;
      
      for (let by = y; by < Math.min(y + blockSize, height); by++) {
        for (let bx = x; bx < Math.min(x + blockSize, width); bx++) {
          const idx = (by * width + bx) * 4;
          r += data[idx];
          g += data[idx + 1];
          b += data[idx + 2];
          count++;
        }
      }
      
      r = Math.floor(r / count);
      g = Math.floor(g / count);
      b = Math.floor(b / count);
      
      for (let by = y; by < Math.min(y + blockSize, height); by++) {
        for (let bx = x; bx < Math.min(x + blockSize, width); bx++) {
          const idx = (by * width + bx) * 4;
          data[idx] = r;
          data[idx + 1] = g;
          data[idx + 2] = b;
        }
      }
    }
  }
}

function scanlineEffect(data, width, height, strength) {
  const lineSpacing = Math.max(1, Math.floor(10 - strength * 8));
  
  for (let y = 0; y < height; y += lineSpacing * 2) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      data[idx] *= 0.3;
      data[idx + 1] *= 0.3;
      data[idx + 2] *= 0.3;
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
    audioSensitivity: audioSensitivityRange.value
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
      datamoshIntensity: '40'
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
      datamoshIntensity: '30'
    },
    'rainbow-sort': {
      direction: 'off',
      spiral: 'off',
      slice: 'off',
      pixelSort: 'columnHue',
      colorEffect: 'hueShift',
      datamosh: 'off',
      intensity: 'large',
      colorIntensity: '60'
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
    datamoshIntensity: datamoshIntensityRange.value
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
}

// ========== Initialize ==========
// Set default color offset for Slice Glitch effect to 0
colorOffsetRange.value = 0;
colorOffsetValue.textContent = 0;

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