// ========== Advanced Features for Effects Studio ==========

// ========== Preset System ==========
const PresetManager = {
  presets: {
    // Artistic Presets
    'vintage-photo': {
      name: 'Vintage Photo',
      category: 'artistic',
      effects: {
        sepia: { enabled: true, params: {} },
        vignette: { enabled: true, params: { strength: 0.4 } },
        noise: { enabled: true, params: { intensity: 15 } }
      },
      globalIntensity: 85
    },
    
    'newspaper-print': {
      name: 'Newspaper Print',
      category: 'artistic',
      effects: {
        halftone: { enabled: true, params: { dotSize: 6 } },
        threshold: { enabled: true, params: { threshold: 140 } }
      },
      globalIntensity: 100
    },
    
    'oil-painting': {
      name: 'Oil Painting',
      category: 'artistic',
      effects: {
        blur: { enabled: true, params: { radius: 2 } },
        posterize: { enabled: true, params: { levels: 8 } },
        emboss: { enabled: true, params: { strength: 0.3 } }
      },
      globalIntensity: 90
    },
    
    // Distortion Presets
    'digital-chaos': {
      name: 'Digital Chaos',
      category: 'distortion',
      effects: {
        glitch: { enabled: true, params: { intensity: 800 } },
        pixelSort: { enabled: true, params: { segmentHeight: 15 } },
        swirl: { enabled: true, params: { intensity: 0.5 } }
      },
      globalIntensity: 120
    },
    
    'liquid-dream': {
      name: 'Liquid Dream',
      category: 'distortion',
      effects: {
        liquify: { enabled: true, params: { intensity: 30 } },
        swirl: { enabled: true, params: { intensity: 0.8 } },
        hueShift: { enabled: true, params: { shift: 180 } }
      },
      globalIntensity: 110
    },
    
    'mirror-dimension': {
      name: 'Mirror Dimension',
      category: 'distortion',
      effects: {
        mirror: { enabled: true, params: { mode: 'horizontal' } },
        swirl: { enabled: true, params: { intensity: 0.4 } },
        invert: { enabled: true, params: {} }
      },
      globalIntensity: 95
    },
    
    // Color Presets
    'neon-nights': {
      name: 'Neon Nights',
      category: 'color',
      effects: {
        hueShift: { enabled: true, params: { shift: 270 } },
        vignette: { enabled: true, params: { strength: 0.6 } },
        posterize: { enabled: true, params: { levels: 6 } }
      },
      globalIntensity: 130
    },
    
    'cyberpunk': {
      name: 'Cyberpunk',
      category: 'color',
      effects: {
        hueShift: { enabled: true, params: { shift: 200 } },
        glitch: { enabled: true, params: { intensity: 400 } },
        edgeDetection: { enabled: true, params: { sensitivity: 0.8 } }
      },
      globalIntensity: 115
    },
    
    // Filter Presets
    'film-noir': {
      name: 'Film Noir',
      category: 'filter',
      effects: {
        threshold: { enabled: true, params: { threshold: 100 } },
        vignette: { enabled: true, params: { strength: 0.7 } },
        motionBlur: { enabled: true, params: { blurSize: 3, direction: 'diagonal' } }
      },
      globalIntensity: 100
    },
    
    'dreamy-soft': {
      name: 'Dreamy Soft',
      category: 'filter',
      effects: {
        blur: { enabled: true, params: { radius: 4 } },
        vignette: { enabled: true, params: { strength: 0.3 } },
        hueShift: { enabled: true, params: { shift: 30 } }
      },
      globalIntensity: 80
    },
    
    // Experimental Presets
    'pixel-art': {
      name: 'Pixel Art',
      category: 'experimental',
      effects: {
        pixelization: { enabled: true, params: { pixelSize: 8 } },
        posterize: { enabled: true, params: { levels: 4 } }
      },
      globalIntensity: 100
    },
    
    'data-corruption': {
      name: 'Data Corruption',
      category: 'experimental',
      effects: {
        pixelSort: { enabled: true, params: { segmentHeight: 20 } },
        noise: { enabled: true, params: { intensity: 40 } },
        glitch: { enabled: true, params: { intensity: 600 } }
      },
      globalIntensity: 140
    }
  },
  
  applyPreset(presetName) {
    const preset = this.presets[presetName];
    if (!preset) return;
    
    // Clear all current effects
    EffectRegistry.activeEffects.forEach(effectName => {
      EffectRegistry.disable(effectName);
      document.getElementById(effectName + '-toggle').checked = false;
    });
    
    // Apply preset effects
    Object.entries(preset.effects).forEach(([effectName, config]) => {
      if (config.enabled) {
        // Enable effect
        document.getElementById(effectName + '-toggle').checked = true;
        EffectRegistry.enable(effectName);
        
        // Set parameters
        Object.entries(config.params).forEach(([paramName, value]) => {
          const slider = document.getElementById(`${effectName}-${paramName}`);
          const select = document.getElementById(`${effectName}-${paramName}`);
          
          if (slider && slider.type === 'range') {
            slider.value = value;
            const valueDisplay = document.getElementById(`${effectName}-${paramName}-value`);
            if (valueDisplay) {
              valueDisplay.textContent = value;
            }
            EffectRegistry.updateParam(effectName, paramName, parseFloat(value));
          } else if (select && select.tagName === 'SELECT') {
            select.value = value;
            EffectRegistry.updateParam(effectName, paramName, value);
          }
        });
      }
    });
    
    // Set global intensity
    if (preset.globalIntensity) {
      const globalIntensitySlider = document.getElementById('global-intensity');
      const globalIntensityValue = document.getElementById('global-intensity-value');
      globalIntensitySlider.value = preset.globalIntensity;
      globalIntensityValue.textContent = preset.globalIntensity;
    }
    
    // Process image with new settings
    if (originalImageData) {
      processImage();
    }
  },
  
  saveCustomPreset() {
    const presetName = prompt('Enter a name for this preset:');
    if (!presetName) return;
    
    const customPreset = {
      name: presetName,
      category: 'custom',
      effects: {},
      globalIntensity: parseInt(document.getElementById('global-intensity').value)
    };
    
    // Capture current effect settings
    EffectRegistry.activeEffects.forEach(effectName => {
      const effect = EffectRegistry.effects[effectName];
      customPreset.effects[effectName] = {
        enabled: true,
        params: { ...effect.params }
      };
    });
    
    // Save to localStorage
    const customPresets = JSON.parse(localStorage.getItem('customPresets') || '{}');
    customPresets[presetName] = customPreset;
    localStorage.setItem('customPresets', JSON.stringify(customPresets));
    
    // Update preset dropdown
    this.updatePresetDropdown();
    
    alert(`Preset "${presetName}" saved!`);
  },
  
  loadCustomPresets() {
    return JSON.parse(localStorage.getItem('customPresets') || '{}');
  },
  
  updatePresetDropdown() {
    const presetSelect = document.getElementById('preset-select');
    if (!presetSelect) return;
    
    // Clear existing options except the default
    while (presetSelect.children.length > 1) {
      presetSelect.removeChild(presetSelect.lastChild);
    }
    
    // Add built-in presets
    Object.keys(this.presets).forEach(presetName => {
      const option = document.createElement('option');
      option.value = presetName;
      option.textContent = this.presets[presetName].name;
      option.dataset.category = this.presets[presetName].category;
      presetSelect.appendChild(option);
    });
    
    // Add custom presets
    const customPresets = this.loadCustomPresets();
    Object.keys(customPresets).forEach(presetName => {
      const option = document.createElement('option');
      option.value = `custom:${presetName}`;
      option.textContent = `${customPresets[presetName].name} (Custom)`;
      option.dataset.category = 'custom';
      presetSelect.appendChild(option);
    });
  }
};

