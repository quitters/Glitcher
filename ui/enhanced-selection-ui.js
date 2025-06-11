/**
 * Enhanced Selection UI - Complete Working Version
 * Provides improved UX with notifications, keyboard shortcuts, and visual feedback
 */

export class EnhancedSelectionUI {
  constructor(selectionManager, canvasInteraction) {
    this.selectionManager = selectionManager;
    this.canvasInteraction = canvasInteraction;
    
    // UI state
    this.currentSelectionMethod = 'random';
    this.selectionSensitivity = 1.0;
    this.isPreviewEnabled = false;
    this.toolButtons = [];
    
    // Enhanced features
    this.notifications = [];
    this.maxNotifications = 3;
    
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.setupKeyboardShortcuts();
    this.setupEnhancedUI();
    
    console.log('✨ Enhanced Selection UI initialized');
    this.showNotification('Enhanced selection system loaded! Use Ctrl+R/B/W/L for quick tool access', 'success', 4000);
  }

  setupEventListeners() {
    // Manual mode toggle
    const manualModeCheckbox = document.getElementById('manual-selection-mode');
    if (manualModeCheckbox) {
      manualModeCheckbox.addEventListener('change', (e) => {
        this.handleManualModeToggle(e.target.checked);
      });
    }

    // Selection method
    const selectionMethodSelect = document.getElementById('selection-method');
    if (selectionMethodSelect) {
      selectionMethodSelect.addEventListener('change', (e) => {
        this.handleSelectionMethodChange(e.target.value);
      });
    }

    // Preview toggle
    const previewCheckbox = document.getElementById('selection-preview-checkbox');
    if (previewCheckbox) {
      previewCheckbox.addEventListener('change', (e) => {
        this.handlePreviewToggle(e.target.checked);
      });
    }

    // Sensitivity slider
    const sensitivityRange = document.getElementById('selection-sensitivity');
    if (sensitivityRange) {
      sensitivityRange.addEventListener('input', (e) => {
        this.handleSensitivityChange(parseFloat(e.target.value));
      });
    }

    // Tool buttons
    this.setupToolButtons();

    // Action buttons
    const clearBtn = document.getElementById('clear-selections');
    if (clearBtn) {
      clearBtn.addEventListener('click', () => this.handleClearSelections());
    }

    const invertBtn = document.getElementById('invert-selection');
    if (invertBtn) {
      invertBtn.addEventListener('click', () => this.handleInvertSelection());
    }

    // Brush size
    const brushSizeRange = document.getElementById('brush-size');
    if (brushSizeRange) {
      brushSizeRange.addEventListener('input', (e) => {
        this.handleBrushSizeChange(parseInt(e.target.value));
      });
    }
  }

  setupToolButtons() {
    const toolSelectors = ['#select-tool', '#brush-tool', '#wand-tool', '#lasso-tool'];
    
    this.toolButtons = toolSelectors.map(selector => {
      const button = document.querySelector(selector);
      if (button) {
        button.addEventListener('click', (e) => {
          const tool = button.getAttribute('data-tool');
          this.handleToolSelection(tool, button);
        });
        
        // Add enhanced styling
        button.style.transition = 'all 0.3s ease';
      }
      return button;
    }).filter(Boolean);
  }

  setupKeyboardShortcuts() {
    document.addEventListener('keydown', (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;
      
      const isCtrl = e.ctrlKey || e.metaKey;
      
      switch (e.key.toLowerCase()) {
        case 'r':
          if (isCtrl) {
            e.preventDefault();
            this.selectTool('select');
          }
          break;
        case 'b':
          if (isCtrl) {
            e.preventDefault();
            this.selectTool('brush');
          }
          break;
        case 'w':
          if (isCtrl) {
            e.preventDefault();
            this.selectTool('wand');
          }
          break;
        case 'l':
          if (isCtrl) {
            e.preventDefault();
            this.selectTool('lasso');
          }
          break;
        case 'escape':
          this.selectTool('none');
          break;
        case 'delete':
        case 'backspace':
          if (this.selectionManager.getSelectionMask()) {
            e.preventDefault();
            this.handleClearSelections();
          }
          break;
        case 'i':
          if (isCtrl) {
            e.preventDefault();
            this.handleInvertSelection();
          }
          break;
        case 'p':
          if (isCtrl) {
            e.preventDefault();
            this.togglePreview();
          }
          break;
      }
    });
  }

  setupEnhancedUI() {
    // Create mode indicator
    this.createModeIndicator();
    
    // Setup right-click context menu
    const canvas = this.canvasInteraction.canvasManager.canvas;
    if (canvas) {
      canvas.addEventListener('contextmenu', (e) => {
        e.preventDefault();
        this.showQuickActions(e.clientX, e.clientY);
      });
    }
  }

  createModeIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'selection-mode-indicator';
    indicator.style.cssText = `
      position: fixed; top: 10px; left: 10px;
      background: linear-gradient(145deg, #2a2a40, #1f1f35);
      color: #4ecdc4; padding: 6px 12px; border-radius: 20px;
      border: 1px solid rgba(78, 205, 196, 0.3);
      font-size: 11px; font-weight: bold; z-index: 1000;
      display: flex; align-items: center; gap: 6px;
    `;
    indicator.innerHTML = '<span>🎯</span><span>AUTO</span>';
    document.body.appendChild(indicator);
  }

  showQuickActions(x, y) {
    const menu = document.createElement('div');
    menu.style.cssText = `
      position: fixed; left: ${x}px; top: ${y}px;
      background: linear-gradient(145deg, #2a2a40, #1f1f35);
      border: 1px solid rgba(255,255,255,0.2); border-radius: 8px;
      padding: 8px 0; box-shadow: 0 8px 25px rgba(0,0,0,0.4);
      z-index: 10000; min-width: 150px; color: white;
      font-family: 'Segoe UI', sans-serif; font-size: 14px;
    `;
    
    const actions = [
      { label: 'Clear Selection', action: () => this.handleClearSelections(), icon: '🗑️' },
      { label: 'Invert Selection', action: () => this.handleInvertSelection(), icon: '🔄' },
      { label: 'Toggle Preview', action: () => this.togglePreview(), icon: '👁️' }
    ];
    
    actions.forEach(action => {
      const item = document.createElement('div');
      item.style.cssText = 'padding: 8px 16px; cursor: pointer; display: flex; align-items: center; gap: 8px; transition: background 0.2s ease;';
      item.innerHTML = `<span>${action.icon}</span><span>${action.label}</span>`;
      
      item.addEventListener('mouseenter', () => {
        item.style.background = 'rgba(78, 205, 196, 0.2)';
      });
      item.addEventListener('mouseleave', () => {
        item.style.background = 'transparent';
      });
      item.addEventListener('click', () => {
        action.action();
        menu.remove();
      });
      
      menu.appendChild(item);
    });
    
    document.body.appendChild(menu);
    
    setTimeout(() => {
      document.addEventListener('click', function removeMenu() {
        if (menu && menu.parentNode) menu.remove();
        document.removeEventListener('click', removeMenu);
      });
    }, 10);
  }

  // Tool handling
  handleToolSelection(tool, button) {
    const currentTool = this.selectionManager.currentTool;
    
    if (currentTool === tool) {
      this.selectTool('none');
      this.showNotification(`${tool} tool deactivated`, 'info', 2000);
    } else {
      this.selectTool(tool);
      this.showNotification(`${tool} tool activated - ${this.getToolHint(tool)}`, 'success', 3000);
    }
  }

  selectTool(tool) {
    this.selectionManager.setCurrentTool(tool);
    this.updateToolButtons(tool);
    this.canvasInteraction.updateCanvasCursor(tool);
  }

  updateToolButtons(activeTool) {
    this.toolButtons.forEach(button => {
      if (button) {
        const tool = button.getAttribute('data-tool');
        const isActive = tool === activeTool;
        
        button.classList.toggle('active', isActive);
      }
    });
  }

  getToolHint(tool) {
    const hints = {
      select: 'Click and drag to select rectangles',
      brush: 'Paint selections, use [/] for size',
      wand: 'Click similar colors to select',
      lasso: 'Draw freeform selections'
    };
    return hints[tool] || '';
  }

  // Event handlers
  handleManualModeToggle(isManual) {
    this.selectionManager.setManualMode(isManual);
    
    const indicator = document.getElementById('selection-mode-indicator');
    if (indicator) {
      indicator.innerHTML = isManual ? '<span>✋</span><span>MANUAL</span>' : '<span>🎯</span><span>AUTO</span>';
      indicator.style.color = isManual ? '#ffc44e' : '#4ecdc4';
      indicator.style.borderColor = isManual ? 'rgba(255, 196, 78, 0.3)' : 'rgba(78, 205, 196, 0.3)';
    }
    
    // Show/hide tool controls
    const toolsContainer = this.findInteractiveToolsContainer();
    if (toolsContainer) {
      toolsContainer.style.display = isManual ? 'block' : 'none';
    }
    
    const modeText = isManual ? 'Manual selection mode enabled' : 'Automatic selection mode enabled';
    this.showNotification(modeText, 'success', 3000);
  }

  handleSelectionMethodChange(method) {
    this.currentSelectionMethod = method;
    console.log('🎯 Selection method changed to:', method);
  }

  handlePreviewToggle(enabled) {
    this.isPreviewEnabled = enabled;
    this.selectionManager.setPreviewVisibility(enabled);
    this.showNotification(enabled ? 'Selection preview enabled' : 'Selection preview disabled', 'info', 2000);
  }

  togglePreview() {
    const checkbox = document.getElementById('selection-preview-checkbox');
    if (checkbox) {
      checkbox.checked = !checkbox.checked;
      this.handlePreviewToggle(checkbox.checked);
    }
  }

  handleSensitivityChange(value) {
    this.selectionSensitivity = value;
    const valueElement = document.getElementById('selection-sensitivity-value');
    if (valueElement) {
      valueElement.textContent = value.toFixed(1);
    }
  }

  handleBrushSizeChange(size) {
    const valueElement = document.getElementById('brush-size-value');
    if (valueElement) {
      valueElement.textContent = size;
    }
    this.canvasInteraction.setBrushSize(size);
    
    if (this.selectionManager.currentTool === 'brush') {
      this.showNotification(`Brush size: ${size}px`, 'info', 1500);
    }
  }

  handleClearSelections() {
    this.selectionManager.clearSelections();
    this.showNotification('Selections cleared', 'success', 2000);
  }

  handleInvertSelection() {
    this.selectionManager.invertSelection();
    this.showNotification('Selection inverted', 'success', 2000);
  }

  // Notification system
  showNotification(message, type = 'info', duration = 3000) {
    // Remove old notifications if too many
    while (this.notifications.length >= this.maxNotifications) {
      const oldNotification = this.notifications.shift();
      if (oldNotification.element.parentNode) {
        oldNotification.element.remove();
      }
    }
    
    const notification = this.createNotificationElement(message, type);
    document.body.appendChild(notification);
    
    const notificationObj = { element: notification, timeout: null };
    this.notifications.push(notificationObj);
    
    // Animate in
    setTimeout(() => {
      notification.style.opacity = '1';
      notification.style.transform = 'translateX(0)';
    }, 10);
    
    // Auto remove
    notificationObj.timeout = setTimeout(() => {
      this.removeNotification(notificationObj);
    }, duration);
    
    // Click to dismiss
    notification.addEventListener('click', () => {
      this.removeNotification(notificationObj);
    });
  }

  createNotificationElement(message, type) {
    const colors = {
      info: 'rgba(78, 205, 196, 0.9)',
      success: 'rgba(102, 187, 106, 0.9)',
      warning: 'rgba(255, 167, 38, 0.9)',
      error: 'rgba(255, 107, 107, 0.9)'
    };
    
    const icons = { info: 'ℹ️', success: '✅', warning: '⚠️', error: '❌' };
    
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed; top: 20px; right: 20px;
      background: ${colors[type] || colors.info}; color: white;
      padding: 12px 16px; border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.3);
      z-index: 10000; font-family: 'Segoe UI', sans-serif;
      font-size: 14px; max-width: 300px; cursor: pointer;
      opacity: 0; transform: translateX(100%);
      transition: all 0.3s ease;
    `;
    
    // Stack notifications
    const existingNotifications = document.querySelectorAll('.notification');
    if (existingNotifications.length > 0) {
      const topOffset = 20 + (existingNotifications.length * 60);
      notification.style.top = `${topOffset}px`;
    }
    
    notification.innerHTML = `
      <div style="display: flex; align-items: center; gap: 8px;">
        <span>${icons[type] || icons.info}</span>
        <span>${message}</span>
      </div>
    `;
    
    notification.className = 'notification';
    return notification;
  }

  removeNotification(notificationObj) {
    if (notificationObj.timeout) {
      clearTimeout(notificationObj.timeout);
    }
    
    const notification = notificationObj.element;
    notification.style.opacity = '0';
    notification.style.transform = 'translateX(100%)';
    
    setTimeout(() => {
      if (notification.parentNode) {
        notification.remove();
      }
    }, 300);
    
    const index = this.notifications.indexOf(notificationObj);
    if (index > -1) {
      this.notifications.splice(index, 1);
    }
  }

  // Utility methods
  findInteractiveToolsContainer() {
    const titles = Array.from(document.querySelectorAll('.group-title'));
    const toolsTitle = titles.find(el => el.textContent.includes('Interactive Tools'));
    return toolsTitle?.parentElement || null;
  }

  getSelectionConfig() {
    const intensitySelect = document.getElementById('intensity-select');
    const intensity = intensitySelect ? intensitySelect.value : 'medium';
    
    return {
      intensity: intensity,
      maxRegions: this.getMaxRegionsForIntensity(intensity),
      sensitivity: this.selectionSensitivity
    };
  }

  getMaxRegionsForIntensity(intensity) {
    switch (intensity) {
      case 'medium': return 2;
      case 'large': return 4;
      case 'extraLarge': return 6;
      default: return 2;
    }
  }

  generateSelections() {
    if (this.selectionManager.isInManualMode()) {
      return [];
    }

    const config = this.getSelectionConfig();
    return this.selectionManager.generateAutomaticSelections(this.currentSelectionMethod, config);
  }

  // Cleanup
  destroy() {
    this.notifications.forEach(notification => {
      if (notification.element.parentNode) {
        notification.element.remove();
      }
    });
    
    const indicator = document.getElementById('selection-mode-indicator');
    if (indicator) {
      indicator.remove();
    }
    
    console.log('🗑️ Enhanced Selection UI destroyed');
  }
}