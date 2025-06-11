/**
 * Artistic Filter Effects for Glitcher App
 * Creative artistic filters for unique visual effects
 */

export class ArtisticFilter {
  /**
   * Apply artistic effect to image data
   * @param {ImageData} imageData - Source image data (not modified)
   * @param {string} style - 'oil_painting', 'watercolor', 'pencil_sketch', 'mosaic', 'stained_glass', 'comic_book'
   * @param {number} intensity - Effect intensity 0-100
   * @param {Object} options - Additional options
   * @returns {ImageData} New image data with effect applied
   */
  static apply(imageData, style = 'oil_painting', intensity = 50, options = {}) {
    const { data, width, height } = imageData;
    const outputData = new Uint8ClampedArray(data);
    const normalizedIntensity = intensity / 100;
    
    switch (style) {
      case 'oil_painting':
        return this.applyOilPaintingEffect(outputData, width, height, normalizedIntensity, options);
      case 'watercolor':
        return this.applyWatercolorEffect(outputData, width, height, normalizedIntensity, options);
      case 'pencil_sketch':
        return this.applyPencilSketchEffect(outputData, width, height, normalizedIntensity, options);
      case 'mosaic':
        return this.applyMosaicEffect(outputData, width, height, normalizedIntensity, options);
      case 'stained_glass':
        return this.applyStainedGlassEffect(outputData, width, height, normalizedIntensity, options);
      case 'comic_book':
        return this.applyComicBookEffect(outputData, width, height, normalizedIntensity, options);
      case 'crosshatch':
        return this.applyCrosshatchEffect(outputData, width, height, normalizedIntensity, options);
      case 'pointillism':
        return this.applyPointillismEffect(outputData, width, height, normalizedIntensity, options);
      default:
        return new ImageData(outputData, width, height);
    }
  }
  
  /**
   * Apply oil painting effect
   */
  static applyOilPaintingEffect(data, width, height, intensity, options = {}) {
    const brushSize = Math.floor((options.brushSize || 3) * intensity) + 1;
    const resultData = new Uint8ClampedArray(data);
    
    for (let y = brushSize; y < height - brushSize; y += brushSize) {
      for (let x = brushSize; x < width - brushSize; x += brushSize) {
        // Sample colors in brush area
        let totalR = 0, totalG = 0, totalB = 0, count = 0;
        
        for (let dy = -brushSize; dy <= brushSize; dy++) {
          for (let dx = -brushSize; dx <= brushSize; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            totalR += data[idx];
            totalG += data[idx + 1];
            totalB += data[idx + 2];
            count++;
          }
        }
        
        const avgR = totalR / count;
        const avgG = totalG / count;
        const avgB = totalB / count;
        
        // Apply averaged color to brush area
        for (let dy = -brushSize; dy <= brushSize; dy++) {
          for (let dx = -brushSize; dx <= brushSize; dx++) {
            const ny = y + dy;
            const nx = x + dx;
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const idx = (ny * width + nx) * 4;
              const originalR = data[idx];
              const originalG = data[idx + 1];
              const originalB = data[idx + 2];
              
              resultData[idx] = originalR + (avgR - originalR) * intensity;
              resultData[idx + 1] = originalG + (avgG - originalG) * intensity;
              resultData[idx + 2] = originalB + (avgB - originalB) * intensity;
            }
          }
        }
      }
    }
    
