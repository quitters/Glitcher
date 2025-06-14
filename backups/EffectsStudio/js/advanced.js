// ========== Advanced Features ==========

// ========== Performance Monitor ==========
const PerformanceMonitor = {
  fpsHistory: [],
  processingTimeHistory: [],
  maxHistoryLength: 60, // 1 second at 60fps
  
  update(fps, processingTime) {
    // Add new data points
    this.fpsHistory.push(fps);
    this.processingTimeHistory.push(processingTime);
    
    // Trim history if too long
    if (this.fpsHistory.length > this.maxHistoryLength) {
      this.fpsHistory.shift();
      this.processingTimeHistory.shift();
    }
    
    // Update display
    document.getElementById('fps-counter').textContent = `${Math.round(fps)} FPS`;
    document.getElementById('processing-time').textContent = `${Math.round(processingTime)} ms`;
    
    // Update graph if visible
    if (document.getElementById('performance-graph').style.display !== 'none') {
      this.updateGraph();
    }
  },
  
  updateGraph() {
    const canvas = document.getElementById('performance-graph-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    const width = canvas.width;
    const height = canvas.height;
    
    // Clear canvas
    ctx.clearRect(0, 0, width, height);
    
    // Draw background
    ctx.fillStyle = 'rgba(0, 0, 0, 0.2)';
    ctx.fillRect(0, 0, width, height);
    
    // Draw FPS graph
    ctx.strokeStyle = '#4ecdc4';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const fpsMax = 60; // Target FPS
    
    for (let i = 0; i < this.fpsHistory.length; i++) {
      const x = (i / this.maxHistoryLength) * width;
      const y = height - (this.fpsHistory[i] / fpsMax) * height;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    // Draw processing time graph
    ctx.strokeStyle = '#ff6b6b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    const timeMax = 33; // 33ms = 30fps
    
    for (let i = 0; i < this.processingTimeHistory.length; i++) {
      const x = (i / this.maxHistoryLength) * width;
      const y = height - (Math.min(this.processingTimeHistory[i], timeMax) / timeMax) * height;
      
      if (i === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    // Draw legend
    ctx.fillStyle = '#ffffff';
    ctx.font = '12px Arial';
    ctx.fillText('FPS', 10, 15);
    ctx.fillStyle = '#4ecdc4';
    ctx.fillRect(40, 5, 20, 10);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillText('Processing Time', 70, 15);
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(170, 5, 20, 10);
  },
  
  toggleGraph() {
    const graph = document.getElementById('performance-graph');
    if (graph.style.display === 'none') {
      graph.style.display = 'block';
      this.updateGraph();
    } else {
      graph.style.display = 'none';
    }
  }
};

// ========== Batch Processing ==========
const BatchProcessor = {
  files: [],
  outputFormat: 'png',
  currentIndex: 0,
  processing: false,
  
  init() {
    // Set up batch file input
    const batchFileInput = document.getElementById('batch-file-input');
    const batchUploadArea = document.querySelector('.file-upload-area.small');
    
    if (batchFileInput) {
      batchFileInput.addEventListener('change', () => {
        this.loadFiles(batchFileInput.files);
      });
    }
    
    // Set up click handler for the batch upload area
    if (batchUploadArea) {
      batchUploadArea.addEventListener('click', () => {
        if (batchFileInput) {
          batchFileInput.click();
        }
      });
    }
    
    // Set up format selector
    const formatSelector = document.getElementById('batch-format');
    if (formatSelector) {
      formatSelector.addEventListener('change', () => {
        this.outputFormat = formatSelector.value;
      });
    }
    
    // Set up process button
    const processBtn = document.getElementById('batch-process-btn');
    if (processBtn) {
      processBtn.addEventListener('click', () => {
        this.processAll();
      });
    }
  },
  
  loadFiles(fileList) {
    this.files = Array.from(fileList).filter(file => file.type.startsWith('image/'));
    
    // Update file count display
    document.getElementById('batch-file-count').textContent = this.files.length;
    
    // Enable process button if files are loaded
    document.getElementById('batch-process-btn').disabled = this.files.length === 0;
    
    showToast(`Loaded ${this.files.length} images for batch processing`);
  },
  
  async processAll() {
    if (this.processing || this.files.length === 0) return;
    
    this.processing = true;
    this.currentIndex = 0;
    
    // Update UI
    document.getElementById('batch-progress').style.display = 'block';
    document.getElementById('batch-progress-bar').style.width = '0%';
    document.getElementById('batch-status').textContent = `Processing 1/${this.files.length}`;
    
    // Process first file
    await this.processNext();
  },
  
  async processNext() {
    if (this.currentIndex >= this.files.length) {
      // All files processed
      this.processing = false;
      showToast('Batch processing complete!');
      return;
    }
    
    const file = this.files[this.currentIndex];
    
    // Load image
    const img = await this.loadImage(file);
    
    // Set canvas dimensions
    canvas.width = img.width;
    canvas.height = img.height;
    
    // Draw original image
    ctx.drawImage(img, 0, 0);
    
    // Get image data
    originalImageData = ctx.getImageData(0, 0, img.width, img.height);
    
    // Process with active effects
    processImage();
    
    // Save processed image
    await this.saveProcessedImage(file.name);
    
    // Update progress
    this.currentIndex++;
    const progress = (this.currentIndex / this.files.length) * 100;
    document.getElementById('batch-progress-bar').style.width = `${progress}%`;
    
    if (this.currentIndex < this.files.length) {
      document.getElementById('batch-status').textContent = `Processing ${this.currentIndex + 1}/${this.files.length}`;
      
      // Process next file (with small delay to update UI)
      setTimeout(() => this.processNext(), 100);
    } else {
      document.getElementById('batch-status').textContent = 'Complete!';
      this.processing = false;
    }
  },
  
  loadImage(file) {
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });
  },
  
  saveProcessedImage(originalName) {
    return new Promise((resolve) => {
      // Generate filename
      const baseName = originalName.split('.')[0];
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
      const fileName = `${baseName}-processed-${timestamp}.${this.outputFormat}`;
      
      // Get data URL
      const dataURL = canvas.toDataURL(`image/${this.outputFormat}`);
      
      // Create download link
      const link = document.createElement('a');
      link.href = dataURL;
      link.download = fileName;
      link.style.display = 'none';
      document.body.appendChild(link);
      
      // Trigger download
      link.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(link);
        resolve();
      }, 100);
    });
  }
};

