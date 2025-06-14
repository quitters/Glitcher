/**
 * Artistic Effect: Halftone
 * Creates a halftone pattern effect
 */

export const halftoneEffect = {
  name: 'halftone',
  displayName: 'Halftone',
  category: 'artistic',
  
  // Parameter definitions
  params: {
    dotSize: {
      value: 8,
      min: 2,
      max: 20,
      step: 1,
      displayName: 'Dot Size',
      tooltip: 'Size of halftone dots'
    },
    angle: {
      value: 45,
      min: 0,
      max: 90,
      step: 5,
      displayName: 'Angle',
      tooltip: 'Halftone pattern angle in degrees'
    }
  },
  
  // Process function that modifies ImageData in-place
  process(imageData, params, globalIntensity) {
    const { width, height, data } = imageData;
    const { dotSize, angle } = params;
    const angleRad = (angle * Math.PI) / 180;
    
    // Create a temporary buffer for the halftone pattern
    const tempData = new Uint8ClampedArray(data);
    
    // Clear the original data (start with white)
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = tempData[i + 3]; // Preserve alpha
    }
    
    // Process in a grid pattern
    for (let y = 0; y < height; y += dotSize) {
      for (let x = 0; x < width; x += dotSize) {
        // Calculate average brightness in this cell
        let totalBrightness = 0;
        let count = 0;
        
        for (let dy = 0; dy < dotSize && y + dy < height; dy++) {
          for (let dx = 0; dx < dotSize && x + dx < width; dx++) {
            const idx = ((y + dy) * width + (x + dx)) * 4;
            const brightness = (tempData[idx] + tempData[idx + 1] + tempData[idx + 2]) / 3;
            totalBrightness += brightness;
            count++;
          }
        }
        
        const avgBrightness = totalBrightness / count;
        const dotRadius = ((255 - avgBrightness) / 255) * (dotSize / 2) * globalIntensity;
        
        // Draw the dot
        const centerX = x + dotSize / 2;
        const centerY = y + dotSize / 2;
        
        for (let dy = 0; dy < dotSize && y + dy < height; dy++) {
          for (let dx = 0; dx < dotSize && x + dx < width; dx++) {
            const px = x + dx;
            const py = y + dy;
            
            // Calculate distance from center with rotation
            const rx = (px - centerX) * Math.cos(angleRad) - (py - centerY) * Math.sin(angleRad);
            const ry = (px - centerX) * Math.sin(angleRad) + (py - centerY) * Math.cos(angleRad);
            const distance = Math.sqrt(rx * rx + ry * ry);
            
            if (distance <= dotRadius) {
              const idx = (py * width + px) * 4;
              // Mix with original based on global intensity
              const mixFactor = globalIntensity;
              data[idx] = tempData[idx] * (1 - mixFactor);
              data[idx + 1] = tempData[idx + 1] * (1 - mixFactor);
              data[idx + 2] = tempData[idx + 2] * (1 - mixFactor);
            }
          }
        }
      }
    }
  }
};
