/**
 * Main Application Entry Point for Glitcher App
 * Coordinates all modules and initializes the application
 * UPDATED: Now includes selection system and filter effects!
 */

import { CanvasManager } from './core/canvas-manager.js';
import { SelectionManager } from './selection/selection-manager.js';
import { EnhancedCanvasInteraction } from './ui/enhanced-canvas-interaction.js';
import { EnhancedSelectionUI } from './ui/enhanced-selection-ui.js';
import { DirectionEffects } from './effects/destructive/direction-effects.js';
import { SpiralEffects } from './effects/destructive/spiral-effects.js';
import { SliceEffects } from './effects/destructive/slice-effects.js';
import { PixelSortEffects } from './effects/destructive/pixel-sort-effects.js';
import { ColorEffects } from './effects/destructive/color-effects.js';
import { FilterEffects } from './effects/non-destructive/filter-effects.js';
import { EFFECT_DEFAULTS } from './config/constants.js';

class GlitcherApp {
  constructor() {
    this.canvasManager = new CanvasManager();
    this.selectionManager = null;
    this.canvasInteraction = null;
    this.selectionUI = null;
    
    // Enhanced UI flag
    this.useEnhancedUI = true;
    
    this.animationId = null;
    this.isPaused = false;
    this.frameCount = 0;
    this.lastFrameTime = 0;
    this.targetFrameRate = 60;
    
    // Destructive effects state
    this.activeClumps = [];
    this.testDirection = 'down';
    this.testSpeed = 2;
    this.testSpiral = 'off';
    this.testSwirlStrength = 0.06;
    this.spiralDirection = 'cw';
    this.testSlice = 'off';
    this.testColorOffset = 20;
    this.testPixelSort = 'off';
    this.testColorEffect = 'off';
    this.testColorIntensity = 50;
    
    // NEW: Non-destructive filter effects state
    this.filterEffect = 'off';
    this.filterIntensity = 50;
    this.filterOptions = {
      style: 'warhol',        // for popArt
      filmType: 'polaroid',   // for vintage
      grainAmount: 30,        // for vintage
      direction: 'horizontal', // for motionBlur
      distance: 10,           // for motionBlur
      dotSize: 4,             // for halftone
      pattern: 'circle',      // for halftone
      // NEW: Options for new filter categories
      cyberpunkStyle: 'neon',
      artisticStyle: 'oil_painting',
      atmosphericStyle: 'fog',
      experimentalStyle: 'kaleidoscope'
    };
    
    // Selection system state
    this.minLifetime = 90;
    this.maxLifetime = 150;
  }

  /**
   * Initialize the application
   */
  async init() {
    try {
      console.log('🎨 Initializing Glitcher App with Enhanced Selection System...');
      
      // Initialize canvas manager first
      this.canvasManager.init();
      
      // Initialize selection system
      this.selectionManager = new SelectionManager(this.canvasManager);
      
      // Initialize enhanced canvas interaction and UI
      if (this.useEnhancedUI) {
        this.canvasInteraction = new EnhancedCanvasInteraction(this.canvasManager, this.selectionManager);
        this.selectionUI = new EnhancedSelectionUI(this.selectionManager, this.canvasInteraction);
        console.log('✨ Enhanced selection system initialized');
      } else {
        // Fallback to original system
        const { CanvasInteraction } = await import('./ui/canvas-interaction.js');
        const { SelectionUI } = await import('./ui/selection-ui.js');
        this.canvasInteraction = new CanvasInteraction(this.canvasManager, this.selectionManager);
        this.selectionUI = new SelectionUI(this.selectionManager, this.canvasInteraction);
        console.log('📝 Standard selection system initialized');
      }
      
      // Set up image load callback
      this.canvasManager.onImageLoad((imageData, width, height) => {
        console.log(`✅ Image loaded: ${width}x${height}`);
        this.startAnimation();
      });
      
      // Set up controls
      this.setupTestControls();
      this.setupFilterControls();
      this.setupSelectionControls();
      
      console.log('✅ Glitcher App with Enhanced Selection System & Filter Effects initialized successfully!');
      
    } catch (error) {
      console.error('❌ Failed to initialize Glitcher App:', error);
    }
  }

