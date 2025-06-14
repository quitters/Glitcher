// Example implementation of mask-aware effect functions

// Modified applyDirectionShift that works with mask-aware shift functions
function applyDirectionShift(imageData, clump, speed, globalDir) {
  let dir = globalDir;
  if (globalDir === 'random') {
    dir = clump.clumpDirection;
  } else if (globalDir === 'jitter') {
    const dirs = ['up','down','left','right'];
    dir = dirs[randomInt(0, dirs.length - 1)];
  }

  // Shift functions now handle mask checking internally
  switch (dir) {
    case 'down':  shiftRectDown(imageData, clump, speed);  break;
    case 'up':    shiftRectUp(imageData, clump, speed);    break;
    case 'left':  shiftRectLeft(imageData, clump, speed);  break;
    case 'right': shiftRectRight(imageData, clump, speed); break;
  }
}

// Modified shift functions that respect selection mask
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
  const { data, width, height } = imageData;
  const mask = isManualSelectionMode() ? selectionMask : null;
  
  for (let row = y; row < y + h; row++) {
    const destRow = row - shift;
    if (destRow < 0) continue;
    
    for (let col = x; col < x + w; col++) {
      const maskIdx = row * width + col;
      
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
  const { data, width, height } = imageData;
  const mask = isManualSelectionMode() ? selectionMask : null;
  
  for (let row = y; row < y + h; row++) {
    for (let col = x; col < x + w; col++) {
      const destCol = col - shift;
      if (destCol < 0) continue;
      
      const maskIdx = row * width + col;
      
      if (!mask || mask[maskIdx] === 255) {
        const srcIdx = (row * width + col) * 4;
        const dstIdx = (row * width + destCol) * 4;
        data[dstIdx]   = data[srcIdx];
        data[dstIdx+1] = data[srcIdx+1];
        data[dstIdx+2] = data[srcIdx+2];
        data[dstIdx+3] = data[srcIdx+3];
      }
    }
  }
}

function shiftRectRight(imageData, {x,y,w,h}, shift) {
  const { data, width, height } = imageData;
  const mask = isManualSelectionMode() ? selectionMask : null;
  
  for (let row = y; row < y + h; row++) {
    for (let col = x + w - 1; col >= x; col--) {
      const destCol = col + shift;
      if (destCol >= width) continue;
      
      const maskIdx = row * width + col;
      
      if (!mask || mask[maskIdx] === 255) {
        const srcIdx = (row * width + col) * 4;
        const dstIdx = (row * width + destCol) * 4;
        data[dstIdx]   = data[srcIdx];
        data[dstIdx+1] = data[srcIdx+1];
        data[dstIdx+2] = data[srcIdx+2];
        data[dstIdx+3] = data[srcIdx+3];
      }
    }
  }
}

// Modified swirlRectangle that respects selection mask
function swirlRectangle(imageData, rect, swirlStrength, swirlType) {
  const { x, y, w, h } = rect;
  const { data, width, height } = imageData;
  if (x<0 || y<0 || x+w>width || y+h>height) return;

  const subregion = new Uint8ClampedArray(w * h * 4);
  const mask = selectionMask; // Reference to global selection mask
  
  // Copy only selected pixels to subregion
  for (let row=0; row<h; row++) {
    for (let col=0; col<w; col++) {
      const srcX = x + col;
      const srcY = y + row;
      const maskIdx = srcY * width + srcX;
      
      if (!mask || mask[maskIdx] === 255) { // Only process selected pixels
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
      
      if (!mask || mask[maskIdx] === 255) { // Only swirl selected pixels
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
      
      if (!mask || mask[maskIdx] === 255) { // Only update selected pixels
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

// Helper function to check if we're in manual selection mode
function isManualSelectionMode() {
  return manualSelectionMode && manualSelectionMode.checked;
}

// Modified updateSelectionsFromMask to preserve shape info
function updateSelectionsFromMask() {
  if (!selectionMask || !selectionEngine) return;
  
  // Find bounding boxes of selected regions
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
            // Note: We don't need to store mask data here since effects will check the global selectionMask
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
      clumpDirection,
      isManualSelection: true // Flag to indicate this came from manual selection
    });
  });
}

// Example of how to modify slice glitch functions
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
        
        // Check mask if in manual mode
        if (!mask || mask[maskIdx] === 255) {
          const srcIdx  = (row*width + col)*4;
          const dstCol  = col + offset;
          if (dstCol>=width) continue;
          
          // Also check destination mask
          const dstMaskIdx = row * width + dstCol;
          if (!mask || mask[dstMaskIdx] === 255) {
            const dstIdx  = (row*width + dstCol)*4;
            data[dstIdx]   = clampColor(data[srcIdx] + colorOffset);
            data[dstIdx+1] = clampColor(data[srcIdx+1] + colorOffset);
            data[dstIdx+2] = clampColor(data[srcIdx+2] + colorOffset);
            data[dstIdx+3] = data[srcIdx+3];
          }
        }
      }
    } else {
      // Similar logic for other direction
    }
  }
}
