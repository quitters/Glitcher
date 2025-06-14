/**
 * Distortion Effect: Motion Blur
 * Adds directional blur simulating movement
 */

/**
 * Register the motion blur effect
 * @param {Object} registry - Effect registry
 */
export function registerMotionBlurEffect(registry) {
  registry.register(
    'motionBlur',
    'distortion',
    processMotionBlur,
    {
      distance: 10,
      angle: 0, // 0-360 degrees
      falloff: 50 // 0-100%
    },
    {}, // options
    {
      distance: {
        controlType: 'slider',
        min: 0,
        max: 100,
        step: 1,
        tooltip: 'Length of the motion blur effect in pixels'
      },
      angle: {
        controlType: 'slider',
        min: 0,
        max: 360,
        step: 5,
        tooltip: 'Direction of the motion blur in degrees'
      },
      falloff: {
        controlType: 'slider',
        min: 0,
        max: 100,
        step: 1,
        tooltip: 'How quickly the blur effect fades out'
      }
    }
  );
}

/**
 * Process the motion blur effect
 * @param {ImageData} imageData - Image data to process
 * @param {Object} params - Effect parameters
 * @param {number} params.distance - Blur distance in pixels (0-100)
 * @param {number} params.angle - Blur direction in degrees (0-360)
 * @param {number} params.falloff - Blur falloff percentage (0-100%)
 * @param {number} globalIntensity - Global intensity multiplier
 * @returns {ImageData} - Processed image data
 */
function processMotionBlur(imageData, params, globalIntensity = 1.0) {
  const { distance, angle, falloff } = params;
  const effectiveDistance = distance * globalIntensity;
  
  // Skip processing if distance is 0
  if (effectiveDistance <= 0) return imageData;
  
  // Create a copy of the image data to work with
  const width = imageData.width;
  const height = imageData.height;
  const src = new Uint8ClampedArray(imageData.data);
  const dst = new Uint8ClampedArray(imageData.data);
  
  // Convert angle to radians
  const angleRad = angle * Math.PI / 180;
  
  // Calculate direction vector
  const dirX = Math.cos(angleRad);
  const dirY = Math.sin(angleRad);
  
  // Calculate number of samples based on distance
  const numSamples = Math.max(3, Math.ceil(effectiveDistance));
  
  // Calculate falloff factor
  const falloffFactor = falloff / 100;
  
  // Process each pixel
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const centerIdx = (y * width + x) * 4;
      
      // Initialize accumulators for each channel
      let sumR = src[centerIdx];
      let sumG = src[centerIdx + 1];
      let sumB = src[centerIdx + 2];
      let sumA = src[centerIdx + 3];
      let weightSum = 1; // Start with weight 1 for the center pixel
      
      // Sample along the motion vector in both directions
      for (let i = 1; i <= numSamples; i++) {
        // Calculate sample position
        const sampleDistance = (i / numSamples) * effectiveDistance;
        const weight = 1 - (falloffFactor * sampleDistance / effectiveDistance);
        
        // Sample in positive direction
        const x1 = Math.round(x + dirX * sampleDistance);
        const y1 = Math.round(y + dirY * sampleDistance);
        
        // Sample in negative direction
        const x2 = Math.round(x - dirX * sampleDistance);
        const y2 = Math.round(y - dirY * sampleDistance);
        
        // Check if sample positions are within bounds
        if (x1 >= 0 && x1 < width && y1 >= 0 && y1 < height) {
          const idx1 = (y1 * width + x1) * 4;
          sumR += src[idx1] * weight;
          sumG += src[idx1 + 1] * weight;
          sumB += src[idx1 + 2] * weight;
          sumA += src[idx1 + 3] * weight;
          weightSum += weight;
        }
        
        if (x2 >= 0 && x2 < width && y2 >= 0 && y2 < height) {
          const idx2 = (y2 * width + x2) * 4;
          sumR += src[idx2] * weight;
          sumG += src[idx2 + 1] * weight;
          sumB += src[idx2 + 2] * weight;
          sumA += src[idx2 + 3] * weight;
          weightSum += weight;
        }
      }
      
      // Calculate weighted average
      dst[centerIdx] = sumR / weightSum;
      dst[centerIdx + 1] = sumG / weightSum;
      dst[centerIdx + 2] = sumB / weightSum;
      dst[centerIdx + 3] = sumA / weightSum;
    }
  }
  
  // Create new ImageData with the processed pixels
  const result = new ImageData(dst, width, height);
  return result;
}
