/**
 * Color Effect: Vintage
 * Film-like color grading with sepia tones and vignetting
 */

export const vintageEffect = {
  name: 'vintage',
  displayName: 'Vintage Film',
  category: 'color',
  
  params: {
    enabled: {
      value: false,
      displayName: 'Enable Vintage'
    },
    intensity: {
      value: 70,
      min: 0,
      max: 100,
      step: 10,
      displayName: 'Effect Intensity',
      tooltip: 'Overall strength of vintage effect'
    },
    sepia: {
      value: true,
      displayName: 'Sepia Tone',
      tooltip: 'Apply warm sepia color grading'
    },
    vignette: {
      value: true,
      displayName: 'Vignette',
      tooltip: 'Darken edges for vintage lens effect'
    },
    grain: {
      value: 30,
      min: 0,
      max: 100,
      step: 10,
      displayName: 'Film Grain',
      tooltip: 'Add noise to simulate film grain'
    }
  },
  
  process(imageData, params, globalIntensity) {
    if (!params.enabled) return;
    
    const intensity = (params.intensity / 100) * globalIntensity;
    
    // Apply effects in order
    if (params.sepia) {
      this._applySepia(imageData, intensity);
    }
    
    if (params.vignette) {
      this._applyVignette(imageData, intensity);
    }
    
    if (params.grain > 0) {
      this._applyGrain(imageData, params.grain / 100, intensity);
    }
  },
  
  /**
   * Apply sepia tone effect
   */
  _applySepia(imageData, intensity) {
    const { data } = imageData;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      // Sepia tone matrix
      const newR = Math.min(255, (r * 0.393) + (g * 0.769) + (b * 0.189));
      const newG = Math.min(255, (r * 0.349) + (g * 0.686) + (b * 0.168));
      const newB = Math.min(255, (r * 0.272) + (g * 0.534) + (b * 0.131));
      
      // Blend with original based on intensity
      data[i] = Math.round(r * (1 - intensity) + newR * intensity);
      data[i + 1] = Math.round(g * (1 - intensity) + newG * intensity);
      data[i + 2] = Math.round(b * (1 - intensity) + newB * intensity);
    }
  },
  
  /**
   * Apply vignette effect
   */
  _applyVignette(imageData, intensity) {
    const { data, width, height } = imageData;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        
        // Calculate distance from center
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate vignette factor (0 at center, 1 at edges)
        const vignetteFactor = Math.pow(distance / maxRadius, 2);
        
        // Darken based on distance and intensity
        const darkening = 1 - (vignetteFactor * intensity * 0.7);
        
        data[idx] = Math.round(data[idx] * darkening);
        data[idx + 1] = Math.round(data[idx + 1] * darkening);
        data[idx + 2] = Math.round(data[idx + 2] * darkening);
      }
    }
  },
  
  /**
   * Apply film grain effect
   */
  _applyGrain(imageData, grainAmount, intensity) {
    const { data } = imageData;
    const grainIntensity = grainAmount * intensity * 50; // Scale grain visibility
    
    for (let i = 0; i < data.length; i += 4) {
      // Generate random grain
      const grain = (Math.random() - 0.5) * grainIntensity;
      
      // Add grain to each channel
      data[i] = Math.max(0, Math.min(255, data[i] + grain));
      data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + grain));
      data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + grain));
    }
  }
};
