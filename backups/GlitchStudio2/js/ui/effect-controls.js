/**
 * Effect Controls
 * Creates and manages UI controls for effect parameters
 */

/**
 * Create controls for an effect
 * @param {Object} effect - Effect object
 * @returns {HTMLElement} Container with all controls
 */
export function createEffectControls(effect) {
  const container = document.createElement('div');
  container.className = 'effect-controls';
  container.id = `${effect.name}-controls`;
  
  // Create control for each parameter
  Object.entries(effect.params).forEach(([paramName, paramDef]) => {
    // Skip 'enabled' parameter as it's handled by the effect toggle
    if (paramName === 'enabled') return;
    
    const control = createControl(effect.name, paramName, paramDef);
    if (control) {
      container.appendChild(control);
    }
  });

  // Special handling for chromaticAberration customAngle visibility
  if (effect.name === 'chromaticAberration') {
    const directionDropdown = container.querySelector(`#${effect.name}-direction`); // ID of the mode dropdown
    const customAngleControlContainer = container.querySelector(`#${effect.name}-customAngle-control-container`); // ID of the customAngle slider's container

    if (directionDropdown && customAngleControlContainer) {
      const updateCustomAngleVisibility = () => {
        if (directionDropdown.value === 'custom') {
          customAngleControlContainer.style.display = ''; // Show the control (revert to default display)
        } else {
          customAngleControlContainer.style.display = 'none'; // Hide the control
        }
      };

      // Add event listener to the direction dropdown
      directionDropdown.addEventListener('change', updateCustomAngleVisibility);
      
      // Initial check to set visibility based on the default/current value
      updateCustomAngleVisibility();
    }
  }
  
  return container;
}

/**
 * Create a single control based on parameter definition
 * @param {string} effectName - Name of the effect
 * @param {string} paramName - Name of the parameter
 * @param {Object} paramDef - Parameter definition
 * @returns {HTMLElement} Control element
 */
function createControl(effectName, paramName, paramDef) {
  const { value, options, min, max, step, displayName } = paramDef;
  
  if (options) {
    return createDropdown(effectName, paramName, value, options, displayName || paramName);
  } else if (typeof value === 'boolean') {
    return createToggle(effectName, paramName, value, displayName || paramName);
  } else if (typeof value === 'number') {
    return createSlider(effectName, paramName, value, min, max, step, displayName || paramName);
  }
  
  return null;
}

/**
 * Create a slider control
 * @param {string} effectName - Effect name
 * @param {string} paramName - Parameter name
 * @param {number} value - Current value
 * @param {number} min - Minimum value
 * @param {number} max - Maximum value
 * @param {number} step - Step size
 * @param {string} displayName - Display name
 * @returns {HTMLElement} Slider control
 */
function createSlider(effectName, paramName, value, min = 0, max = 100, step = 1, displayName) {
  const container = document.createElement('div');
  container.className = 'slider-container';
  container.id = `${effectName}-${paramName}-control-container`; // Added ID for the whole control
  
  const labelContainer = document.createElement('div');
  labelContainer.className = 'slider-label';
  
  const label = document.createElement('span');
  label.textContent = formatDisplayName(displayName);
  
  const valueDisplay = document.createElement('span');
  valueDisplay.className = 'slider-value';
  valueDisplay.id = `${effectName}-${paramName}-value`;
  valueDisplay.textContent = value;
  
  labelContainer.appendChild(label);
  labelContainer.appendChild(valueDisplay);
  
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.className = 'control-slider';
  slider.id = `${effectName}-${paramName}`;
  slider.min = min;
  slider.max = max;
  slider.step = step;
  slider.value = value;
  
  // Update display and fire change event
  slider.addEventListener('input', (e) => {
    const newValue = parseFloat(e.target.value);
    valueDisplay.textContent = newValue;
    
    // Fire custom event for parameter change
    const event = new CustomEvent('effectParameterChange', {
      detail: {
        effectName,
        paramName,
        value: newValue
      }
    });
    document.dispatchEvent(event);
  });
  
  container.appendChild(labelContainer);
  container.appendChild(slider);
  
  return container;
}

