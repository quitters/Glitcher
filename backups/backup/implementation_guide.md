# Implementation Guide: Mask-Aware Effects for Organic Selections

## Overview
This guide explains how to modify the Glitcher effect system to properly handle organic selections created with brush, lasso, and wand tools. Currently, these selections are converted to rectangles, losing their organic shapes. The solution makes all effect functions mask-aware.

## Key Changes Required

### 1. Global Selection Mode Detection
Add a helper function to check if we're in manual selection mode:

```javascript
function isManualSelectionMode() {
  return manualSelectionMode && manualSelectionMode.checked;
}
```

### 2. Modify Direction Shift Functions
Each shift function needs to check the selection mask before moving pixels:

```javascript
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
```

Apply similar changes to:
- `shiftRectUp`
- `shiftRectLeft`  
- `shiftRectRight`

### 3. Modify Swirl/Spiral Effects
The swirl function needs mask awareness in three places:
1. When copying pixels to subregion
2. When applying the swirl transformation
3. When writing pixels back

```javascript
function swirlRectangle(imageData, rect, swirlStrength, swirlType) {
  const { x, y, w, h } = rect;
  const { data, width, height } = imageData;
  const mask = isManualSelectionMode() ? selectionMask : null;
  
  // ... existing bounds checking ...
  
  // Only process selected pixels throughout the function
  for (let row=0; row<h; row++) {
    for (let col=0; col<w; col++) {
      const srcX = x + col;
      const srcY = y + row;
      const maskIdx = srcY * width + srcX;
      
      if (!mask || mask[maskIdx] === 255) {
        // Process this pixel
      }
    }
  }
}
```

### 4. Modify Slice Glitch Functions
Update both horizontal and vertical slice functions:

```javascript
function horizontalSliceGlitch(imageData, colorMax) {
  const { data, width, height } = imageData;
  const mask = isManualSelectionMode() ? selectionMask : null;
  
  // ... calculate slice parameters ...
  
  for (let row=startY; row<startY+sliceHeight; row++) {
    for (let col=0; col<width; col++) {
      const maskIdx = row * width + col;
      
      if (!mask || mask[maskIdx] === 255) {
        // Apply slice effect
      }
    }
  }
}
```

### 5. Modify Pixel Sort Functions
Each sort function needs to only sort selected pixels:

```javascript
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
    
    // Sort and write back
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
```

### 6. Keep updateSelectionsFromMask Simple
The function can remain mostly unchanged - it just finds bounding boxes:

```javascript
function updateSelectionsFromMask() {
  if (!selectionMask || !selectionEngine) return;
  
  // Find bounding boxes as before
  // Effects will check the mask themselves
  
  activeClumps = [];
  regions.forEach(region => {
    activeClumps.push({
      ...region,
      framesRemaining,
      clumpDirection,
      isManualSelection: true // Optional flag
    });
  });
}
```

## Testing

1. Load an image
2. Enable Manual Selection Mode
3. Use brush tool to paint an organic shape
4. Apply various effects:
   - Direction shifts should only move selected pixels
   - Swirls should only affect selected areas
   - Pixel sorts should only reorder selected pixels
   - Color effects should only modify selected regions

## Performance Considerations

- Mask checking adds minimal overhead (simple array lookup)
- Effects already iterate through pixels, so the additional check is negligible
- No additional memory allocation needed (reuses existing selectionMask)

## Benefits

1. **Accurate Selections**: Organic shapes are preserved exactly as drawn
2. **Better User Experience**: What you draw is what gets affected
3. **Backward Compatible**: Non-manual selections work as before
4. **Clean Architecture**: Effects check mask directly rather than storing redundant data

## Implementation Order

1. Start with one effect (e.g., shiftRectDown) and test thoroughly
2. Apply pattern to other shift functions
3. Update swirl effect
4. Modify slice effects
5. Update pixel sort functions
6. Test all combinations
