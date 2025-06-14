/**
 * GlitchStudio2 - Presets UI Manager
 * Handles UI interactions for presets
 */

import { createToast } from './notifications.js';

class PresetsUIManager {
  constructor(app) {
    this.app = app;
    this.presetsGrid = document.getElementById('presets-grid');
    this.presetsEmpty = document.getElementById('presets-empty');
    this.newPresetBtn = document.getElementById('new-preset-btn');
    this.createFirstPresetBtn = document.getElementById('create-first-preset-btn');
    this.presetsBtn = document.getElementById('presets-btn');
    this.exportPresetsBtn = document.getElementById('export-presets-btn');
    this.importPresetsBtn = document.getElementById('import-presets-btn');
    this.importFileInput = document.getElementById('import-presets-file');
  }

  /**
   * Initialize presets UI
   */
  init() {
    this._registerEventListeners();
    this.updatePresetsList();
    console.log('Presets UI manager initialized');
  }

  /**
   * Register event listeners for presets UI
   * @private
   */
  _registerEventListeners() {
    // New preset button
    if (this.newPresetBtn) {
      this.newPresetBtn.addEventListener('click', () => this._showNewPresetDialog());
    }

    // Create first preset button (in empty state)
    if (this.createFirstPresetBtn) {
      this.createFirstPresetBtn.addEventListener('click', () => this._showNewPresetDialog());
    }

    // Presets button in quick actions
    if (this.presetsBtn) {
      this.presetsBtn.addEventListener('click', () => {
        // Find and click the presets tab
        const presetsTab = document.querySelector('.tab-button[data-category="presets"]');
        if (presetsTab) {
          presetsTab.click();
        }
      });
    }
    
    // Export presets button
    if (this.exportPresetsBtn) {
      this.exportPresetsBtn.addEventListener('click', () => this._exportPresets());
    }
    
    // Import presets button
    if (this.importPresetsBtn) {
      this.importPresetsBtn.addEventListener('click', () => {
        // Trigger file input
        if (this.importFileInput) {
          this.importFileInput.click();
        } else {
          this._createImportFileInput();
        }
      });
    }
    
    // Import file input change
    if (this.importFileInput) {
      this.importFileInput.addEventListener('change', (e) => this._handleImportFile(e));
    } else {
      this._createImportFileInput();
    }
  }

  /**
   * Update the presets list in the UI
   */
  updatePresetsList() {
    const presets = this.app.presets.getAllPresets();
    
    // Clear existing presets (except the "new preset" button)
    const children = Array.from(this.presetsGrid.children);
    children.forEach(child => {
      if (!child.id || child.id !== 'new-preset-btn') {
        this.presetsGrid.removeChild(child);
      }
    });
    
    // Show empty state if no presets
    if (presets.length === 0) {
      if (this.presetsEmpty) {
        this.presetsEmpty.style.display = 'block';
      }
      return;
    }
    
    // Hide empty state if we have presets
    if (this.presetsEmpty) {
      this.presetsEmpty.style.display = 'none';
    }
    
    // Add presets to the grid
    presets.forEach(preset => {
      const presetCard = this._createPresetCard(preset);
      
      // Insert before the "new preset" button
      if (this.newPresetBtn && this.newPresetBtn.parentNode === this.presetsGrid) {
        this.presetsGrid.insertBefore(presetCard, this.newPresetBtn);
      } else {
        this.presetsGrid.appendChild(presetCard);
      }
    });
  }

