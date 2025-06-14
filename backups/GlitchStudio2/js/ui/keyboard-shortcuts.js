/**
 * GlitchStudio2 - Keyboard Shortcuts Manager
 * Handles keyboard shortcuts for the application
 */

import { createToast } from './notifications.js';
import { removeStuckOverlays } from './overlay-fix.js';

class KeyboardShortcutsManager {
  constructor(app) {
    this.app = app;
    this.shortcuts = new Map();
    this.isEnabled = true;
    this.modifierKeys = {
      ctrl: false,
      shift: false,
      alt: false
    };
  }

  /**
   * Initialize keyboard shortcuts
   */
  init() {
    this._registerEventListeners();
    this._registerDefaultShortcuts();
    console.log('Keyboard shortcuts manager initialized');
  }

  /**
   * Register event listeners for keyboard events
   * @private
   */
  _registerEventListeners() {
    // Key down event
    document.addEventListener('keydown', (e) => {
      if (!this.isEnabled) return;
      
      // Track modifier keys
      if (e.key === 'Control') this.modifierKeys.ctrl = true;
      if (e.key === 'Shift') this.modifierKeys.shift = true;
      if (e.key === 'Alt') this.modifierKeys.alt = true;
      
      // Check for shortcuts
      this._handleKeyDown(e);
    });
    
    // Key up event
    document.addEventListener('keyup', (e) => {
      // Reset modifier keys
      if (e.key === 'Control') this.modifierKeys.ctrl = false;
      if (e.key === 'Shift') this.modifierKeys.shift = false;
      if (e.key === 'Alt') this.modifierKeys.alt = false;
    });
    
    // Reset modifier keys when window loses focus
    window.addEventListener('blur', () => {
      this.modifierKeys.ctrl = false;
      this.modifierKeys.shift = false;
      this.modifierKeys.alt = false;
    });
  }

  /**
   * Register default keyboard shortcuts
   * @private
   */
  _registerDefaultShortcuts() {
    // Save image - Ctrl+S
    this.registerShortcut('s', true, false, false, () => {
      this.app.takeSnapshot();
      return true; // Prevent default browser save dialog
    });
    
    // Reset image - Ctrl+R
    this.registerShortcut('r', true, false, false, () => {
      this.app.resetImage(false);
      return true; // Prevent browser refresh
    });
    
    // Full reset - Ctrl+Shift+R
    this.registerShortcut('r', true, true, false, () => {
      this.app.resetImage(true);
      return true; // Prevent browser refresh
    });
    
    // Clear effects - Ctrl+Backspace
    this.registerShortcut('Backspace', true, false, false, () => {
      this.app.clearAllEffects();
      return true;
    });
    
    // Show help - F1 or ?
    this.registerShortcut('F1', false, false, false, () => {
      this.app._showKeyboardShortcutsHelp();
      return true;
    });
    
    this.registerShortcut('?', false, false, false, () => {
      this.app._showKeyboardShortcutsHelp();
      return false; // Allow default since ? is a printable character
    });
    
    // Fix stuck overlays - Escape key
    this.registerShortcut('Escape', false, false, false, () => {
      removeStuckOverlays();
      createToast('Fixed any stuck overlays');
      return true; // Prevent default browser behavior
    });
    
    // Toggle theme - Ctrl+T
    this.registerShortcut('t', true, false, false, () => {
      if (this.app.ui && this.app.ui.themeManager) {
        this.app.ui.themeManager.toggleTheme();
      }
      return true;
    });
    
    // Save preset - Ctrl+P
    this.registerShortcut('p', true, false, false, () => {
      if (this.app.ui && this.app.ui.presetsUI) {
        this.app.ui.presetsUI._showNewPresetDialog();
      }
      return true;
    });
    
    // Show presets panel - Ctrl+Shift+P
    this.registerShortcut('p', true, true, false, () => {
      const presetsTab = document.querySelector('.tab-button[data-category="presets"]');
      if (presetsTab) {
        presetsTab.click();
      }
      return true;
    });
  }

  /**
   * Handle key down event
   * @private
   * @param {KeyboardEvent} e - Keyboard event
   */
  _handleKeyDown(e) {
    // Skip if target is an input field or textarea
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') {
      return;
    }
    
    // Create shortcut key
    const shortcutKey = e.key.toLowerCase();
    
    // Check if shortcut exists
    const shortcut = this.shortcuts.get(`${shortcutKey}_${this.modifierKeys.ctrl}_${this.modifierKeys.shift}_${this.modifierKeys.alt}`);
    
    if (shortcut) {
      const preventDefault = shortcut();
      if (preventDefault) {
        e.preventDefault();
      }
    }
  }

  /**
   * Register a keyboard shortcut
   * @param {string} key - Key to trigger the shortcut
   * @param {boolean} ctrl - Whether Ctrl key is required
   * @param {boolean} shift - Whether Shift key is required
   * @param {boolean} alt - Whether Alt key is required
   * @param {Function} callback - Function to call when shortcut is triggered
   */
  registerShortcut(key, ctrl = false, shift = false, alt = false, callback) {
    const shortcutKey = `${key.toLowerCase()}_${ctrl}_${shift}_${alt}`;
    this.shortcuts.set(shortcutKey, callback);
  }

  /**
   * Enable keyboard shortcuts
   */
  enable() {
    this.isEnabled = true;
  }

  /**
   * Disable keyboard shortcuts
   */
  disable() {
    this.isEnabled = false;
  }

  /**
   * Get all registered shortcuts
   * @returns {Array} Array of shortcut objects
   */
  getAllShortcuts() {
    const result = [];
    
    this.shortcuts.forEach((callback, key) => {
      const [keyName, ctrl, shift, alt] = key.split('_');
      
      result.push({
        key: keyName,
        ctrl: ctrl === 'true',
        shift: shift === 'true',
        alt: alt === 'true'
      });
    });
    
    return result;
  }
}

export { KeyboardShortcutsManager };
