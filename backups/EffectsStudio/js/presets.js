// ========== Presets System ==========

const PresetManager = {
  presets: {},
  categories: ['Artistic', 'Distortion', 'Color', 'Experimental', 'User'],
  activePreset: null,
  
  // Initialize with built-in presets
  init() {
    // Add built-in presets
    this.addPreset('Glitch Art', 'Artistic', {
      activeEffects: ['glitch', 'rgbSplit'],
      params: {
        'glitch': { intensity: 2048 },
        'rgbSplit': { distance: 15 }
      },
      globalIntensity: 80
    });
    
    this.addPreset('Vintage', 'Artistic', {
      activeEffects: ['vignette', 'posterize'],
      params: {
        'vignette': { amount: 0.7 },
        'posterize': { levels: 5 }
      },
      globalIntensity: 70
    });
    
    this.addPreset('Neon', 'Color', {
      activeEffects: ['edgeDetection', 'hueShift', 'invert'],
      params: {
        'edgeDetection': { threshold: 20 },
        'hueShift': { shift: 180 },
        'invert': { intensity: 1.0 }
      },
      globalIntensity: 100
    });
    
    this.addPreset('Cyberpunk', 'Distortion', {
      activeEffects: ['rgbSplit', 'glitch', 'hueShift'],
      params: {
        'rgbSplit': { distance: 12 },
        'glitch': { intensity: 1500 },
        'hueShift': { shift: 220 }
      },
      globalIntensity: 90
    });
    
    this.addPreset('Dreamy', 'Artistic', {
      activeEffects: ['blur', 'swirl'],
      params: {
        'blur': { radius: 3 },
        'swirl': { intensity: 0.2 }
      },
      globalIntensity: 60
    });
    
    this.addPreset('Corrupted', 'Experimental', {
      activeEffects: ['datamosh', 'glitch', 'noise'],
      params: {
        'datamosh': { intensity: 30 },
        'glitch': { intensity: 2000 },
        'noise': { amount: 70 }
      },
      globalIntensity: 100
    });
    
    this.addPreset('Pixel Art', 'Artistic', {
      activeEffects: ['pixelate', 'posterize'],
      params: {
        'pixelate': { pixelSize: 12 },
        'posterize': { levels: 8 }
      },
      globalIntensity: 100
    });
    
    this.addPreset('Sketch', 'Filter', {
      activeEffects: ['edgeDetection', 'invert'],
      params: {
        'edgeDetection': { threshold: 15 },
        'invert': { intensity: 0.5 }
      },
      globalIntensity: 70
    });
    
    // Load user presets from localStorage
    this.loadUserPresets();
    
    // Populate preset selector
    this.populatePresetSelector();
  },
  
  // Add a preset to the collection
  addPreset(name, category, settings) {
    if (!this.categories.includes(category)) {
      category = 'User';
    }
    
    this.presets[name] = {
      name,
      category,
      settings
    };
  },
  
  // Apply a preset
  applyPreset(presetName) {
    const preset = this.presets[presetName];
    if (!preset) return false;
    
    // Clear current effects
    clearAllEffects();
    
    // Set global intensity
    const globalIntensity = preset.settings.globalIntensity || 100;
    document.getElementById('global-intensity').value = globalIntensity;
    document.getElementById('global-intensity-value').textContent = globalIntensity;
    
    // Enable and configure effects
    preset.settings.activeEffects.forEach(effectName => {
      const checkbox = document.getElementById(`${effectName}-toggle`);
      if (checkbox) {
        checkbox.checked = true;
        EffectRegistry.enable(effectName);
        
        // Set parameters
        if (preset.settings.params[effectName]) {
          Object.entries(preset.settings.params[effectName]).forEach(([param, value]) => {
            const slider = document.getElementById(`${effectName}-${param}`);
            if (slider) {
              slider.value = value * 10;
              document.getElementById(`${effectName}-${param}-value`).textContent = value * 10;
              EffectRegistry.updateParam(effectName, param, value);
            }
          });
        }
      }
    });
    
    this.activePreset = presetName;
    showToast(`Applied preset: ${presetName}`);
    return true;
  },
  
  // Save current settings as a new preset
  saveCurrentAsPreset(name, category) {
    if (!name) return false;
    
    // Get active effects and their parameters
    const activeEffects = [...EffectRegistry.activeEffects];
    const params = {};
    
    activeEffects.forEach(effectName => {
      const effect = EffectRegistry.effects[effectName];
      if (effect) {
        params[effectName] = { ...effect.params };
      }
    });
    
    // Create preset
    const preset = {
      activeEffects,
      params,
      globalIntensity: parseInt(document.getElementById('global-intensity').value)
    };
    
    // Add to presets
    this.addPreset(name, category || 'User', preset);
    
    // Save to localStorage if it's a user preset
    if (category === 'User') {
      this.saveUserPresets();
    }
    
    // Update preset selector
    this.populatePresetSelector();
    
    showToast(`Saved preset: ${name}`);
    return true;
  },
  
  // Delete a preset
  deletePreset(presetName) {
    if (!this.presets[presetName]) return false;
    
    // Don't allow deleting built-in presets
    if (this.presets[presetName].category !== 'User') {
      showToast('Cannot delete built-in presets', 'error');
      return false;
    }
    
    delete this.presets[presetName];
    this.saveUserPresets();
    this.populatePresetSelector();
    
    showToast(`Deleted preset: ${presetName}`);
    return true;
  },
  
  // Save user presets to localStorage
  saveUserPresets() {
    const userPresets = Object.values(this.presets)
      .filter(preset => preset.category === 'User');
    
    localStorage.setItem('effectsStudioUserPresets', JSON.stringify(userPresets));
  },
  
  // Load user presets from localStorage
  loadUserPresets() {
    try {
      const savedPresets = localStorage.getItem('effectsStudioUserPresets');
      if (savedPresets) {
        const userPresets = JSON.parse(savedPresets);
        userPresets.forEach(preset => {
          this.addPreset(preset.name, 'User', preset.settings);
        });
      }
    } catch (error) {
      console.error('Error loading user presets:', error);
    }
  },
  
  // Populate the preset selector dropdown
  populatePresetSelector() {
    const presetSelector = document.getElementById('preset-selector');
    if (!presetSelector) return;
    
    // Clear current options
    presetSelector.innerHTML = '<option value="">Select a preset...</option>';
    
    // Group presets by category
    const presetsByCategory = {};
    this.categories.forEach(category => {
      presetsByCategory[category] = [];
    });
    
    Object.values(this.presets).forEach(preset => {
      if (presetsByCategory[preset.category]) {
        presetsByCategory[preset.category].push(preset);
      } else {
        presetsByCategory['User'].push(preset);
      }
    });
    
    // Add options grouped by category
    this.categories.forEach(category => {
      if (presetsByCategory[category].length > 0) {
        const optgroup = document.createElement('optgroup');
        optgroup.label = category;
        
        presetsByCategory[category].forEach(preset => {
          const option = document.createElement('option');
          option.value = preset.name;
          option.textContent = preset.name;
          optgroup.appendChild(option);
        });
        
        presetSelector.appendChild(optgroup);
      }
    });
  },
  
  // Export all presets to a JSON file
  exportPresets() {
    const presetData = JSON.stringify(this.presets, null, 2);
    const blob = new Blob([presetData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'effects-studio-presets.json';
    link.click();
    
    URL.revokeObjectURL(url);
    showToast('Presets exported successfully');
  },
  
  // Import presets from a JSON file
  importPresets(fileInput) {
    const file = fileInput.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importedPresets = JSON.parse(e.target.result);
        
        // Add each imported preset
        let importCount = 0;
        Object.values(importedPresets).forEach(preset => {
          this.addPreset(preset.name, preset.category, preset.settings);
          importCount++;
        });
        
        // Save user presets
        this.saveUserPresets();
        
        // Update preset selector
        this.populatePresetSelector();
        
        showToast(`Imported ${importCount} presets successfully`);
      } catch (error) {
        console.error('Error importing presets:', error);
        showToast('Error importing presets', 'error');
      }
    };
    
    reader.readAsText(file);
  }
};