// ========== Performance Monitor ==========
const PerformanceMonitor = {
  frameCount: 0,
  lastTime: 0,
  fps: 0,
  processingTime: 0,
  
  update() {
    const now = performance.now();
    this.frameCount++;
    
    if (now - this.lastTime >= 1000) {
      this.fps = Math.round((this.frameCount * 1000) / (now - this.lastTime));
      this.frameCount = 0;
      this.lastTime = now;
      this.updateDisplay();
    }
  },
  
  measureProcessing(fn) {
    const start = performance.now();
    const result = fn();
    this.processingTime = Math.round(performance.now() - start);
    return result;
  },
  
  updateDisplay() {
    const perfDisplay = document.getElementById('performance-display');
    if (perfDisplay) {
      perfDisplay.innerHTML = `
        <div class="text-small">
          Performance: ${this.fps} FPS | Processing: ${this.processingTime}ms
        </div>
      `;
    }
  }
};

// ========== Batch Processing ==========
const BatchProcessor = {
  async processMultipleImages(files, preset = null) {
    const results = [];
    const progressCallback = this.updateProgress.bind(this);
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      progressCallback(i, files.length, `Processing ${file.name}...`);
      
      try {
        const result = await this.processSingleImage(file, preset);
        results.push({
          originalName: file.name,
          processedDataUrl: result,
          success: true
        });
      } catch (error) {
        results.push({
          originalName: file.name,
          error: error.message,
          success: false
        });
      }
    }
    
    progressCallback(files.length, files.length, 'Complete!');
    return results;
  },
  
  processSingleImage(file, preset) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = e => {
        const img = new Image();
        img.onload = () => {
          try {
            // Create temporary canvas
            const tempCanvas = document.createElement('canvas');
            const tempCtx = tempCanvas.getContext('2d');
            tempCanvas.width = img.width;
            tempCanvas.height = img.height;
            
            // Draw and process image
            tempCtx.drawImage(img, 0, 0);
            let imageData = tempCtx.getImageData(0, 0, img.width, img.height);
            
            // Apply preset if specified
            if (preset) {
              const originalActiveEffects = [...EffectRegistry.activeEffects];
              PresetManager.applyPreset(preset);
              imageData = EffectRegistry.processAll(imageData);
              // Restore original effects
              EffectRegistry.activeEffects = originalActiveEffects;
            } else {
              imageData = EffectRegistry.processAll(imageData);
            }
            
            tempCtx.putImageData(imageData, 0, 0);
            resolve(tempCanvas.toDataURL('image/png'));
          } catch (error) {
            reject(error);
          }
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target.result;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  },
  
  updateProgress(current, total, status) {
    const progressBar = document.getElementById('batch-progress');
    const progressText = document.getElementById('batch-progress-text');
    
    if (progressBar && progressText) {
      const percentage = Math.round((current / total) * 100);
      progressBar.style.width = `${percentage}%`;
      progressText.textContent = `${status} (${current}/${total})`;
    }
  },
  
  downloadResults(results) {
    results.forEach((result, index) => {
      if (result.success) {
        const link = document.createElement('a');
        link.href = result.processedDataUrl;
        link.download = `processed_${String(index + 1).padStart(3, '0')}_${result.originalName}`;
        setTimeout(() => link.click(), index * 500); // Stagger downloads
      }
    });
  }
};

