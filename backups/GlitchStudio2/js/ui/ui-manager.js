/**
 * UI Manager
 * Handles UI interactions and updates with the new effect system
 */

import { createToast } from './notifications.js';
import { createEffectControls } from './effect-controls.js';
import { PresetsUIManager } from './presets-ui.js';
import { ThemeManager } from './theme-manager.js';
import { KeyboardShortcutsManager } from './keyboard-shortcuts.js';

export class UIManager {
  constructor(app) {
    this.app = app;
    this.effectsContainer = document.getElementById('effects-container');
    this.effectChainElement = document.getElementById('effect-chain');
    this.categoryTabs = document.querySelectorAll('.tab-button');
    this.globalIntensitySlider = document.getElementById('global-intensity');
    this.globalIntensityValue = document.getElementById('global-intensity-value');
    
    // Quick action buttons
    this.quickSaveBtn = document.getElementById('quick-save-btn');
    this.quickResetBtn = document.getElementById('quick-reset-btn');
    this.clearEffectsBtn = document.getElementById('clear-effects-btn');
    this.newImageBtn = document.getElementById('new-image-btn');
    this.helpBtn = document.getElementById('help-btn');
    
    // File input
    this.imageInput = document.getElementById('image-input');
    this.canvasPlaceholder = document.getElementById('canvas-placeholder');
    
    // Advanced features buttons
    this.audioReactiveBtn = document.getElementById('audio-reactive-btn');
    this.batchExportBtn = document.getElementById('batch-export-btn');
    this.recordBtn = document.getElementById('record-btn');
    
    // Current category
    this.currentCategory = 'all';
  }
  
  /**
   * Initialize the UI
   */
  init() {
    this._registerEventListeners();
    this._createEffectControls();
    
    // Initialize sub-managers
    this.themeManager = new ThemeManager();
    this.themeManager.init();
    
    this.presetsUI = new PresetsUIManager(this.app);
    this.presetsUI.init();
    
    this.keyboardShortcuts = new KeyboardShortcutsManager(this.app);
    this.keyboardShortcuts.init();
    
    // Listen for parameter changes
    document.addEventListener('effectParameterChange', (e) => {
      const { effectName, paramName, value } = e.detail;
      this.app.registry.updateParam(effectName, paramName, value);
      
      // Reprocess if effect is active
      const effect = this.app.registry.getEffect(effectName);
      if (effect && effect.enabled) {
        this._processEffects();
      }
    });
    
    console.log('UI Manager initialized');
  }
  
  /**
   * Update the effect chain display
   */
  updateEffectChain() {
    if (!this.effectChainElement) return;
    
    // Clear current chain
    this.effectChainElement.innerHTML = '';
    
    // Get active effects
    const activeEffects = this.app.registry.getActiveEffects();
    
    if (activeEffects.length === 0) {
      const emptyMessage = document.createElement('div');
      emptyMessage.className = 'chain-empty';
      emptyMessage.textContent = 'No effects applied';
      this.effectChainElement.appendChild(emptyMessage);
      return;
    }
    
    // Create effect chain items
    activeEffects.forEach(effect => {
      const effectItem = document.createElement('div');
      effectItem.className = 'effect-chain-item';
      effectItem.dataset.effect = effect.name;
      
      const effectName = document.createElement('span');
      effectName.className = 'effect-name';
      effectName.textContent = effect.displayName || effect.name;
      
      const removeBtn = document.createElement('button');
      removeBtn.className = 'remove-effect-btn';
      removeBtn.innerHTML = '&times;';
      removeBtn.title = 'Remove effect';
      removeBtn.onclick = () => {
        this.app.registry.disable(effect.name);
        this.updateEffectChain();
        this._updateEffectToggle(effect.name, false);
        this._processEffects();
      };
      
      effectItem.appendChild(effectName);
      effectItem.appendChild(removeBtn);
      this.effectChainElement.appendChild(effectItem);
    });
  }
  
  /**
   * Update performance display
   * @param {number} fps - Frames per second
   * @param {number} processingTime - Effect processing time in ms
   */
  updatePerformanceDisplay(fps, processingTime) {
    // Can be implemented if needed
  }
  
  /**
   * Update play/pause button state
   * @param {boolean} isPaused - Whether animation is paused
   */
  updatePlayPauseButton(isPaused) {
    // Can be implemented if needed
  }
  
