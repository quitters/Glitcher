/**
 * Color Effect: Saturation
 * Boost or reduce color saturation
 */

export const saturationEffect = {
  name: 'saturation',
  displayName: 'Saturation',
  category: 'color',
  
  params: {
    enabled: {
      value: false,
      displayName: 'Enable Saturation'
    },
    amount: {
      value: 150,
      min: 0,
      max: 300,
      step: 10,
      displayName: 'Saturation Amount',
      tooltip: '100 = normal, <100 = desaturated, >100 = oversaturated'
    },
    vibrance: {
      value: false,
      displayName: 'Smart Vibrance',
      tooltip: 'Protect skin tones while adjusting saturation'
    }
  },
  
  process(imageData, params, globalIntensity) {
    if (!params.enabled) return;
    
    const { data } = imageData;
    const saturationFactor = (params.amount / 100) * globalIntensity;
    
    for (let i = 0; i < data.length; i += 4) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];
      
      if (params.vibrance) {
        this._applyVibrance(data, i, r, g, b, saturationFactor);
      } else {
        this._applySaturation(data, i, r, g, b, saturationFactor);
      }
    }
  },
  
  /**
   * Apply standard saturation adjustment
   */
  _applySaturation(data, idx, r, g, b, factor) {
    // Convert to HSL
    const [h, s, l] = this._rgbToHsl(r, g, b);
    
    // Adjust saturation
    const newS = Math.min(1, Math.max(0, s * factor));
    
    // Convert back to RGB
    const [newR, newG, newB] = this._hslToRgb(h, newS, l);
    
    data[idx] = newR;
    data[idx + 1] = newG;
    data[idx + 2] = newB;
  },
  
  /**
   * Apply vibrance (smart saturation that protects skin tones)
   */
  _applyVibrance(data, idx, r, g, b, factor) {
    // Calculate current saturation
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const sat = (max - min) / 255;
    
    // Vibrance affects less saturated colors more
    const vibranceFactor = factor * (1 - sat);
    
    // Detect if this might be a skin tone (rough approximation)
    const isSkinTone = r > g && g > b && r - b > 15 && r - b < 100;
    
    // Apply less effect to skin tones
    const adjustedFactor = isSkinTone ? 1 + (vibranceFactor - 1) * 0.3 : vibranceFactor;
    
    this._applySaturation(data, idx, r, g, b, adjustedFactor);
  },
  
  /**
   * Convert RGB to HSL
   */
  _rgbToHsl(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s, l = (max + min) / 2;
    
    if (max === min) {
      h = s = 0;
    } else {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      
      h /= 6;
    }
    
    return [h, s, l];
  },
  
  /**
   * Convert HSL to RGB
   */
  _hslToRgb(h, s, l) {
    let r, g, b;
    
    if (s === 0) {
      r = g = b = l;
    } else {
      const hue2rgb = (p, q, t) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };
      
      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }
    
    return [
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    ];
  }
};