  /**
   * Create a preset card element
   * @private
   * @param {Object} preset - Preset object
   * @returns {HTMLElement} Preset card element
   */
  _createPresetCard(preset) {
    const card = document.createElement('div');
    card.className = 'preset-card';
    card.dataset.presetId = preset.id;
    
    // Thumbnail
    const thumbnail = document.createElement('div');
    thumbnail.className = 'preset-thumbnail';
    if (preset.thumbnail) {
      thumbnail.style.backgroundImage = `url(${preset.thumbnail})`;
    } else {
      thumbnail.classList.add('empty');
      thumbnail.innerHTML = '🖼️';
    }
    
    // Info
    const info = document.createElement('div');
    info.className = 'preset-info';
    
    const name = document.createElement('h4');
    name.className = 'preset-name';
    name.textContent = preset.name;
    
    const effects = document.createElement('p');
    effects.className = 'preset-effects';
    effects.textContent = `${preset.effectChain.length} effect${preset.effectChain.length !== 1 ? 's' : ''}`;
    
    info.appendChild(name);
    info.appendChild(effects);
    
    // Actions
    const actions = document.createElement('div');
    actions.className = 'preset-actions';
    
    const deleteBtn = document.createElement('div');
    deleteBtn.className = 'preset-action-btn delete';
    deleteBtn.innerHTML = '🗑️';
    deleteBtn.title = 'Delete preset';
    deleteBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      this._confirmDeletePreset(preset.id, preset.name);
    });
    
    actions.appendChild(deleteBtn);
    
    // Add all elements to card
    card.appendChild(thumbnail);
    card.appendChild(info);
    card.appendChild(actions);
    
    // Click event to load preset
    card.addEventListener('click', () => {
      this.app.loadPreset(preset.id);
    });
    
    return card;
  }

  /**
   * Show dialog to create a new preset
   * @private
   */
  _showNewPresetDialog() {
    // Check if there are effects to save
    const activeEffects = this.app.state.getActiveEffects();
    if (activeEffects.length === 0) {
      createToast('Add some effects before saving a preset', 'warning');
      return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'preset-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    
    const modalTitle = document.createElement('h3');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = 'Save Preset';
    
    const closeBtn = document.createElement('span');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeBtn);
    
    // Modal body
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    
    const form = document.createElement('div');
    form.className = 'preset-form';
    
    const formGroup = document.createElement('div');
    formGroup.className = 'preset-form-group';
    
    const label = document.createElement('label');
    label.className = 'preset-form-label';
    label.textContent = 'Preset Name';
    label.htmlFor = 'preset-name-input';
    
    const input = document.createElement('input');
    input.className = 'preset-form-input';
    input.id = 'preset-name-input';
    input.type = 'text';
    input.placeholder = 'Enter a name for your preset';
    input.value = `Preset ${new Date().toLocaleDateString()}`;
    
    formGroup.appendChild(label);
    formGroup.appendChild(input);
    
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'preset-form-buttons';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'control-button';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    const saveBtn = document.createElement('button');
    saveBtn.className = 'control-button accent-button';
    saveBtn.textContent = 'Save Preset';
    saveBtn.addEventListener('click', () => {
      const name = input.value.trim();
      if (!name) {
        input.focus();
        return;
      }
      
      this.app.savePreset(name);
      this.updatePresetsList();
      document.body.removeChild(modal);
    });
    
    buttonGroup.appendChild(cancelBtn);
    buttonGroup.appendChild(saveBtn);
    
    form.appendChild(formGroup);
    form.appendChild(buttonGroup);
    modalBody.appendChild(form);
    
    // Add all elements to modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modal.appendChild(modalContent);
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Focus input
    setTimeout(() => {
      input.focus();
      input.select();
    }, 100);
    
    // Close when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }

  /**
   * Create import file input if it doesn't exist
   * @private
   */
  _createImportFileInput() {
    // Create hidden file input if it doesn't exist
    if (!this.importFileInput) {
      const input = document.createElement('input');
      input.type = 'file';
      input.id = 'import-presets-file';
      input.accept = '.json';
      input.style.display = 'none';
      input.addEventListener('change', (e) => this._handleImportFile(e));
      
      document.body.appendChild(input);
      this.importFileInput = input;
    }
  }
  
  /**
   * Handle import file selection
   * @private
   * @param {Event} event - File input change event
   */
  _handleImportFile(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const importData = JSON.parse(e.target.result);
        this._showImportConfirmDialog(importData);
      } catch (error) {
        console.error('Error parsing import file:', error);
        createToast('Invalid preset file format', 'error');
      }
    };
    
    reader.onerror = () => {
      createToast('Error reading file', 'error');
    };
    
    reader.readAsText(file);
    
    // Reset file input so the same file can be selected again
    event.target.value = '';
  }
  
  /**
   * Show confirmation dialog for importing presets
   * @private
   * @param {Object} importData - Import data object
   */
  _showImportConfirmDialog(importData) {
    if (!importData || !importData.presets || !Array.isArray(importData.presets) || importData.presets.length === 0) {
      createToast('No presets found in file', 'warning');
      return;
    }
    
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    modal.id = 'import-modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    
    const modalTitle = document.createElement('h3');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = 'Import Presets';
    
    const closeBtn = document.createElement('span');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeBtn);
    
    // Modal body
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    
    const message = document.createElement('p');
    message.textContent = `Import ${importData.presets.length} presets?`;
    
    const importOptions = document.createElement('div');
    importOptions.className = 'import-options';
    
    const mergeOption = document.createElement('div');
    mergeOption.className = 'import-option';
    
    const mergeRadio = document.createElement('input');
    mergeRadio.type = 'radio';
    mergeRadio.id = 'merge-option';
    mergeRadio.name = 'import-option';
    mergeRadio.checked = true;
    
    const mergeLabel = document.createElement('label');
    mergeLabel.htmlFor = 'merge-option';
    mergeLabel.textContent = 'Merge with existing presets';
    
    mergeOption.appendChild(mergeRadio);
    mergeOption.appendChild(mergeLabel);
    
    const replaceOption = document.createElement('div');
    replaceOption.className = 'import-option';
    
    const replaceRadio = document.createElement('input');
    replaceRadio.type = 'radio';
    replaceRadio.id = 'replace-option';
    replaceRadio.name = 'import-option';
    
    const replaceLabel = document.createElement('label');
    replaceLabel.htmlFor = 'replace-option';
    replaceLabel.textContent = 'Replace all existing presets';
    
    replaceOption.appendChild(replaceRadio);
    replaceOption.appendChild(replaceLabel);
    
    importOptions.appendChild(mergeOption);
    importOptions.appendChild(replaceOption);
    
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'preset-form-buttons';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'control-button';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    const importBtn = document.createElement('button');
    importBtn.className = 'control-button accent-button';
    importBtn.textContent = 'Import';
    importBtn.addEventListener('click', () => {
      const replace = replaceRadio.checked;
      const result = this.app.presets.importPresets(importData, replace);
      
      if (result.success) {
        createToast(`Imported ${result.imported} presets successfully`, 'success');
        this.updatePresetsList();
      } else {
        createToast(`Import failed: ${result.error}`, 'error');
      }
      
      document.body.removeChild(modal);
    });
    
    buttonGroup.appendChild(cancelBtn);
    buttonGroup.appendChild(importBtn);
    
    modalBody.appendChild(message);
    modalBody.appendChild(importOptions);
    modalBody.appendChild(buttonGroup);
    
    // Add all elements to modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modal.appendChild(modalContent);
    
    document.body.appendChild(modal);
  }
  
  /**
   * Export presets to a file
   * @private
   */
  _exportPresets() {
    const presets = this.app.presets.getAllPresets();
    
    if (presets.length === 0) {
      createToast('No presets to export', 'warning');
      return;
    }
    
    this.app.presets.downloadPresetsFile();
    createToast(`Exported ${presets.length} presets successfully`, 'success');
  }
  
  /**
   * Show confirmation dialog for deleting a preset
   * @private
   * @param {string} presetId - Preset ID
   * @param {string} presetName - Preset name
   */
  _confirmDeletePreset(presetId, presetName) {
    // Create modal
    const modal = document.createElement('div');
    modal.className = 'modal';
    
    const modalContent = document.createElement('div');
    modalContent.className = 'modal-content';
    
    // Modal header
    const modalHeader = document.createElement('div');
    modalHeader.className = 'modal-header';
    
    const modalTitle = document.createElement('h3');
    modalTitle.className = 'modal-title';
    modalTitle.textContent = 'Delete Preset';
    
    const closeBtn = document.createElement('span');
    closeBtn.className = 'modal-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    modalHeader.appendChild(modalTitle);
    modalHeader.appendChild(closeBtn);
    
    // Modal body
    const modalBody = document.createElement('div');
    modalBody.className = 'modal-body';
    
    const message = document.createElement('p');
    message.textContent = `Are you sure you want to delete the preset "${presetName}"?`;
    message.style.marginBottom = '20px';
    
    const buttonGroup = document.createElement('div');
    buttonGroup.className = 'preset-form-buttons';
    
    const cancelBtn = document.createElement('button');
    cancelBtn.className = 'control-button';
    cancelBtn.textContent = 'Cancel';
    cancelBtn.addEventListener('click', () => {
      document.body.removeChild(modal);
    });
    
    const deleteBtn = document.createElement('button');
    deleteBtn.className = 'control-button danger-button';
    deleteBtn.textContent = 'Delete';
    deleteBtn.addEventListener('click', () => {
      this.app.deletePreset(presetId);
      this.updatePresetsList();
      document.body.removeChild(modal);
    });
    
    buttonGroup.appendChild(cancelBtn);
    buttonGroup.appendChild(deleteBtn);
    
    modalBody.appendChild(message);
    modalBody.appendChild(buttonGroup);
    
    // Add all elements to modal
    modalContent.appendChild(modalHeader);
    modalContent.appendChild(modalBody);
    modal.appendChild(modalContent);
    
    // Add modal to body
    document.body.appendChild(modal);
    
    // Close when clicking outside
    modal.addEventListener('click', (e) => {
      if (e.target === modal) {
        document.body.removeChild(modal);
      }
    });
  }
}

export { PresetsUIManager };
