/**
 * Artistic Effect: Emboss
 * Creates a 3D embossed appearance
 */

import { applyKernel } from '../../utils/effect-utils.js';

export const embossEffect = {
  name: 'emboss',
  displayName: 'Emboss',
  category: 'artistic',
  
  params: {
    enabled: {
      value: false,
      displayName: 'Enable Emboss'
    },
    strength: {
      value: 1,
      min: 0.5,
      max: 3,
      step: 0.5,
      displayName: 'Emboss Strength',
      tooltip: 'Intensity of the emboss effect'
    },
    direction: {
      value: 'topLeft',
      options: ['topLeft', 'top', 'topRight', 'left', 'right', 'bottomLeft', 'bottom', 'bottomRight'],
      displayName: 'Light Direction',
      tooltip: 'Direction of the emboss light source'
    },
    grayscale: {
      value: true,
      displayName: 'Grayscale',
      tooltip: 'Convert to grayscale for classic emboss look'
    }
  },
  
  process(imageData, params, globalIntensity) {
    if (!params.enabled) return;
    
    const { data } = imageData;
    const strength = params.strength * globalIntensity;
    
    // Get the appropriate kernel based on direction
    const kernel = this._getEmbossKernel(params.direction, strength);
    
    // Apply emboss kernel
    applyKernel(imageData, kernel, 3);
    
    // Add gray bias to make the effect visible
    for (let i = 0; i < data.length; i += 4) {
      data[i] = Math.min(255, Math.max(0, data[i] + 128));
      data[i + 1] = Math.min(255, Math.max(0, data[i + 1] + 128));
      data[i + 2] = Math.min(255, Math.max(0, data[i + 2] + 128));
      
      // Convert to grayscale if requested
      if (params.grayscale) {
        const gray = (data[i] + data[i + 1] + data[i + 2]) / 3;
        data[i] = data[i + 1] = data[i + 2] = gray;
      }
    }
  },
  
  /**
   * Get emboss kernel for specific direction
   */
  _getEmbossKernel(direction, strength) {
    const s = strength;
    
    const kernels = {
      topLeft: [
        -s, -s, 0,
        -s, 1, s,
        0, s, s
      ],
      top: [
        -s, -s, -s,
        0, 1, 0,
        s, s, s
      ],
      topRight: [
        0, -s, -s,
        s, 1, -s,
        s, s, 0
      ],
      left: [
        -s, 0, s,
        -s, 1, s,
        -s, 0, s
      ],
      right: [
        s, 0, -s,
        s, 1, -s,
        s, 0, -s
      ],
      bottomLeft: [
        0, s, s,
        -s, 1, s,
        -s, -s, 0
      ],
      bottom: [
        s, s, s,
        0, 1, 0,
        -s, -s, -s
      ],
      bottomRight: [
        s, s, 0,
        s, 1, -s,
        0, -s, -s
      ]
    };
    
    return kernels[direction] || kernels.topLeft;
  }
};
