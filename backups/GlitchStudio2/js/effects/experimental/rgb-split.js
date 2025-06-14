/**
 * Experimental Effect: RGB Split
 * Separates RGB channels with offset for a chromatic aberration effect
 */

/**
 * Register the RGB split effect
 * @param {Object} registry - Effect registry
 */
export function registerRgbSplitEffect(registry) {
  registry.register(
    'rgbSplit',
    'experimental',
    processRgbSplit,
    {
      distance: 10,
      angle: 0
    },
    {
      isExperimental: true
    }
  );
}

/**
 * Process the RGB split effect
 * @param {ImageData} imageData - Image data to process
 * @param {Object} params - Effect parameters
 * @param {number} globalIntensity - Global intensity multiplier
 * @returns {ImageData} - Processed image data
 */
function processRgbSplit(imageData, params, globalIntensity = 1.0) {
  const { width, height, data } = imageData;
  const result = new ImageData(new Uint8ClampedArray(width * height * 4), width, height);
  
  // Fill result with black and full alpha
  for (let i = 0; i < result.data.length; i += 4) {
    result.data[i] = 0;
    result.data[i + 1] = 0;
    result.data[i + 2] = 0;
    result.data[i + 3] = 255;
  }
  
  // Calculate effective distance based on global intensity
  const distance = Math.max(0, params.distance * globalIntensity);
  
  // Skip processing if distance is 0
  if (distance === 0) return imageData;
  
  // Convert angle from degrees to radians
  const angle = (params.angle || 0) * Math.PI / 180;
  
  // Calculate offsets for each channel
  const redOffsetX = Math.cos(angle) * distance;
  const redOffsetY = Math.sin(angle) * distance;
  
  const greenOffsetX = Math.cos(angle + Math.PI * 2/3) * distance;
  const greenOffsetY = Math.sin(angle + Math.PI * 2/3) * distance;
  
  const blueOffsetX = Math.cos(angle + Math.PI * 4/3) * distance;
  const blueOffsetY = Math.sin(angle + Math.PI * 4/3) * distance;
  
  // Apply RGB channel offsets
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const baseIdx = (y * width + x) * 4;
      
      // Calculate source positions for each channel
      const redX = Math.round(x + redOffsetX);
      const redY = Math.round(y + redOffsetY);
      
      const greenX = Math.round(x + greenOffsetX);
      const greenY = Math.round(y + greenOffsetY);
      
      const blueX = Math.round(x + blueOffsetX);
      const blueY = Math.round(y + blueOffsetY);
      
      // Get red channel if within bounds
      if (redX >= 0 && redX < width && redY >= 0 && redY < height) {
        const redIdx = (redY * width + redX) * 4;
        result.data[baseIdx] = data[redIdx];
      }
      
      // Get green channel if within bounds
      if (greenX >= 0 && greenX < width && greenY >= 0 && greenY < height) {
        const greenIdx = (greenY * width + greenX) * 4 + 1;
        result.data[baseIdx + 1] = data[greenIdx];
      }
      
      // Get blue channel if within bounds
      if (blueX >= 0 && blueX < width && blueY >= 0 && blueY < height) {
        const blueIdx = (blueY * width + blueX) * 4 + 2;
        result.data[baseIdx + 2] = data[blueIdx];
      }
      
      // Alpha is always full
      result.data[baseIdx + 3] = 255;
    }
  }
  
  return result;
}