    return new ImageData(resultData, width, height);
  }
  
  /**
   * Apply watercolor effect
   */
  static applyWatercolorEffect(data, width, height, intensity, options = {}) {
    const bleedAmount = options.bleedAmount || 2;
    const resultData = new Uint8ClampedArray(data);
    
    // Create watercolor bleeding effect
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        let r = data[idx];
        let g = data[idx + 1];
        let b = data[idx + 2];
        
        // Sample surrounding pixels for bleeding
        const neighbors = [
          [(y-1) * width + x, 0.7],     // top
          [(y+1) * width + x, 0.7],     // bottom  
          [y * width + (x-1), 0.7],     // left
          [y * width + (x+1), 0.7],     // right
          [(y-1) * width + (x-1), 0.3], // top-left
          [(y-1) * width + (x+1), 0.3], // top-right
          [(y+1) * width + (x-1), 0.3], // bottom-left
          [(y+1) * width + (x+1), 0.3]  // bottom-right
        ];
        
        for (const [neighborIdx, weight] of neighbors) {
          const nIdx = neighborIdx * 4;
          const blendFactor = weight * bleedAmount * intensity * 0.1;
          
          r += (data[nIdx] - r) * blendFactor;
          g += (data[nIdx + 1] - g) * blendFactor;
          b += (data[nIdx + 2] - b) * blendFactor;
        }
        
        // Reduce saturation for watercolor look
        const gray = (r + g + b) / 3;
        const desaturation = 0.3 * intensity;
        
        resultData[idx] = r + (gray - r) * desaturation;
        resultData[idx + 1] = g + (gray - g) * desaturation;
        resultData[idx + 2] = b + (gray - b) * desaturation;
      }
    }
    
    return new ImageData(resultData, width, height);
  }
  
  /**
   * Apply pencil sketch effect
   */
  static applyPencilSketchEffect(data, width, height, intensity, options = {}) {
    const resultData = new Uint8ClampedArray(data);
    
    // Convert to grayscale and enhance edges
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        // Edge detection using Sobel operator
        let gx = 0, gy = 0;
        const sobelX = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]];
        const sobelY = [[-1, -2, -1], [0, 0, 0], [1, 2, 1]];
        
        for (let ky = 0; ky < 3; ky++) {
          for (let kx = 0; kx < 3; kx++) {
            const px = x + kx - 1;
            const py = y + ky - 1;
            const pidx = (py * width + px) * 4;
            
            const gray = (data[pidx] + data[pidx + 1] + data[pidx + 2]) / 3;
            gx += gray * sobelX[ky][kx];
            gy += gray * sobelY[ky][kx];
          }
        }
        
        const edgeStrength = Math.min(255, Math.sqrt(gx * gx + gy * gy));
        const pencilValue = 255 - edgeStrength;
        
        const originalGray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        const finalValue = originalGray + (pencilValue - originalGray) * intensity;
        
        resultData[idx] = finalValue;
        resultData[idx + 1] = finalValue;
        resultData[idx + 2] = finalValue;
      }
    }
    
    return new ImageData(resultData, width, height);
  }
  
  /**
   * Apply mosaic effect
   */
  static applyMosaicEffect(data, width, height, intensity, options = {}) {
    const tileSize = Math.floor((options.tileSize || 8) * (1 + intensity));
    const resultData = new Uint8ClampedArray(data);
    
    for (let y = 0; y < height; y += tileSize) {
      for (let x = 0; x < width; x += tileSize) {
        // Calculate average color for this tile
        let totalR = 0, totalG = 0, totalB = 0, count = 0;
        
        for (let dy = 0; dy < tileSize && y + dy < height; dy++) {
          for (let dx = 0; dx < tileSize && x + dx < width; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            totalR += data[idx];
            totalG += data[idx + 1];
            totalB += data[idx + 2];
            count++;
          }
        }
        
        const avgR = totalR / count;
        const avgG = totalG / count;
        const avgB = totalB / count;
        
        // Apply averaged color to entire tile
        for (let dy = 0; dy < tileSize && y + dy < height; dy++) {
          for (let dx = 0; dx < tileSize && x + dx < width; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            const originalR = data[idx];
            const originalG = data[idx + 1];
            const originalB = data[idx + 2];
            
            resultData[idx] = originalR + (avgR - originalR) * intensity;
            resultData[idx + 1] = originalG + (avgG - originalG) * intensity;
            resultData[idx + 2] = originalB + (avgB - originalB) * intensity;
          }
        }
      }
    }
    
    return new ImageData(resultData, width, height);
  }
  
  /**
   * Apply stained glass effect
   */
  static applyStainedGlassEffect(data, width, height, intensity, options = {}) {
    const cellSize = Math.floor((options.cellSize || 12) * (1 + intensity * 0.5));
    const resultData = new Uint8ClampedArray(data);
    
    for (let y = 0; y < height; y += cellSize) {
      for (let x = 0; x < width; x += cellSize) {
        // Create irregular cell shapes
        const centerX = x + cellSize / 2;
        const centerY = y + cellSize / 2;
        
        let totalR = 0, totalG = 0, totalB = 0, count = 0;
        
        // Calculate average color for this cell
        for (let dy = 0; dy < cellSize && y + dy < height; dy++) {
          for (let dx = 0; dx < cellSize && x + dx < width; dx++) {
            const dist = Math.sqrt((dx - cellSize/2) ** 2 + (dy - cellSize/2) ** 2);
            if (dist < cellSize / 2) {
              const idx = ((y + dy) * width + (x + dx)) * 4;
              totalR += data[idx];
              totalG += data[idx + 1];
              totalB += data[idx + 2];
              count++;
            }
          }
        }
        
        if (count > 0) {
          const avgR = totalR / count;
          const avgG = totalG / count;
          const avgB = totalB / count;
          
          // Enhance saturation for stained glass look
          const enhancedR = Math.min(255, avgR * 1.3);
          const enhancedG = Math.min(255, avgG * 1.3);
          const enhancedB = Math.min(255, avgB * 1.3);
          
          // Apply to cell area with circular shape
          for (let dy = 0; dy < cellSize && y + dy < height; dy++) {
            for (let dx = 0; dx < cellSize && x + dx < width; dx++) {
              const dist = Math.sqrt((dx - cellSize/2) ** 2 + (dy - cellSize/2) ** 2);
              if (dist < cellSize / 2) {
                const idx = ((y + dy) * width + (x + dx)) * 4;
                const originalR = data[idx];
                const originalG = data[idx + 1];
                const originalB = data[idx + 2];
                
                resultData[idx] = originalR + (enhancedR - originalR) * intensity;
                resultData[idx + 1] = originalG + (enhancedG - originalG) * intensity;
                resultData[idx + 2] = originalB + (enhancedB - originalB) * intensity;
              } else {
                // Black border
                const idx = ((y + dy) * width + (x + dx)) * 4;
                resultData[idx] *= (1 - intensity * 0.5);
                resultData[idx + 1] *= (1 - intensity * 0.5);
                resultData[idx + 2] *= (1 - intensity * 0.5);
              }
            }
          }
        }
      }
    }
    
    return new ImageData(resultData, width, height);
  }
  
  /**
   * Apply comic book effect
   */
  static applyComicBookEffect(data, width, height, intensity, options = {}) {
    const resultData = new Uint8ClampedArray(data);
    const colorLevels = options.colorLevels || 4;
    
    // Quantize colors and add black outlines
    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        
        let r = data[idx];
        let g = data[idx + 1];
        let b = data[idx + 2];
        
        // Quantize colors
        r = Math.floor(r / (256 / colorLevels)) * (256 / colorLevels);
        g = Math.floor(g / (256 / colorLevels)) * (256 / colorLevels);
        b = Math.floor(b / (256 / colorLevels)) * (256 / colorLevels);
        
        // Edge detection for outlines
        const centerGray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        const neighbors = [
          (y-1) * width + x,     // top
          (y+1) * width + x,     // bottom
          y * width + (x-1),     // left
          y * width + (x+1)      // right
        ];
        
        let isEdge = false;
        for (const nIdx of neighbors) {
          const neighborIdx = nIdx * 4;
          const neighborGray = (data[neighborIdx] + data[neighborIdx + 1] + data[neighborIdx + 2]) / 3;
          if (Math.abs(centerGray - neighborGray) > 50) {
            isEdge = true;
            break;
          }
        }
        
        if (isEdge && intensity > 0.3) {
          // Black outline
          resultData[idx] = data[idx] * (1 - intensity * 0.8);
          resultData[idx + 1] = data[idx + 1] * (1 - intensity * 0.8);
          resultData[idx + 2] = data[idx + 2] * (1 - intensity * 0.8);
        } else {
          // Quantized color
          const originalR = data[idx];
          const originalG = data[idx + 1];
          const originalB = data[idx + 2];
          
          resultData[idx] = originalR + (r - originalR) * intensity;
          resultData[idx + 1] = originalG + (g - originalG) * intensity;
          resultData[idx + 2] = originalB + (b - originalB) * intensity;
        }
      }
    }
    
    return new ImageData(resultData, width, height);
  }
  
  /**
   * Apply crosshatch effect
   */
  static applyCrosshatchEffect(data, width, height, intensity, options = {}) {
    const resultData = new Uint8ClampedArray(data);
    const lineSpacing = options.lineSpacing || 4;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        const gray = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
        
        // Create crosshatch pattern based on brightness
        let isHatchLine = false;
        
        // Horizontal lines
        if (gray < 200 && y % lineSpacing === 0) {
          isHatchLine = true;
        }
        
        // Vertical lines (for darker areas)
        if (gray < 150 && x % lineSpacing === 0) {
          isHatchLine = true;
        }
        
        // Diagonal lines (for very dark areas)
        if (gray < 100 && (x + y) % lineSpacing === 0) {
          isHatchLine = true;
        }
        
        // Opposite diagonal (for extremely dark areas)
        if (gray < 50 && (x - y) % lineSpacing === 0) {
          isHatchLine = true;
        }
        
        if (isHatchLine) {
          const hatchValue = gray * 0.3;
          resultData[idx] = data[idx] + (hatchValue - data[idx]) * intensity;
          resultData[idx + 1] = data[idx + 1] + (hatchValue - data[idx + 1]) * intensity;
          resultData[idx + 2] = data[idx + 2] + (hatchValue - data[idx + 2]) * intensity;
        } else {
          resultData[idx] = data[idx];
          resultData[idx + 1] = data[idx + 1];
          resultData[idx + 2] = data[idx + 2];
        }
      }
    }
    
    return new ImageData(resultData, width, height);
  }
  
  /**
   * Apply pointillism effect
   */
  static applyPointillismEffect(data, width, height, intensity, options = {}) {
    const resultData = new Uint8ClampedArray(data);
    const dotSize = Math.floor((options.dotSize || 3) * intensity) + 1;
    const dotSpacing = dotSize + 1;
    
    // Create white background
    for (let i = 0; i < resultData.length; i += 4) {
      resultData[i] = 255;
      resultData[i + 1] = 255;
      resultData[i + 2] = 255;
      resultData[i + 3] = data[i + 3];
    }
    
    // Add colored dots
    for (let y = dotSize; y < height - dotSize; y += dotSpacing) {
      for (let x = dotSize; x < width - dotSize; x += dotSpacing) {
        // Sample color from original image
        const centerIdx = (y * width + x) * 4;
        const r = data[centerIdx];
        const g = data[centerIdx + 1];
        const b = data[centerIdx + 2];
        
        // Enhance saturation for pointillist effect
        const enhancedR = Math.min(255, r * 1.2);
        const enhancedG = Math.min(255, g * 1.2);
        const enhancedB = Math.min(255, b * 1.2);
        
        // Draw circular dot
        for (let dy = -dotSize; dy <= dotSize; dy++) {
          for (let dx = -dotSize; dx <= dotSize; dx++) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= dotSize) {
              const ny = y + dy;
              const nx = x + dx;
              if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
                const idx = (ny * width + nx) * 4;
                const originalR = resultData[idx];
                const originalG = resultData[idx + 1];
                const originalB = resultData[idx + 2];
                
                resultData[idx] = originalR + (enhancedR - originalR) * intensity;
                resultData[idx + 1] = originalG + (enhancedG - originalG) * intensity;
                resultData[idx + 2] = originalB + (enhancedB - originalB) * intensity;
              }
            }
          }
        }
      }
    }
    
    return new ImageData(resultData, width, height);
  }
}