// Initialize preset manager when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  PresetManager.init();
  
  // Set up preset selector change event
  const presetSelector = document.getElementById('preset-selector');
  if (presetSelector) {
    presetSelector.addEventListener('change', () => {
      const selectedPreset = presetSelector.value;
      if (selectedPreset) {
        PresetManager.applyPreset(selectedPreset);
      }
    });
  }
  
  // Set up save preset button
  const savePresetBtn = document.getElementById('save-preset-btn');
  if (savePresetBtn) {
    savePresetBtn.addEventListener('click', () => {
      const presetName = prompt('Enter a name for your preset:');
      if (presetName) {
        PresetManager.saveCurrentAsPreset(presetName, 'User');
      }
    });
  }
  
  // Set up export presets button
  const exportPresetsBtn = document.getElementById('export-presets-btn');
  if (exportPresetsBtn) {
    exportPresetsBtn.addEventListener('click', () => {
      PresetManager.exportPresets();
    });
  }
  
  // Set up import presets button and file input
  const importPresetsBtn = document.getElementById('import-presets-btn');
  const importPresetsInput = document.getElementById('import-presets-input');
  
  if (importPresetsBtn && importPresetsInput) {
    importPresetsBtn.addEventListener('click', () => {
      importPresetsInput.click();
    });
    
    importPresetsInput.addEventListener('change', () => {
      PresetManager.importPresets(importPresetsInput);
    });
  }
});

// Toast notification function
function showToast(message, type = 'success') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  document.body.appendChild(toast);
  
  // Show toast
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Hide and remove toast
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      document.body.removeChild(toast);
    }, 300);
  }, 3000);
}
