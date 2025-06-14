// ========== DOM Elements ==========

// Canvas & context
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// File input
const fileInput = document.getElementById('image-input');

// Dropdowns
const directionSelect    = document.getElementById('direction-select');
const spiralSelect       = document.getElementById('spiral-select');
const sliceSelect        = document.getElementById('slice-select');
const pixelSortSelect    = document.getElementById('pixel-sort-select');
const intensitySelect    = document.getElementById('intensity-select');

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

// Buttons
const randomizeBtn       = document.getElementById('randomize-btn');
const playPauseBtn       = document.getElementById('play-pause-btn');
const resetBtn           = document.getElementById('reset-btn');
const snapshotBtn        = document.getElementById('snapshot-btn');
const recordBtn          = document.getElementById('record-btn');
const spiralDirectionBtn = document.getElementById('spiral-direction-btn');

// Reverse checkbox
const reverseCheckbox    = document.getElementById('reverse-checkbox');

// ========== Global State ==========

let originalImageData  = null;
let glitchImageData    = null;
let imgWidth = 0, imgHeight = 0;

let animationId = null;
let isPaused    = false;

// Active pixel clumps
let activeClumps = [];

// Track spiral direction (CW/CCW) via a toggle button
let spiralDirection = 'cw';  // defaults to CW

// ========== Setup Event Listeners ==========

// File load
fileInput.addEventListener('change', handleFileSelect);

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
  playPauseBtn.textContent = 'Pause';
  activeClumps = [];
  animate();
}

// ========== Animation Loop ==========

function animate() {
  if (isPaused) {
    animationId = requestAnimationFrame(animate);
    return;
  }

  // Read current UI states
  const direction   = directionSelect.value;    // off, down, up, ...
  const spiral      = spiralSelect.value;       // off, spiral, insideOut, ...
  const slice       = sliceSelect.value;        // off, horizontal, ...
  const pixelSort   = pixelSortSelect.value;    // off, columnBrightness, rowBrightness, ...
  const intensity   = intensitySelect.value;    // medium, large, extraLarge
  const shiftSpeed  = parseInt(speedRange.value, 10);
  const swirlStr    = parseFloat(swirlRange.value);
  const colorMax    = parseInt(colorOffsetRange.value, 10);
  const minLife     = parseInt(minLifetimeRange.value, 10);
  const maxLife     = parseInt(maxLifetimeRange.value, 10);

  // Manage clumps
  if (activeClumps.length === 0) {
    spawnNewClumps(intensity, minLife, maxLife);
  }

  // For each clump, do direction + swirl
  activeClumps.forEach(clump => {
    if (direction !== 'off') {
      applyDirectionShift(glitchImageData, clump, shiftSpeed, direction);
    }
    if (spiral !== 'off') {
      // If spiral == "spiral", use the user-chosen direction (spiralDirection)
      // Otherwise if "insideOut", "outsideIn", or "random," pass them directly
      let swirlType = spiral;
      if (spiral === 'spiral') {
        swirlType = spiralDirection;  // 'cw' or 'ccw'
      }
      swirlRectangle(glitchImageData, clump, swirlStr, swirlType);
    }
    // decrement lifetime
    clump.framesRemaining--;
  });
  // Remove expired
  activeClumps = activeClumps.filter(c => c.framesRemaining > 0);

  // Slice glitch
  if (slice !== 'off') {
    applySliceGlitch(glitchImageData, slice, colorMax);
  }

  // Pixel sort
  if (pixelSort !== 'off') {
    applyPixelSort(glitchImageData, pixelSort);
  }

  // Draw updated
  ctx.putImageData(glitchImageData, 0, 0);

  animationId = requestAnimationFrame(animate);
}

// ========== Clumps ==========

function spawnNewClumps(intensity, minLife, maxLife) {
  const n = getNumClumps(intensity);
  for (let i = 0; i < n; i++) {
    const { x, y, w, h } = pickRandomClump(intensity, imgWidth, imgHeight);
    const framesRemaining = randomInt(minLife, maxLife);

    // If direction == 'random', store a random direction for entire life
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

// ========== Direction Shift ==========

function applyDirectionShift(imageData, clump, speed, globalDir) {
  let dir = globalDir;
  if (globalDir === 'random') {
    // use clump's stored direction
    dir = clump.clumpDirection;
  } else if (globalDir === 'jitter') {
    // pick random each frame
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

// ========== Spiral (Swirl) ==========

function swirlRectangle(imageData, rect, swirlStrength, swirlType) {
  const { x, y, w, h } = rect;
  const { data, width, height } = imageData;
  if (x<0 || y<0 || x+w>width || y+h>height) return;

  // Copy subregion
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

  // Copy swirlBuffer back
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

// ========== Slice Glitch ==========

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
      // shift right
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
      // shift left
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
      // shift down
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
      // shift up
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

// ========== Pixel Sort Logic ==========

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
    default:
      break;
  }
}

// Sort all columns by brightness
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
    // sort ascending
    column.sort((p,q) => p.value - q.value);
    // put back
    for (let y=0; y<height; y++) {
      const idx = (y*width + x)*4;
      data[idx]   = column[y].r;
      data[idx+1] = column[y].g;
      data[idx+2] = column[y].b;
      data[idx+3] = column[y].a;
    }
  }
}

// Sort all rows by brightness
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

// Sort all columns by hue
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
    // sort by hue ascending
    column.sort((p,q) => p.value - q.value);
    // put back
    for (let y=0; y<height; y++) {
      const idx = (y*width + x)*4;
      data[idx]   = column[y].r;
      data[idx+1] = column[y].g;
      data[idx+2] = column[y].b;
      data[idx+3] = column[y].a;
    }
  }
}