// ========== Animation System ==========
const AnimationSystem = {
  recording: false,
  frames: [],
  frameRate: 30,
  maxDuration: 5, // seconds
  recordingStartTime: 0,
  
  init() {
    // Set up record button
    const recordBtn = document.getElementById('record-btn');
    if (recordBtn) {
      recordBtn.addEventListener('click', () => {
        this.toggleRecording();
      });
    }
    
    // Set up frame rate selector
    const frameRateSelector = document.getElementById('frame-rate');
    if (frameRateSelector) {
      frameRateSelector.addEventListener('change', () => {
        this.frameRate = parseInt(frameRateSelector.value);
      });
    }
    
    // Set up duration selector
    const durationSelector = document.getElementById('max-duration');
    if (durationSelector) {
      durationSelector.addEventListener('change', () => {
        this.maxDuration = parseInt(durationSelector.value);
      });
    }
  },
  
  toggleRecording() {
    if (this.recording) {
      this.stopRecording();
    } else {
      this.startRecording();
    }
  },
  
  startRecording() {
    if (!originalImageData) {
      showToast('Please load an image first', 'error');
      return;
    }
    
    this.recording = true;
    this.frames = [];
    this.recordingStartTime = Date.now();
    
    // Update UI
    document.getElementById('record-btn').textContent = '⏹️ Stop Recording';
    document.getElementById('record-btn').classList.add('recording');
    document.getElementById('recording-indicator').style.display = 'block';
    
    showToast(`Recording started (max ${this.maxDuration}s)`);
  },
  
  captureFrame() {
    if (!this.recording) return;
    
    // Check if we've reached max duration
    const elapsedTime = (Date.now() - this.recordingStartTime) / 1000;
    if (elapsedTime >= this.maxDuration) {
      this.stopRecording();
      return;
    }
    
    // Capture current canvas state
    const frameData = canvas.toDataURL('image/png');
    this.frames.push(frameData);
    
    // Update recording time
    document.getElementById('recording-time').textContent = elapsedTime.toFixed(1) + 's';
  },
  
  stopRecording() {
    if (!this.recording) return;
    
    this.recording = false;
    
    // Update UI
    document.getElementById('record-btn').textContent = '🔴 Record';
    document.getElementById('record-btn').classList.remove('recording');
    document.getElementById('recording-indicator').style.display = 'none';
    
    // Create and export GIF if we have frames
    if (this.frames.length > 0) {
      this.createGif();
    } else {
      showToast('No frames captured', 'error');
    }
  },
  
  createGif() {
    showToast(`Creating GIF from ${this.frames.length} frames...`);
    
    // Show loading indicator
    document.getElementById('gif-loading').style.display = 'block';
    
    // Create a new gif
    const gif = new GIF({
      workers: 2,
      quality: 10,
      width: canvas.width,
      height: canvas.height
    });
    
    // Add frames
    const loadPromises = this.frames.map(frameData => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
          gif.addFrame(img, { delay: 1000 / this.frameRate });
          resolve();
        };
        img.src = frameData;
      });
    });
    
    // When all frames are loaded, render the gif
    Promise.all(loadPromises).then(() => {
      gif.on('finished', (blob) => {
        // Create download link
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `effects-studio-animation-${new Date().toISOString().slice(0, 10)}.gif`;
        
        // Hide loading indicator
        document.getElementById('gif-loading').style.display = 'none';
        
        // Trigger download
        link.click();
        
        // Clean up
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        
        showToast('GIF created and downloaded');
      });
      
      // Start rendering
      gif.render();
    });
  }
};

