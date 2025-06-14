/**
 * Color Effect: Posterize
 * Reduces the number of color levels in the image
 */

export const posterizeEffect = {
  name: 'posterize',
  displayName: 'Posterize',
  category: 'color',
  
  // Parameter definitions
  params: {
    levels: {
      value: 5,
      min: 2,
      max: 20,
      step: 1,
      displayName: 'Color Levels',
      tooltip: 'Number of color levels per channel'
    }
  },
  
  // Process function that modifies ImageData in-place
  process(imageData, params, globalIntensity) {
    const { data } = imageData;
    const levels = Math.max(2, Math.floor(params.levels * globalIntensity));
    
    // Calculate step size for posterization
    const step = 255 / (levels - 1);
    
    // Process each pixel
    for (let i = 0; i < data.length; i += 4) {
      // Posterize each channel
      data[i] = Math.round(Math.round(data[i] / step) * step);     // Red
      data[i + 1] = Math.round(Math.round(data[i + 1] / step) * step); // Green
      data[i + 2] = Math.round(Math.round(data[i + 2] / step) * step); // Blue
      // Alpha remains unchanged
    }
  }
};
