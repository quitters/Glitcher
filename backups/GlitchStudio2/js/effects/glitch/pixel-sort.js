/**
 * Glitch Effect: Enhanced Pixel Sort
 * Advanced pixel sorting with multiple variations including diagonal and circular
 */

export const pixelSortEffect = {
  name: 'pixelSort',
  displayName: 'Enhanced Pixel Sort',
  category: 'glitch',
  
  params: {
    sortType: {
      value: 'columnBrightness',
      options: [
        'off',
        'columnBrightness',
        'rowBrightness', 
        'columnHue',
        'rowHue',
        'randomLines',
        'diagonal',
        'circular'
      ],
      displayName: 'Sort Mode',
      tooltip: 'Type of pixel sorting algorithm'
    },
    frequency: {
      value: 30,
      min: 1,
      max: 100,
      step: 1,
      displayName: 'Sort Frequency',
      tooltip: 'How often sorting occurs (lower = more frequent)'
    },
    intensity: {
      value: 100,
      min: 10,
      max: 100,
      step: 10,
      displayName: 'Sort Intensity',
      tooltip: 'Percentage of image affected by sorting'
    }
  },
  
  // Internal frame counter
  _frameCount: 0,
  
  process(imageData, params, globalIntensity) {
    if (params.sortType === 'off') return;
    
    this._frameCount++;
    
    // Control frequency - lower frequency value = more frequent sorting
    const shouldSort = this._frameCount % Math.max(1, 101 - params.frequency) === 0;
    if (!shouldSort) return;
    
    const intensity = (params.intensity / 100) * globalIntensity;
    
    // Apply sorting based on selected type
    switch (params.sortType) {
      case 'columnBrightness':
        this._sortColumnsByBrightness(imageData, intensity);
        break;
      case 'rowBrightness':
        this._sortRowsByBrightness(imageData, intensity);
        break;
      case 'columnHue':
        this._sortColumnsByHue(imageData, intensity);
        break;
      case 'rowHue':
        this._sortRowsByHue(imageData, intensity);
        break;
      case 'randomLines':
        this._randomLineSort(imageData, intensity);
        break;
      case 'diagonal':
        this._diagonalSort(imageData, intensity);
        break;
      case 'circular':
        this._circularSort(imageData, intensity);
        break;
    }
  },
  
  /**
   * Sort columns by brightness
   */
  _sortColumnsByBrightness(imageData, intensity) {
    const { width, height } = imageData;
    const columnsToSort = Math.floor(width * intensity);
    
    for (let i = 0; i < columnsToSort; i++) {
      const x = Math.floor(Math.random() * width);
      this._sortOneColumnByBrightness(imageData, x);
    }
  },
  
  /**
   * Sort rows by brightness
   */
  _sortRowsByBrightness(imageData, intensity) {
    const { height } = imageData;
    const rowsToSort = Math.floor(height * intensity);
    
    for (let i = 0; i < rowsToSort; i++) {
      const y = Math.floor(Math.random() * height);
      this._sortOneRowByBrightness(imageData, y);
    }
  },
  
  /**
   * Sort columns by hue
   */
  _sortColumnsByHue(imageData, intensity) {
    const { width, height } = imageData;
    const columnsToSort = Math.floor(width * intensity);
    
    for (let i = 0; i < columnsToSort; i++) {
      const x = Math.floor(Math.random() * width);
      this._sortOneColumnByHue(imageData, x);
    }
  },
  
  /**
   * Sort rows by hue
   */
  _sortRowsByHue(imageData, intensity) {
    const { height } = imageData;
    const rowsToSort = Math.floor(height * intensity);
    
    for (let i = 0; i < rowsToSort; i++) {
      const y = Math.floor(Math.random() * height);
      this._sortOneRowByHue(imageData, y);
    }
  },
  
  /**
   * Sort random lines (mix of horizontal and vertical)
   */
  _randomLineSort(imageData, intensity) {
    const { width, height } = imageData;
    const linesToSort = Math.floor(Math.min(width, height) * intensity * 0.3);
    
    for (let i = 0; i < linesToSort; i++) {
      const horizontal = Math.random() < 0.5;
      if (horizontal) {
        const row = Math.floor(Math.random() * height);
        this._sortOneRowByBrightness(imageData, row);
      } else {
        const col = Math.floor(Math.random() * width);
        this._sortOneColumnByBrightness(imageData, col);
      }
    }
  },
  
  /**
   * Diagonal sorting - shuffle pixels along diagonal lines
   */
  _diagonalSort(imageData, intensity) {
    const { data, width, height } = imageData;
    const diagonalsToSort = Math.floor((width + height) * intensity * 0.1);
    
    for (let d = 0; d < diagonalsToSort; d++) {
      const k = Math.floor(Math.random() * (width + height - 1));
      const diagonal = [];
      
      let startX = k < height ? 0 : k - height + 1;
      let startY = k < height ? k : height - 1;
      let x = startX, y = startY;
      
      // Extract diagonal pixels
      while (x < width && y >= 0) {
        const idx = (y * width + x) * 4;
        diagonal.push({
          r: data[idx],
          g: data[idx + 1],
          b: data[idx + 2],
          a: data[idx + 3],
          x, y
        });
        x++;
        y--;
      }
      
      // Shuffle diagonal pixels for glitch effect
      for (let i = diagonal.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [diagonal[i], diagonal[j]] = [diagonal[j], diagonal[i]];
      }
      
      // Put shuffled pixels back
      diagonal.forEach((pixel, i) => {
        const targetX = startX + i;
        const targetY = startY - i;
        if (targetX < width && targetY >= 0) {
          const idx = (targetY * width + targetX) * 4;
          data[idx] = pixel.r;
          data[idx + 1] = pixel.g;
          data[idx + 2] = pixel.b;
          data[idx + 3] = pixel.a;
        }
      });
    }
  },
  
  /**
   * Circular sorting - sort pixels in circular patterns from center
   */
  _circularSort(imageData, intensity) {
    const { data, width, height } = imageData;
    const centerX = width / 2;
    const centerY = height / 2;
    const maxRadius = Math.sqrt(centerX * centerX + centerY * centerY);
    const radiusStep = Math.max(1, Math.floor(maxRadius * 0.05));
    const ringsToSort = Math.floor((maxRadius / radiusStep) * intensity);
    
    for (let r = 0; r < ringsToSort * radiusStep; r += radiusStep) {
      const circle = [];
      const circumference = 2 * Math.PI * r;
      const steps = Math.max(8, Math.floor(circumference));
      
      // Extract circular ring
      for (let i = 0; i < steps; i++) {
        const angle = (i / steps) * 2 * Math.PI;
        const x = Math.round(centerX + r * Math.cos(angle));
        const y = Math.round(centerY + r * Math.sin(angle));
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const idx = (y * width + x) * 4;
          const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
          circle.push({
            r: data[idx],
            g: data[idx + 1],
            b: data[idx + 2],
            a: data[idx + 3],
            brightness,
            x, y
          });
        }
      }
      
      // Sort by brightness
      circle.sort((a, b) => a.brightness - b.brightness);
      
      // Put sorted pixels back
      circle.forEach((pixel, i) => {
        const angle = (i / steps) * 2 * Math.PI;
        const x = Math.round(centerX + r * Math.cos(angle));
        const y = Math.round(centerY + r * Math.sin(angle));
        
        if (x >= 0 && x < width && y >= 0 && y < height) {
          const idx = (y * width + x) * 4;
          data[idx] = pixel.r;
          data[idx + 1] = pixel.g;
          data[idx + 2] = pixel.b;
          data[idx + 3] = pixel.a;
        }
      });
    }
  },
  
  /**
   * Sort one column by brightness
   */
  _sortOneColumnByBrightness(imageData, x) {
    const { data, width, height } = imageData;
    const column = [];
    
    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      column.push({
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2],
        a: data[idx + 3],
        brightness
      });
    }
    
    column.sort((a, b) => a.brightness - b.brightness);
    
    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      const pixel = column[y];
      data[idx] = pixel.r;
      data[idx + 1] = pixel.g;
      data[idx + 2] = pixel.b;
      data[idx + 3] = pixel.a;
    }
  },
  
  /**
   * Sort one row by brightness
   */
  _sortOneRowByBrightness(imageData, y) {
    const { data, width } = imageData;
    const row = [];
    
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const brightness = (data[idx] + data[idx + 1] + data[idx + 2]) / 3;
      row.push({
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2],
        a: data[idx + 3],
        brightness
      });
    }
    
    row.sort((a, b) => a.brightness - b.brightness);
    
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const pixel = row[x];
      data[idx] = pixel.r;
      data[idx + 1] = pixel.g;
      data[idx + 2] = pixel.b;
      data[idx + 3] = pixel.a;
    }
  },
  
  /**
   * Sort one column by hue
   */
  _sortOneColumnByHue(imageData, x) {
    const { data, width, height } = imageData;
    const column = [];
    
    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      const hue = this._rgbToHue(data[idx], data[idx + 1], data[idx + 2]);
      column.push({
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2],
        a: data[idx + 3],
        hue
      });
    }
    
    column.sort((a, b) => a.hue - b.hue);
    
    for (let y = 0; y < height; y++) {
      const idx = (y * width + x) * 4;
      const pixel = column[y];
      data[idx] = pixel.r;
      data[idx + 1] = pixel.g;
      data[idx + 2] = pixel.b;
      data[idx + 3] = pixel.a;
    }
  },
  
  /**
   * Sort one row by hue
   */
  _sortOneRowByHue(imageData, y) {
    const { data, width } = imageData;
    const row = [];
    
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const hue = this._rgbToHue(data[idx], data[idx + 1], data[idx + 2]);
      row.push({
        r: data[idx],
        g: data[idx + 1],
        b: data[idx + 2],
        a: data[idx + 3],
        hue
      });
    }
    
    row.sort((a, b) => a.hue - b.hue);
    
    for (let x = 0; x < width; x++) {
      const idx = (y * width + x) * 4;
      const pixel = row[x];
      data[idx] = pixel.r;
      data[idx + 1] = pixel.g;
      data[idx + 2] = pixel.b;
      data[idx + 3] = pixel.a;
    }
  },
  
  /**
   * Convert RGB to hue value
   */
  _rgbToHue(r, g, b) {
    r /= 255;
    g /= 255;
    b /= 255;
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    
    if (max === min) {
      return 0;
    }
    
    const d = max - min;
    let h;
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    return h / 6;
  }
};
