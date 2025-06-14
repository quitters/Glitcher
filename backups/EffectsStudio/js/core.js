// ========== Core Variables ==========
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const canvasPlaceholder = document.getElementById('canvas-placeholder');
const effectChainDisplay = document.getElementById('effect-chain');
const globalIntensitySlider = document.getElementById('global-intensity');
const globalIntensityValue = document.getElementById('global-intensity-value');

// File input
const fileInput = document.getElementById('image-input');

// Buttons
const playPauseBtn = document.getElementById('play-pause-btn');
const resetBtn = document.getElementById('reset-btn');
const snapshotBtn = document.getElementById('snapshot-btn');
const randomizeBtn = document.getElementById('randomize-btn');
const clearEffectsBtn = document.getElementById('clear-effects-btn');

// ========== Global State ==========
let originalImageData = null;
let workingImageData = null;
let imgWidth = 0, imgHeight = 0;

let animationId = null;
let isPaused = false;
let frameCount = 0;

// Performance tracking
let lastFrameTime = 0;
let targetFrameRate = 60;
let processingTime = 0;

// ========== Effect Registry ==========
const EffectRegistry = {
  effects: {},
  activeEffects: [],
  
  register(name, category, processor, defaultParams = {}) {
    this.effects[name] = {
      name,
      category,
      processor,
      params: { ...defaultParams },
      enabled: false
    };
  },
  
  enable(name) {
    const effect = this.effects[name];
    if (effect && !effect.enabled) {
      effect.enabled = true;
      if (!this.activeEffects.includes(name)) {
        this.activeEffects.push(name);
      }
      updateEffectChain();
    }
  },
  
  disable(name) {
    const effect = this.effects[name];
    if (effect && effect.enabled) {
      effect.enabled = false;
      const index = this.activeEffects.indexOf(name);
      if (index !== -1) {
        this.activeEffects.splice(index, 1);
      }
      updateEffectChain();
    }
  },
  
  updateParam(name, param, value) {
    if (this.effects[name]) {
      this.effects[name].params[param] = value;
    }
  },
  
  processAll(imageData) {
    const startTime = performance.now();
    
    let workingData = new ImageData(
      new Uint8ClampedArray(imageData.data),
      imageData.width,
      imageData.height
    );
    
    const globalIntensity = parseInt(globalIntensitySlider.value) / 100;
    
    this.activeEffects.forEach(effectName => {
      const effect = this.effects[effectName];
      if (effect && effect.enabled) {
        workingData = effect.processor(workingData, effect.params, globalIntensity);
      }
    });
    
    processingTime = performance.now() - startTime;
    return workingData;
  }
};

// ========== Setup Event Listeners ==========

// Initialize all event listeners when the document is loaded
function initializeEventListeners() {
  // File load
  if (fileInput) {
    fileInput.addEventListener('change', handleFileSelect);
  }
  
  // Play/Pause button
  if (playPauseBtn) {
    playPauseBtn.addEventListener('click', togglePlayPause);
  }
  
  // Reset button
  if (resetBtn) {
    resetBtn.addEventListener('click', resetImage);
  }
  
  // Snapshot button
  if (snapshotBtn) {
    snapshotBtn.addEventListener('click', downloadSnapshot);
  }
  
  // Randomize button
  if (randomizeBtn) {
    randomizeBtn.addEventListener('click', randomizeEffects);
  }
  
  // Clear effects button
  if (clearEffectsBtn) {
    clearEffectsBtn.addEventListener('click', clearAllEffects);
  }
  
  // Global intensity slider
  if (globalIntensitySlider) {
    globalIntensitySlider.addEventListener('input', () => {
      globalIntensityValue.textContent = globalIntensitySlider.value;
      if (originalImageData) {
        processImage();
      }
    });
  }
  
  // Category tabs
  document.querySelectorAll('.tab-button').forEach(button => {
    button.addEventListener('click', () => {
      switchToCategory(button.dataset.category);
    });
  });
  
  // Set initial category
  const activeTab = document.querySelector('.tab-button.active');
  if (activeTab) {
    switchToCategory(activeTab.dataset.category);
  } else {
    // Default to first tab
    const firstTab = document.querySelector('.tab-button');
    if (firstTab) {
      firstTab.classList.add('active');
      switchToCategory(firstTab.dataset.category);
    }
  }
  
  console.log('Effects Studio: Core event listeners initialized');
}

// Call initialization when the document is loaded
document.addEventListener('DOMContentLoaded', initializeEventListeners);

// Drag and drop for file upload area is now handled in the UI.js file
// This ensures all event listeners are properly set up and checked for existence

