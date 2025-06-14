/**
 * Artistic Effect: Swirl
 * Creates a swirling distortion effect
 */

export const swirlEffect = {
  name: 'swirl',
  displayName: 'Swirl',
  category: 'artistic',
  
  // Parameter definitions
  params: {
    strength: {
      value: 0.5,
      min: -2,
      max: 2,
      step: 0.1,
      displayName: 'Swirl Strength',
      tooltip: 'Strength and direction of swirl (negative for counter-clockwise)'
    },
    radius: {
      value: 200,
      min: 50,
      max: 500,
      step: 10,
      displayName: 'Swirl Radius',
      tooltip: 'Size of the swirl effect area'
    }
  },
  
  // Process function that modifies ImageData in-place
  process(imageData, params, globalIntensity) {
    const { width, height, data } = imageData;
    const { strength, radius } = params;
    const effectiveStrength = strength * globalIntensity;
    
    // Center of swirl
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Create a copy of the original data
    const originalData = new Uint8ClampedArray(data);
    
    // Process each pixel
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        // Calculate distance from center
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < radius) {
          // Calculate swirl amount based on distance
          const percent = (radius - distance) / radius;
          const theta = percent * percent * effectiveStrength * Math.PI * 2;
          
          // Calculate source coordinates
          const sourceX = centerX + (dx * Math.cos(theta) - dy * Math.sin(theta));
          const sourceY = centerY + (dx * Math.sin(theta) + dy * Math.cos(theta));
          
          // Bilinear interpolation for smooth results
          const x1 = Math.floor(sourceX);
          const y1 = Math.floor(sourceY);
          const x2 = Math.ceil(sourceX);
          const y2 = Math.ceil(sourceY);
          
          if (x1 >= 0 && x2 < width && y1 >= 0 && y2 < height) {
            const fx = sourceX - x1;
            const fy = sourceY - y1;
            
            const idx = (y * width + x) * 4;
            const idx11 = (y1 * width + x1) * 4;
            const idx12 = (y1 * width + x2) * 4;
            const idx21 = (y2 * width + x1) * 4;
            const idx22 = (y2 * width + x2) * 4;
            
            // Interpolate each channel
            for (let c = 0; c < 3; c++) {
              const v11 = originalData[idx11 + c];
              const v12 = originalData[idx12 + c];
              const v21 = originalData[idx21 + c];
              const v22 = originalData[idx22 + c];
              
              const v1 = v11 * (1 - fx) + v12 * fx;
              const v2 = v21 * (1 - fx) + v22 * fx;
              
              data[idx + c] = Math.round(v1 * (1 - fy) + v2 * fy);
            }
          }
        }
      }
    }
  }
};