/**
 * Create a dropdown control
 * @param {string} effectName - Effect name
 * @param {string} paramName - Parameter name
 * @param {string} value - Current value
 * @param {Array} options - Available options
 * @param {string} displayName - Display name
 * @returns {HTMLElement} Dropdown control
 */
function createDropdown(effectName, paramName, value, options, displayName) {
  const container = document.createElement('div');
  container.className = 'dropdown-container';
  
  const label = document.createElement('label');
  label.className = 'dropdown-label';
  label.textContent = formatDisplayName(displayName);
  label.htmlFor = `${effectName}-${paramName}`;
  
  const select = document.createElement('select');
  select.className = 'control-select';
  select.id = `${effectName}-${paramName}`;
  
  // Add options
  options.forEach(option => {
    const optionEl = document.createElement('option');
    optionEl.value = option;
    optionEl.textContent = formatDisplayName(option);
    if (option === value) {
      optionEl.selected = true;
    }
    select.appendChild(optionEl);
  });
  
  // Update on change
  select.addEventListener('change', (e) => {
    const event = new CustomEvent('effectParameterChange', {
      detail: {
        effectName,
        paramName,
        value: e.target.value
      }
    });
    document.dispatchEvent(event);
  });
  
  container.appendChild(label);
  container.appendChild(select);
  
  return container;
}

/**
 * Create a toggle control
 * @param {string} effectName - Effect name
 * @param {string} paramName - Parameter name
 * @param {boolean} value - Current value
 * @param {string} displayName - Display name
 * @returns {HTMLElement} Toggle control
 */
function createToggle(effectName, paramName, value, displayName) {
  const container = document.createElement('div');
  container.className = 'toggle-container';
  
  const toggle = document.createElement('input');
  toggle.type = 'checkbox';
  toggle.className = 'toggle-switch';
  toggle.id = `${effectName}-${paramName}`;
  toggle.checked = value;
  
  const label = document.createElement('label');
  label.className = 'toggle-label';
  label.htmlFor = `${effectName}-${paramName}`;
  label.textContent = formatDisplayName(displayName);
  
  // Update on change
  toggle.addEventListener('change', (e) => {
    const event = new CustomEvent('effectParameterChange', {
      detail: {
        effectName,
        paramName,
        value: e.target.checked
      }
    });
    document.dispatchEvent(event);
  });
  
  container.appendChild(toggle);
  container.appendChild(label);
  
  return container;
}

/**
 * Format display name (handle camelCase, underscores, etc.)
 * @param {string} name - Raw name
 * @returns {string} Formatted name
 */
function formatDisplayName(name) {
  // Handle camelCase
  let formatted = name.replace(/([A-Z])/g, ' $1');
  // Handle underscores
  formatted = formatted.replace(/_/g, ' ');
  // Capitalize first letter
  formatted = formatted.charAt(0).toUpperCase() + formatted.slice(1);
  // Clean up extra spaces
  return formatted.replace(/\s+/g, ' ').trim();
}

/**
 * Update all controls for an effect with new values
 * @param {string} effectName - Effect name
 * @param {Object} params - New parameter values
 */
export function updateEffectControls(effectName, params) {
  Object.entries(params).forEach(([paramName, paramDef]) => {
    const elementId = `${effectName}-${paramName}`;
    const element = document.getElementById(elementId);
    
    if (element) {
      if (element.type === 'checkbox') {
        element.checked = paramDef.value;
      } else {
        element.value = paramDef.value;
        
        // Update value display for sliders
        const valueDisplay = document.getElementById(`${elementId}-value`);
        if (valueDisplay) {
          valueDisplay.textContent = paramDef.value;
        }
      }
    }
  });
}