// Handle image upload function
function handleImageUpload(file) {
  if (!file || !file.type.startsWith('image/')) return;
  
  const reader = new FileReader();
  reader.onload = (e) => {
    const img = new Image();
    img.onload = () => {
      // Hide placeholder, show canvas
      canvasPlaceholder.style.display = 'none';
      canvas.style.display = 'block';
      
      // Set canvas dimensions
      imgWidth = img.width;
      imgHeight = img.height;
      canvas.width = imgWidth;
      canvas.height = imgHeight;
      
      // Draw original image
      ctx.drawImage(img, 0, 0);
      
      // Store original image data
      originalImageData = ctx.getImageData(0, 0, imgWidth, imgHeight);
      
      // Start animation loop
      startAnimation();
      
      // Show toast notification
      if (window.showToast) {
        showToast('Image loaded successfully');
      }
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

// Function to handle file selection from input element
function handleFileSelect() {
  if (fileInput.files.length > 0) {
    handleImageUpload(fileInput.files[0]);
  }
}

// Make switchToCategory globally available for HTML event handlers
window.switchToCategory = function(category) {
  // Update active tab
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.toggle('active', button.dataset.category === category);
  });
  
  // Show/hide effect groups based on category
  document.querySelectorAll('.effect-category').forEach(group => {
    group.style.display = (group.dataset.category === category) ? 'block' : 'none';
  });
}

// ========== Load Image & Start ==========

function handleFileSelect() {
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    const img = new Image();
    img.onload = () => {
      imgWidth = img.width;
      imgHeight = img.height;
      canvas.width = imgWidth;
      canvas.height = imgHeight;

      ctx.drawImage(img, 0, 0);
      originalImageData = ctx.getImageData(0, 0, imgWidth, imgHeight);

      workingImageData = new ImageData(
        new Uint8ClampedArray(originalImageData.data),
        imgWidth,
        imgHeight
      );

      // Hide placeholder, show canvas
      canvasPlaceholder.style.display = 'none';
      canvas.style.display = 'block';

      // Start animation loop
      startAnimation();
    };
    img.src = e.target.result;
  };
  reader.readAsDataURL(file);
}

function startAnimation() {
  if (animationId) {
    cancelAnimationFrame(animationId);
  }
  isPaused = false;
  updatePlayPauseButton();
  lastFrameTime = performance.now();
  animate();
}

function updatePlayPauseButton() {
  if (isPaused) {
    playPauseBtn.textContent = '▶️ Resume';
    playPauseBtn.classList.remove('success-button');
    playPauseBtn.classList.add('control-button');
  } else {
    playPauseBtn.textContent = '⏸️ Pause';
    playPauseBtn.classList.add('success-button');
    playPauseBtn.classList.remove('control-button');
  }
}

// ========== Animation Loop ==========

function animate(currentTime) {
  if (!isPaused) {
    animationId = requestAnimationFrame(animate);
    
    // Calculate delta time and limit frame rate
    const now = performance.now();
    const elapsed = now - lastFrameTime;
    
    if (elapsed > 1000 / targetFrameRate) {
      lastFrameTime = now - (elapsed % (1000 / targetFrameRate));
      frameCount++;
      
      // Process image with active effects
      processImage();
      
      // Update performance display every 30 frames
      if (frameCount % 30 === 0) {
        updatePerformanceDisplay();
      }
    }
  }
}

// ========== Image Processing ==========

function processImage() {
  if (!originalImageData) return;
  
  // Apply all active effects
  workingImageData = EffectRegistry.processAll(originalImageData);
  
  // Draw to canvas
  ctx.putImageData(workingImageData, 0, 0);
}

// ========== Effect Chain Management ==========

function updateEffectChain() {
  // Clear current chain display
  effectChainDisplay.innerHTML = '';
  
  // Add active effects as pills
  EffectRegistry.activeEffects.forEach(effectName => {
    const effect = EffectRegistry.effects[effectName];
    if (effect) {
      const pill = document.createElement('div');
      pill.className = 'effect-pill';
      pill.innerHTML = `${effectName} <button onclick="EffectRegistry.disable('${effectName}')">×</button>`;
      effectChainDisplay.appendChild(pill);
    }
  });
  
  // Process image with updated effects
  if (originalImageData) {
    processImage();
  }
}

// ========== UI Functions ==========

function switchToCategory(category) {
  // Update active tab button
  document.querySelectorAll('.tab-button').forEach(button => {
    button.classList.toggle('active', button.dataset.category === category);
  });
  
  // Show/hide effect groups based on category
  document.querySelectorAll('.control-group[data-category]').forEach(group => {
    group.style.display = (group.dataset.category === category || group.dataset.category === 'global') ? 'block' : 'none';
  });
}

