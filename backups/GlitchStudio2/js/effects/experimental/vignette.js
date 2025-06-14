/**
 * Experimental Effect: Vignette
 * Darkens the corners of the image
 */

/**
 * Register the vignette effect
 * @param {Object} registry - Effect registry
 */
export function registerVignetteEffect(registry) {
  registry.register(
    'vignette',
    'experimental',
    processVignette,
    {
      amount: 50,
      softness: 50,
      shape: 'circle', // 'circle', 'square'
      centerX: 50, // 0-100%
      centerY: 50, // 0-100%
      color: '#000000' // black by default
    },
    {}, // options
    {
      amount: {
        controlType: 'slider',
        min: 0,
        max: 100,
        step: 1,
        tooltip: 'Intensity of the vignette effect'
      },
      softness: {
        controlType: 'slider',
        min: 0,
        max: 100,
        step: 1,
        tooltip: 'Softness of the vignette edges'
      },
      shape: {
        controlType: 'dropdown',
        options: [
          { value: 'circle', label: 'Circle' },
          { value: 'square', label: 'Square' }
        ],
        tooltip: 'Shape of the vignette'
      },
      centerX: {
        controlType: 'slider',
        min: 0,
        max: 100,
        step: 1,
        tooltip: 'Horizontal position of the vignette center'
      },
      centerY: {
        controlType: 'slider',
        min: 0,
        max: 100,
        step: 1,
        tooltip: 'Vertical position of the vignette center'
      },
      color: {
        controlType: 'color',
        tooltip: 'Color of the vignette'
      }
    }
  );
}

/**
 * Process the vignette effect
 * @param {ImageData} imageData - Image data to process
 * @param {Object} params - Effect parameters
 * @param {number} params.amount - Vignette intensity (0-100%)
 * @param {number} params.softness - Edge softness (0-100%)
 * @param {string} params.shape - Vignette shape ('circle', 'square')
 * @param {number} params.centerX - Center X position (0-100%)
 * @param {number} params.centerY - Center Y position (0-100%)
 * @param {string} params.color - Vignette color in hex format
 * @param {number} globalIntensity - Global intensity multiplier
 * @returns {ImageData} - Processed image data
 */
function processVignette(imageData, params, globalIntensity = 1.0) {
  const { amount, softness, shape, centerX, centerY, color } = params;
  const effectiveAmount = amount * globalIntensity / 100;
  
  // Skip processing if amount is 0
  if (effectiveAmount <= 0) return imageData;
  
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  // Parse vignette color
  const r = parseInt(color.slice(1, 3), 16);
  const g = parseInt(color.slice(3, 5), 16);
  const b = parseInt(color.slice(5, 7), 16);
  
  // Calculate center position in pixels
  const centerXPx = width * centerX / 100;
  const centerYPx = height * centerY / 100;
  
  // Calculate maximum distance from center to corner
  const maxDistance = shape === 'circle' 
    ? Math.sqrt(Math.pow(Math.max(centerXPx, width - centerXPx), 2) + Math.pow(Math.max(centerYPx, height - centerYPx), 2))
    : Math.max(Math.max(centerXPx, width - centerXPx), Math.max(centerYPx, height - centerYPx));
  
  // Adjust softness
  const adjustedSoftness = softness / 100;
  const softStart = 1 - effectiveAmount;
  
  // Process each pixel
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      // Calculate distance from center
      let distance;
      if (shape === 'circle') {
        // Euclidean distance for circle
        distance = Math.sqrt(Math.pow(x - centerXPx, 2) + Math.pow(y - centerYPx, 2)) / maxDistance;
      } else {
        // Manhattan distance for square (modified to create square shape)
        const dx = Math.abs(x - centerXPx) / Math.max(centerXPx, width - centerXPx);
        const dy = Math.abs(y - centerYPx) / Math.max(centerYPx, height - centerYPx);
        distance = Math.max(dx, dy);
      }
      
      // Calculate vignette factor (0 = no effect, 1 = full effect)
      let factor = 0;
      if (distance > softStart) {
        // Apply softness curve
        factor = Math.min(1, (distance - softStart) / (adjustedSoftness * (1 - softStart)));
      }
      
      // Apply vignette effect
      if (factor > 0) {
        data[idx] = data[idx] * (1 - factor) + r * factor;
        data[idx + 1] = data[idx + 1] * (1 - factor) + g * factor;
        data[idx + 2] = data[idx + 2] * (1 - factor) + b * factor;
        // Alpha channel remains unchanged
      }
    }
  }
  
  return imageData;
}
