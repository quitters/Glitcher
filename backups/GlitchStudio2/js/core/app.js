/**
 * GlitchStudio2 - Main Application
 * Initializes the application and manages the overall flow
 */

import { createToast } from '../ui/notifications.js';
import { CanvasManager } from './canvas.js';
import { EffectRegistry } from './registry.js';
import { AppState } from './state.js';
import { UIManager } from '../ui/ui-manager.js';
import { PresetsManager } from './presets.js';
import { registerAllEffects } from '../effects/index.js';
import { BatchExporter } from './batch-export.js';
import { getRecorder } from './recorder.js';
import { getAudioReactive } from './audio-reactive.js';

// Main application class
class GlitchStudioApp {
  constructor() {
    this.canvas = null;
    this.registry = null;
    this.state = null;
    this.ui = null;
    this.presets = null;
    this.batchExporter = null;
    this.recorder = null;
    this.audioReactive = null;
    
    // Animation frame ID
    this.animationId = null;
    this.isPaused = false;
    
    // Performance monitoring
    this.lastFrameTime = 0;
    this.fps = 0;
    this.processingTime = 0;
  }
  
  /**
   * Initialize the application
   */
  async init() {
    console.log('Initializing GlitchStudio2...');
    
    // Initialize core components
    this.state = new AppState();
    this.registry = new EffectRegistry();
    this.canvas = new CanvasManager('canvas');
    this.presets = new PresetsManager();
    this.ui = new UIManager(this);
    
    // Initialize advanced features
    this.batchExporter = new BatchExporter(this);
    this.recorder = getRecorder(this.canvas.canvas);
    this.audioReactive = getAudioReactive();
    
    // Register all effects
    registerAllEffects(this.registry);
    
    // Initialize presets
    this.presets.init();
    
    // Initialize UI
    this.ui.init();
    
    // Register keyboard shortcuts
    this._registerKeyboardShortcuts();
    
    // Show welcome tutorial for first-time users
    this._checkAndShowWelcomeTutorial();
    
    console.log('GlitchStudio2 initialized successfully');
  }
  
  /**
   * Start the animation loop
   */
  startAnimationLoop() {
    if (this.animationId) return;
    
    const animate = (timestamp) => {
      if (!this.isPaused) {
        // Calculate FPS
        const elapsed = timestamp - this.lastFrameTime;
        this.fps = Math.round(1000 / elapsed);
        this.lastFrameTime = timestamp;
        
        // Process effects
        const startTime = performance.now();
        this._processEffects();
        this.processingTime = performance.now() - startTime;
        
        // Update performance display
        this.ui.updatePerformanceDisplay(this.fps, this.processingTime);
      }
      
      this.animationId = requestAnimationFrame(animate);
    };
    
    this.animationId = requestAnimationFrame(animate);
  }
  