// ========== Keyboard Shortcuts ==========
const KeyboardShortcuts = {
  shortcuts: {
    'r': 'Reset Image',
    's': 'Take Snapshot',
    'p': 'Play/Pause',
    'c': 'Clear Effects',
    'q': 'Randomize Effects',
    '1-5': 'Switch Categories',
    'space': 'Play/Pause'
  },
  
  init() {
    // Create help panel content
    const helpContent = document.getElementById('keyboard-shortcuts-content');
    if (helpContent) {
      let html = '<h3>Keyboard Shortcuts</h3><ul>';
      
      Object.entries(this.shortcuts).forEach(([key, description]) => {
        html += `<li><kbd>${key}</kbd> - ${description}</li>`;
      });
      
      html += '</ul>';
      helpContent.innerHTML = html;
    }
    
    // Set up help button
    const helpBtn = document.getElementById('help-btn');
    if (helpBtn) {
      helpBtn.addEventListener('click', () => {
        this.toggleHelpPanel();
      });
    }
    
    // Set up close button
    const closeBtn = document.getElementById('close-help-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => {
        this.toggleHelpPanel(false);
      });
    }
  },
  
  toggleHelpPanel(show) {
    const helpPanel = document.getElementById('help-panel');
    if (!helpPanel) return;
    
    if (show === undefined) {
      // Toggle
      helpPanel.style.display = helpPanel.style.display === 'none' ? 'block' : 'none';
    } else {
      // Set to specific state
      helpPanel.style.display = show ? 'block' : 'none';
    }
  }
};