// ========== Animation System ==========
const AnimationSystem = {
  isAnimating: false,
  animationSpeed: 1,
  frameCounter: 0,
  
  start() {
    if (this.isAnimating) return;
    this.isAnimating = true;
    this.frameCounter = 0;
    this.animate();
  },
  
  stop() {
    this.isAnimating = false;
  },
  
  animate() {
    if (!this.isAnimating || !originalImageData) return;
    
    this.frameCounter++;
    
    // Animate global intensity with sine wave
    const globalIntensitySlider = document.getElementById('global-intensity');
    const globalIntensityValue = document.getElementById('global-intensity-value');
    const baseIntensity = 100;
    const amplitude = 50;
    const frequency = 0.05;
    
    const newIntensity = Math.round(baseIntensity + amplitude * Math.sin(this.frameCounter * frequency * this.animationSpeed));
    globalIntensitySlider.value = newIntensity;
    globalIntensityValue.textContent = newIntensity;
    
    // Process image with animated parameters
    processImage();
    
    // Continue animation
    requestAnimationFrame(() => this.animate());
  },
  
  setSpeed(speed) {
    this.animationSpeed = Math.max(0.1, Math.min(5, speed));
  }
};

// ========== Keyboard Shortcuts ==========
const KeyboardShortcuts = {
  shortcuts: {
    'KeyR': () => resetImage(),
    'KeyS': () => downloadSnapshot(),
    'KeyP': () => togglePlayPause(),
    'KeyC': () => clearAllEffects(),
    'KeyQ': () => randomizeEffects(),
    'Digit1': () => switchToCategory('artistic'),
    'Digit2': () => switchToCategory('distortion'),
    'Digit3': () => switchToCategory('color'),
    'Digit4': () => switchToCategory('filter'),
    'Digit5': () => switchToCategory('experimental'),
    'Space': (e) => {
      e.preventDefault();
      AnimationSystem.isAnimating ? AnimationSystem.stop() : AnimationSystem.start();
    }
  },
  
  init() {
    document.addEventListener('keydown', (e) => {
      // Only trigger if not typing in an input
      if (e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        const handler = this.shortcuts[e.code];
        if (handler) {
          e.preventDefault();
          handler(e);
        }
      }
    });
  }
};

