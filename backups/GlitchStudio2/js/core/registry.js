/**
 * Effect Registry
 * Simplified registry for managing effects
 */

export class EffectRegistry {
  constructor() {
    this.effects = new Map();
    this.activeEffects = [];
    this.globalIntensity = 1.0;
  }
  
  /**
   * Register an effect
   * @param {Object} effect - Effect object with name, category, params, and process function
   */
  register(effect) {
    if (!effect.name || !effect.process) {
      console.error('Effect must have name and process function');
      return;
    }
    
    // Store effect with enabled state
    this.effects.set(effect.name, {
      ...effect,
      enabled: false
    });
    
    console.log(`Registered effect: ${effect.name} (${effect.category})`);
  }
  
  /**
   * Enable an effect
   * @param {string} name - Effect name
   */
  enable(name) {
    const effect = this.effects.get(name);
    if (effect && !effect.enabled) {
      effect.enabled = true;
      if (!this.activeEffects.includes(name)) {
        this.activeEffects.push(name);
      }
    }
  }
  
  /**
   * Disable an effect
   * @param {string} name - Effect name
   */
  disable(name) {
    const effect = this.effects.get(name);
    if (effect && effect.enabled) {
      effect.enabled = false;
      this.activeEffects = this.activeEffects.filter(effectName => effectName !== name);
    }
  }
  
  /**
   * Toggle an effect on/off
   * @param {string} name - Effect name
   * @returns {boolean} New enabled state
   */
  toggle(name) {
    const effect = this.effects.get(name);
    if (!effect) return false;
    
    if (effect.enabled) {
      this.disable(name);
    } else {
      this.enable(name);
    }
    
    return effect.enabled;
  }
  
  /**
   * Update a parameter for an effect
   * @param {string} effectName - Effect name
   * @param {string} paramName - Parameter name
   * @param {any} value - Parameter value
   */
  updateParam(effectName, paramName, value) {
    const effect = this.effects.get(effectName);
    if (effect && effect.params[paramName]) {
      effect.params[paramName].value = value;
    }
  }
  
  /**
   * Get an effect by name
   * @param {string} name - Effect name
   * @returns {Object} Effect object
   */
  getEffect(name) {
    return this.effects.get(name);
  }
  
  /**
   * Set the global intensity
   * @param {number} value - Intensity value (0-2)
   */
  setGlobalIntensity(value) {
    this.globalIntensity = Math.max(0, Math.min(2, value));
  }
  
  /**
   * Get all effects in a category
   * @param {string} category - Category name
   * @returns {Array} Array of effects
   */
  getEffectsByCategory(category) {
    return Array.from(this.effects.values())
      .filter(effect => effect.category === category);
  }
  
  /**
   * Process image data through all active effects
   * @param {ImageData} imageData - Image data to process (modified in-place)
   */
  processEffectChain(imageData) {
    if (!imageData || this.activeEffects.length === 0) return;
    
    // Apply each active effect in order
    for (const effectName of this.activeEffects) {
      const effect = this.effects.get(effectName);
      if (effect && effect.enabled) {
        try {
          // Extract current parameter values
          const params = {};
          Object.entries(effect.params).forEach(([name, def]) => {
            params[name] = def.value;
          });
          
          // Process modifies imageData in-place
          effect.process(imageData, params, this.globalIntensity);
        } catch (err) {
          console.error(`Error processing effect ${effectName}:`, err);
        }
      }
    }
  }
  
  /**
   * Clear all active effects
   */
  clearAllEffects() {
    this.activeEffects.forEach(name => {
      const effect = this.effects.get(name);
      if (effect) {
        effect.enabled = false;
      }
    });
    this.activeEffects = [];
  }
  
  /**
   * Get a list of all registered effects
   * @returns {Array} Array of effect objects
   */
  getAllEffects() {
    return Array.from(this.effects.values());
  }
  
  /**
   * Get a list of all active effects
   * @returns {Array} Array of active effect objects
   */
  getActiveEffects() {
    return this.activeEffects.map(name => this.effects.get(name)).filter(Boolean);
  }
}
