/**
 * Distortion Effect: Pixelate
 * Creates a pixelated version of the image
 */

/**
 * Register the pixelate effect
 * @param {Object} registry - Effect registry
 */
export function registerPixelateEffect(registry) {
  registry.register(
    'pixelate',
    'distortion',
    processPixelate,
    {
      pixelSize: 8
    }
  );
}

/**
 * Process the pixelate effect
 * @param {ImageData} imageData - Image data to process
 * @param {Object} params - Effect parameters
 * @param {number} globalIntensity - Global intensity multiplier
 * @returns {ImageData} - Processed image data
 */
function processPixelate(imageData, params, globalIntensity = 1.0) {
  const { width, height, data } = imageData;
  const result = new ImageData(new Uint8ClampedArray(data), width, height);
  
  // Calculate effective pixel size based on global intensity
  const pixelSize = Math.max(1, Math.floor(params.pixelSize * globalIntensity));
  
  // Skip processing if pixel size is 1 (no pixelation)
  if (pixelSize <= 1) return imageData;
  
  // Process each block
  for (let y = 0; y < height; y += pixelSize) {
    for (let x = 0; x < width; x += pixelSize) {
      // Calculate block boundaries
      const blockWidth = Math.min(pixelSize, width - x);
      const blockHeight = Math.min(pixelSize, height - y);
      
      // Calculate average color for the block
      let r = 0, g = 0, b = 0, a = 0;
      let count = 0;
      
      for (let by = 0; by < blockHeight; by++) {
        for (let bx = 0; bx < blockWidth; bx++) {
          const srcIdx = ((y + by) * width + (x + bx)) * 4;
          r += data[srcIdx];
          g += data[srcIdx + 1];
          b += data[srcIdx + 2];
          a += data[srcIdx + 3];
          count++;
        }
      }
      
      // Calculate average
      r = Math.round(r / count);
      g = Math.round(g / count);
      b = Math.round(b / count);
      a = Math.round(a / count);
      
      // Fill the block with the average color
      for (let by = 0; by < blockHeight; by++) {
        for (let bx = 0; bx < blockWidth; bx++) {
          const destIdx = ((y + by) * width + (x + bx)) * 4;
          result.data[destIdx] = r;
          result.data[destIdx + 1] = g;
          result.data[destIdx + 2] = b;
          result.data[destIdx + 3] = a;
        }
      }
    }
  }
  
  return result;
}