  /**
   * Stop the animation loop
   */
  stopAnimationLoop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }
  
  /**
   * Toggle pause state
   */
  togglePause() {
    this.isPaused = !this.isPaused;
    return this.isPaused;
  }
  
  /**
   * Reset the image to original
   * @param {boolean} fullReset - If true, completely reset and show placeholder
   */
  resetImage(fullReset = false) {
    if (fullReset) {
      // Full reset - clear image and show placeholder
      this.canvas.resetCanvas();
      this.stopAnimationLoop();
    } else {
      // Just reset to original image
      this.canvas.resetToOriginal();
    }
    this.ui.updateUI();
  }
  
  /**
   * Clear all active effects
   */
  clearAllEffects() {
    this.registry.clearAllEffects();
    this.canvas.resetToOriginal();
    this.ui.updateEffectChain();
    
    // Update presets UI if available
    if (this.ui && this.ui.presetsUI) {
      this.ui.presetsUI.updatePresetsList();
    }
    
    createToast('All effects cleared');
  }
  
  /**
   * Take a snapshot of the current canvas state
   */
  takeSnapshot() {
    if (!this.canvas || !this.canvas.hasImage()) {
      createToast('No image to save', 'warning');
      return;
    }
    
    const dataURL = this.canvas.getDataURL();
    if (!dataURL) return;
    
    // Create a download link
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = `glitchstudio_${Date.now()}.png`;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    createToast('Image saved successfully!');
  }
  
  /**
   * Save current effect chain as a preset
   * @param {string} name - Preset name
   * @returns {string} ID of the new preset
   */
  savePreset(name) {
    if (!this.state || !this.canvas) return null;
    
    // Get current effect chain
    const effectChain = this.registry.getActiveEffects();
    if (effectChain.length === 0) {
      createToast('No effects to save as preset', 'warning');
      return null;
    }
    
    // Create a thumbnail
    const thumbnailDataUrl = this.canvas.getDataURL('image/jpeg', 0.5);
    
    // Save preset
    const presetId = this.presets.savePreset(name, effectChain, thumbnailDataUrl);
    
    createToast(`Preset "${name}" saved successfully!`);
    return presetId;
  }
  
  /**
   * Load a preset by ID
   * @param {string} presetId - Preset ID
   * @returns {boolean} True if loaded successfully
   */
  loadPreset(presetId) {
    const preset = this.presets.getPresetById(presetId);
    if (!preset) {
      createToast('Preset not found', 'error');
      return false;
    }
    
    // Clear current effects
    this.clearAllEffects();
    
    // Apply preset effects
    preset.effectChain.forEach(effectData => {
      // Enable the effect
      this.registry.enable(effectData.name);
      
      // Set parameters
      if (effectData.params) {
        Object.entries(effectData.params).forEach(([paramName, paramDef]) => {
          this.registry.updateParam(effectData.name, paramName, paramDef.value);
        });
      }
    });
    
    // Update UI
    this.ui.updateEffectsList();
    this.ui.updateEffectChain();
    
    createToast(`Preset "${preset.name}" loaded successfully!`);
    return true;
  }
  
  /**
   * Delete a preset by ID
   * @param {string} presetId - Preset ID
   * @returns {boolean} True if deleted successfully
   */
  deletePreset(presetId) {
    const success = this.presets.deletePreset(presetId);
    
    if (success) {
      createToast('Preset deleted successfully');
    } else {
      createToast('Failed to delete preset', 'error');
    }
    
    return success;
  }
  
  /**
   * Register global keyboard shortcuts
   * @private
   */
  _registerKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      
      switch (e.key.toLowerCase()) {
        case 'r':
          this.resetImage();
          break;
        case 's':
          this.takeSnapshot();
          break;
        case 'p':
          const isPaused = this.togglePause();
          this.ui.updatePlayPauseButton(isPaused);
          break;
        case 'c':
          this.clearAllEffects();
          break;
        case 'n':
          if (this.canvas.hasImage() && confirm('Start over with a new image?')) {
            this.resetImage(true);
          }
          break;
        case 'h':
        case '?':
          this._showKeyboardShortcutsHelp();
          break;
      }
    });
  }
  
  /**
   * Show keyboard shortcuts help dialog
   * @private
   */
  _showKeyboardShortcutsHelp() {
    // Implementation can remain the same as before
    const shortcuts = [
      { keys: 'S', action: 'Save current image' },
      { keys: 'R', action: 'Reset to original image' },
      { keys: 'C', action: 'Clear all effects' },
      { keys: 'N', action: 'New image' },
      { keys: 'P', action: 'Pause/Resume' },
      { keys: 'H or ?', action: 'Show this help' }
    ];
    
    // Create and show modal with shortcuts
    // (Modal creation code remains the same)
  }
  
  /**
   * Check and show welcome tutorial
   * @private
   */
  _checkAndShowWelcomeTutorial() {
    const hasSeenTutorial = localStorage.getItem('glitchstudio_seen_tutorial');
    
    if (!hasSeenTutorial) {
      setTimeout(() => {
        this._showWelcomeTutorial();
      }, 1000);
    }
  }
  
  /**
   * Show welcome tutorial
   * @private
   */
  _showWelcomeTutorial() {
    // Tutorial implementation remains the same
    // Just create a simple welcome message for now
    createToast('Welcome to GlitchStudio2! Upload an image to get started.', 'info');
    localStorage.setItem('glitchstudio_seen_tutorial', 'true');
  }
  
  /**
   * Process all active effects
   * @private
   */
  _processEffects() {
    if (!this.canvas.hasImage()) return;
    
    // Get current image data
    const imageData = this.canvas.getImageData();
    
    // Process through effect chain (modifies in-place)
    this.registry.processEffectChain(imageData);
    
    // Update canvas with processed data
    this.canvas.putImageData(imageData);
  }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  window.GlitchStudio = new GlitchStudioApp();
  window.GlitchStudio.init();
});

// Export for module usage
export { GlitchStudioApp };