  /**
   * Set up selection-related controls
   */
  setupSelectionControls() {
    // Lifetime controls
    const minLifetimeRange = document.getElementById('min-lifetime');
    const minLifetimeValue = document.getElementById('min-lifetime-value');
    if (minLifetimeRange && minLifetimeValue) {
      minLifetimeRange.addEventListener('input', (e) => {
        this.minLifetime = parseInt(e.target.value);
        minLifetimeValue.textContent = this.minLifetime;
      });
    }
    
    const maxLifetimeRange = document.getElementById('max-lifetime');
    const maxLifetimeValue = document.getElementById('max-lifetime-value');
    if (maxLifetimeRange && maxLifetimeValue) {
      maxLifetimeRange.addEventListener('input', (e) => {
        this.maxLifetime = parseInt(e.target.value);
        maxLifetimeValue.textContent = this.maxLifetime;
      });
    }
  }

  /**
   * Set up existing destructive effect controls
   */
  setupTestControls() {
    // Play/Pause button
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (playPauseBtn) {
      playPauseBtn.addEventListener('click', () => this.togglePlayPause());
    }
    
    // Reset button
    const resetBtn = document.getElementById('reset-btn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => this.resetImage());
    }
    
    // Direction select
    const directionSelect = document.getElementById('direction-select');
    if (directionSelect) {
      directionSelect.addEventListener('change', (e) => {
        this.testDirection = e.target.value;
      });
    }
    
    // Spiral select
    const spiralSelect = document.getElementById('spiral-select');
    if (spiralSelect) {
      spiralSelect.addEventListener('change', (e) => {
        this.testSpiral = e.target.value;
      });
    }
    
    // Spiral direction button
    const spiralDirectionBtn = document.getElementById('spiral-direction-btn');
    if (spiralDirectionBtn) {
      spiralDirectionBtn.addEventListener('click', () => {
        this.spiralDirection = (this.spiralDirection === 'cw') ? 'ccw' : 'cw';
        spiralDirectionBtn.textContent = this.spiralDirection.toUpperCase();
      });
    }
    
    // Speed range
    const speedRange = document.getElementById('speed-range');
    if (speedRange) {
      speedRange.addEventListener('input', (e) => {
        this.testSpeed = parseInt(e.target.value);
        const speedValue = document.getElementById('speed-value');
        if (speedValue) speedValue.textContent = this.testSpeed;
      });
    }
    
    // Swirl range
    const swirlRange = document.getElementById('swirl-range');
    if (swirlRange) {
      swirlRange.addEventListener('input', (e) => {
        this.testSwirlStrength = parseFloat(e.target.value);
        const swirlValue = document.getElementById('swirl-value');
        if (swirlValue) swirlValue.textContent = this.testSwirlStrength;
      });
    }
    
    // Slice select
    const sliceSelect = document.getElementById('slice-select');
    if (sliceSelect) {
      sliceSelect.addEventListener('change', (e) => {
        this.testSlice = e.target.value;
      });
    }
    
    // Color offset range
    const colorOffsetRange = document.getElementById('color-offset-range');
    if (colorOffsetRange) {
      colorOffsetRange.addEventListener('input', (e) => {
        this.testColorOffset = parseInt(e.target.value);
        const colorOffsetValue = document.getElementById('color-offset-value');
        if (colorOffsetValue) colorOffsetValue.textContent = this.testColorOffset;
      });
    }
    
    // Pixel sort select
    const pixelSortSelect = document.getElementById('pixel-sort-select');
    if (pixelSortSelect) {
      pixelSortSelect.addEventListener('change', (e) => {
        this.testPixelSort = e.target.value;
      });
    }
    
    // Color effect select
    const colorEffectSelect = document.getElementById('color-effect-select');
    if (colorEffectSelect) {
      colorEffectSelect.addEventListener('change', (e) => {
        this.testColorEffect = e.target.value;
      });
    }
    
    // Color intensity range
    const colorIntensityRange = document.getElementById('color-intensity-range');
    if (colorIntensityRange) {
      colorIntensityRange.addEventListener('input', (e) => {
        this.testColorIntensity = parseInt(e.target.value);
        const colorIntensityValue = document.getElementById('color-intensity-value');
        if (colorIntensityValue) colorIntensityValue.textContent = this.testColorIntensity;
      });
    }
  }

