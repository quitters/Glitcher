/**
 * Filter Effect: Motion Blur
 * Creates directional blur effects
 */

export const motionBlurEffect = {
  name: 'motionBlur',
  displayName: 'Motion Blur',
  category: 'filter',
  
  params: {
    enabled: {
      value: false,
      displayName: 'Enable Motion Blur'
    },
    distance: {
      value: 20,
      min: 5,
      max: 50,
      step: 5,
      displayName: 'Blur Distance',
      tooltip: 'Length of motion blur trail'
    },
    angle: {
      value: 0,
      min: 0,
      max: 360,
      step: 15,
      displayName: 'Blur Angle',
      tooltip: 'Direction of motion blur in degrees'
    },
    quality: {
      value: 'medium',
      options: ['low', 'medium', 'high'],
      displayName: 'Blur Quality',
      tooltip: 'Number of samples (affects performance)'
    }
  },
  
  process(imageData, params, globalIntensity) {
    if (!params.enabled) return;
    
    const { data, width, height } = imageData;
    const distance = Math.floor(params.distance * globalIntensity);
    const angleRad = (params.angle * Math.PI) / 180;
    
    // Determine sample count based on quality
    const samples = {
      'low': 5,
      'medium': 10,
      'high': 20
    }[params.quality];
    
    // Calculate step offsets
    const dx = Math.cos(angleRad) * distance / samples;
    const dy = Math.sin(angleRad) * distance / samples;
    
    // Create output buffer
    const output = new Uint8ClampedArray(data.length);
    
    // Apply motion blur
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const idx = (y * width + x) * 4;
        let r = 0, g = 0, b = 0, a = 0;
        let validSamples = 0;
        
        // Sample along the motion vector
        for (let s = 0; s < samples; s++) {
          const sampleX = Math.round(x + dx * s);
          const sampleY = Math.round(y + dy * s);
          
          // Check bounds
          if (sampleX >= 0 && sampleX < width && sampleY >= 0 && sampleY < height) {
            const sampleIdx = (sampleY * width + sampleX) * 4;
            r += data[sampleIdx];
            g += data[sampleIdx + 1];
            b += data[sampleIdx + 2];
            a += data[sampleIdx + 3];
            validSamples++;
          }
        }
        
        // Average the samples
        if (validSamples > 0) {
          output[idx] = Math.round(r / validSamples);
          output[idx + 1] = Math.round(g / validSamples);
          output[idx + 2] = Math.round(b / validSamples);
          output[idx + 3] = Math.round(a / validSamples);
        } else {
          // Fallback to original pixel
          output[idx] = data[idx];
          output[idx + 1] = data[idx + 1];
          output[idx + 2] = data[idx + 2];
          output[idx + 3] = data[idx + 3];
        }
      }
    }
    
    // Copy output back
    for (let i = 0; i < data.length; i++) {
      data[i] = output[i];
    }
  }
};
