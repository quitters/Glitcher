/**
 * Glitch Effect: Slice
 * Creates horizontal and vertical slice displacement with color offset
 * Simulates digital tearing and displacement artifacts
 */

export const sliceEffect = {
  name: 'slice',
  displayName: 'Slice Glitch',
  category: 'glitch',
  
  params: {
    enabled: {
      value: false,
      displayName: 'Enable Slice'
    },
    mode: {
      value: 'both',
      options: ['off', 'horizontal', 'vertical', 'both'],
      displayName: 'Slice Mode',
      tooltip: 'Direction of slice effects'
    },
    colorOffset: {
      value: 20,
      min: 0,
      max: 100,
      step: 5,
      displayName: 'Color Offset',
      tooltip: 'RGB channel displacement amount'
    },
    sliceCount: {
      value: 3,
      min: 1,
      max: 10,
      step: 1,
      displayName: 'Slice Count',
      tooltip: 'Number of slices per frame'
    },
    maxThickness: {
      value: 20,
      min: 5,
      max: 50,
      step: 5,
      displayName: 'Max Thickness',
      tooltip: 'Maximum slice thickness in pixels'
    },
    displacement: {
      value: 15,
      min: 5,
      max: 50,
      step: 5,
      displayName: 'Displacement',
      tooltip: 'Maximum horizontal/vertical shift'
    }
  },
  
  process(imageData, params, globalIntensity) {
    if (!params.enabled || params.mode === 'off') return;
    
    const colorMax = Math.floor(params.colorOffset * globalIntensity);
    const displacement = Math.floor(params.displacement * globalIntensity);
    
    // Apply slices based on mode
    for (let i = 0; i < params.sliceCount; i++) {
      if (params.mode === 'horizontal' || params.mode === 'both') {
        this._horizontalSliceGlitch(imageData, colorMax, params.maxThickness, displacement);
      }
      
      if (params.mode === 'vertical' || params.mode === 'both') {
        this._verticalSliceGlitch(imageData, colorMax, params.maxThickness, displacement);
      }
    }
  },
  
  /**
   * Apply horizontal slice glitch
   */
  _horizontalSliceGlitch(imageData, colorMax, maxThickness, maxDisplacement) {
    const { data, width, height } = imageData;
    
    // Random slice parameters
    const sliceHeight = Math.floor(Math.random() * maxThickness) + 1;
    const startY = Math.floor(Math.random() * (height - sliceHeight));
    const direction = Math.random() < 0.5 ? -1 : 1;
    const offset = Math.floor(Math.random() * maxDisplacement) + 1;
    const colorOffset = Math.floor((Math.random() * 2 - 1) * colorMax);
    
    // Create buffer for the slice
    const sliceBuffer = new Uint8ClampedArray(sliceHeight * width * 4);
    
    // Copy slice to buffer
    for (let row = 0; row < sliceHeight; row++) {
      const y = startY + row;
      if (y >= height) break;
      
      for (let x = 0; x < width; x++) {
        const srcIdx = (y * width + x) * 4;
        const bufIdx = (row * width + x) * 4;
        sliceBuffer[bufIdx] = data[srcIdx];
        sliceBuffer[bufIdx + 1] = data[srcIdx + 1];
        sliceBuffer[bufIdx + 2] = data[srcIdx + 2];
        sliceBuffer[bufIdx + 3] = data[srcIdx + 3];
      }
    }
    
    // Write back with displacement and color offset
    for (let row = 0; row < sliceHeight; row++) {
      const y = startY + row;
      if (y >= height) break;
      
      if (direction === 1) {
        // Shift right
        for (let x = width - 1; x >= 0; x--) {
          const srcX = x;
          const dstX = x + offset;
          if (dstX >= width) continue;
          
          const bufIdx = (row * width + srcX) * 4;
          const dstIdx = (y * width + dstX) * 4;
          
          data[dstIdx] = this._clampColor(sliceBuffer[bufIdx] + colorOffset);
          data[dstIdx + 1] = this._clampColor(sliceBuffer[bufIdx + 1] + colorOffset);
          data[dstIdx + 2] = this._clampColor(sliceBuffer[bufIdx + 2] + colorOffset);
          data[dstIdx + 3] = sliceBuffer[bufIdx + 3];
        }
      } else {
        // Shift left
        for (let x = 0; x < width; x++) {
          const srcX = x;
          const dstX = x - offset;
          if (dstX < 0) continue;
          
          const bufIdx = (row * width + srcX) * 4;
          const dstIdx = (y * width + dstX) * 4;
          
          data[dstIdx] = this._clampColor(sliceBuffer[bufIdx] + colorOffset);
          data[dstIdx + 1] = this._clampColor(sliceBuffer[bufIdx + 1] + colorOffset);
          data[dstIdx + 2] = this._clampColor(sliceBuffer[bufIdx + 2] + colorOffset);
          data[dstIdx + 3] = sliceBuffer[bufIdx + 3];
        }
      }
    }
  },
  
  /**
   * Apply vertical slice glitch
   */
  _verticalSliceGlitch(imageData, colorMax, maxThickness, maxDisplacement) {
    const { data, width, height } = imageData;
    
    // Random slice parameters
    const sliceWidth = Math.floor(Math.random() * maxThickness) + 1;
    const startX = Math.floor(Math.random() * (width - sliceWidth));
    const direction = Math.random() < 0.5 ? -1 : 1;
    const offset = Math.floor(Math.random() * maxDisplacement) + 1;
    const colorOffset = Math.floor((Math.random() * 2 - 1) * colorMax);
    
    // Create buffer for the slice
    const sliceBuffer = new Uint8ClampedArray(sliceWidth * height * 4);
    
    // Copy slice to buffer
    for (let col = 0; col < sliceWidth; col++) {
      const x = startX + col;
      if (x >= width) break;
      
      for (let y = 0; y < height; y++) {
        const srcIdx = (y * width + x) * 4;
        const bufIdx = (y * sliceWidth + col) * 4;
        sliceBuffer[bufIdx] = data[srcIdx];
        sliceBuffer[bufIdx + 1] = data[srcIdx + 1];
        sliceBuffer[bufIdx + 2] = data[srcIdx + 2];
        sliceBuffer[bufIdx + 3] = data[srcIdx + 3];
      }
    }
    
    // Write back with displacement and color offset
    for (let col = 0; col < sliceWidth; col++) {
      const x = startX + col;
      if (x >= width) break;
      
      if (direction === 1) {
        // Shift down
        for (let y = height - 1; y >= 0; y--) {
          const srcY = y;
          const dstY = y + offset;
          if (dstY >= height) continue;
          
          const bufIdx = (srcY * sliceWidth + col) * 4;
          const dstIdx = (dstY * width + x) * 4;
          
          data[dstIdx] = this._clampColor(sliceBuffer[bufIdx] + colorOffset);
          data[dstIdx + 1] = this._clampColor(sliceBuffer[bufIdx + 1] + colorOffset);
          data[dstIdx + 2] = this._clampColor(sliceBuffer[bufIdx + 2] + colorOffset);
          data[dstIdx + 3] = sliceBuffer[bufIdx + 3];
        }
      } else {
        // Shift up
        for (let y = 0; y < height; y++) {
          const srcY = y;
          const dstY = y - offset;
          if (dstY < 0) continue;
          
          const bufIdx = (srcY * sliceWidth + col) * 4;
          const dstIdx = (dstY * width + x) * 4;
          
          data[dstIdx] = this._clampColor(sliceBuffer[bufIdx] + colorOffset);
          data[dstIdx + 1] = this._clampColor(sliceBuffer[bufIdx + 1] + colorOffset);
          data[dstIdx + 2] = this._clampColor(sliceBuffer[bufIdx + 2] + colorOffset);
          data[dstIdx + 3] = sliceBuffer[bufIdx + 3];
        }
      }
    }
  },
  
  /**
   * Clamp color value to valid range
   */
  _clampColor(value) {
    return Math.max(0, Math.min(255, value));
  }
};