  /**
   * Register all UI event listeners
   * @private
   */
  _registerEventListeners() {
    // Category tabs
    this.categoryTabs.forEach(tab => {
      tab.addEventListener('click', () => {
        const category = tab.dataset.category;
        this._switchCategory(category);
      });
    });
    
    // Global intensity slider
    if (this.globalIntensitySlider) {
      this.globalIntensitySlider.addEventListener('input', () => {
        const value = this.globalIntensitySlider.value / 100;
        this.app.registry.setGlobalIntensity(value);
        if (this.globalIntensityValue) {
          this.globalIntensityValue.textContent = this.globalIntensitySlider.value;
        }
        this._processEffects();
      });
    }
    
    // Quick action buttons
    if (this.quickSaveBtn) {
      this.quickSaveBtn.addEventListener('click', () => {
        this.app.takeSnapshot();
      });
    }
    
    if (this.quickResetBtn) {
      this.quickResetBtn.addEventListener('click', () => {
        this.app.resetImage();
      });
    }
    
    if (this.clearEffectsBtn) {
      this.clearEffectsBtn.addEventListener('click', () => {
        this.app.clearAllEffects();
      });
    }
    
    if (this.newImageBtn) {
      this.newImageBtn.addEventListener('click', () => {
        if (this.app.canvas.hasImage()) {
          if (confirm('Start over with a new image? This will clear all effects and remove the current image.')) {
            this.app.resetImage(true);
            this._triggerFileInput();
          }
        } else {
          this._triggerFileInput();
        }
      });
    }
    
    if (this.helpBtn) {
      this.helpBtn.addEventListener('click', () => {
        this._showKeyboardShortcutsHelp();
      });
    }
    
    // Set up file upload handlers
    this._setupFileUploadHandlers();
    
    // Set up advanced features
    this._setupAdvancedFeatures();
  }
  
