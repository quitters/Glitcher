/**
 * Control Factory
 * Creates UI controls for different types of effect parameters
 */

/**
 * Create a control element based on parameter type
 * @param {string} effectName - Name of the effect
 * @param {string} paramName - Name of the parameter
 * @param {any} paramValue - Current value of the parameter
 * @param {Object} paramMeta - Optional metadata about the parameter (type, options, etc.)
 * @param {Function} onChange - Callback when value changes
 * @returns {HTMLElement} The created control element
 */
export function createControl(effectName, paramName, paramValue, paramMeta = {}, onChange) {
  // Determine control type based on parameter value and metadata
  const controlType = determineControlType(paramName, paramValue, paramMeta);
  
  // Create appropriate control
  switch (controlType) {
    case 'toggle':
      return createToggleControl(effectName, paramName, paramValue, onChange);
    case 'dropdown':
      return createDropdownControl(effectName, paramName, paramValue, paramMeta.options || [], onChange);
    case 'color':
      return createColorControl(effectName, paramName, paramValue, onChange);
    case 'text':
      return createTextControl(effectName, paramName, paramValue, paramMeta, onChange);
    case 'slider':
    default:
      return createSliderControl(effectName, paramName, paramValue, paramMeta, onChange);
  }
}

/**
 * Determine the appropriate control type based on parameter name, value and metadata
 * @param {string} paramName - Name of the parameter
 * @param {any} paramValue - Current value of the parameter
 * @param {Object} paramMeta - Metadata about the parameter
 * @returns {string} Control type ('slider', 'toggle', 'dropdown', 'color')
 */
function determineControlType(paramName, paramValue, paramMeta) {
  // If metadata explicitly specifies control type, use that
  if (paramMeta.controlType) {
    return paramMeta.controlType;
  }
  
  // Boolean values should use toggle controls
  if (typeof paramValue === 'boolean') {
    return 'toggle';
  }
  
  // If options are provided, use dropdown
  if (paramMeta.options && Array.isArray(paramMeta.options) && paramMeta.options.length > 0) {
    return 'dropdown';
  }
  
  // Check parameter name for hints
  const nameLower = paramName.toLowerCase();
  
  // Color parameters
  if (nameLower.includes('color') || 
      (typeof paramValue === 'string' && paramValue.startsWith('#'))) {
    return 'color';
  }
  
  // Text input parameters
  if (nameLower === 'seed' || 
      nameLower === 'text' || 
      nameLower === 'name' || 
      nameLower === 'label' || 
      nameLower === 'title') {
    return 'text';
  }
  
  // Toggle parameters (on/off, enable/disable)
  if (nameLower.includes('enable') || 
      nameLower.includes('preserve') || 
      nameLower === 'on' || 
      nameLower === 'active' || 
      nameLower === 'visible') {
    return 'toggle';
  }
  
  // Channel selection or mode parameters often use dropdowns
  if (nameLower === 'channel' || 
      nameLower === 'mode' || 
      nameLower === 'type' || 
      nameLower === 'shape') {
    return 'dropdown';
  }
  
  // Default to slider for numeric values
  return 'slider';
}

/**
 * Create a slider control
 * @param {string} effectName - Name of the effect
 * @param {string} paramName - Name of the parameter
 * @param {number} paramValue - Current value of the parameter
 * @param {Object} paramMeta - Metadata about the parameter
 * @param {Function} onChange - Callback when value changes
 * @returns {HTMLElement} Slider control element
 */
