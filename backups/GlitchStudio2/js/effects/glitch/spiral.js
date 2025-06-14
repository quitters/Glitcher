/**
 * Glitch Effect: Spiral
 * Creates spiral/swirl distortions within rectangular regions
 * Supports CW, CCW, inside-out, outside-in, and random variations
 */

export const spiralEffect = {
  name: 'spiral',
  displayName: 'Spiral Distortion',
  category: 'glitch',
  
  params: {
    enabled: {
      value: false,
      displayName: 'Enable Spiral'
    },
    mode: {
      value: 'cw',
      options: ['cw', 'ccw', 'insideOut', 'outsideIn', 'random'],
      displayName: 'Spiral Mode',
      tooltip: 'Direction and type of spiral effect'
    },
    strength: {
      value: 0.08,
      min: 0.01,
      max: 0.5,
      step: 0.01,
      displayName: 'Swirl Strength',
      tooltip: 'Intensity of the spiral distortion'
    },
    regionSize: {
      value: 'medium',
      options: ['small', 'medium', 'large', 'extraLarge'],
      displayName: 'Region Size',
      tooltip: 'Size of affected regions'
    },
    regionCount: {
      value: 3,
      min: 1,
      max: 10,
      step: 1,
      displayName: 'Region Count',
      tooltip: 'Number of spiral regions'
    }
  },
  
  // Store active regions for consistent frame processing
  _activeRegions: [],
  _lastFrameTime: 0,
  
  process(imageData, params, globalIntensity) {
    if (!params.enabled) return;
    
    const currentTime = Date.now();
    const shouldGenerateNew = currentTime - this._lastFrameTime > 100; // New regions every 100ms
    
    if (shouldGenerateNew || this._activeRegions.length === 0) {
      this._generateRegions(imageData, params);
      this._lastFrameTime = currentTime;
    }
    
    const strength = params.strength * globalIntensity;
    
    // Apply spiral to each active region
    this._activeRegions.forEach(region => {
      this._swirlRectangle(imageData, region, strength, params.mode);
    });
  },
  
  /**
   * Generate random regions for spiral effect
   */
  _generateRegions(imageData, params) {
    const { width, height } = imageData;
    this._activeRegions = [];
    
    const count = params.regionCount;
    const { maxW, maxH } = this._getRegionDimensions(params.regionSize, width, height);
    
    for (let i = 0; i < count; i++) {
      const w = Math.floor(Math.random() * (maxW - 20) + 20);
      const h = Math.floor(Math.random() * (maxH - 20) + 20);
      const x = Math.floor(Math.random() * (width - w));
      const y = Math.floor(Math.random() * (height - h));
      
      this._activeRegions.push({ x, y, w, h });
    }
  },
  
  /**
   * Get maximum region dimensions based on size setting
   */
  _getRegionDimensions(size, width, height) {
    switch (size) {
      case 'small':
        return { maxW: Math.floor(width / 8), maxH: Math.floor(height / 8) };
      case 'medium':
        return { maxW: Math.floor(width / 4), maxH: Math.floor(height / 4) };
      case 'large':
        return { maxW: Math.floor(width / 2), maxH: Math.floor(height / 2) };
      case 'extraLarge':
        return { maxW: Math.floor(width * 0.75), maxH: Math.floor(height * 0.75) };
      default:
        return { maxW: Math.floor(width / 4), maxH: Math.floor(height / 4) };
    }
  },
  
  /**
   * Apply spiral/swirl effect to a rectangular region
   */
  _swirlRectangle(imageData, rect, swirlStrength, swirlType) {
    const { x, y, w, h } = rect;
    const { data, width, height } = imageData;
    
    // Boundary check
    if (x < 0 || y < 0 || x + w > width || y + h > height) return;
    
    // Extract subregion
    const subregion = new Uint8ClampedArray(w * h * 4);
    for (let row = 0; row < h; row++) {
      for (let col = 0; col < w; col++) {
        const srcX = x + col;
        const srcY = y + row;
        const srcIdx = (srcY * width + srcX) * 4;
        const dstIdx = (row * w + col) * 4;
        subregion[dstIdx] = data[srcIdx];
        subregion[dstIdx + 1] = data[srcIdx + 1];
        subregion[dstIdx + 2] = data[srcIdx + 2];
        subregion[dstIdx + 3] = data[srcIdx + 3];
      }
    }
    
    // Apply swirl transformation
    const centerX = w / 2;
    const centerY = h / 2;
    const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
    const swirlBuffer = new Uint8ClampedArray(subregion);
    
    for (let row = 0; row < h; row++) {
      for (let col = 0; col < w; col++) {
        const dx = col - centerX;
        const dy = row - centerY;
        const radius = Math.sqrt(dx * dx + dy * dy);
        const theta = Math.atan2(dy, dx);
        
        const swirlAngle = this._computeSwirlAngle(radius, maxRadius, swirlStrength, swirlType);
        const newTheta = theta + swirlAngle;
        
        const nx = Math.round(centerX + radius * Math.cos(newTheta));
        const ny = Math.round(centerY + radius * Math.sin(newTheta));
        
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) {
          const srcIdx = (row * w + col) * 4;
          const dstIdx = (ny * w + nx) * 4;
          swirlBuffer[dstIdx] = subregion[srcIdx];
          swirlBuffer[dstIdx + 1] = subregion[srcIdx + 1];
          swirlBuffer[dstIdx + 2] = subregion[srcIdx + 2];
          swirlBuffer[dstIdx + 3] = subregion[srcIdx + 3];
        }
      }
    }
    
    // Copy swirled data back to main image
    for (let row = 0; row < h; row++) {
      for (let col = 0; col < w; col++) {
        const srcIdx = (row * w + col) * 4;
        const dstX = x + col;
        const dstY = y + row;
        const dstIdx = (dstY * width + dstX) * 4;
        data[dstIdx] = swirlBuffer[srcIdx];
        data[dstIdx + 1] = swirlBuffer[srcIdx + 1];
        data[dstIdx + 2] = swirlBuffer[srcIdx + 2];
        data[dstIdx + 3] = swirlBuffer[srcIdx + 3];
      }
    }
  },
  
  /**
   * Compute swirl angle based on radius and mode
   */
  _computeSwirlAngle(radius, maxRadius, strength, type) {
    const normalizedRadius = radius / maxRadius;
    
    switch (type) {
      case 'cw':
        return strength * normalizedRadius;
      case 'ccw':
        return -strength * normalizedRadius;
      case 'insideOut':
        return strength * (1 - normalizedRadius);
      case 'outsideIn':
        return strength * normalizedRadius * normalizedRadius;
      case 'random':
        return (Math.random() * 2 - 1) * strength * normalizedRadius;
      default:
        return 0;
    }
  }
};