// ========== Help System ==========
const HelpSystem = {
  tips: [
    "💡 Use the Global Intensity slider to control all effects at once",
    "🎨 Try combining 2-3 effects for unique results",
    "⚡ Press Space to animate effects automatically",
    "🔢 Use number keys 1-5 to switch between effect categories",
    "💾 Save your favorite combinations as custom presets",
    "📷 Press 'S' for quick snapshot, 'R' to reset image",
    "🎲 Press 'Q' to randomize effects for inspiration",
    "⏸️ Press 'P' to pause/resume processing",
    "🗑️ Press 'C' to clear all active effects"
  ],
  
  currentTip: 0,
  
  showRandomTip() {
    const tip = this.tips[Math.floor(Math.random() * this.tips.length)];
    this.showToast(tip, 4000);
  },
  
  showToast(message, duration = 3000) {
    // Create toast if it doesn't exist
    let toast = document.getElementById('help-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'help-toast';
      toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: linear-gradient(145deg, #2a2a40, #1f1f35);
        color: white;
        padding: 15px 20px;
        border-radius: 10px;
        box-shadow: 0 4px 20px rgba(0,0,0,0.3);
        border: 1px solid rgba(255,255,255,0.1);
        max-width: 300px;
        z-index: 1000;
        opacity: 0;
        transform: translateY(-20px);
        transition: all 0.3s ease;
        font-size: 14px;
        line-height: 1.4;
      `;
      document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(-20px)';
    }, duration);
  }
};

// ========== Auto-Save System ==========
const AutoSave = {
  interval: null,
  
  start() {
    this.stop(); // Clear any existing interval
    this.interval = setInterval(() => {
      this.saveCurrentState();
    }, 30000); // Auto-save every 30 seconds
  },
  
  stop() {
    if (this.interval) {
      clearInterval(this.interval);
      this.interval = null;
    }
  },
  
  saveCurrentState() {
    if (!EffectRegistry.activeEffects.length) return;
    
    const state = {
      timestamp: Date.now(),
      activeEffects: EffectRegistry.activeEffects,
      effectParams: {},
      globalIntensity: document.getElementById('global-intensity').value
    };
    
    // Save current parameters
    EffectRegistry.activeEffects.forEach(effectName => {
      state.effectParams[effectName] = { ...EffectRegistry.effects[effectName].params };
    });
    
    localStorage.setItem('autoSaveState', JSON.stringify(state));
  },
  
  loadLastState() {
    const saved = localStorage.getItem('autoSaveState');
    if (!saved) return false;
    
    try {
      const state = JSON.parse(saved);
      const hourAgo = Date.now() - (60 * 60 * 1000);
      
      if (state.timestamp < hourAgo) return false; // Don't load old states
      
      // Restore effects and parameters
      state.activeEffects.forEach(effectName => {
        const toggle = document.getElementById(effectName + '-toggle');
        if (toggle) {
          toggle.checked = true;
          EffectRegistry.enable(effectName);
          
          // Restore parameters
          if (state.effectParams[effectName]) {
            Object.entries(state.effectParams[effectName]).forEach(([param, value]) => {
              const control = document.getElementById(`${effectName}-${param}`);
              if (control) {
                control.value = value;
                const valueDisplay = document.getElementById(`${effectName}-${param}-value`);
                if (valueDisplay) valueDisplay.textContent = value;
                EffectRegistry.updateParam(effectName, param, value);
              }
            });
          }
        }
      });
      
      // Restore global intensity
      const globalSlider = document.getElementById('global-intensity');
      const globalValue = document.getElementById('global-intensity-value');
      globalSlider.value = state.globalIntensity;
      globalValue.textContent = state.globalIntensity;
      
      HelpSystem.showToast('🔄 Previous session restored', 3000);
      return true;
    } catch (error) {
      console.error('Failed to load auto-save state:', error);
      return false;
    }
  }
};

// ========== Enhanced UI Functions ==========

function switchToCategory(category) {
  const tabButton = document.querySelector(`[data-category="${category}"]`);
  if (tabButton) {
    tabButton.click();
  }
}

function togglePlayPause() {
  if (AnimationSystem.isAnimating) {
    AnimationSystem.stop();
    document.getElementById('play-pause-btn').innerHTML = '▶️ Play Animation';
  } else {
    AnimationSystem.start();
    document.getElementById('play-pause-btn').innerHTML = '⏸️ Pause Animation';
  }
}

// ========== Additional HTML for Advanced Features ==========
const advancedFeaturesHTML = `
  <!-- Add to Global Controls section -->
  <div class="control-group" data-category="global">
    <div class="group-title">🎬 Animation</div>
    <div class="button-grid">
      <button id="play-pause-btn" class="control-button">▶️ Play Animation</button>
      <button id="animation-speed-btn" class="control-button toggle-button" onclick="cycleAnimationSpeed()">1x</button>
    </div>
    <div class="text-small">Animate effects automatically with sine wave modulation</div>
  </div>

  <div class="control-group" data-category="global">
    <div class="group-title">📋 Presets</div>
    <select id="preset-select" class="control-select">
      <option value="">Choose a preset...</option>
    </select>
    <div class="button-grid">
      <button id="save-preset-btn" class="control-button">💾 Save Preset</button>
      <button id="help-btn" class="control-button">❓ Show Tip</button>
    </div>
  </div>

  <div class="control-group" data-category="global">
    <div class="group-title">📦 Batch Processing</div>
    <input type="file" id="batch-input" multiple accept="image/*" style="display: none;">
    <button id="batch-btn" class="control-button" onclick="document.getElementById('batch-input').click()">
      📁 Process Multiple Images
    </button>
    <div id="batch-progress-container" style="display: none; margin-top: 15px;">
      <div class="text-small" id="batch-progress-text">Ready to process...</div>
      <div style="background: #1a1a30; border-radius: 5px; height: 8px; margin-top: 5px; overflow: hidden;">
        <div id="batch-progress" style="background: linear-gradient(45deg, #4ecdc4, #45b7d1); height: 100%; width: 0%; transition: width 0.3s ease;"></div>
      </div>
    </div>
  </div>

  <div class="control-group" data-category="global">
    <div class="group-title">⚡ Performance</div>
    <div id="performance-display">
      <div class="text-small">Performance: -- FPS | Processing: --ms</div>
    </div>
    <div class="text-small">Monitor real-time performance metrics</div>
  </div>

  <div class="control-group" data-category="global">
    <div class="group-title">⌨️ Shortcuts</div>
    <div class="text-small" style="line-height: 1.6;">
      <strong>R</strong> - Reset | <strong>S</strong> - Save | <strong>P</strong> - Pause<br>
      <strong>C</strong> - Clear | <strong>Q</strong> - Random | <strong>Space</strong> - Animate<br>
      <strong>1-5</strong> - Switch Categories
    </div>
  </div>
`;

// ========== Initialization Function ==========
function initializeAdvancedFeatures() {
  // Initialize systems
  KeyboardShortcuts.init();
  PresetManager.updatePresetDropdown();
  AutoSave.start();
  
  // Set up event listeners
  document.getElementById('preset-select')?.addEventListener('change', (e) => {
    if (e.target.value) {
      if (e.target.value.startsWith('custom:')) {
        const presetName = e.target.value.replace('custom:', '');
        const customPresets = PresetManager.loadCustomPresets();
        if (customPresets[presetName]) {
          PresetManager.applyPreset(customPresets[presetName]);
        }
      } else {
        PresetManager.applyPreset(e.target.value);
      }
    }
  });
  
  document.getElementById('save-preset-btn')?.addEventListener('click', () => {
    PresetManager.saveCustomPreset();
  });
  
  document.getElementById('help-btn')?.addEventListener('click', () => {
    HelpSystem.showRandomTip();
  });
  
  document.getElementById('play-pause-btn')?.addEventListener('click', togglePlayPause);
  
  document.getElementById('batch-input')?.addEventListener('change', async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;
    
    const progressContainer = document.getElementById('batch-progress-container');
    progressContainer.style.display = 'block';
    
    try {
      const results = await BatchProcessor.processMultipleImages(files);
      BatchProcessor.downloadResults(results);
      HelpSystem.showToast(`✅ Processed ${results.length} images successfully!`, 4000);
    } catch (error) {
      HelpSystem.showToast(`❌ Batch processing failed: ${error.message}`, 4000);
    } finally {
      progressContainer.style.display = 'none';
    }
  });
  
  // Try to restore previous session
  setTimeout(() => {
    AutoSave.loadLastState();
  }, 1000);
  
  // Show welcome tip
  setTimeout(() => {
    HelpSystem.showToast('👋 Welcome to Effects Studio! Press ❓ for tips', 4000);
  }, 2000);
}

// Animation speed cycling
let animationSpeeds = [0.5, 1, 2, 3, 5];
let currentSpeedIndex = 1;

function cycleAnimationSpeed() {
  currentSpeedIndex = (currentSpeedIndex + 1) % animationSpeeds.length;
  const newSpeed = animationSpeeds[currentSpeedIndex];
  AnimationSystem.setSpeed(newSpeed);
  document.getElementById('animation-speed-btn').textContent = `${newSpeed}x`;
}

// Export for integration
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    PresetManager,
    PerformanceMonitor,
    BatchProcessor,
    AnimationSystem,
    KeyboardShortcuts,
    HelpSystem,
    AutoSave,
    initializeAdvancedFeatures,
    advancedFeaturesHTML
  };
}