/**
 * Filter Effect: Edge Detection
 * Detects edges in the image using convolution
 */

import { applyKernel, kernels } from '../../utils/effect-utils.js';

export const edgeDetectionEffect = {
  name: 'edgeDetection',
  displayName: 'Edge Detection',
  category: 'filter',
  
  params: {
    enabled: {
      value: false,
      displayName: 'Enable Edge Detection'
    },
    threshold: {
      value: 50,
      min: 0,
      max: 255,
      step: 5,
      displayName: 'Edge Threshold',
      tooltip: 'Minimum edge strength to display'
    },
    invert: {
      value: false,
      displayName: 'Invert Edges',
      tooltip: 'Show edges as light on dark background'
    },
    colorize: {
      value: false,
      displayName: 'Colorize Edges',
      tooltip: 'Keep original colors on edges'
    }
  },
  
  process(imageData, params, globalIntensity) {
    if (!params.enabled) return;
    
    const { data, width, height } = imageData;
    const threshold = params.threshold * globalIntensity;
    
    // Store original for colorize option
    const original = params.colorize ? new Uint8ClampedArray(data) : null;
    
    // Apply edge detection kernel
    applyKernel(imageData, kernels.edgeDetect, 3);
    
    // Process edges with threshold
    for (let i = 0; i < data.length; i += 4) {
      // Calculate edge intensity from RGB values
      const edgeIntensity = (data[i] + data[i + 1] + data[i + 2]) / 3;
      
      if (edgeIntensity < threshold) {
        // Below threshold - no edge
        if (params.invert) {
          data[i] = data[i + 1] = data[i + 2] = 255;
        } else {
          data[i] = data[i + 1] = data[i + 2] = 0;
        }
      } else {
        // Above threshold - edge detected
        if (params.colorize && original) {
          // Keep original colors
          data[i] = original[i];
          data[i + 1] = original[i + 1];
          data[i + 2] = original[i + 2];
        } else {
          // Black/white edge
          const edgeValue = params.invert ? 0 : 255;
          data[i] = data[i + 1] = data[i + 2] = edgeValue;
        }
      }
    }
  }
};