function createSliderControl(effectName, paramName, paramValue, paramMeta, onChange) {
  const controlRow = document.createElement('div');
  controlRow.className = 'control-row';
  
  // Parameter label
  const label = document.createElement('label');
  label.htmlFor = `${effectName}-${paramName}`;
  label.textContent = formatParamName(paramName) + ':';
  
  // Determine appropriate scale and range based on parameter value and metadata
  const { min, max, step, scale } = determineSliderRange(paramValue, paramMeta);
  
  const sliderValue = Math.round(paramValue / scale);
  
  // Parameter slider
  const slider = document.createElement('input');
  slider.type = 'range';
  slider.className = 'control-slider';
  slider.id = `${effectName}-${paramName}`;
  slider.min = min.toString();
  slider.max = max.toString();
  slider.step = step.toString();
  slider.value = sliderValue.toString();
  
  // Value display
  const valueDisplay = document.createElement('span');
  valueDisplay.className = 'slider-value';
  valueDisplay.id = `${effectName}-${paramName}-value`;
  valueDisplay.textContent = paramValue.toString();
  
  // Update parameter on slider change
  slider.addEventListener('input', () => {
    const newValue = parseFloat(slider.value) * scale;
    const formattedValue = (Math.round(newValue * 100) / 100).toString(); // Round to 2 decimal places
    valueDisplay.textContent = formattedValue;
    onChange(paramName, newValue);
  });
  
  // Add tooltip if available
  if (paramMeta.tooltip) {
    label.title = paramMeta.tooltip;
    slider.title = paramMeta.tooltip;
  }
  
  controlRow.appendChild(label);
  controlRow.appendChild(slider);
  controlRow.appendChild(valueDisplay);
  
  return controlRow;
}

/**
 * Create a toggle switch control
 * @param {string} effectName - Name of the effect
 * @param {string} paramName - Name of the parameter
 * @param {boolean} paramValue - Current value of the parameter
 * @param {Function} onChange - Callback when value changes
 * @returns {HTMLElement} Toggle control element
 */
function createToggleControl(effectName, paramName, paramValue, onChange) {
  const controlRow = document.createElement('div');
  controlRow.className = 'control-row toggle-row';
  
  // Toggle switch
  const toggle = document.createElement('input');
  toggle.type = 'checkbox';
  toggle.className = 'toggle-switch';
  toggle.id = `${effectName}-${paramName}`;
  toggle.checked = paramValue;
  
  // Toggle label
  const toggleLabel = document.createElement('label');
  toggleLabel.htmlFor = `${effectName}-${paramName}`;
  toggleLabel.className = 'toggle-label';
  toggleLabel.textContent = formatParamName(paramName);
  
  // Update parameter on toggle change
  toggle.addEventListener('change', () => {
    onChange(paramName, toggle.checked);
  });
  
  controlRow.appendChild(toggle);
  controlRow.appendChild(toggleLabel);
  
  return controlRow;
}

/**
 * Create a dropdown select control
 * @param {string} effectName - Name of the effect
 * @param {string} paramName - Name of the parameter
 * @param {any} paramValue - Current value of the parameter
 * @param {Array} options - Available options
 * @param {Function} onChange - Callback when value changes
 * @returns {HTMLElement} Dropdown control element
 */
function createDropdownControl(effectName, paramName, paramValue, options, onChange) {
  const controlRow = document.createElement('div');
  controlRow.className = 'control-row';
  
  // Parameter label
  const label = document.createElement('label');
  label.htmlFor = `${effectName}-${paramName}`;
  label.textContent = formatParamName(paramName) + ':';
  
  // Dropdown select
  const select = document.createElement('select');
  select.className = 'control-dropdown';
  select.id = `${effectName}-${paramName}`;
  
  // Add options
  options.forEach(option => {
    const optionEl = document.createElement('option');
    
    // Handle both simple arrays and object arrays
    if (typeof option === 'object' && option !== null) {
      optionEl.value = option.value;
      optionEl.textContent = option.label || option.value;
    } else {
      optionEl.value = option;
      optionEl.textContent = option;
    }
    
    // Set selected option
    if (optionEl.value === paramValue) {
      optionEl.selected = true;
    }
    
    select.appendChild(optionEl);
  });
  
  // Update parameter on select change
  select.addEventListener('change', () => {
    onChange(paramName, select.value);
  });
  
  controlRow.appendChild(label);
  controlRow.appendChild(select);
  
  return controlRow;
}

/**
 * Create a color picker control
 * @param {string} effectName - Name of the effect
 * @param {string} paramName - Name of the parameter
 * @param {string} paramValue - Current color value (hex)
 * @param {Function} onChange - Callback when value changes
 * @returns {HTMLElement} Color picker control element
 */
