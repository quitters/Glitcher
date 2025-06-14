/**
 * Application State Manager
 * Manages application state and persistence
 */

class AppState {
  constructor() {
    this.currentCategory = 'all';
    this.isDarkMode = true;
    this.isAutoSaveEnabled = true;
    this.lastSaveTime = null;
    this.activeEffects = [];
    this.nextEffectId = 1;
    
    // Load saved state from localStorage
    this._loadState();
  }
  
  /**
   * Switch to a different effect category
   * @param {string} category - Category name
   */
  switchCategory(category) {
    this.currentCategory = category;
    this._saveState();
    return this.currentCategory;
  }
  
  /**
   * Get current category
   * @returns {string} Current category
   */
  getCurrentCategory() {
    return this.currentCategory;
  }
  
  /**
   * Toggle dark/light mode
   * @returns {boolean} New dark mode state
   */
  toggleDarkMode() {
    this.isDarkMode = !this.isDarkMode;
    this._saveState();
    return this.isDarkMode;
  }
  
  /**
   * Toggle auto-save feature
   * @returns {boolean} New auto-save state
   */
  toggleAutoSave() {
    this.isAutoSaveEnabled = !this.isAutoSaveEnabled;
    this._saveState();
    return this.isAutoSaveEnabled;
  }
  
  /**
   * Save current application state
   * @param {Object} data - State data to save
   */
  saveState(data) {
    if (!this.isAutoSaveEnabled) return;
    
    const stateData = {
      timestamp: new Date().toISOString(),
      ...data
    };
    
    localStorage.setItem('glitchStudio_appState', JSON.stringify(stateData));
    this.lastSaveTime = new Date();
  }
  
  /**
   * Load saved application state
   * @returns {Object|null} Saved state or null
   */
  loadSavedState() {
    try {
      const savedState = localStorage.getItem('glitchStudio_appState');
      return savedState ? JSON.parse(savedState) : null;
    } catch (err) {
      console.error('Error loading saved state:', err);
      return null;
    }
  }
  
  /**
   * Clear saved application state
   */
  clearSavedState() {
    localStorage.removeItem('glitchStudio_appState');
  }
  
  /**
   * Load state from localStorage
   * @private
   */
  _loadState() {
    try {
      const settings = localStorage.getItem('glitchStudio_settings');
      if (settings) {
        const { currentCategory, isDarkMode, isAutoSaveEnabled } = JSON.parse(settings);
        
        if (currentCategory) this.currentCategory = currentCategory;
        if (typeof isDarkMode !== 'undefined') this.isDarkMode = isDarkMode;
        if (typeof isAutoSaveEnabled !== 'undefined') this.isAutoSaveEnabled = isAutoSaveEnabled;
      }
    } catch (err) {
      console.error('Error loading settings:', err);
    }
  }
  
  /**
   * Save state to localStorage
   * @private
   */
  _saveState() {
    try {
      const settings = {
        currentCategory: this.currentCategory,
        isDarkMode: this.isDarkMode,
        isAutoSaveEnabled: this.isAutoSaveEnabled
      };
      
      localStorage.setItem('glitchStudio_settings', JSON.stringify(settings));
    } catch (err) {
      console.error('Error saving settings:', err);
    }
  }
  
  /**
   * Add an effect to the active effects list
   * @param {Object} effect - Effect object
   * @returns {Object} Effect with assigned ID
   */
  addEffect(effect) {
    // Create a copy of the effect with a unique ID
    const effectWithId = {
      ...effect,
      id: `effect_${this.nextEffectId++}`
    };
    
    this.activeEffects.push(effectWithId);
    return effectWithId;
  }
  
  /**
   * Remove an effect from the active effects list
   * @param {string} effectId - Effect ID
   * @returns {boolean} True if effect was removed
   */
  removeEffect(effectId) {
    const initialLength = this.activeEffects.length;
    this.activeEffects = this.activeEffects.filter(effect => effect.id !== effectId);
    return this.activeEffects.length !== initialLength;
  }
  
  /**
   * Get all active effects
   * @returns {Array} List of active effects
   */
  getActiveEffects() {
    return [...this.activeEffects];
  }
  
  /**
   * Clear all active effects
   */
  clearAllEffects() {
    this.activeEffects = [];
  }
  
  /**
   * Update effect parameters
   * @param {string} effectId - Effect ID
   * @param {Object} params - New parameters
   * @returns {boolean} True if effect was updated
   */
  updateEffectParams(effectId, params) {
    const effect = this.activeEffects.find(e => e.id === effectId);
    if (!effect) return false;
    
    // Update parameters
    effect.params = { ...effect.params, ...params };
    return true;
  }
}

export { AppState };
