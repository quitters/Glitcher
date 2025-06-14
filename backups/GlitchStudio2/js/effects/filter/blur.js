/**
 * Filter Effect: Blur
 * Applies a Gaussian blur to the image
 */

/**
 * Register the blur effect
 * @param {Object} registry - Effect registry
 */
export function registerBlurEffect(registry) {
  registry.register(
    'blur',
    'filter',
    processBlur,
    {
      radius: 5
    }
  );
}

/**
 * Process the blur effect
 * @param {ImageData} imageData - Image data to process
 * @param {Object} params - Effect parameters
 * @param {number} globalIntensity - Global intensity multiplier
 * @returns {ImageData} - Processed image data
 */
function processBlur(imageData, params, globalIntensity = 1.0) {
  const { width, height, data } = imageData;
  const result = new ImageData(new Uint8ClampedArray(data), width, height);
  
  // Calculate effective radius based on global intensity
  const radius = Math.max(1, Math.floor(params.radius * globalIntensity));
  
  // Skip processing if radius is less than 1
  if (radius < 1) return imageData;
  
  // Generate Gaussian kernel
  const kernel = generateGaussianKernel(radius);
  const kernelSize = kernel.length;
  const kernelSum = kernel.reduce((sum, val) => sum + val, 0);
  
  // Create temporary buffer for horizontal pass
  const tempBuffer = new Uint8ClampedArray(width * height * 4);
  
  // Horizontal pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      let weightSum = 0;
      
      for (let i = -radius; i <= radius; i++) {
        const srcX = Math.min(width - 1, Math.max(0, x + i));
        const srcIdx = (y * width + srcX) * 4;
        const weight = kernel[i + radius];
        
        r += data[srcIdx] * weight;
        g += data[srcIdx + 1] * weight;
        b += data[srcIdx + 2] * weight;
        a += data[srcIdx + 3] * weight;
        weightSum += weight;
      }
      
      // Normalize by weight sum
      const destIdx = (y * width + x) * 4;
      tempBuffer[destIdx] = r / weightSum;
      tempBuffer[destIdx + 1] = g / weightSum;
      tempBuffer[destIdx + 2] = b / weightSum;
      tempBuffer[destIdx + 3] = a / weightSum;
    }
  }
  
  // Vertical pass
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let r = 0, g = 0, b = 0, a = 0;
      let weightSum = 0;
      
      for (let j = -radius; j <= radius; j++) {
        const srcY = Math.min(height - 1, Math.max(0, y + j));
        const srcIdx = (srcY * width + x) * 4;
        const weight = kernel[j + radius];
        
        r += tempBuffer[srcIdx] * weight;
        g += tempBuffer[srcIdx + 1] * weight;
        b += tempBuffer[srcIdx + 2] * weight;
        a += tempBuffer[srcIdx + 3] * weight;
        weightSum += weight;
      }
      
      // Normalize by weight sum
      const destIdx = (y * width + x) * 4;
      result.data[destIdx] = r / weightSum;
      result.data[destIdx + 1] = g / weightSum;
      result.data[destIdx + 2] = b / weightSum;
      result.data[destIdx + 3] = a / weightSum;
    }
  }
  
  return result;
}

/**
 * Generate a Gaussian kernel for the blur effect
 * @param {number} radius - Blur radius
 * @returns {Array} - Gaussian kernel
 */
function generateGaussianKernel(radius) {
  const size = radius * 2 + 1;
  const kernel = new Array(size);
  const sigma = radius / 3;
  let sum = 0;
  
  // Calculate Gaussian values
  for (let i = 0; i < size; i++) {
    const x = i - radius;
    // Gaussian function: f(x) = (1 / sqrt(2π * σ²)) * e^(-(x² / 2σ²))
    kernel[i] = Math.exp(-(x * x) / (2 * sigma * sigma));
    sum += kernel[i];
  }
  
  // Normalize kernel
  for (let i = 0; i < size; i++) {
    kernel[i] /= sum;
  }
  
  return kernel;
}