function createColorControl(effectName, paramName, paramValue, onChange) {
  const controlRow = document.createElement('div');
  controlRow.className = 'control-row color-row';
  
  // Parameter label
  const label = document.createElement('label');
  label.htmlFor = `${effectName}-${paramName}`;
  label.textContent = formatParamName(paramName) + ':';
  
  // Color picker
  const colorPicker = document.createElement('input');
  colorPicker.type = 'color';
  colorPicker.className = 'color-picker';
  colorPicker.id = `${effectName}-${paramName}`;
  colorPicker.value = paramValue;
  
  // Color value display
  const valueDisplay = document.createElement('span');
  valueDisplay.className = 'color-value';
  valueDisplay.textContent = paramValue;
  
  // Update parameter on color change
  colorPicker.addEventListener('input', () => {
    valueDisplay.textContent = colorPicker.value;
    onChange(paramName, colorPicker.value);
  });
  
  controlRow.appendChild(label);
  controlRow.appendChild(colorPicker);
  controlRow.appendChild(valueDisplay);
  
  return controlRow;
}

/**
 * Format parameter name for display (camelCase to Title Case with spaces)
 * @param {string} paramName - Parameter name in camelCase
 * @returns {string} Formatted parameter name
 */
function formatParamName(paramName) {
  // Convert camelCase to space-separated
  const withSpaces = paramName.replace(/([A-Z])/g, ' $1');
  
  // Capitalize first letter and return
  return withSpaces.charAt(0).toUpperCase() + withSpaces.slice(1);
}

/**
 * Create a text input control
 * @param {string} effectName - Name of the effect
 * @param {string} paramName - Name of the parameter
 * @param {string} paramValue - Current value of the parameter
 * @param {Object} paramMeta - Metadata about the parameter
 * @param {Function} onChange - Callback when value changes
 * @returns {HTMLElement} Text input control element
 */
function createTextControl(effectName, paramName, paramValue, paramMeta, onChange) {
  const controlRow = document.createElement('div');
  controlRow.className = 'control-row';
  
  // Parameter label
  const label = document.createElement('label');
  label.htmlFor = `${effectName}-${paramName}`;
  label.textContent = formatParamName(paramName) + ':';
  
  // Text input
  const textInput = document.createElement('input');
  textInput.type = 'text';
  textInput.className = 'text-input';
  textInput.id = `${effectName}-${paramName}`;
  textInput.value = paramValue;
  textInput.placeholder = paramMeta.placeholder || '';
  
  // Set max length if specified
  if (paramMeta.maxLength) {
    textInput.maxLength = paramMeta.maxLength;
  }
  
  // Update parameter on input change
  textInput.addEventListener('change', () => {
    onChange(paramName, textInput.value);
  });
  
  // Add tooltip if available
  if (paramMeta.tooltip) {
    label.title = paramMeta.tooltip;
    textInput.title = paramMeta.tooltip;
  }
  
  controlRow.appendChild(label);
  controlRow.appendChild(textInput);
  
  return controlRow;
}

/**
 * Determine appropriate slider range and scale based on parameter value and metadata
 * @param {number} paramValue - Current parameter value
 * @param {Object} paramMeta - Parameter metadata
 * @returns {Object} Slider configuration {min, max, step, scale}
 */
function determineSliderRange(paramValue, paramMeta = {}) {
  // Use metadata if provided
  if (paramMeta.min !== undefined && paramMeta.max !== undefined) {
    return {
      min: paramMeta.min,
      max: paramMeta.max,
      step: paramMeta.step || 1,
      scale: 1
    };
  }
  
  // Default configurations based on value range
  if (paramValue > 100) {
    return { min: 0, max: 200, step: 1, scale: 1 };
  } else if (paramValue > 10) {
    return { min: 0, max: 100, step: 1, scale: 0.2 };
  } else if (paramValue > 1) {
    return { min: 0, max: 100, step: 1, scale: 0.1 };
  } else {
    return { min: 0, max: 100, step: 1, scale: 0.01 };
  }
}
