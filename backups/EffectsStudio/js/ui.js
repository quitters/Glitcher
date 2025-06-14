// ========== UI Components and Interactions ==========

// UI Manager handles all UI-related functionality
const UIManager = {
  // Initialize all UI components
  init() {
    this.setupCategoryTabs();
    this.setupTooltips();
    this.setupDragAndDrop();
    this.setupHelpSystem();
    this.setupThemeToggle();
    this.setupFullscreenToggle();
    this.setupZoomControls();
    this.setupEffectSearch();
    this.setupContextMenu();
    this.setupResizablePanel();
    
    // Initialize UI state from localStorage if available
    this.loadUIState();
    
    console.log('Effects Studio: UI components initialized');
  },
  
  // Set up category tabs
  setupCategoryTabs() {
    const tabs = document.querySelectorAll('.tab-button');
    const groups = document.querySelectorAll('.control-group');
    
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        // Remove active class from all tabs
        tabs.forEach(t => t.classList.remove('active'));
        
        // Add active class to clicked tab
        tab.classList.add('active');
        
        // Show/hide control groups based on category
        const category = tab.dataset.category;
        groups.forEach(group => {
          if (group.dataset.category === category || group.dataset.category === 'global') {
            group.style.display = 'block';
          } else {
            group.style.display = 'none';
          }
        });
        
        // Save active tab to localStorage
        localStorage.setItem('effectsStudioActiveTab', category);
      });
    });
    
    // Set initial active tab from localStorage or default to first tab
    const savedTab = localStorage.getItem('effectsStudioActiveTab');
    if (savedTab) {
      const tab = document.querySelector(`.tab-button[data-category="${savedTab}"]`);
      if (tab) tab.click();
    } else {
      // Default to first tab
      tabs[0].click();
    }
  },
  
  // Set up tooltips
  setupTooltips() {
    const tooltipElements = document.querySelectorAll('[data-tooltip]');
    
    tooltipElements.forEach(element => {
      // Create tooltip element
      const tooltip = document.createElement('div');
      tooltip.className = 'tooltip';
      tooltip.textContent = element.dataset.tooltip;
      
      // Add events
      element.addEventListener('mouseenter', () => {
        document.body.appendChild(tooltip);
        const rect = element.getBoundingClientRect();
        
        // Position tooltip
        tooltip.style.left = `${rect.left + rect.width / 2 - tooltip.offsetWidth / 2}px`;
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 5}px`;
        
        // Show tooltip
        setTimeout(() => tooltip.classList.add('show'), 10);
      });
      
      element.addEventListener('mouseleave', () => {
        tooltip.classList.remove('show');
        setTimeout(() => {
          if (tooltip.parentNode) {
            tooltip.parentNode.removeChild(tooltip);
          }
        }, 200);
      });
    });
  },
  
  // Set up drag and drop for file upload
  setupDragAndDrop() {
    const dropArea = document.querySelector('.file-upload-area');
    const fileInput = document.getElementById('image-input');
    
    if (!dropArea || !fileInput) return;
    
    // Prevent default drag behaviors
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, preventDefaults, false);
      document.body.addEventListener(eventName, preventDefaults, false);
    });
    
    // Highlight drop area when item is dragged over it
    ['dragenter', 'dragover'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => {
        dropArea.classList.add('highlight');
      }, false);
    });
    
    // Remove highlight when item is dragged out or dropped
    ['dragleave', 'drop'].forEach(eventName => {
      dropArea.addEventListener(eventName, () => {
        dropArea.classList.remove('highlight');
      }, false);
    });
    
    // Handle dropped files
    dropArea.addEventListener('drop', (e) => {
      const dt = e.dataTransfer;
      const files = dt.files;
      
      if (files.length > 0 && files[0].type.match('image.*')) {
        fileInput.files = files;
        handleImageUpload(files[0]);
      }
    }, false);
    
    // Handle click to upload
    dropArea.addEventListener('click', () => {
      fileInput.click();
    });
    
    function preventDefaults(e) {
      e.preventDefault();
      e.stopPropagation();
    }
  },
  
  // Set up help system
  setupHelpSystem() {
    const helpBtn = document.getElementById('help-btn');
    const helpOverlay = document.getElementById('help-overlay');
    const closeHelpBtn = document.getElementById('close-help');
    
    if (!helpBtn || !helpOverlay || !closeHelpBtn) return;
    
    helpBtn.addEventListener('click', () => {
      helpOverlay.classList.remove('hidden');
    });
    
    closeHelpBtn.addEventListener('click', () => {
      helpOverlay.classList.add('hidden');
    });
    
    // Close help when clicking outside the help content
    helpOverlay.addEventListener('click', (e) => {
      if (e.target === helpOverlay) {
        helpOverlay.classList.add('hidden');
      }
    });
  },
  
  // Set up theme toggle (light/dark mode)
  setupThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    if (!themeToggle) return;
    
    // Check for saved theme preference or use system preference
    const savedTheme = localStorage.getItem('effectsStudioTheme');
    let currentTheme = savedTheme || (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light');
    
    // Set initial theme
    document.documentElement.setAttribute('data-theme', currentTheme);
    themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    
    // Toggle theme on click
    themeToggle.addEventListener('click', () => {
      currentTheme = currentTheme === 'light' ? 'dark' : 'light';
      document.documentElement.setAttribute('data-theme', currentTheme);
      localStorage.setItem('effectsStudioTheme', currentTheme);
      themeToggle.textContent = currentTheme === 'dark' ? '☀️' : '🌙';
    });
  },
  
  // Set up fullscreen toggle
  setupFullscreenToggle() {
    const fullscreenBtn = document.getElementById('fullscreen-btn');
    if (!fullscreenBtn) return;
    
    fullscreenBtn.addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen().catch(err => {
          console.error(`Error attempting to enable fullscreen: ${err.message}`);
        });
        fullscreenBtn.textContent = '⏹️';
      } else {
        if (document.exitFullscreen) {
          document.exitFullscreen();
          fullscreenBtn.textContent = '⏺️';
        }
      }
    });
    
    // Update button when fullscreen state changes
    document.addEventListener('fullscreenchange', () => {
      fullscreenBtn.textContent = document.fullscreenElement ? '⏹️' : '⏺️';
    });
  },
  
  // Set up zoom controls for canvas
  setupZoomControls() {
    const zoomInBtn = document.getElementById('zoom-in-btn');
    const zoomOutBtn = document.getElementById('zoom-out-btn');
    const zoomResetBtn = document.getElementById('zoom-reset-btn');
    const canvasArea = document.querySelector('.canvas-area');
    
    if (!zoomInBtn || !zoomOutBtn || !zoomResetBtn || !canvasArea) return;
    
    let zoomLevel = 1;
    
    zoomInBtn.addEventListener('click', () => {
      if (zoomLevel < 3) {
        zoomLevel += 0.1;
        updateZoom();
      }
    });
    
    zoomOutBtn.addEventListener('click', () => {
      if (zoomLevel > 0.3) {
        zoomLevel -= 0.1;
        updateZoom();
      }
    });
    
    zoomResetBtn.addEventListener('click', () => {
      zoomLevel = 1;
      updateZoom();
    });
    
    function updateZoom() {
      const canvas = document.getElementById('canvas');
      if (!canvas) return;
      
      canvas.style.transform = `scale(${zoomLevel})`;
      document.getElementById('zoom-level').textContent = `${Math.round(zoomLevel * 100)}%`;
    }
  },
  
  // Set up effect search functionality
  setupEffectSearch() {
    const searchInput = document.getElementById('effect-search');
    if (!searchInput) return;
    
    searchInput.addEventListener('input', () => {
      const searchTerm = searchInput.value.toLowerCase();
      const effectControls = document.querySelectorAll('.effect-control');
      
      effectControls.forEach(control => {
        const effectName = control.dataset.effect.toLowerCase();
        if (effectName.includes(searchTerm) || searchTerm === '') {
          control.style.display = 'block';
        } else {
          control.style.display = 'none';
        }
      });
    });
    
    // Clear search button
    const clearSearchBtn = document.getElementById('clear-search');
    if (clearSearchBtn) {
      clearSearchBtn.addEventListener('click', () => {
        searchInput.value = '';
        searchInput.dispatchEvent(new Event('input'));
      });
    }
  },
  
  // Set up context menu for canvas
  setupContextMenu() {
    const canvas = document.getElementById('canvas');
    const canvasArea = document.querySelector('.canvas-area');
    
    if (!canvas || !canvasArea) return;
    
    // Create context menu
    const contextMenu = document.createElement('div');
    contextMenu.className = 'context-menu';
    contextMenu.innerHTML = `
      <ul>
        <li id="ctx-save">Save Image</li>
        <li id="ctx-copy">Copy to Clipboard</li>
        <li id="ctx-reset">Reset Image</li>
        <li id="ctx-clear">Clear Effects</li>
        <li id="ctx-fullscreen">Fullscreen</li>
      </ul>
    `;
    
    // Add context menu to document
    document.body.appendChild(contextMenu);
    
    // Show context menu on right click
    canvasArea.addEventListener('contextmenu', (e) => {
      e.preventDefault();
      
      // Position menu
      contextMenu.style.top = `${e.clientY}px`;
      contextMenu.style.left = `${e.clientX}px`;
      
      // Show menu
      contextMenu.classList.add('show');
      
      // Hide menu when clicking elsewhere
      document.addEventListener('click', hideContextMenu);
    });
    
    // Handle menu item clicks
    document.getElementById('ctx-save').addEventListener('click', () => {
      takeSnapshot();
      hideContextMenu();
    });
    
    document.getElementById('ctx-copy').addEventListener('click', () => {
      copyCanvasToClipboard();
      hideContextMenu();
    });
    
    document.getElementById('ctx-reset').addEventListener('click', () => {
      resetImage();
      hideContextMenu();
    });
    
    document.getElementById('ctx-clear').addEventListener('click', () => {
      clearAllEffects();
      hideContextMenu();
    });
    
    document.getElementById('ctx-fullscreen').addEventListener('click', () => {
      if (!document.fullscreenElement) {
        document.documentElement.requestFullscreen();
      } else {
        document.exitFullscreen();
      }
      hideContextMenu();
    });
    
    function hideContextMenu() {
      contextMenu.classList.remove('show');
      document.removeEventListener('click', hideContextMenu);
    }
    
    // Copy canvas to clipboard
    function copyCanvasToClipboard() {
      canvas.toBlob(blob => {
        const item = new ClipboardItem({ 'image/png': blob });
        navigator.clipboard.write([item]).then(() => {
          showToast('Image copied to clipboard');
        }).catch(err => {
          console.error('Error copying to clipboard:', err);
          showToast('Failed to copy to clipboard', 'error');
        });
      });
    }
  },
  
  // Set up resizable panel
  setupResizablePanel() {
    const controlPanel = document.querySelector('.control-panel');
    const resizeHandle = document.createElement('div');
    resizeHandle.className = 'resize-handle';
    
    if (!controlPanel) return;
    
    // Add resize handle to control panel
    controlPanel.appendChild(resizeHandle);
    
    // Set initial width from localStorage or default
    const savedWidth = localStorage.getItem('effectsStudioPanelWidth');
    if (savedWidth) {
      controlPanel.style.width = savedWidth;
    }
    
    // Make panel resizable
    let isResizing = false;
    
    resizeHandle.addEventListener('mousedown', (e) => {
      isResizing = true;
      document.body.style.cursor = 'ew-resize';
      document.body.style.userSelect = 'none';
      e.preventDefault();
    });
    
    document.addEventListener('mousemove', (e) => {
      if (!isResizing) return;
      
      const newWidth = e.clientX;
      const minWidth = 250;
      const maxWidth = window.innerWidth * 0.5;
      
      if (newWidth >= minWidth && newWidth <= maxWidth) {
        controlPanel.style.width = `${newWidth}px`;
      }
    });
    
    document.addEventListener('mouseup', () => {
      if (isResizing) {
        isResizing = false;
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
        
        // Save width to localStorage
        localStorage.setItem('effectsStudioPanelWidth', controlPanel.style.width);
      }
    });
  },
  
  // Save UI state to localStorage
  saveUIState() {
    const state = {
      activeTab: document.querySelector('.tab-button.active')?.dataset.category,
      panelWidth: document.querySelector('.control-panel').style.width,
      theme: document.documentElement.getAttribute('data-theme')
    };
    
    localStorage.setItem('effectsStudioUIState', JSON.stringify(state));
  },
  
  // Load UI state from localStorage
  loadUIState() {
    try {
      const savedState = localStorage.getItem('effectsStudioUIState');
      if (!savedState) return;
      
      const state = JSON.parse(savedState);
      
      // Apply saved state
      if (state.theme) {
        document.documentElement.setAttribute('data-theme', state.theme);
      }
      
      if (state.panelWidth) {
        document.querySelector('.control-panel').style.width = state.panelWidth;
      }
      
      // Active tab is handled in setupCategoryTabs
    } catch (error) {
      console.error('Error loading UI state:', error);
    }
  }
};

// Create toast notification
function showToast(message, type = 'success', duration = 3000) {
  const toastContainer = document.getElementById('toast-container');
  if (!toastContainer) return;
  
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.textContent = message;
  
  toastContainer.appendChild(toast);
  
  // Show toast
  setTimeout(() => {
    toast.classList.add('show');
  }, 10);
  
  // Hide and remove toast
  setTimeout(() => {
    toast.classList.remove('show');
    setTimeout(() => {
      if (toast.parentNode === toastContainer) {
        toastContainer.removeChild(toast);
      }
    }, 300);
  }, duration);
}

// Initialize UI when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  UIManager.init();
});
