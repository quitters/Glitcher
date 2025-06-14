/**
 * Batch Export Module
 * Generates multiple variations of effects for bulk export
 */

import { createToast } from '../ui/notifications.js';

export class BatchExporter {
  constructor(app) {
    this.app = app;
    this.isExporting = false;
    this.exportProgress = 0;
    this.cancelRequested = false;
  }
  
  /**
   * Export multiple variations
   * @param {Object} options - Export options
   */
  async exportVariations(options = {}) {
    const {
      count = 10,
      randomizeParams = true,
      randomizeEffects = false,
      format = 'png',
      quality = 0.9,
      prefix = 'glitch',
      delay = 200
    } = options;
    
    if (this.isExporting) {
      createToast('Export already in progress', 'warning');
      return;
    }
    
    if (!this.app.canvas.hasImage()) {
      createToast('No image to export', 'warning');
      return;
    }
    
    this.isExporting = true;
    this.exportProgress = 0;
    this.cancelRequested = false;
    
    // Store current state
    const originalEffects = this._captureCurrentState();
    
    try {
      // Show progress UI
      this._showProgressUI(count);
      
      for (let i = 0; i < count; i++) {
        if (this.cancelRequested) break;
        
        // Generate variation
        if (randomizeEffects) {
          this._randomizeEffectChain();
        } else if (randomizeParams) {
          this._randomizeParameters();
        }
        
        // Wait for effects to process
        await this._waitForFrame();
        
        // Export image
        const filename = `${prefix}_${String(i + 1).padStart(3, '0')}.${format}`;
        this._exportImage(filename, format, quality);
        
        // Update progress
        this.exportProgress = ((i + 1) / count) * 100;
        this._updateProgressUI();
        
        // Delay between exports
        await this._delay(delay);
      }
      
      createToast(`Exported ${count} variations successfully!`);
      
    } catch (error) {
      console.error('Batch export error:', error);
      createToast('Export failed: ' + error.message, 'error');
      
    } finally {
      // Restore original state
      this._restoreState(originalEffects);
      
      // Hide progress UI
      this._hideProgressUI();
      
      this.isExporting = false;
      this.exportProgress = 0;
    }
  }
  
  /**
   * Cancel ongoing export
   */
  cancelExport() {
    this.cancelRequested = true;
  }
  
  /**
   * Generate preset variations
   * @param {Array} presetIds - Array of preset IDs to cycle through
   * @param {Object} options - Export options
   */
  async exportPresetVariations(presetIds, options = {}) {
    const {
      variationsPerPreset = 3,
      format = 'png',
      quality = 0.9,
      delay = 300
    } = options;
    
    if (!presetIds || presetIds.length === 0) {
      createToast('No presets selected', 'warning');
      return;
    }
    
    const totalCount = presetIds.length * variationsPerPreset;
    const exportOptions = {
      ...options,
      count: totalCount,
      randomizeParams: true,
      randomizeEffects: false
    };
    
    // Custom export loop for presets
    this.isExporting = true;
    this.exportProgress = 0;
    this.cancelRequested = false;
    
    const originalEffects = this._captureCurrentState();
    
    try {
      this._showProgressUI(totalCount);
      let exportCount = 0;
      
      for (const presetId of presetIds) {
        if (this.cancelRequested) break;
        
        // Load preset
        const preset = this.app.presets.getPresetById(presetId);
        if (!preset) continue;
        
        this.app.loadPreset(presetId);
        await this._waitForFrame();
        
        // Generate variations
        for (let v = 0; v < variationsPerPreset; v++) {
          if (this.cancelRequested) break;
          
          if (v > 0) {
            this._randomizeParameters(0.3); // Subtle variations
          }
          
          await this._waitForFrame();
          
          const filename = `${preset.name}_var${v + 1}.${format}`;
          this._exportImage(filename, format, quality);
          
          exportCount++;
          this.exportProgress = (exportCount / totalCount) * 100;
          this._updateProgressUI();
          
          await this._delay(delay);
        }
      }
      
      createToast(`Exported ${exportCount} preset variations!`);
      
    } finally {
      this._restoreState(originalEffects);
      this._hideProgressUI();
      this.isExporting = false;
    }
  }
  
  /**
   * Capture current effect state
   * @private
   */
  _captureCurrentState() {
    const effects = this.app.registry.getActiveEffects();
    return effects.map(effect => ({
      name: effect.name,
      enabled: effect.enabled,
      params: JSON.parse(JSON.stringify(effect.params))
    }));
  }
  
