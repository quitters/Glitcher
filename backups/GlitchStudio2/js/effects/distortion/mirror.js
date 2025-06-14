/**
 * Distortion Effect: Mirror
 * Creates a mirror reflection of the image
 */

/**
 * Register the mirror effect
 * @param {Object} registry - Effect registry
 */
export function registerMirrorEffect(registry) {
  registry.register(
    'mirror',
    'distortion',
    processMirror,
    {
      mode: 'horizontal',
      position: 0.5
    }
  );
}

/**
 * Process the mirror effect
 * @param {ImageData} imageData - Image data to process
 * @param {Object} params - Effect parameters
 * @param {number} globalIntensity - Global intensity multiplier
 * @returns {ImageData} - Processed image data
 */
function processMirror(imageData, params, globalIntensity = 1.0) {
  const { width, height, data } = imageData;
  const result = new ImageData(new Uint8ClampedArray(data), width, height);
  
  const { mode, position } = params;
  const effectivePosition = Math.max(0, Math.min(1, position));
  
  if (mode === 'horizontal') {
    // Mirror horizontally
    const mirrorLine = Math.floor(width * effectivePosition);
    
    for (let y = 0; y < height; y++) {
      for (let x = mirrorLine; x < width; x++) {
        // Calculate mirror position
        const mirrorX = mirrorLine - (x - mirrorLine) - 1;
        
        // Skip if mirror position is outside image bounds
        if (mirrorX < 0) continue;
        
        // Copy mirrored pixel
        const srcIdx = (y * width + mirrorX) * 4;
        const destIdx = (y * width + x) * 4;
        
        result.data[destIdx] = data[srcIdx];
        result.data[destIdx + 1] = data[srcIdx + 1];
        result.data[destIdx + 2] = data[srcIdx + 2];
        result.data[destIdx + 3] = data[srcIdx + 3];
      }
    }
  } else if (mode === 'vertical') {
    // Mirror vertically
    const mirrorLine = Math.floor(height * effectivePosition);
    
    for (let y = mirrorLine; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Calculate mirror position
        const mirrorY = mirrorLine - (y - mirrorLine) - 1;
        
        // Skip if mirror position is outside image bounds
        if (mirrorY < 0) continue;
        
        // Copy mirrored pixel
        const srcIdx = (mirrorY * width + x) * 4;
        const destIdx = (y * width + x) * 4;
        
        result.data[destIdx] = data[srcIdx];
        result.data[destIdx + 1] = data[srcIdx + 1];
        result.data[destIdx + 2] = data[srcIdx + 2];
        result.data[destIdx + 3] = data[srcIdx + 3];
      }
    }
  } else if (mode === 'quad') {
    // Mirror in both directions (quadrant mirror)
    const mirrorX = Math.floor(width * effectivePosition);
    const mirrorY = Math.floor(height * effectivePosition);
    
    // Process all four quadrants
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Determine source quadrant (top-left is the source)
        let srcX = x;
        let srcY = y;
        
        if (x >= mirrorX) srcX = mirrorX - (x - mirrorX) - 1;
        if (y >= mirrorY) srcY = mirrorY - (y - mirrorY) - 1;
        
        // Skip if source position is outside image bounds
        if (srcX < 0 || srcY < 0) continue;
        
        // Copy mirrored pixel
        const srcIdx = (srcY * width + srcX) * 4;
        const destIdx = (y * width + x) * 4;
        
        result.data[destIdx] = data[srcIdx];
        result.data[destIdx + 1] = data[srcIdx + 1];
        result.data[destIdx + 2] = data[srcIdx + 2];
        result.data[destIdx + 3] = data[srcIdx + 3];
      }
    }
  }
  
  return result;
}
