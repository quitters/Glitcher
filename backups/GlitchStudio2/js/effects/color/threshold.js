/**
 * Color Effect: Threshold
 * Converts image to black and white based on brightness threshold
 */

export const thresholdEffect = {
  name: 'threshold',
  displayName: 'Threshold',
  category: 'color',
  
  // Parameter definitions
  params: {
    threshold: {
      value: 127,
      min: 0,
      max: 255,
      step: 1,
      displayName: 'Threshold Level',
      tooltip: 'Brightness threshold for black/white conversion'
    }
  },
  
  // Process function that modifies ImageData in-place
  process(imageData, params, globalIntensity) {
    const { data } = imageData;
    const threshold = params.threshold;
    
    // Process each pixel
    for (let i = 0; i < data.length; i += 4) {
      // Calculate brightness
      const brightness = (data[i] + data[i + 1] + data[i + 2]) / 3;
      
      // Apply threshold
      const newValue = brightness > threshold ? 255 : 0;
      
      // Mix with original based on global intensity
      data[i] = Math.round(data[i] * (1 - globalIntensity) + newValue * globalIntensity);     // Red
      data[i + 1] = Math.round(data[i + 1] * (1 - globalIntensity) + newValue * globalIntensity); // Green
      data[i + 2] = Math.round(data[i + 2] * (1 - globalIntensity) + newValue * globalIntensity); // Blue
      // Alpha remains unchanged
    }
  }
};