  /**
   * NEW: Set up filter effect controls
   */
  setupFilterControls() {
    // Filter effect select
    const filterEffectSelect = document.getElementById('filter-effect-select');
    if (filterEffectSelect) {
      filterEffectSelect.addEventListener('change', (e) => {
        this.filterEffect = e.target.value;
        this.showFilterControls(e.target.value);
      });
    }
    
    // Filter intensity range
    const filterIntensityRange = document.getElementById('filter-intensity-range');
    if (filterIntensityRange) {
      filterIntensityRange.addEventListener('input', (e) => {
        this.filterIntensity = parseInt(e.target.value);
        const filterIntensityValue = document.getElementById('filter-intensity-value');
        if (filterIntensityValue) filterIntensityValue.textContent = this.filterIntensity;
      });
    }
    
    // Pop Art style select
    const popArtStyleSelect = document.getElementById('pop-art-style');
    if (popArtStyleSelect) {
      popArtStyleSelect.addEventListener('change', (e) => {
        this.filterOptions.style = e.target.value;
      });
    }
    
    // Vintage film type select
    const vintageFilmSelect = document.getElementById('vintage-film-type');
    if (vintageFilmSelect) {
      vintageFilmSelect.addEventListener('change', (e) => {
        this.filterOptions.filmType = e.target.value;
      });
    }
    
    // Film grain range
    const filmGrainRange = document.getElementById('film-grain-range');
    if (filmGrainRange) {
      filmGrainRange.addEventListener('input', (e) => {
        this.filterOptions.grainAmount = parseInt(e.target.value);
        const filmGrainValue = document.getElementById('film-grain-value');
        if (filmGrainValue) filmGrainValue.textContent = this.filterOptions.grainAmount;
      });
    }
    
    // Motion blur direction select
    const motionBlurDirection = document.getElementById('motion-blur-direction');
    if (motionBlurDirection) {
      motionBlurDirection.addEventListener('change', (e) => {
        this.filterOptions.direction = e.target.value;
      });
    }
    
    // Halftone pattern select
    const halftonePattern = document.getElementById('halftone-pattern');
    if (halftonePattern) {
      halftonePattern.addEventListener('change', (e) => {
        this.filterOptions.pattern = e.target.value;
      });
    }
    
    // NEW: Cyberpunk style select
    const cyberpunkStyle = document.getElementById('cyberpunk-style');
    if (cyberpunkStyle) {
      cyberpunkStyle.addEventListener('change', (e) => {
        this.filterOptions.cyberpunkStyle = e.target.value;
      });
    }
    
    // NEW: Artistic style select
    const artisticStyle = document.getElementById('artistic-style');
    if (artisticStyle) {
      artisticStyle.addEventListener('change', (e) => {
        this.filterOptions.artisticStyle = e.target.value;
      });
    }
    
    // NEW: Atmospheric style select
    const atmosphericStyle = document.getElementById('atmospheric-style');
    if (atmosphericStyle) {
      atmosphericStyle.addEventListener('change', (e) => {
        this.filterOptions.atmosphericStyle = e.target.value;
      });
    }
    
    // NEW: Experimental style select
    const experimentalStyle = document.getElementById('experimental-style');
    if (experimentalStyle) {
      experimentalStyle.addEventListener('change', (e) => {
        this.filterOptions.experimentalStyle = e.target.value;
      });
    }
  }

  /**
   * NEW: Show/hide filter-specific controls
   */
  showFilterControls(filterType) {
    // Hide all filter controls first
    const controlContainers = [
      'pop-art-controls',
      'vintage-controls', 
      'motion-blur-controls',
      'halftone-controls',
      'cyberpunk-controls',
      'artistic-controls',
      'atmospheric-controls',
      'experimental-controls'
    ];
    
    controlContainers.forEach(id => {
      const element = document.getElementById(id);
      if (element) element.style.display = 'none';
    });
    
    // Show relevant controls
    switch (filterType) {
      case 'popArt':
        const popArtControls = document.getElementById('pop-art-controls');
        if (popArtControls) popArtControls.style.display = 'block';
        break;
        
      case 'vintage':
        const vintageControls = document.getElementById('vintage-controls');
        if (vintageControls) vintageControls.style.display = 'block';
        break;
        
      case 'motionBlur':
        const motionBlurControls = document.getElementById('motion-blur-controls');
        if (motionBlurControls) motionBlurControls.style.display = 'block';
        break;
        
      case 'halftone':
        const halftoneControls = document.getElementById('halftone-controls');
        if (halftoneControls) halftoneControls.style.display = 'block';
        break;
        
      // NEW: Show controls for new filter categories
      case 'cyberpunk':
        const cyberpunkControls = document.getElementById('cyberpunk-controls');
        if (cyberpunkControls) cyberpunkControls.style.display = 'block';
        break;
        
      case 'artistic':
        const artisticControls = document.getElementById('artistic-controls');
        if (artisticControls) artisticControls.style.display = 'block';
        break;
        
      case 'atmospheric':
        const atmosphericControls = document.getElementById('atmospheric-controls');
        if (atmosphericControls) atmosphericControls.style.display = 'block';
        break;
        
      case 'experimental':
        const experimentalControls = document.getElementById('experimental-controls');
        if (experimentalControls) experimentalControls.style.display = 'block';
        break;
    }
  }