  /**
   * Restore effect state
   * @private
   */
  _restoreState(effectsState) {
    // Clear current effects
    this.app.clearAllEffects();
    
    // Restore saved state
    effectsState.forEach(effectData => {
      this.app.registry.enable(effectData.name);
      
      Object.entries(effectData.params).forEach(([paramName, paramValue]) => {
        this.app.registry.updateParam(effectData.name, paramName, paramValue.value);
      });
    });
    
    this.app.ui.updateEffectsList();
    this.app.ui.updateEffectChain();
  }
  
  /**
   * Randomize effect parameters
   * @private
   */
  _randomizeParameters(factor = 1.0) {
    const activeEffects = this.app.registry.getActiveEffects();
    
    activeEffects.forEach(effect => {
      Object.entries(effect.params).forEach(([paramName, param]) => {
        if (paramName === 'enabled') return;
        
        if (typeof param.value === 'number' && param.min !== undefined && param.max !== undefined) {
          // Randomize numeric parameters
          const range = param.max - param.min;
          const variation = (Math.random() - 0.5) * range * factor;
          const newValue = Math.max(param.min, Math.min(param.max, param.value + variation));
          
          this.app.registry.updateParam(effect.name, paramName, newValue);
          
        } else if (param.options && Math.random() < 0.3 * factor) {
          // Occasionally change option parameters
          const randomOption = param.options[Math.floor(Math.random() * param.options.length)];
          this.app.registry.updateParam(effect.name, paramName, randomOption);
        }
      });
    });
  }
  
  /**
   * Randomize effect chain
   * @private
   */
  _randomizeEffectChain() {
    // Clear current effects
    this.app.clearAllEffects();
    
    // Get all available effects
    const allEffects = this.app.registry.getAllEffects();
    
    // Randomly select 2-5 effects
    const effectCount = Math.floor(Math.random() * 4) + 2;
    const selectedEffects = [];
    
    for (let i = 0; i < effectCount && i < allEffects.length; i++) {
      const randomIndex = Math.floor(Math.random() * allEffects.length);
      const effect = allEffects[randomIndex];
      
      if (!selectedEffects.includes(effect)) {
        selectedEffects.push(effect);
        this.app.registry.enable(effect.name);
        
        // Randomize its parameters
        this._randomizeParameters(1.0);
      }
    }
    
    this.app.ui.updateEffectsList();
    this.app.ui.updateEffectChain();
  }
  
  /**
   * Export current canvas as image
   * @private
   */
  _exportImage(filename, format, quality) {
    const dataURL = this.app.canvas.getDataURL(`image/${format}`, quality);
    
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
  
  /**
   * Wait for next animation frame
   * @private
   */
  _waitForFrame() {
    return new Promise(resolve => {
      requestAnimationFrame(() => {
        requestAnimationFrame(resolve);
      });
    });
  }
  
  /**
   * Delay helper
   * @private
   */
  _delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Show progress UI
   * @private
   */
  _showProgressUI(totalCount) {
    // Create progress overlay
    const overlay = document.createElement('div');
    overlay.className = 'batch-export-overlay';
    overlay.innerHTML = `
      <div class="batch-export-modal">
        <h3>Exporting Variations</h3>
        <div class="progress-info">
          <span class="progress-text">Processing: <span id="export-current">0</span> / ${totalCount}</span>
          <button class="cancel-btn" id="cancel-export">Cancel</button>
        </div>
        <div class="progress-bar">
          <div class="progress-fill" id="export-progress" style="width: 0%"></div>
        </div>
      </div>
    `;
    
    document.body.appendChild(overlay);
    
    // Add cancel handler
    document.getElementById('cancel-export').addEventListener('click', () => {
      this.cancelExport();
    });
    
    this._progressOverlay = overlay;
  }
  
  /**
   * Update progress UI
   * @private
   */
  _updateProgressUI() {
    if (!this._progressOverlay) return;
    
    const progressBar = this._progressOverlay.querySelector('#export-progress');
    const currentText = this._progressOverlay.querySelector('#export-current');
    
    progressBar.style.width = `${this.exportProgress}%`;
    currentText.textContent = Math.floor(this.exportProgress / 100 * parseInt(currentText.parentElement.textContent.split('/')[1]));
  }
  
  /**
   * Hide progress UI
   * @private
   */
  _hideProgressUI() {
    if (this._progressOverlay) {
      this._progressOverlay.remove();
      this._progressOverlay = null;
    }
  }
}