// Make toggleEffect globally available for HTML event handlers
window.toggleEffect = function(effectName) {
  const checkbox = document.getElementById(`${effectName}-toggle`);
  if (checkbox.checked) {
    EffectRegistry.enable(effectName);
  } else {
    EffectRegistry.disable(effectName);
  }
}

// Make toggleControls globally available for HTML event handlers
window.toggleControls = function(effectName) {
  const controls = document.getElementById(`${effectName}-controls`);
  const button = document.querySelector(`[onclick="event.stopPropagation(); toggleControls('${effectName}')"]`);
  
  if (controls.classList.contains('collapsed')) {
    controls.classList.remove('collapsed');
    button.textContent = '▲';
  } else {
    controls.classList.add('collapsed');
    button.textContent = '▼';
  }
}

// Make clearAllEffects globally available for HTML event handlers
window.clearAllEffects = function() {
  // Disable all active effects
  [...EffectRegistry.activeEffects].forEach(effectName => {
    document.getElementById(`${effectName}-toggle`).checked = false;
    EffectRegistry.disable(effectName);
  });
}

function togglePlayPause() {
  isPaused = !isPaused;
  updatePlayPauseButton();
  
  if (!isPaused && originalImageData) {
    animate();
  }
}

function resetImage() {
  if (!originalImageData) return;
  
  // Reset to original image
  workingImageData = new ImageData(
    new Uint8ClampedArray(originalImageData.data),
    imgWidth,
    imgHeight
  );
  
  ctx.putImageData(workingImageData, 0, 0);
}

function downloadSnapshot() {
  if (!canvas.width) return;
  
  const link = document.createElement('a');
  link.download = 'effects-studio-' + new Date().toISOString().slice(0, 10) + '.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
}

function randomizeEffects() {
  // Clear current effects
  clearAllEffects();
  
  // Get all available effects
  const availableEffects = Object.keys(EffectRegistry.effects);
  
  // Randomly select 1-3 effects
  const numEffects = Math.floor(Math.random() * 3) + 1;
  const selectedEffects = [];
  
  for (let i = 0; i < numEffects; i++) {
    if (availableEffects.length === 0) break;
    
    const randomIndex = Math.floor(Math.random() * availableEffects.length);
    const effectName = availableEffects.splice(randomIndex, 1)[0];
    selectedEffects.push(effectName);
    
    // Enable the effect
    const checkbox = document.getElementById(`${effectName}-toggle`);
    if (checkbox) {
      checkbox.checked = true;
      EffectRegistry.enable(effectName);
      
      // Randomize parameters
      const effect = EffectRegistry.effects[effectName];
      if (effect) {
        Object.keys(effect.params).forEach(param => {
          const slider = document.getElementById(`${effectName}-${param}`);
          if (slider && slider.type === 'range') {
            const min = parseInt(slider.min);
            const max = parseInt(slider.max);
            const randomValue = Math.floor(Math.random() * (max - min + 1)) + min;
            slider.value = randomValue;
            
            const valueDisplay = document.getElementById(`${effectName}-${param}-value`);
            if (valueDisplay) {
              valueDisplay.textContent = randomValue;
            }
            
            EffectRegistry.updateParam(effectName, param, randomValue);
          }
        });
      }
    }
  }
  
  // Set a random global intensity
  const randomIntensity = Math.floor(Math.random() * 150) + 50;
  globalIntensitySlider.value = randomIntensity;
  globalIntensityValue.textContent = randomIntensity;
}

// ========== Performance Monitoring ==========

function updatePerformanceDisplay() {
  const fps = Math.round(1000 / (performance.now() - lastFrameTime));
  document.getElementById('fps-counter').textContent = `${fps} FPS`;
  document.getElementById('processing-time').textContent = `${Math.round(processingTime)} ms`;
}

// ========== Keyboard Shortcuts ==========

document.addEventListener('keydown', (e) => {
  // Only respond if we have an image loaded
  if (!originalImageData) return;
  
  switch (e.key.toLowerCase()) {
    case 'r':
      resetImage();
      break;
    case 's':
      downloadSnapshot();
      break;
    case 'p':
      togglePlayPause();
      break;
    case 'c':
      clearAllEffects();
      break;
    case 'q':
      randomizeEffects();
      break;
    case ' ':
      togglePlayPause();
      e.preventDefault(); // Prevent page scroll
      break;
    case '1':
    case '2':
    case '3':
    case '4':
    case '5':
      const categories = ['artistic', 'distortion', 'color', 'filter', 'experimental'];
      const index = parseInt(e.key) - 1;
      if (categories[index]) {
        switchToCategory(categories[index]);
      }
      break;
  }
});

// Initialize with artistic category
switchToCategory('artistic');

// Make functions available globally
window.toggleEffect = toggleEffect;
window.toggleControls = toggleControls;