// Sort all rows by hue
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

// Sort random lines (row or column) each frame
function randomLineSort(imageData) {
  const { width, height } = imageData;
  const linesToSort = 3; // arbitrary small number each frame
  for (let i=0; i<linesToSort; i++) {
    const horizontal = Math.random() < 0.5;
    if (horizontal) {
      // random row
      const row = randomInt(0, height-1);
      sortOneRowByBrightness(imageData, row);
    } else {
      // random column
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

// ========== Utility: Hue Conversion ==========

function rgbToHue(r, g, b) {
  // Convert [0..255] range to [0..1]
  let rf = r / 255;
  let gf = g / 255;
  let bf = b / 255;
  let max = Math.max(rf, gf, bf), min = Math.min(rf, gf, bf);
  let h = 0;
  if (max === min) {
    h = 0; // grayscale
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
  return h * 360; // degrees [0..360)
}

// ========== Play/Pause & Reset ==========

function togglePlayPause() {
  isPaused = !isPaused;
  playPauseBtn.textContent = isPaused ? 'Play' : 'Pause';
  if (!isPaused) {
    animate();
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
}

// ========== Recording to MP4 (or WebM) ==========

let mediaRecorder = null;
let recordedChunks = [];

function startRecording() {
  if (!glitchImageData) return;

  // Duration in seconds
  const duration = parseInt(recordRange.value, 20);
  // Whether user wants reversed video
  const doReverse = reverseCheckbox.checked;

  // Reset chunks
  recordedChunks = [];

  // Try MP4 first:
let options = {
  mimeType: 'video/mp4; codecs=avc1.42E01E',
  videoBitsPerSecond: 15_000_000 // 15 Mbps
};

if (!MediaRecorder.isTypeSupported(options.mimeType)) {
  // Fallback to VP9
  options = {
    mimeType: 'video/webm; codecs=vp9',
    videoBitsPerSecond: 10_000_000
  };
}

const stream = canvas.captureStream(30); // 30 fps
mediaRecorder = new MediaRecorder(stream, options);

  mediaRecorder.ondataavailable = (e) => {
    if (e.data && e.data.size > 0) {
      recordedChunks.push(e.data);
    }
  };

  mediaRecorder.onstop = () => {
    // Build the final blob
    // (Note: simply reversing the order of chunks generally does NOT produce a reversed
    //  video. True reversing requires re-encoding frames in reverse.)
    if (doReverse) {
      recordedChunks.reverse(); // minimal, naive attempt (likely won't produce an actual reversed playback)
    }

    const blob = new Blob(recordedChunks, { type: options.mimeType });
    const url = URL.createObjectURL(blob);

    // Download link
    const link = document.createElement('a');
    link.href = url;
    // Give it an extension based on chosen mimeType
    if (options.mimeType.includes('mp4')) {
      link.download = 'glitch_recording.mp4';
    } else {
      link.download = 'glitch_recording.webm';
    }
    link.click();
    URL.revokeObjectURL(url);
  };

  mediaRecorder.start();
  // Auto-stop after the chosen duration
  setTimeout(() => {
    if (mediaRecorder && mediaRecorder.state === 'recording') {
      mediaRecorder.stop();
    }
  }, duration * 1000);
}

// ========== Download Snapshot ==========

function downloadSnapshot() {
  if (!glitchImageData) return;
  // The canvas already displays the current glitch state
  const dataURL = canvas.toDataURL('image/png');
  const link = document.createElement('a');
  link.href = dataURL;
  link.download = 'glitch_snapshot.png';
  link.click();
}

// ========== Randomize Settings ==========

function randomizeSettings() {
  // Direction
  const dirVals = ['off','down','up','right','left','random','jitter'];
  directionSelect.value = dirVals[randomInt(0, dirVals.length-1)];

  // Spiral
  const spVals = ['off','spiral','insideOut','outsideIn','random'];
  spiralSelect.value = spVals[randomInt(0, spVals.length-1)];

  // Slice
  const slVals = ['off','horizontal','vertical','both'];
  sliceSelect.value = slVals[randomInt(0, slVals.length-1)];

  // Pixel Sort
  const pxVals = ['off','columnBrightness','rowBrightness','columnHue','rowHue','randomLines'];
  pixelSortSelect.value = pxVals[randomInt(0, pxVals.length-1)];

  // Intensity
  const intVals = ['medium','large','extraLarge'];
  intensitySelect.value = intVals[randomInt(0, intVals.length-1)];

  // Shift speed: 1..5
  const spd = randomInt(1,5);
  speedRange.value = spd;
  speedValue.textContent = spd;

  // Swirl range: 0.01..0.15
  const swirl = randomFloat(0.01,0.15,2);
  swirlRange.value = swirl;
  swirlValue.textContent = swirl.toString();

  // Color offset: 0..50
  const cOff = randomInt(0,50);
  colorOffsetRange.value = cOff;
  colorOffsetValue.textContent = cOff;

  // Clump lifetime: 1..300
  const mn = randomInt(1,300);
  const mx = randomInt(mn,300);
  minLifetimeRange.value = mn;
  minLifetimeValue.textContent = mn;
  maxLifetimeRange.value = mx;
  maxLifetimeValue.textContent = mx;
}

// ========== Utility ==========

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