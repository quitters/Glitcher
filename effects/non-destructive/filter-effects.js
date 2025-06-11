/**
 * Filter Effects Coordinator
 * Manages all non-destructive filter effects
 */

import { PopArtFilter } from './pop-art-filter.js';
import { VintageFilmFilter } from './vintage-film-filter.js';
import { CyberpunkFilter } from './new-filters/cyberpunk-filter.js';
import { ArtisticFilter } from './new-filters/artistic-filter.js';
import { AtmosphericFilter } from './new-filters/atmospheric-filter.js';
import { ExperimentalFilter } from './new-filters/experimental-filter.js';

export class FilterEffects {
  /**
   * Apply filter effect to image data (non-destructive)
   * @param {ImageData} imageData - Source image data
   * @param {string} effectType - Type of filter effect
   * @param {number} intensity - Effect intensity 0-100
   * @param {Object} options - Additional effect options
   * @returns {ImageData} New image data with filter applied
   */
  static apply(imageData, effectType, intensity = 50, options = {}) {
    if (effectType === 'off' || !imageData) {
      return imageData;
    }
    
    switch (effectType) {
      case 'popArt':
        return PopArtFilter.apply(imageData, options.style || 'warhol', intensity, options);
        
      case 'vintage':
        return VintageFilmFilter.apply(imageData, options.filmType || 'polaroid', intensity, options);
        
      case 'emboss':
        return this.applyEmbossFilter(imageData, intensity);
        
      case 'edgeDetect':
        return this.applyEdgeDetectionFilter(imageData, intensity);
        
      case 'motionBlur':
        return this.applyMotionBlurFilter(imageData, intensity, options);
        
      case 'vignette':
        return this.applyVignetteFilter(imageData, intensity);
        
      case 'halftone':
        return this.applyHalftoneFilter(imageData, intensity, options);
        
      // NEW: Cyberpunk filters
      case 'cyberpunk':
        return CyberpunkFilter.apply(imageData, options.style || 'neon', intensity, options);
        
      // NEW: Artistic filters
      case 'artistic':
        return ArtisticFilter.apply(imageData, options.style || 'oil_painting', intensity, options);
        
      // NEW: Atmospheric filters
      case 'atmospheric':
        return AtmosphericFilter.apply(imageData, options.style || 'fog', intensity, options);
        
      // NEW: Experimental filters
      case 'experimental':
        return ExperimentalFilter.apply(imageData, options.style || 'kaleidoscope', intensity, options);
        
      default:
        console.warn(`Unknown filter effect: ${effectType}`);
        return imageData;
    }
  }
  