  /**
   * Set up file upload handlers
   * @private
   */
  _setupFileUploadHandlers() {
    // Create file input if it doesn't exist
    if (!this.imageInput) {
      this.imageInput = document.createElement('input');
      this.imageInput.type = 'file';
      this.imageInput.id = 'image-input';
      this.imageInput.accept = 'image/*';
      this.imageInput.style.display = 'none';
      document.body.appendChild(this.imageInput);
    }
    
    // File input change handler
    this.imageInput.addEventListener('change', async (e) => {
      const file = e.target.files[0];
      if (file) {
        await this._loadImage(file);
        // Reset input to allow selecting same file again
        e.target.value = '';
      }
    });
    
    // Canvas placeholder handlers
    if (this.canvasPlaceholder) {
      // Click to upload
      this.canvasPlaceholder.addEventListener('click', () => {
        this._triggerFileInput();
      });
      
      // Drag and drop
      this.canvasPlaceholder.addEventListener('dragover', (e) => {
        e.preventDefault();
        this.canvasPlaceholder.classList.add('drag-over');
      });
      
      this.canvasPlaceholder.addEventListener('dragleave', () => {
        this.canvasPlaceholder.classList.remove('drag-over');
      });
      
      this.canvasPlaceholder.addEventListener('drop', async (e) => {
        e.preventDefault();
        this.canvasPlaceholder.classList.remove('drag-over');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
          await this._loadImage(file);
        }
      });
    }
  }
  
  /**
   * Trigger file input dialog
   * @private
   */
  _triggerFileInput() {
    if (this.imageInput) {
      this.imageInput.click();
    }
  }
  
  /**
   * Load an image file
   * @param {File} file - Image file
   * @private
   */
  async _loadImage(file) {
    try {
      // Hide placeholder
      if (this.canvasPlaceholder) {
        this.canvasPlaceholder.style.display = 'none';
      }
      
      // Load image
      await this.app.canvas.loadImage(file);
      this.app.startAnimationLoop();
      
      createToast('Image loaded successfully');
    } catch (err) {
      console.error('Error loading image:', err);
      createToast('Failed to load image', 'error');
    }
  }
  
  /**
   * Create effect controls for all registered effects
   * @private
   */
  _createEffectControls() {
    if (!this.effectsContainer) return;
    
    // Clear container
    this.effectsContainer.innerHTML = '';
    
    // Get all effects grouped by category
    const effectsByCategory = new Map();
    
    this.app.registry.getAllEffects().forEach(effect => {
      const category = effect.category || 'other';
      if (!effectsByCategory.has(category)) {
        effectsByCategory.set(category, []);
      }
      effectsByCategory.get(category).push(effect);
    });
    
    // Create controls for each category
    effectsByCategory.forEach((effects, category) => {
      effects.forEach(effect => {
        const controlGroup = this._createEffectControlGroup(effect);
        this.effectsContainer.appendChild(controlGroup);
      });
    });
  }
  
  /**
   * Create control group for a single effect
   * @param {Object} effect - Effect object
   * @returns {HTMLElement} Control group element
   * @private
   */
  _createEffectControlGroup(effect) {
    const controlGroup = document.createElement('div');
    controlGroup.className = 'control-group';
    controlGroup.dataset.category = effect.category;
    controlGroup.dataset.effectName = effect.name;
    
    // Effect header with toggle
    const header = document.createElement('div');
    header.className = 'group-title';
    
    const toggle = document.createElement('input');
    toggle.type = 'checkbox';
    toggle.className = 'effect-toggle';
    toggle.id = `${effect.name}-toggle`;
    toggle.checked = effect.params.enabled ? effect.params.enabled.value : false;
    
    const label = document.createElement('label');
    label.textContent = effect.displayName || effect.name;
    
    // Expand/collapse button
    const expandBtn = document.createElement('button');
    expandBtn.className = 'expand-btn';
    expandBtn.textContent = '▼';
    expandBtn.onclick = (e) => {
      e.stopPropagation();
      this._toggleEffectControls(effect.name);
    };
    
    header.appendChild(toggle);
    header.appendChild(label);
    header.appendChild(expandBtn);
    
    // Effect controls container
    const controlsContainer = document.createElement('div');
    controlsContainer.className = 'effect-controls collapsed';
    controlsContainer.id = `${effect.name}-controls`;
    
    // Create parameter controls
    const controls = createEffectControls(effect);
    controlsContainer.appendChild(controls);
    
    // Toggle event
    toggle.addEventListener('change', () => {
      const enabled = this.app.registry.toggle(effect.name);
      this.updateEffectChain();
      if (enabled) {
        // Expand controls when enabling
        controlsContainer.classList.remove('collapsed');
        expandBtn.textContent = '▲';
      }
      this._processEffects();
    });
    
    // Click on header to toggle effect
    header.addEventListener('click', (e) => {
      if (e.target !== expandBtn && e.target !== toggle) {
        toggle.checked = !toggle.checked;
        toggle.dispatchEvent(new Event('change'));
      }
    });
    
    controlGroup.appendChild(header);
    controlGroup.appendChild(controlsContainer);
    
    return controlGroup;
  }
  
  /**
   * Update the toggle state of an effect
   * @param {string} effectName - Effect name
   * @param {boolean} enabled - New state
   * @private
   */
  _updateEffectToggle(effectName, enabled) {
    const toggle = document.getElementById(`${effectName}-toggle`);
    if (toggle) {
      toggle.checked = enabled;
    }
  }
  
  /**
   * Toggle effect controls visibility
   * @param {string} effectName - Effect name
   * @private
   */
  _toggleEffectControls(effectName) {
    const controls = document.getElementById(`${effectName}-controls`);
    const expandBtn = document.querySelector(`[data-effect-name="${effectName}"] .expand-btn`);
    
    if (controls && expandBtn) {
      controls.classList.toggle('collapsed');
      expandBtn.textContent = controls.classList.contains('collapsed') ? '▼' : '▲';
    }
  }
  
  /**
   * Switch to a different effect category
   * @param {string} category - Category name
   * @private
   */
  _switchCategory(category) {
    this.currentCategory = category;
    
    // Update tabs
    this.categoryTabs.forEach(tab => {
      if (tab.dataset.category === category) {
        tab.classList.add('active');
      } else {
        tab.classList.remove('active');
      }
    });
    
    // Show/hide control groups
    const controlGroups = document.querySelectorAll('.control-group');
    controlGroups.forEach(group => {
      if (group.dataset.category === category || category === 'all') {
        group.style.display = 'block';
      } else {
        group.style.display = 'none';
      }
    });
  }
  
  /**
   * Process effects and update canvas
   * @private
   */
  _processEffects() {
    if (!this.app.canvas.hasImage()) return;
    
    // Get image data
    const imageData = this.app.canvas.getImageData();
    
    // Process through effect chain (modifies imageData in-place)
    this.app.registry.processEffectChain(imageData);
    
    // Put processed data back
    this.app.canvas.putImageData(imageData);
  }
  
  /**
   * Update UI after effects are loaded
   */
  updateEffectsList() {
    this._createEffectControls();
  }
  
  /**
   * Update all UI elements
   */
  updateUI() {
    this.updateEffectChain();
    this._createEffectControls();
  }
  
  /**
   * Set up advanced features
   * @private
   */
  _setupAdvancedFeatures() {
    // Audio Reactive
    if (this.audioReactiveBtn) {
      this.audioReactiveBtn.addEventListener('click', async () => {
        if (this.app.audioReactive.isActive) {
          this.app.audioReactive.stop();
          this.audioReactiveBtn.classList.remove('active');
          createToast('Audio reactive disabled');
        } else {
          const success = await this.app.audioReactive.init();
          if (success) {
            this.audioReactiveBtn.classList.add('active');
            createToast('Audio reactive enabled - speak or play music!');
          } else {
            createToast('Failed to access microphone', 'error');
          }
        }
      });
    }
    
    // Batch Export
    if (this.batchExportBtn) {
      this.batchExportBtn.addEventListener('click', () => {
        if (!this.app.canvas.hasImage()) {
          createToast('Please load an image first', 'warning');
          return;
        }
        
        // Show batch export dialog
        this._showBatchExportDialog();
      });
    }
    
    // Recording
    if (this.recordBtn) {
      this.recordBtn.addEventListener('click', async () => {
        if (!this.app.canvas.hasImage()) {
          createToast('Please load an image first', 'warning');
          return;
        }
        
        if (this.app.recorder.isRecording) {
          this.app.recorder.stopRecording();
          this.recordBtn.classList.remove('recording');
          this.recordBtn.textContent = '🎥 Record';
        } else {
          const started = await this.app.recorder.startRecording({ duration: 10 });
          if (started) {
            this.recordBtn.classList.add('recording');
            this.recordBtn.textContent = '⏹️ Stop';
          }
        }
      });
    }
  }
  
  /**
   * Show batch export dialog
   * @private
   */
  _showBatchExportDialog() {
    const dialog = document.createElement('div');
    dialog.className = 'modal';
    dialog.innerHTML = `
      <div class="modal-content">
        <span class="modal-close">&times;</span>
        <h3>Batch Export Options</h3>
        <div class="modal-body">
          <div class="control-item">
            <label>Number of Variations</label>
            <input type="number" id="batch-count" min="1" max="50" value="10">
          </div>
          <div class="control-item">
            <label>Export Mode</label>
            <select id="batch-mode">
              <option value="params">Randomize Parameters</option>
              <option value="effects">Randomize Effects</option>
            </select>
          </div>
          <div class="control-item">
            <label>File Prefix</label>
            <input type="text" id="batch-prefix" value="glitch">
          </div>
          <div class="button-group">
            <button class="primary-btn" id="start-batch-export">Start Export</button>
            <button class="secondary-btn" id="cancel-batch-export">Cancel</button>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Event handlers
    const closeModal = () => {
      dialog.remove();
    };
    
    dialog.querySelector('.modal-close').addEventListener('click', closeModal);
    dialog.querySelector('#cancel-batch-export').addEventListener('click', closeModal);
    
    dialog.querySelector('#start-batch-export').addEventListener('click', async () => {
      const count = parseInt(dialog.querySelector('#batch-count').value);
      const mode = dialog.querySelector('#batch-mode').value;
      const prefix = dialog.querySelector('#batch-prefix').value;
      
      closeModal();
      
      await this.app.batchExporter.exportVariations({
        count,
        randomizeParams: mode === 'params',
        randomizeEffects: mode === 'effects',
        prefix
      });
    });
    
    // Click outside to close
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) {
        closeModal();
      }
    });
  }
  
  /**
   * Show keyboard shortcuts help dialog
   * @private
   */
  _showKeyboardShortcutsHelp() {
    const shortcuts = [
      { keys: 'S', action: 'Save current image' },
      { keys: 'R', action: 'Reset to original image' },
      { keys: 'C', action: 'Clear all effects' },
      { keys: 'N', action: 'New image' },
      { keys: 'P', action: 'Pause/Resume animation' },
      { keys: 'H or ?', action: 'Show this help' }
    ];
    
    const dialog = document.createElement('div');
    dialog.className = 'modal';
    dialog.innerHTML = `
      <div class="modal-content">
        <span class="modal-close">&times;</span>
        <div class="modal-body">
          <h3>Keyboard Shortcuts</h3>
          <ul>
            ${shortcuts.map(s => `<li><strong>${s.keys}</strong> - ${s.action}</li>`).join('')}
          </ul>
        </div>
      </div>
    `;
    
    document.body.appendChild(dialog);
    
    // Close handlers
    const closeModal = () => dialog.remove();
    dialog.querySelector('.modal-close').addEventListener('click', closeModal);
    dialog.addEventListener('click', (e) => {
      if (e.target === dialog) closeModal();
    });
  }
}