  /**
   * Start animation loop
   */
  startAnimation() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    if (!this.canvasManager.isImageLoaded()) {
      console.warn('No image loaded for animation');
      return;
    }

    this.isPaused = false;
    this.updatePlayPauseButton();
    this.activeClumps = [];
    this.frameCount = 0;
    this.lastFrameTime = 0;
    
    console.log('🎬 Starting animation with selection system and filter effects...');
    this.animate(0);
  }

  /**
   * Main animation loop - UPDATED with selection system integration
   */
  animate(currentTime) {
    // Frame rate limiting
    if (currentTime - this.lastFrameTime < 1000 / this.targetFrameRate) {
      this.animationId = requestAnimationFrame((time) => this.animate(time));
      return;
    }
    this.lastFrameTime = currentTime;

    if (this.isPaused) {
      this.animationId = requestAnimationFrame((time) => this.animate(time));
      return;
    }

    this.frameCount++;

    // Manage selection-based clump spawning
    if (this.activeClumps.length === 0) {
      this.spawnNewClumps();
    }

    // Get current selection mask for effects
    const selectionMask = this.selectionManager.getSelectionMask();

    // Process active clumps (destructive effects)
    this.activeClumps.forEach(clump => {
      if (this.testDirection !== 'off') {
        DirectionEffects.applyDirectionShift(
          this.canvasManager.glitchImageData,
          clump,
          this.testSpeed,
          this.testDirection,
          selectionMask  // Pass selection mask to effect
        );
      }
      
      if (this.testSpiral !== 'off') {
        let swirlType = this.testSpiral;
        if (this.testSpiral === 'spiral') {
          swirlType = this.spiralDirection;
        }
        SpiralEffects.applySwirlEffect(
          this.canvasManager.glitchImageData,
          clump,
          this.testSwirlStrength,
          swirlType,
          this.spiralDirection,
          selectionMask  // Pass selection mask to effect
        );
      }
      
      clump.framesRemaining--;
    });

    // Remove expired clumps
    this.activeClumps = this.activeClumps.filter(c => c.framesRemaining > 0);

    // Apply slice effects
    if (this.testSlice !== 'off') {
      SliceEffects.applySliceGlitch(
        this.canvasManager.glitchImageData,
        this.testSlice,
        this.testColorOffset
      );
    }
    
    // Apply pixel sort effects (every 5 frames to avoid overwhelming)
    if (this.testPixelSort !== 'off' && this.frameCount % 5 === 0) {
      PixelSortEffects.applyPixelSort(
        this.canvasManager.glitchImageData,
        this.testPixelSort
      );
    }
    
    // Apply color effects
    if (this.testColorEffect !== 'off') {
      const newPixelData = ColorEffects.applyColorEffect(
        this.canvasManager.glitchImageData,
        this.testColorEffect,
        this.testColorIntensity
      );
      if (newPixelData && newPixelData !== this.canvasManager.glitchImageData.data) {
        this.canvasManager.glitchImageData.data.set(new Uint8ClampedArray(newPixelData));
      }
    }

    // NEW: Apply non-destructive filter effects as final pass
    let finalImageData = this.canvasManager.glitchImageData;
    if (this.filterEffect !== 'off') {
      // Set the appropriate style option based on filter type
      let currentOptions = { ...this.filterOptions };
      
      switch (this.filterEffect) {
        case 'cyberpunk':
          currentOptions.style = this.filterOptions.cyberpunkStyle;
          break;
        case 'artistic':
          currentOptions.style = this.filterOptions.artisticStyle;
          break;
        case 'atmospheric':
          currentOptions.style = this.filterOptions.atmosphericStyle;
          break;
        case 'experimental':
          currentOptions.style = this.filterOptions.experimentalStyle;
          break;
      }
      
      finalImageData = FilterEffects.apply(
        this.canvasManager.glitchImageData,
        this.filterEffect,
        this.filterIntensity,
        currentOptions
      );
    }

    // Update canvas with final result
    this.canvasManager.ctx.putImageData(finalImageData, 0, 0);
    
    // Draw selection overlays (only when preview is enabled)
    this.selectionManager.drawInteractiveSelectionOverlay();

    // Continue animation
    this.animationId = requestAnimationFrame((time) => this.animate(time));
  }

  /**
   * Spawn new clumps using selection system
   */
  spawnNewClumps() {
    if (this.selectionManager.isInManualMode()) {
      // In manual mode, convert selection mask to clumps
      const regions = this.selectionManager.maskToRegions();
      this.activeClumps = this.selectionManager.selectionsToClumps(
        regions,
        this.minLifetime,
        this.maxLifetime
      );
    } else {
      // In automatic mode, generate selections using UI settings
      const selections = this.selectionUI.generateSelections();
      
      if (selections.length > 0) {
        this.activeClumps = this.selectionManager.selectionsToClumps(
          selections,
          this.minLifetime,
          this.maxLifetime
        );
      } else {
        // Fallback to random if no selections generated
        this.spawnTestClump();
      }
    }
    
    console.log(`🎯 Spawned ${this.activeClumps.length} new clumps`);
  }

  /**
   * Spawn a test clump for fallback (when selection system fails)
   */
  spawnTestClump() {
    const { width, height } = this.canvasManager.getImageDimensions();
    
    // Create a random rectangular region
    const w = Math.floor(Math.random() * 100) + 50;
    const h = Math.floor(Math.random() * 100) + 50;
    const x = Math.floor(Math.random() * (width - w));
    const y = Math.floor(Math.random() * (height - h));
    
    const clump = {
      x, y, w, h,
      framesRemaining: Math.floor(Math.random() * (this.maxLifetime - this.minLifetime)) + this.minLifetime,
      clumpDirection: this.testDirection === 'random' ? 
        ['down', 'up', 'left', 'right'][Math.floor(Math.random() * 4)] : 
        this.testDirection
    };
    
    this.activeClumps.push(clump);
    console.log(`🎯 Spawned fallback test clump at (${x}, ${y}) with direction: ${clump.clumpDirection}`);
  }

  /**
   * Toggle play/pause state
   */
  togglePlayPause() {
    this.isPaused = !this.isPaused;
    this.updatePlayPauseButton();
    console.log(this.isPaused ? '⏸️ Paused' : '▶️ Playing');
  }

  /**
   * Update play/pause button text
   */
  updatePlayPauseButton() {
    const playPauseBtn = document.getElementById('play-pause-btn');
    if (!playPauseBtn) return;

    if (this.isPaused) {
      playPauseBtn.innerHTML = `
        <div class="flex-row">
          <div class="status-indicator paused" id="status-indicator"></div>
          <span>▶️ Play</span>
        </div>
      `;
    } else {
      playPauseBtn.innerHTML = `
        <div class="flex-row">
          <div class="status-indicator" id="status-indicator"></div>
          <span>⏸️ Pause</span>
        </div>
      `;
    }
  }

  /**
   * Reset image to original state
   */
  resetImage() {
    this.canvasManager.resetImage();
    this.activeClumps = [];
    this.selectionManager.clearSelections();
    console.log('🔄 Image reset to original state');
  }

  /**
   * Stop animation
   */
  stop() {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
    this.isPaused = true;
    this.updatePlayPauseButton();
  }
}

// Initialize and start the application
const app = new GlitcherApp();

// Wait for DOM to be ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => app.init());
} else {
  app.init();
}

// Expose app instance for debugging
window.glitcherApp = app;

// Expose debug function globally
window.getGlitcherDebugInfo = () => {
  return {
    canvasManager: {
      isInitialized: !!app.canvasManager,
      isImageLoaded: app.canvasManager.isImageLoaded(),
      imageDimensions: app.canvasManager.getImageDimensions()
    },
    selectionManager: app.selectionManager ? app.selectionManager.getDebugInfo() : null,
    animation: {
      isPaused: app.isPaused,
      frameCount: app.frameCount,
      activeClumps: app.activeClumps.length,
      targetFrameRate: app.targetFrameRate
    },
    effects: {
      direction: app.testDirection,
      spiral: app.testSpiral,
      slice: app.testSlice,
      pixelSort: app.testPixelSort,
      colorEffect: app.testColorEffect,
      filterEffect: app.filterEffect
    }
  };
};