  /**
   * Apply emboss filter
   * @param {ImageData} imageData - Source image data
   * @param {number} intensity - Effect intensity 0-100
   * @returns {ImageData} New image data with emboss effect
   */
  static applyEmbossFilter(imageData, intensity) {
    const { data, width, height } = imageData;
    const outputData = new Uint8ClampedArray(data);
    const normalizedIntensity = intensity / 100;
    
    // Emboss kernel
    const kernel = [
      [-2, -1,  0],
      [-1,  1,  1],
      [ 0,  1,  2]
    ];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let r = 0, g = 0, b = 0;
        
        for (let ky = 0; ky < 3; ky++) {
          for (let kx = 0; kx < 3; kx++) {
            const px = x + kx - 1;
            const py = y + ky - 1;
            const idx = (py * width + px) * 4;
            const weight = kernel[ky][kx];
            
            r += data[idx] * weight;
            g += data[idx + 1] * weight;
            b += data[idx + 2] * weight;
          }
        }
        
        const centerIdx = (y * width + x) * 4;
        
        // Add offset to make emboss visible
        r += 128;
        g += 128;
        b += 128;
        
        // Blend with original
        const originalR = data[centerIdx];
        const originalG = data[centerIdx + 1];
        const originalB = data[centerIdx + 2];
        
        outputData[centerIdx]     = originalR + (Math.max(0, Math.min(255, r)) - originalR) * normalizedIntensity;
        outputData[centerIdx + 1] = originalG + (Math.max(0, Math.min(255, g)) - originalG) * normalizedIntensity;
        outputData[centerIdx + 2] = originalB + (Math.max(0, Math.min(255, b)) - originalB) * normalizedIntensity;
      }
    }
    
    return new ImageData(outputData, width, height);
  }
  
  /**
   * Apply edge detection filter
   * @param {ImageData} imageData - Source image data
   * @param {number} intensity - Effect intensity 0-100
   * @returns {ImageData} New image data with edge detection
   */
  static applyEdgeDetectionFilter(imageData, intensity) {
    const { data, width, height } = imageData;
    const outputData = new Uint8ClampedArray(data);
    const normalizedIntensity = intensity / 100;
    
    // Sobel edge detection kernels
    const sobelX = [
      [-1, 0, 1],
      [-2, 0, 2],
      [-1, 0, 1]
    ];
    
    const sobelY = [
      [-1, -2, -1],
      [ 0,  0,  0],
      [ 1,  2,  1]
    ];
    
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        let gx = 0, gy = 0;
        
        for (let ky = 0; ky < 3; ky++) {
          for (let kx = 0; kx < 3; kx++) {
            const px = x + kx - 1;
            const py = y + ky - 1;
            const idx = (py * width + px) * 4;
            
            // Convert to grayscale for edge detection
            const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            
            gx += gray * sobelX[ky][kx];
            gy += gray * sobelY[ky][kx];
          }
        }
        
        const magnitude = Math.sqrt(gx * gx + gy * gy);
        const edgeValue = Math.min(255, magnitude);
        
        const centerIdx = (y * width + x) * 4;
        const originalR = data[centerIdx];
        const originalG = data[centerIdx + 1];
        const originalB = data[centerIdx + 2];
        
        // Blend edge with original
        outputData[centerIdx]     = originalR + (edgeValue - originalR) * normalizedIntensity;
        outputData[centerIdx + 1] = originalG + (edgeValue - originalG) * normalizedIntensity;
        outputData[centerIdx + 2] = originalB + (edgeValue - originalB) * normalizedIntensity;
      }
    }
    
    return new ImageData(outputData, width, height);
  }
  
  /**
   * Apply motion blur filter
   * @param {ImageData} imageData - Source image data
   * @param {number} intensity - Effect intensity 0-100
   * @param {Object} options - {direction: 'horizontal'|'vertical'|'diagonal', distance: number}
   * @returns {ImageData} New image data with motion blur
   */
  static applyMotionBlurFilter(imageData, intensity, options = {}) {
    const { data, width, height } = imageData;
    const outputData = new Uint8ClampedArray(data);
    const normalizedIntensity = intensity / 100;
    
    const direction = options.direction || 'horizontal';
    const distance = Math.floor((options.distance || 10) * normalizedIntensity);
    
    let dx = 0, dy = 0;
    switch (direction) {
      case 'horizontal': dx = 1; break;
      case 'vertical': dy = 1; break;
      case 'diagonal': dx = 1; dy = 1; break;
    }
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, count = 0;
        
        for (let i = -distance; i <= distance; i++) {
          const nx = x + i * dx;
          const ny = y + i * dy;
          
          if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
            const idx = (ny * width + nx) * 4;
            r += data[idx];
            g += data[idx + 1];
            b += data[idx + 2];
            count++;
          }
        }
        
        if (count > 0) {
          const centerIdx = (y * width + x) * 4;
          const originalR = data[centerIdx];
          const originalG = data[centerIdx + 1];
          const originalB = data[centerIdx + 2];
          
          outputData[centerIdx]     = originalR + ((r / count) - originalR) * normalizedIntensity;
          outputData[centerIdx + 1] = originalG + ((g / count) - originalG) * normalizedIntensity;
          outputData[centerIdx + 2] = originalB + ((b / count) - originalB) * normalizedIntensity;
        }
      }
    }
    
    return new ImageData(outputData, width, height);
  }
  
  /**
   * Apply vignette filter
   * @param {ImageData} imageData - Source image data
   * @param {number} intensity - Effect intensity 0-100
   * @returns {ImageData} New image data with vignette
   */
  static applyVignetteFilter(imageData, intensity) {
    const { data, width, height } = imageData;
    const outputData = new Uint8ClampedArray(data);
    const normalizedIntensity = intensity / 100;
    
    const centerX = width / 2;
    const centerY = height / 2;
    const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Calculate vignette factor (0 at edges, 1 at center)
        let vignetteFactor = 1 - (distance / maxDistance);
        vignetteFactor = Math.max(0, Math.min(1, vignetteFactor));
        
        // Apply easing for smoother falloff
        vignetteFactor = vignetteFactor * vignetteFactor;
        
        const idx = (y * width + x) * 4;
        const factor = 1 - (1 - vignetteFactor) * normalizedIntensity;
        
        outputData[idx]     = data[idx] * factor;
        outputData[idx + 1] = data[idx + 1] * factor;
        outputData[idx + 2] = data[idx + 2] * factor;
        outputData[idx + 3] = data[idx + 3]; // Alpha unchanged
      }
    }
    
    return new ImageData(outputData, width, height);
  }
  
  /**
   * Apply halftone filter
   * @param {ImageData} imageData - Source image data
   * @param {number} intensity - Effect intensity 0-100
   * @param {Object} options - {dotSize: number, pattern: 'circle'|'square'}
   * @returns {ImageData} New image data with halftone effect
   */
  static applyHalftoneFilter(imageData, intensity, options = {}) {
    const { data, width, height } = imageData;
    const outputData = new Uint8ClampedArray(data);
    const normalizedIntensity = intensity / 100;
    
    const dotSize = options.dotSize || 4;
    const pattern = options.pattern || 'circle';
    
    for (let y = 0; y < height; y += dotSize) {
      for (let x = 0; x < width; x += dotSize) {
        // Calculate average brightness in this region
        let totalBrightness = 0;
        let pixelCount = 0;
        
        for (let dy = 0; dy < dotSize && y + dy < height; dy++) {
          for (let dx = 0; dx < dotSize && x + dx < width; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
            totalBrightness += brightness;
            pixelCount++;
          }
        }
        
        const avgBrightness = totalBrightness / pixelCount;
        const dotRadius = (dotSize / 2) * (avgBrightness / 255);
        
        // Draw halftone dot
        for (let dy = 0; dy < dotSize && y + dy < height; dy++) {
          for (let dx = 0; dx < dotSize && x + dx < width; dx++) {
            const centerX = dotSize / 2;
            const centerY = dotSize / 2;
            const distance = Math.sqrt((dx - centerX) ** 2 + (dy - centerY) ** 2);
            
            let inDot = false;
            if (pattern === 'circle') {
              inDot = distance <= dotRadius;
            } else if (pattern === 'square') {
              inDot = Math.abs(dx - centerX) <= dotRadius && Math.abs(dy - centerY) <= dotRadius;
            }
            
            const idx = ((y + dy) * width + (x + dx)) * 4;
            const originalR = data[idx];
            const originalG = data[idx + 1];
            const originalB = data[idx + 2];
            
            if (inDot) {
              // Black dot
              outputData[idx]     = originalR + (0 - originalR) * normalizedIntensity;
              outputData[idx + 1] = originalG + (0 - originalG) * normalizedIntensity;
              outputData[idx + 2] = originalB + (0 - originalB) * normalizedIntensity;
            } else {
              // White background
              outputData[idx]     = originalR + (255 - originalR) * normalizedIntensity;
              outputData[idx + 1] = originalG + (255 - originalG) * normalizedIntensity;
              outputData[idx + 2] = originalB + (255 - originalB) * normalizedIntensity;
            }
          }
        }
      }
    }
    
    return new ImageData(outputData, width, height);
  }
}