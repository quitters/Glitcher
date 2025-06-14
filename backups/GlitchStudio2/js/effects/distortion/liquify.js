/**
 * Distortion Effect: Liquify
 * Creates fluid-like distortions in the image
 */

/**
 * Register the liquify effect
 * @param {Object} registry - Effect registry
 */
export function registerLiquifyEffect(registry) {
  registry.register(
    'liquify',
    'distortion',
    processLiquify,
    {
      intensity: 20,
      brushSize: 30,
      mode: 'push', // 'push', 'twirl', 'expand', 'contract'
      centerX: 50, // 0-100%
      centerY: 50  // 0-100%
    },
    {}, // options
    {
      intensity: {
        controlType: 'slider',
        min: 0,
        max: 100,
        step: 1,
        tooltip: 'Strength of the liquify distortion'
      },
      brushSize: {
        controlType: 'slider',
        min: 5,
        max: 100,
        step: 1,
        tooltip: 'Size of the area affected by the liquify effect'
      },
      mode: {
        controlType: 'dropdown',
        options: [
          { value: 'push', label: 'Push' },
          { value: 'twirl', label: 'Twirl' },
          { value: 'expand', label: 'Expand' },
          { value: 'contract', label: 'Contract' }
        ],
        tooltip: 'Type of distortion to apply'
      },
      centerX: {
        controlType: 'slider',
        min: 0,
        max: 100,
        step: 1,
        tooltip: 'Horizontal position of the effect center'
      },
      centerY: {
        controlType: 'slider',
        min: 0,
        max: 100,
        step: 1,
        tooltip: 'Vertical position of the effect center'
      }
    }
  );
}

/**
 * Process the liquify effect
 * @param {ImageData} imageData - Image data to process
 * @param {Object} params - Effect parameters
 * @param {number} params.intensity - Effect intensity (0-100)
 * @param {number} params.brushSize - Size of the effect area (1-100 pixels)
 * @param {string} params.mode - Distortion mode ('push', 'twirl', 'expand', 'contract')
 * @param {number} params.centerX - Center X position (0-100%)
 * @param {number} params.centerY - Center Y position (0-100%)
 * @param {number} globalIntensity - Global intensity multiplier
 * @returns {ImageData} - Processed image data
 */
function processLiquify(imageData, params, globalIntensity = 1.0) {
  const { intensity, brushSize, mode, centerX, centerY } = params;
  const effectiveIntensity = intensity * globalIntensity;
  
  // Skip processing if intensity is 0
  if (effectiveIntensity <= 0) return imageData;
  
  // Create a copy of the image data to work with
  const width = imageData.width;
  const height = imageData.height;
  const src = new Uint8ClampedArray(imageData.data);
  const dst = new Uint8ClampedArray(imageData.data.length);
  
  // Calculate center position in pixels
  const centerXPx = width * centerX / 100;
  const centerYPx = height * centerY / 100;
  
  // Calculate brush radius
  const radius = Math.max(1, brushSize);
  const radiusSquared = radius * radius;
  
  // Process each pixel
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      // Calculate distance from center
      const dx = x - centerXPx;
      const dy = y - centerYPx;
      const distanceSquared = dx * dx + dy * dy;
      
      // Skip pixels outside the brush area
      if (distanceSquared > radiusSquared) {
        // Copy original pixel
        dst[idx] = src[idx];
        dst[idx + 1] = src[idx + 1];
        dst[idx + 2] = src[idx + 2];
        dst[idx + 3] = src[idx + 3];
        continue;
      }
      
      // Calculate distance factor (0 at edge, 1 at center)
      const distance = Math.sqrt(distanceSquared);
      const distanceFactor = 1 - (distance / radius);
      
      // Calculate displacement based on mode
      let displaceX = 0;
      let displaceY = 0;
      
      switch (mode) {
        case 'push':
          // Push away from center
          if (distance > 0) {
            const angle = Math.atan2(dy, dx);
            displaceX = Math.cos(angle) * effectiveIntensity * distanceFactor;
            displaceY = Math.sin(angle) * effectiveIntensity * distanceFactor;
          }
          break;
          
        case 'twirl':
          // Rotate around center
          if (distance > 0) {
            const angle = Math.atan2(dy, dx);
            const twirl = effectiveIntensity * distanceFactor * Math.PI / 180;
            const newAngle = angle + twirl;
            
            displaceX = (Math.cos(newAngle) * distance) - dx;
            displaceY = (Math.sin(newAngle) * distance) - dy;
          }
          break;
          
        case 'expand':
          // Expand from center
          if (distance > 0) {
            const factor = effectiveIntensity * distanceFactor / 10;
            displaceX = -dx * factor;
            displaceY = -dy * factor;
          }
          break;
          
        case 'contract':
          // Contract toward center
          if (distance > 0) {
            const factor = effectiveIntensity * distanceFactor / 10;
            displaceX = dx * factor;
            displaceY = dy * factor;
          }
          break;
      }
      
      // Calculate source pixel coordinates with displacement
      const srcX = x - displaceX;
      const srcY = y - displaceY;
      
      // Bilinear interpolation for smoother results
      const x1 = Math.floor(srcX);
      const y1 = Math.floor(srcY);
      const x2 = Math.min(x1 + 1, width - 1);
      const y2 = Math.min(y1 + 1, height - 1);
      
      const xWeight = srcX - x1;
      const yWeight = srcY - y1;
      
      // Check if source coordinates are within bounds
      if (x1 >= 0 && x1 < width && y1 >= 0 && y1 < height) {
        const idx11 = (y1 * width + x1) * 4;
        const idx12 = (y1 * width + x2) * 4;
        const idx21 = (y2 * width + x1) * 4;
        const idx22 = (y2 * width + x2) * 4;
        
        // Interpolate color values
        for (let c = 0; c < 4; c++) {
          const top = src[idx11 + c] * (1 - xWeight) + src[idx12 + c] * xWeight;
          const bottom = src[idx21 + c] * (1 - xWeight) + src[idx22 + c] * xWeight;
          dst[idx + c] = Math.round(top * (1 - yWeight) + bottom * yWeight);
        }
      } else {
        // Fallback to original pixel if out of bounds
        dst[idx] = src[idx];
        dst[idx + 1] = src[idx + 1];
        dst[idx + 2] = src[idx + 2];
        dst[idx + 3] = src[idx + 3];
      }
    }
  }
  
  // Create new ImageData with the processed pixels
  const result = new ImageData(dst, width, height);
  return result;
}
