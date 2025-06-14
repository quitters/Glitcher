/**
 * Color Effect: Invert
 * Inverts the colors of the image
 */

export const invertEffect = {
  name: 'invert',
  displayName: 'Invert',
  category: 'color',
  
  // Simple effect - no parameters needed
  params: {},
  
  // Process function that modifies ImageData in-place
  process(imageData, params, globalIntensity) {
    const { data } = imageData;
    
    // Process each pixel
    for (let i = 0; i < data.length; i += 4) {
      // Invert RGB channels based on global intensity
      data[i] = Math.round(data[i] * (1 - globalIntensity) + (255 - data[i]) * globalIntensity);       // Red
      data[i + 1] = Math.round(data[i + 1] * (1 - globalIntensity) + (255 - data[i + 1]) * globalIntensity); // Green
      data[i + 2] = Math.round(data[i + 2] * (1 - globalIntensity) + (255 - data[i + 2]) * globalIntensity); // Blue
      // Alpha remains unchanged
    }
  }
};