// ========== Auto-Save System ==========
const AutoSaveSystem = {
  enabled: true,
  interval: 60000, // 1 minute
  timer: null,
  
  init() {
    // Load preference from localStorage
    this.enabled = localStorage.getItem('effectsStudioAutoSave') !== 'false';
    
    // Set up toggle
    const autoSaveToggle = document.getElementById('auto-save-toggle');
    if (autoSaveToggle) {
      autoSaveToggle.checked = this.enabled;
      
      autoSaveToggle.addEventListener('change', () => {
        this.enabled = autoSaveToggle.checked;
        localStorage.setItem('effectsStudioAutoSave', this.enabled);
        
        if (this.enabled) {
          this.startTimer();
          showToast('Auto-save enabled');
        } else {
          this.stopTimer();
          showToast('Auto-save disabled');
        }
      });
    }
    
    // Start timer if enabled
    if (this.enabled) {
      this.startTimer();
    }
  },
  
  startTimer() {
    this.stopTimer();
    
    this.timer = setInterval(() => {
      this.saveState();
    }, this.interval);
  },
  
  stopTimer() {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
  },
  
  saveState() {
    if (!originalImageData) return;
    
    // Get active effects and their parameters
    const activeEffects = [...EffectRegistry.activeEffects];
    const params = {};
    
    activeEffects.forEach(effectName => {
      const effect = EffectRegistry.effects[effectName];
      if (effect) {
        params[effectName] = { ...effect.params };
      }
    });
    
    // Create state object
    const state = {
      activeEffects,
      params,
      globalIntensity: parseInt(document.getElementById('global-intensity').value),
      timestamp: new Date().toISOString()
    };
    
    // Save to localStorage
    localStorage.setItem('effectsStudioLastState', JSON.stringify(state));
    
    // Show subtle notification
    const autoSaveIndicator = document.getElementById('auto-save-indicator');
    if (autoSaveIndicator) {
      autoSaveIndicator.classList.add('active');
      setTimeout(() => {
        autoSaveIndicator.classList.remove('active');
      }, 2000);
    }
  },
  
  loadLastState() {
    try {
      const savedState = localStorage.getItem('effectsStudioLastState');
      if (!savedState) {
        showToast('No saved state found', 'error');
        return false;
      }
      
      const state = JSON.parse(savedState);
      
      // Clear current effects
      clearAllEffects();
      
      // Set global intensity
      document.getElementById('global-intensity').value = state.globalIntensity;
      document.getElementById('global-intensity-value').textContent = state.globalIntensity;
      
      // Enable and configure effects
      state.activeEffects.forEach(effectName => {
        const checkbox = document.getElementById(`${effectName}-toggle`);
        if (checkbox) {
          checkbox.checked = true;
          EffectRegistry.enable(effectName);
          
          // Set parameters
          if (state.params[effectName]) {
            Object.entries(state.params[effectName]).forEach(([param, value]) => {
              const slider = document.getElementById(`${effectName}-${param}`);
              if (slider) {
                slider.value = value * 10;
                document.getElementById(`${effectName}-${param}-value`).textContent = value * 10;
                EffectRegistry.updateParam(effectName, param, value);
              }
            });
          }
        }
      });
      
      const timestamp = new Date(state.timestamp).toLocaleString();
      showToast(`Loaded state from ${timestamp}`);
      return true;
    } catch (error) {
      console.error('Error loading saved state:', error);
      showToast('Error loading saved state', 'error');
      return false;
    }
  }
};

// Initialize advanced features when the document is loaded
document.addEventListener('DOMContentLoaded', () => {
  // Initialize all systems
  BatchProcessor.init();
  AnimationSystem.init();
  KeyboardShortcuts.init();
  AutoSaveSystem.init();
  
  // Set up performance monitor toggle
  const perfToggle = document.getElementById('performance-toggle');
  if (perfToggle) {
    perfToggle.addEventListener('click', () => {
      PerformanceMonitor.toggleGraph();
    });
  }
  
  // Set up restore button
  const restoreBtn = document.getElementById('restore-state-btn');
  if (restoreBtn) {
    restoreBtn.addEventListener('click', () => {
      AutoSaveSystem.loadLastState();
    });
  }
  
  console.log('Effects Studio: Advanced features initialized');
});
