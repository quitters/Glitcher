/**
 * Filter Effect: Noise
 * Adds random noise to the image
 */

/**
 * Register the noise effect
 * @param {Object} registry - Effect registry
 */
export function registerNoiseEffect(registry) {
  registry.register(
    'noise',
    'filter',
    processNoise,
    {
      amount: 50,
      type: 'gaussian', // 'gaussian', 'saltPepper', 'uniform'
      monochrome: true,
      seed: '' // Empty string means random seed each time
    },
    {}, // options
    {
      amount: {
        controlType: 'slider',
        min: 0,
        max: 100,
        step: 1,
        tooltip: 'Amount of noise to apply to the image'
      },
      type: {
        controlType: 'dropdown',
        options: [
          { value: 'gaussian', label: 'Gaussian' },
          { value: 'saltPepper', label: 'Salt & Pepper' },
          { value: 'uniform', label: 'Uniform' }
        ],
        tooltip: 'Type of noise pattern to apply'
      },
      monochrome: {
        controlType: 'toggle',
        tooltip: 'Apply the same noise to all color channels'
      },
      seed: {
        controlType: 'text',
        tooltip: 'Enter text to generate reproducible noise patterns (leave empty for random)'
      }
    }
  );
}

/**
 * Process the noise effect
 * @param {ImageData} imageData - Image data to process
 * @param {Object} params - Effect parameters
 * @param {number} params.amount - Amount of noise to apply (0-100%)
 * @param {string} params.type - Type of noise ('gaussian', 'saltPepper', 'uniform')
 * @param {boolean} params.monochrome - Whether to apply the same noise to all channels
 * @param {string} params.seed - Seed for reproducible noise (empty for random)
 * @param {number} globalIntensity - Global intensity multiplier
 * @returns {ImageData} - Processed image data
 */
function processNoise(imageData, params, globalIntensity = 1.0) {
  const { amount, type, monochrome, seed } = params;
  const effectiveAmount = amount * globalIntensity / 100;
  
  // Skip processing if amount is 0
  if (effectiveAmount <= 0) return imageData;
  
  const data = imageData.data;
  const width = imageData.width;
  const height = imageData.height;
  
  // Initialize pseudo-random number generator with seed if provided
  let seedValue = seed ? hashString(seed) : Date.now();
  const random = seededRandom(seedValue);
  
  // Process each pixel
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      
      // Generate noise values
      let noiseR, noiseG, noiseB;
      
      if (monochrome) {
        // Same noise for all channels
        const noise = generateNoise(type, random, effectiveAmount);
        noiseR = noiseG = noiseB = noise;
      } else {
        // Different noise for each channel
        noiseR = generateNoise(type, random, effectiveAmount);
        noiseG = generateNoise(type, random, effectiveAmount);
        noiseB = generateNoise(type, random, effectiveAmount);
      }
      
      // Apply noise to each channel
      data[idx] = Math.max(0, Math.min(255, data[idx] + noiseR));
      data[idx + 1] = Math.max(0, Math.min(255, data[idx + 1] + noiseG));
      data[idx + 2] = Math.max(0, Math.min(255, data[idx + 2] + noiseB));
      // Alpha channel remains unchanged
    }
  }
  
  return imageData;
}

/**
 * Generate noise value based on the specified type
 * @param {string} type - Type of noise
 * @param {Function} random - Seeded random function
 * @param {number} amount - Noise amount (0-1)
 * @returns {number} - Noise value to add to pixel
 */
function generateNoise(type, random, amount) {
  switch (type) {
    case 'gaussian':
      // Approximate Gaussian noise using Box-Muller transform
      const u1 = random();
      const u2 = random();
      const z = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
      return z * 128 * amount; // Scale to appropriate range
      
    case 'saltPepper':
      // Salt and pepper noise
      const threshold = amount / 2;
      const value = random();
      if (value < threshold) {
        return -255; // Pepper (black)
      } else if (value > 1 - threshold) {
        return 255; // Salt (white)
      }
      return 0;
      
    case 'uniform':
    default:
      // Uniform noise
      return (random() * 2 - 1) * 255 * amount;
  }
}

/**
 * Create a seeded random number generator
 * @param {number} seed - Seed value
 * @returns {Function} - Seeded random function
 */
function seededRandom(seed) {
  return function() {
    seed = (seed * 9301 + 49297) % 233280;
    return seed / 233280;
  };
}

/**
 * Simple string hash function
 * @param {string} str - String to hash
 * @returns {number} - Hash value
 */
function hashString(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return Math.abs(hash);
}
