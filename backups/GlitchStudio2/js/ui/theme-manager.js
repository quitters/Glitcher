/**
 * GlitchStudio2 - Theme Manager
 * Handles theme switching between light and dark mode
 */

class ThemeManager {
  constructor() {
    this.storageKey = 'glitchstudio_theme';
    this.themeToggleBtn = document.getElementById('theme-toggle-btn');
    this.isDarkMode = false;
  }

  /**
   * Initialize theme manager
   */
  init() {
    this._loadThemePreference();
    this._registerEventListeners();
    console.log('Theme manager initialized');
  }

  /**
   * Register event listeners for theme toggle
   * @private
   */
  _registerEventListeners() {
    if (this.themeToggleBtn) {
      this.themeToggleBtn.addEventListener('click', () => {
        this.toggleTheme();
      });
    }
  }

  /**
   * Load theme preference from local storage
   * @private
   */
  _loadThemePreference() {
    try {
      const savedTheme = localStorage.getItem(this.storageKey);
      if (savedTheme === 'dark') {
        this.enableDarkMode();
      } else {
        this.enableLightMode();
      }
    } catch (error) {
      console.error('Failed to load theme preference:', error);
      // Default to light mode
      this.enableLightMode();
    }
  }

  /**
   * Save theme preference to local storage
   * @private
   * @param {string} theme - Theme name ('light' or 'dark')
   */
  _saveThemePreference(theme) {
    try {
      localStorage.setItem(this.storageKey, theme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  }

  /**
   * Toggle between light and dark mode
   */
  toggleTheme() {
    if (this.isDarkMode) {
      this.enableLightMode();
    } else {
      this.enableDarkMode();
    }
  }

  /**
   * Update the theme toggle button icon and tooltip
   * @private
   */
  _updateThemeToggleButton() {
    const button = document.getElementById('theme-toggle-btn');
    if (!button) return;
    
    if (this.isDarkMode) {
      button.title = 'Switch to light mode (Ctrl+T)';
      button.innerHTML = '☀️ Light Mode';
    } else {
      button.title = 'Switch to dark mode (Ctrl+T)';
      button.innerHTML = '🌙 Dark Mode';
    }
  }

  /**
   * Enable dark mode
   */
  enableDarkMode() {
    document.body.classList.add('dark-mode');
    this.isDarkMode = true;
    this._saveThemePreference('dark');
    this._updateThemeToggleButton();
    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: 'dark' } }));
  }

  /**
   * Enable light mode
   */
  enableLightMode() {
    document.body.classList.remove('dark-mode');
    this.isDarkMode = false;
    this._saveThemePreference('light');
    this._updateThemeToggleButton();
    
    // Dispatch theme change event
    window.dispatchEvent(new CustomEvent('themechange', { detail: { theme: 'light' } }));
  }

  /**
   * Check if dark mode is enabled
   * @returns {boolean} True if dark mode is enabled
   */
  isDarkModeEnabled() {
    return this.isDarkMode;
  }
}

export { ThemeManager };
