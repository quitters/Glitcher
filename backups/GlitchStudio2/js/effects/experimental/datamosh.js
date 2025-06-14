/**
 * Experimental Effect: Datamosh
 * Various digital corruption and compression artifact effects
 */

export const datamoshEffect = {
  name: 'datamosh',
  displayName: 'Datamosh',
  category: 'experimental',
  
  params: {
    enabled: {
      value: false,
      displayName: 'Enable Datamosh'
    },
    mode: {
      value: 'randomBytes',
      options: ['randomBytes', 'bitShift', 'compression', 'scanlines'],
      displayName: 'Corruption Type',
      tooltip: 'Type of digital corruption effect'
    },
    intensity: {
      value: 30,
      min: 10,
      max: 100,
      step: 10,
      displayName: 'Corruption Intensity',
      tooltip: 'Strength of the datamosh effect'
    },
    blockSize: {
      value: 8,
      min: 2,
      max: 32,
      step: 2,
      displayName: 'Block Size',
      tooltip: 'Size of compression blocks (for compression mode)'
    }
  },
  
  process(imageData, params, globalIntensity) {
    if (!params.enabled) return;
    
    const intensity = (params.intensity / 100) * globalIntensity;
    
    switch (params.mode) {
      case 'randomBytes':
        this._randomByteCorruption(imageData, intensity);
        break;
      case 'bitShift':
        this._bitShiftCorruption(imageData, intensity);
        break;
      case 'compression':
        this._compressionArtifacts(imageData, intensity, params.blockSize);
        break;
      case 'scanlines':
        this._scanlineEffect(imageData, intensity);
        break;
    }
  },
  
  /**
   * Random byte corruption - randomly corrupts pixel data
   */
  _randomByteCorruption(imageData, intensity) {
    const { data } = imageData;
    const corruptionRate = intensity * 0.01;
    
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < corruptionRate) {
        // Corrupt with random values
        data[i] = Math.floor(Math.random() * 256);
        data[i + 1] = Math.floor(Math.random() * 256);
        data[i + 2] = Math.floor(Math.random() * 256);
      }
    }
  },
  
  /**
   * Bit shift corruption - shifts bits in color channels
   */
  _bitShiftCorruption(imageData, intensity) {
    const { data } = imageData;
    
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < intensity) {
        // Different bit operations for each channel
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];
        
        if (intensity >= 1) {
          // Full bit shift
          data[i] = ((r << 1) | (r >> 7)) & 255;
          data[i + 1] = ((g >> 1) | (g << 7)) & 255;
          data[i + 2] = ((b << 2) | (b >> 6)) & 255;
        } else {
          // Blend shifted with original based on intensity
          const rShift = ((r << 1) | (r >> 7)) & 255;
          const gShift = ((g >> 1) | (g << 7)) & 255;
          const bShift = ((b << 2) | (b >> 6)) & 255;
          
          data[i] = Math.round(r * (1 - intensity) + rShift * intensity);
          data[i + 1] = Math.round(g * (1 - intensity) + gShift * intensity);
          data[i + 2] = Math.round(b * (1 - intensity) + bShift * intensity);
        }
      }
    }
  },
  
  /**
   * Compression artifacts - simulates JPEG-like block compression
   */
  _compressionArtifacts(imageData, intensity, blockSize) {
    const { data, width, height } = imageData;
    const adjustedBlockSize = Math.max(2, Math.floor(blockSize * intensity));
    
    for (let y = 0; y < height; y += adjustedBlockSize) {
      for (let x = 0; x < width; x += adjustedBlockSize) {
        let r = 0, g = 0, b = 0, count = 0;
        
        // Calculate average color for the block
        for (let by = y; by < Math.min(y + adjustedBlockSize, height); by++) {
          for (let bx = x; bx < Math.min(x + adjustedBlockSize, width); bx++) {
            const idx = (by * width + bx) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            count++;
          }
        }
        
        // Average color with quality loss
        r = Math.floor(r / count);
        g = Math.floor(g / count);
        b = Math.floor(b / count);
        
        // Quantize colors to simulate compression
        const levels = Math.max(2, Math.floor(16 * (1 - intensity)));
        r = Math.floor(r / levels) * levels;
        g = Math.floor(g / levels) * levels;
        b = Math.floor(b / levels) * levels;
        
        // Apply average color to entire block
        for (let by = y; by < Math.min(y + adjustedBlockSize, height); by++) {
          for (let bx = x; bx < Math.min(x + adjustedBlockSize, width); bx++) {
            const idx = (by * width + bx) * 4;
            data[idx] = r;
            data[idx + 1] = g;
            data[idx + 2] = b;
          }
        }
      }
    }
  },
  
  /**
   * Scanline effect - CRT-style horizontal lines
   */
  _scanlineEffect(imageData, intensity) {
    const { data, width, height } = imageData;
    const lineSpacing = Math.max(1, Math.floor(10 - intensity * 8));
    const darkness = 0.3 + (1 - intensity) * 0.5; // Less intense = lighter lines
    
    for (let y = 0; y < height; y++) {
      // Create scanline pattern
      if (y % (lineSpacing * 2) < lineSpacing) {
        for (let x = 0; x < width; x++) {
          const idx = (y * width + x) * 4;
          data[idx] *= darkness;
          data[idx + 1] *= darkness;
          data[idx + 2] *= darkness;
        }
      }
      
      // Add slight RGB shift on scanlines for CRT effect
      if (y % lineSpacing === 0 && intensity > 0.5) {
        for (let x = 1; x < width - 1; x++) {
          const idx = (y * width + x) * 4;
          const prevIdx = (y * width + (x - 1)) * 4;
          const nextIdx = (y * width + (x + 1)) * 4;
          
          // Shift RGB channels slightly
          data[idx] = data[prevIdx]; // Red from left
          data[idx + 2] = data[nextIdx + 2]; // Blue from right
        }
      }
    }
  }
};
