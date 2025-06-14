/**
 * Glitch Effect: Direction Shift
 * Animated directional displacement with clump-based regions
 * Creates dynamic shifting effects with lifetime controls
 */

export const directionShiftEffect = {
  name: 'directionShift',
  displayName: 'Direction Shift',
  category: 'glitch',
  
  params: {
    enabled: {
      value: false,
      displayName: 'Enable Direction Shift'
    },
    direction: {
      value: 'random',
      options: ['off', 'down', 'up', 'left', 'right', 'random', 'jitter'],
      displayName: 'Shift Direction',
      tooltip: 'Direction of pixel displacement'
    },
    speed: {
      value: 3,
      min: 1,
      max: 10,
      step: 1,
      displayName: 'Shift Speed',
      tooltip: 'Pixels moved per frame'
    },
    intensity: {
      value: 'medium',
      options: ['small', 'medium', 'large', 'extraLarge'],
      displayName: 'Clump Size',
      tooltip: 'Size and number of affected regions'
    },
    minLifetime: {
      value: 30,
      min: 10,
      max: 300,
      step: 10,
      displayName: 'Min Lifetime',
      tooltip: 'Minimum frames a clump stays active'
    },
    maxLifetime: {
      value: 90,
      min: 10,
      max: 300,
      step: 10,
      displayName: 'Max Lifetime',
      tooltip: 'Maximum frames a clump stays active'
    }
  },
  
  // Internal state for clump management
  _activeClumps: [],
  _frameCount: 0,
  
  process(imageData, params, globalIntensity) {
    if (!params.enabled || params.direction === 'off') return;
    
    this._frameCount++;
    
    // Manage clump lifecycle
    this._updateClumps(imageData, params);
    
    const speed = Math.floor(params.speed * globalIntensity);
    
    // Apply direction shift to each active clump
    this._activeClumps.forEach(clump => {
      this._applyDirectionShift(imageData, clump, speed, params.direction);
      clump.framesRemaining--;
    });
    
    // Remove expired clumps
    this._activeClumps = this._activeClumps.filter(c => c.framesRemaining > 0);
  },
  
  /**
   * Update clump lifecycle - spawn new ones if needed
   */
  _updateClumps(imageData, params) {
    const targetClumpCount = this._getNumClumps(params.intensity);
    
    if (this._activeClumps.length < targetClumpCount) {
      const clumpsToSpawn = targetClumpCount - this._activeClumps.length;
      this._spawnNewClumps(imageData, params, clumpsToSpawn);
    }
  },
  
  /**
   * Get number of clumps based on intensity
   */
  _getNumClumps(intensity) {
    switch (intensity) {
      case 'small': return 1;
      case 'medium': return 2;
      case 'large': return 4;
      case 'extraLarge': return 6;
      default: return 2;
    }
  },
  
  /**
   * Spawn new clumps with random properties
   */
  _spawnNewClumps(imageData, params, count) {
    const { width, height } = imageData;
    
    for (let i = 0; i < count; i++) {
      const clump = this._pickRandomClump(params.intensity, width, height);
      const framesRemaining = Math.floor(
        Math.random() * (params.maxLifetime - params.minLifetime) + params.minLifetime
      );
      
      // For random mode, assign a direction to each clump
      let clumpDirection = null;
      if (params.direction === 'random') {
        const dirs = ['down', 'up', 'left', 'right'];
        clumpDirection = dirs[Math.floor(Math.random() * dirs.length)];
      }
      
      this._activeClumps.push({
        ...clump,
        framesRemaining,
        clumpDirection
      });
    }
  },
  
  /**
   * Generate random clump dimensions based on intensity
   */
  _pickRandomClump(intensity, width, height) {
    let maxW, maxH;
    
    switch (intensity) {
      case 'small':
        maxW = Math.floor(width / 8);
        maxH = Math.floor(height / 8);
        break;
      case 'medium':
        maxW = Math.floor(width / 6);
        maxH = Math.floor(height / 6);
        break;
      case 'large':
        maxW = Math.floor(width / 3);
        maxH = Math.floor(height / 3);
        break;
      case 'extraLarge':
        maxW = Math.floor(width / 2);
        maxH = Math.floor(height / 2);
        break;
      default:
        maxW = Math.floor(width / 6);
        maxH = Math.floor(height / 6);
    }
    
    const w = Math.floor(Math.random() * (maxW - 10) + 10);
    const h = Math.floor(Math.random() * (maxH - 10) + 10);
    const x = Math.floor(Math.random() * (width - w));
    const y = Math.floor(Math.random() * (height - h));
    
    return { x, y, w, h };
  },
  
  /**
   * Apply directional shift to a clump
   */
  _applyDirectionShift(imageData, clump, speed, globalDir) {
    let dir = globalDir;
    
    if (globalDir === 'random') {
      dir = clump.clumpDirection;
    } else if (globalDir === 'jitter') {
      const dirs = ['up', 'down', 'left', 'right'];
      dir = dirs[Math.floor(Math.random() * dirs.length)];
    }
    
    switch (dir) {
      case 'down':
        this._shiftRectDown(imageData, clump, speed);
        break;
      case 'up':
        this._shiftRectUp(imageData, clump, speed);
        break;
      case 'left':
        this._shiftRectLeft(imageData, clump, speed);
        break;
      case 'right':
        this._shiftRectRight(imageData, clump, speed);
        break;
    }
  },
  
  /**
   * Shift rectangle downward
   */
  _shiftRectDown(imageData, rect, shift) {
    const { data, width, height } = imageData;
    const { x, y, w, h } = rect;
    
    // Create temporary buffer to avoid overwriting
    const buffer = new Uint8ClampedArray(w * h * 4);
    
    // Copy region to buffer
    for (let row = 0; row < h; row++) {
      for (let col = 0; col < w; col++) {
        const srcY = y + row;
        const srcX = x + col;
        if (srcY >= 0 && srcY < height && srcX >= 0 && srcX < width) {
          const srcIdx = (srcY * width + srcX) * 4;
          const bufIdx = (row * w + col) * 4;
          buffer[bufIdx] = data[srcIdx];
          buffer[bufIdx + 1] = data[srcIdx + 1];
          buffer[bufIdx + 2] = data[srcIdx + 2];
          buffer[bufIdx + 3] = data[srcIdx + 3];
        }
      }
    }
    
    // Write shifted data back
    for (let row = 0; row < h; row++) {
      const destRow = y + row + shift;
      if (destRow >= height) continue;
      
      for (let col = 0; col < w; col++) {
        const destX = x + col;
        if (destX >= 0 && destX < width && destRow >= 0) {
          const bufIdx = (row * w + col) * 4;
          const dstIdx = (destRow * width + destX) * 4;
          data[dstIdx] = buffer[bufIdx];
          data[dstIdx + 1] = buffer[bufIdx + 1];
          data[dstIdx + 2] = buffer[bufIdx + 2];
          data[dstIdx + 3] = buffer[bufIdx + 3];
        }
      }
    }
  },
  
  /**
   * Shift rectangle upward
   */
  _shiftRectUp(imageData, rect, shift) {
    const { data, width, height } = imageData;
    const { x, y, w, h } = rect;
    
    const buffer = new Uint8ClampedArray(w * h * 4);
    
    // Copy region to buffer
    for (let row = 0; row < h; row++) {
      for (let col = 0; col < w; col++) {
        const srcY = y + row;
        const srcX = x + col;
        if (srcY >= 0 && srcY < height && srcX >= 0 && srcX < width) {
          const srcIdx = (srcY * width + srcX) * 4;
          const bufIdx = (row * w + col) * 4;
          buffer[bufIdx] = data[srcIdx];
          buffer[bufIdx + 1] = data[srcIdx + 1];
          buffer[bufIdx + 2] = data[srcIdx + 2];
          buffer[bufIdx + 3] = data[srcIdx + 3];
        }
      }
    }
    
    // Write shifted data back
    for (let row = 0; row < h; row++) {
      const destRow = y + row - shift;
      if (destRow < 0) continue;
      
      for (let col = 0; col < w; col++) {
        const destX = x + col;
        if (destX >= 0 && destX < width && destRow < height) {
          const bufIdx = (row * w + col) * 4;
          const dstIdx = (destRow * width + destX) * 4;
          data[dstIdx] = buffer[bufIdx];
          data[dstIdx + 1] = buffer[bufIdx + 1];
          data[dstIdx + 2] = buffer[bufIdx + 2];
          data[dstIdx + 3] = buffer[bufIdx + 3];
        }
      }
    }
  },
  
  /**
   * Shift rectangle left
   */
  _shiftRectLeft(imageData, rect, shift) {
    const { data, width, height } = imageData;
    const { x, y, w, h } = rect;
    
    const buffer = new Uint8ClampedArray(w * h * 4);
    
    // Copy region to buffer
    for (let row = 0; row < h; row++) {
      for (let col = 0; col < w; col++) {
        const srcY = y + row;
        const srcX = x + col;
        if (srcY >= 0 && srcY < height && srcX >= 0 && srcX < width) {
          const srcIdx = (srcY * width + srcX) * 4;
          const bufIdx = (row * w + col) * 4;
          buffer[bufIdx] = data[srcIdx];
          buffer[bufIdx + 1] = data[srcIdx + 1];
          buffer[bufIdx + 2] = data[srcIdx + 2];
          buffer[bufIdx + 3] = data[srcIdx + 3];
        }
      }
    }
    
    // Write shifted data back
    for (let row = 0; row < h; row++) {
      const destY = y + row;
      if (destY < 0 || destY >= height) continue;
      
      for (let col = 0; col < w; col++) {
        const destCol = x + col - shift;
        if (destCol >= 0 && destCol < width) {
          const bufIdx = (row * w + col) * 4;
          const dstIdx = (destY * width + destCol) * 4;
          data[dstIdx] = buffer[bufIdx];
          data[dstIdx + 1] = buffer[bufIdx + 1];
          data[dstIdx + 2] = buffer[bufIdx + 2];
          data[dstIdx + 3] = buffer[bufIdx + 3];
        }
      }
    }
  },
  
  /**
   * Shift rectangle right
   */
  _shiftRectRight(imageData, rect, shift) {
    const { data, width, height } = imageData;
    const { x, y, w, h } = rect;
    
    const buffer = new Uint8ClampedArray(w * h * 4);
    
    // Copy region to buffer
    for (let row = 0; row < h; row++) {
      for (let col = 0; col < w; col++) {
        const srcY = y + row;
        const srcX = x + col;
        if (srcY >= 0 && srcY < height && srcX >= 0 && srcX < width) {
          const srcIdx = (srcY * width + srcX) * 4;
          const bufIdx = (row * w + col) * 4;
          buffer[bufIdx] = data[srcIdx];
          buffer[bufIdx + 1] = data[srcIdx + 1];
          buffer[bufIdx + 2] = data[srcIdx + 2];
          buffer[bufIdx + 3] = data[srcIdx + 3];
        }
      }
    }
    
    // Write shifted data back
    for (let row = 0; row < h; row++) {
      const destY = y + row;
      if (destY < 0 || destY >= height) continue;
      
      for (let col = 0; col < w; col++) {
        const destCol = x + col + shift;
        if (destCol >= 0 && destCol < width) {
          const bufIdx = (row * w + col) * 4;
          const dstIdx = (destY * width + destCol) * 4;
          data[dstIdx] = buffer[bufIdx];
          data[dstIdx + 1] = buffer[bufIdx + 1];
          data[dstIdx + 2] = buffer[bufIdx + 2];
          data[dstIdx + 3] = buffer[bufIdx + 3];
        }
      }
    }
  }
};
