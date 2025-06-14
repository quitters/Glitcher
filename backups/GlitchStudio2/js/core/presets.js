/**
 * GlitchStudio2 - Presets Manager
 * Manages saving, loading, updating, and deleting effect presets
 */

class PresetsManager {
  constructor() {
    this.storageKey = 'glitchstudio_presets';
    this.presets = [];
    this.currentPresetId = null;
    this.version = '1.0.0'; // Used for import/export compatibility
  }

  /**
   * Initialize the presets manager
   */
  init() {
    this.loadFromStorage();
    console.log('Presets manager initialized');
  }

  /**
   * Load presets from local storage
   */
  loadFromStorage() {
    try {
      const savedPresets = localStorage.getItem(this.storageKey);
      if (savedPresets) {
        this.presets = JSON.parse(savedPresets);
      }
    } catch (error) {
      console.error('Failed to load presets from storage:', error);
      this.presets = [];
    }
  }

  /**
   * Save presets to local storage
   */
  saveToStorage() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.presets));
    } catch (error) {
      console.error('Failed to save presets to storage:', error);
    }
  }

  /**
   * Get all presets
   * @returns {Array} List of presets
   */
  getAllPresets() {
    return [...this.presets];
  }

  /**
   * Get preset by ID
   * @param {string} id - Preset ID
   * @returns {Object|null} Preset object or null if not found
   */
  getPresetById(id) {
    return this.presets.find(preset => preset.id === id) || null;
  }

  /**
   * Save current effect chain as a preset
   * @param {string} name - Preset name
   * @param {Array} effectChain - Array of effect objects
   * @param {string} thumbnailDataUrl - Thumbnail image as data URL
   * @returns {string} ID of the new preset
   */
  savePreset(name, effectChain, thumbnailDataUrl = null) {
    const id = this._generateId();
    const timestamp = Date.now();
    
    const preset = {
      id,
      name,
      effectChain: JSON.parse(JSON.stringify(effectChain)), // Deep copy
      thumbnail: thumbnailDataUrl,
      created: timestamp,
      modified: timestamp
    };
    
    this.presets.push(preset);
    this.saveToStorage();
    
    return id;
  }

  /**
   * Update an existing preset
   * @param {string} id - Preset ID
   * @param {Object} updates - Properties to update
   * @returns {boolean} True if updated successfully
   */
  updatePreset(id, updates) {
    const index = this.presets.findIndex(preset => preset.id === id);
    
    if (index === -1) return false;
    
    this.presets[index] = {
      ...this.presets[index],
      ...updates,
      modified: Date.now()
    };
    
    this.saveToStorage();
    return true;
  }

  /**
   * Delete a preset
   * @param {string} id - Preset ID
   * @returns {boolean} True if deleted successfully
   */
  deletePreset(id) {
    const initialLength = this.presets.length;
    this.presets = this.presets.filter(preset => preset.id !== id);
    
    if (this.presets.length !== initialLength) {
      this.saveToStorage();
      return true;
    }
    
    return false;
  }

  /**
   * Generate a unique ID for a preset
   * @private
   * @returns {string} Unique ID
   */
  _generateId() {
    return 'preset_' + Math.random().toString(36).substr(2, 9) + '_' + Date.now();
  }
  
  /**
   * Export all presets to a JSON file
   * @returns {Object} Export data object
   */
  exportPresets() {
    const exportData = {
      version: this.version,
      timestamp: Date.now(),
      presets: this.presets
    };
    
    return exportData;
  }
  
  /**
   * Generate a downloadable JSON file with all presets
   */
  downloadPresetsFile() {
    const exportData = this.exportPresets();
    const dataStr = JSON.stringify(exportData, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
    
    const exportFileName = `glitchstudio_presets_${new Date().toISOString().slice(0, 10)}.json`;
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileName);
    linkElement.style.display = 'none';
    document.body.appendChild(linkElement);
    linkElement.click();
    document.body.removeChild(linkElement);
    
    return exportData;
  }
  
  /**
   * Import presets from a JSON object
   * @param {Object} importData - Import data object
   * @param {boolean} replace - Whether to replace existing presets
   * @returns {Object} Result with success status and counts
   */
  importPresets(importData, replace = false) {
    if (!importData || !importData.presets || !Array.isArray(importData.presets)) {
      return { success: false, error: 'Invalid import data format' };
    }
    
    try {
      // Check version compatibility
      if (importData.version && importData.version !== this.version) {
        console.warn(`Importing presets from different version: ${importData.version}`);
      }
      
      let importedCount = 0;
      let skippedCount = 0;
      
      if (replace) {
        // Replace all presets
        this.presets = [...importData.presets];
        importedCount = importData.presets.length;
      } else {
        // Merge with existing presets
        importData.presets.forEach(importedPreset => {
          // Check if preset with same ID already exists
          const existingIndex = this.presets.findIndex(p => p.id === importedPreset.id);
          
          if (existingIndex >= 0) {
            // Skip or update existing preset
            skippedCount++;
          } else {
            // Add new preset
            this.presets.push(importedPreset);
            importedCount++;
          }
        });
      }
      
      // Save to storage
      this.saveToStorage();
      
      return {
        success: true,
        imported: importedCount,
        skipped: skippedCount,
        total: importData.presets.length
      };
    } catch (error) {
      console.error('Error importing presets:', error);
      return { success: false, error: error.message };
    }
  }
}

export { PresetsManager };
