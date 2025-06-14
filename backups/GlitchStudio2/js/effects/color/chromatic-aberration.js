/**
 * Color Effect: Chromatic Aberration
 * Simulates lens aberration or custom RGB channel splitting.
 */

export const chromaticAberrationEffect = {
  name: 'chromaticAberration',
  displayName: 'Chromatic Aberration',
  category: 'color',
  
  params: {
    enabled: {
      value: false,
      displayName: 'Enable Chromatic Aberration',
      tooltip: 'Toggle the effect on or off'
    },
    offset: {
      value: 5,
      min: 0,
      max: 50, // Increased max
      step: 1,
      displayName: 'Offset/Distance',
      tooltip: 'Pixel offset for standard modes, or distance for custom mode'
    },
    direction: {
      value: 'horizontal',
      options: ['horizontal', 'vertical', 'radial', 'custom'], // Added 'custom'
      displayName: 'Aberration Mode',
      tooltip: 'Mode of color channel separation. Custom mode uses angle and distance for RGB split.'
    },
    customAngle: { // New parameter for 'custom' mode
      value: 0,
      min: 0,
      max: 360,
      step: 1,
      displayName: 'Custom Angle',
      tooltip: 'Base angle for custom RGB split (0-360 degrees). Active if mode is Custom.'
    }
  },
  
  process(imageData, params, globalIntensity = 1.0) {
    if (!params.enabled.value) {
      return imageData; // Return original if not enabled
    }

    const { width, height } = imageData;
    const srcData = imageData.data;
    
    // Create new ImageData to store the result (non-destructive)
    const outputImageData = new ImageData(width, height);
    const outputData = outputImageData.data;

    // Initialize outputData alpha from source, RGB will be filled by effect logic
    // If a pixel's color is not set by the effect, it will be black by default from new ImageData.
    for (let i = 0; i < srcData.length; i += 4) {
      outputData[i + 3] = srcData[i + 3]; // Preserve original alpha
    }

    const effectiveOffset = Math.floor((params.offset.value || 0) * globalIntensity);

    // If offset is 0 and not custom mode (custom mode might still shift if angle changes, but distance 0 is also no-op)
    // A zero offset effectively means no visual change for standard modes.
    // For custom mode, distance 0 also means no change.
    if (effectiveOffset === 0) {
      // To be truly non-destructive and return a *new* instance even for no-op:
      for (let i = 0; i < srcData.length; i++) { outputData[i] = srcData[i]; }
      return outputImageData;
    }
    
    switch (params.direction.value) {
      case 'horizontal':
        this._horizontalAberration(outputData, srcData, width, height, effectiveOffset);
        break;
      case 'vertical':
        this._verticalAberration(outputData, srcData, width, height, effectiveOffset);
        break;
      case 'radial':
        this._radialAberration(outputData, srcData, width, height, effectiveOffset);
        break;
      case 'custom':
        this._customAberration(outputData, srcData, width, height, effectiveOffset, params.customAngle.value);
        break;
      default:
        // If unknown mode, copy srcData to outputData to ensure a valid image is returned
        for (let i = 0; i < srcData.length; i++) { outputData[i] = srcData[i]; }
        break;
    }
    return outputImageData;
  },
  
  _horizontalAberration(outputData, srcData, width, height, offset) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        
        // Red channel (shifted right)
        const redX = Math.min(x + offset, width - 1);
        const redSrcIdx = (y * width + redX) * 4;
        outputData[idx] = srcData[redSrcIdx];
        
        // Green channel (stays in place)
        outputData[idx + 1] = srcData[idx + 1];
        
        // Blue channel (shifted left)
        const blueX = Math.max(x - offset, 0);
        const blueSrcIdx = (y * width + blueX) * 4;
        outputData[idx + 2] = srcData[blueSrcIdx + 2];
        // Alpha is already set
      }
    }
  },
  
  _verticalAberration(outputData, srcData, width, height, offset) {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        
        // Red channel (shifted down)
        const redY = Math.min(y + offset, height - 1);
        const redSrcIdx = (redY * width + x) * 4;
        outputData[idx] = srcData[redSrcIdx];
        
        // Green channel (stays in place)
        outputData[idx + 1] = srcData[idx + 1];
        
        // Blue channel (shifted up)
        const blueY = Math.max(y - offset, 0);
        const blueSrcIdx = (blueY * width + x) * 4;
        outputData[idx + 2] = srcData[blueSrcIdx + 2];
        // Alpha is already set
      }
    }
  },
  
  _radialAberration(outputData, srcData, width, height, offset) {
    const centerX = width / 2;
    const centerY = height / 2;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const dx = x - centerX;
        const dy = y - centerY;
        const distFromCenter = Math.sqrt(dx * dx + dy * dy);
        
        if (distFromCenter === 0) { // Center pixel, no shift
          outputData[idx]     = srcData[idx];
          outputData[idx + 1] = srcData[idx + 1];
          outputData[idx + 2] = srcData[idx + 2];
        } else {
          const normalizedDx = dx / distFromCenter;
          const normalizedDy = dy / distFromCenter;
          
          // Red channel (shifted outward)
          const redX = Math.round(x + normalizedDx * offset);
          const redY = Math.round(y + normalizedDy * offset);
          if (redX >= 0 && redX < width && redY >= 0 && redY < height) {
            const redSrcIdx = (redY * width + redX) * 4;
            outputData[idx] = srcData[redSrcIdx];
          } else {
            outputData[idx] = 0; // Or some default color if out of bounds
          }
          
          // Green channel (stays in place)
          outputData[idx + 1] = srcData[idx + 1];
          
          // Blue channel (shifted inward)
          const blueX = Math.round(x - normalizedDx * offset);
          const blueY = Math.round(y - normalizedDy * offset);
          if (blueX >= 0 && blueX < width && blueY >= 0 && blueY < height) {
            const blueSrcIdx = (blueY * width + blueX) * 4;
            outputData[idx + 2] = srcData[blueSrcIdx + 2];
          } else {
            outputData[idx + 2] = 0; // Or some default color if out of bounds
          }
        }
        // Alpha is already set
      }
    }
  },

  _customAberration(outputData, srcData, width, height, distance, angleDegrees) {
    if (distance === 0) {
      // If distance is zero, just copy src to output as no shift will occur.
      for (let i = 0; i < srcData.length; i++) { outputData[i] = srcData[i]; }
      return;
    }

    const angleRad = angleDegrees * Math.PI / 180;

    // Calculate offsets for each channel (R, G, B shifted by 120 deg increments from base angle)
    const rOffX = Math.cos(angleRad) * distance;
    const rOffY = Math.sin(angleRad) * distance;
    
    const gOffX = Math.cos(angleRad + (2 * Math.PI / 3)) * distance;
    const gOffY = Math.sin(angleRad + (2 * Math.PI / 3)) * distance;
    
    const bOffX = Math.cos(angleRad + (4 * Math.PI / 3)) * distance;
    const bOffY = Math.sin(angleRad + (4 * Math.PI / 3)) * distance;

    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const baseIdx = (y * width + x) * 4;

        // Red channel
        const rSrcX = Math.round(x + rOffX);
        const rSrcY = Math.round(y + rOffY);
        if (rSrcX >= 0 && rSrcX < width && rSrcY >= 0 && rSrcY < height) {
          const rSrcIdx = (rSrcY * width + rSrcX) * 4;
          outputData[baseIdx] = srcData[rSrcIdx];
        } else {
          outputData[baseIdx] = 0; // Default to black if out of bounds
        }

        // Green channel
        const gSrcX = Math.round(x + gOffX);
        const gSrcY = Math.round(y + gOffY);
        if (gSrcX >= 0 && gSrcX < width && gSrcY >= 0 && gSrcY < height) {
          const gSrcIdx = (gSrcY * width + gSrcX) * 4;
          outputData[baseIdx + 1] = srcData[gSrcIdx + 1];
        } else {
          outputData[baseIdx + 1] = 0; // Default to black if out of bounds
        }

        // Blue channel
        const bSrcX = Math.round(x + bOffX);
        const bSrcY = Math.round(y + bOffY);
        if (bSrcX >= 0 && bSrcX < width && bSrcY >= 0 && bSrcY < height) {
          const bSrcIdx = (bSrcY * width + bSrcX) * 4;
          outputData[baseIdx + 2] = srcData[bSrcIdx + 2];
        } else {
          outputData[baseIdx + 2] = 0; // Default to black if out of bounds
        }
        // Alpha is already set
      }
    }
  }
};
