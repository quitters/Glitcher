# GlitchStudio2

A modern, modular image processing application that combines professional effects with creative glitch tools.

## Current Status

**Version**: 2.1 (Under Development)
**Phase 1**: Core Infrastructure ✅ COMPLETED
**Phase 2**: Effect Implementation 🚧 IN PROGRESS
**Phase 3**: Advanced Features ⏳ PLANNED

## Project Structure

GlitchStudio2 follows a modular architecture with clear separation of concerns:

```
GlitchStudio2/
├── index.html               # Main application HTML
├── test.html                # Testing page for development
├── css/                     # Stylesheets
│   ├── main.css             # Main styling
│   ├── theme.css            # Theme variables
│   ├── neumorphic.css       # Neumorphic UI styling
│   ├── modal.css            # Modal dialogs
│   ├── presets.css          # Preset management UI
│   └── animations.css       # Animation effects
├── js/
│   ├── main.js              # Application entry point
│   ├── core/                # Core application functionality
│   │   ├── app.js           # Main application class
│   │   ├── canvas.js        # Canvas management
│   │   ├── registry.js      # Simplified effect registry
│   │   ├── state.js         # Application state management
│   │   └── presets.js       # Preset management
│   ├── ui/                  # User interface components
│   │   ├── ui-manager.js    # Main UI controller
│   │   ├── effect-controls.js # Dynamic control generation
│   │   ├── notifications.js # Toast notifications
│   │   ├── theme-manager.js # Theme switching
│   │   └── keyboard-shortcuts.js # Keyboard handling
│   ├── effects/             # Image processing effects
│   │   ├── index.js         # Central effect exports
│   │   ├── artistic/        # Artistic effects (empty)
│   │   ├── color/           # Color effects (4 implemented)
│   │   ├── distortion/      # Distortion effects (empty)
│   │   ├── filter/          # Filter effects (empty)
│   │   ├── glitch/          # Glitch effects (1 implemented)
│   │   └── experimental/    # Experimental effects (empty)
│   └── utils/               # Utility functions
├── assets/                  # Static assets
└── docs/                    # Documentation
    ├── glitchstudio21-plan.md     # Enhancement plan
    └── glitchstudio21-Progress.md # Progress tracking
```

## Current Features

### Working Features ✅
- **Image Loading**: Drag & drop or click to upload
- **Canvas Display**: Real-time effect preview
- **Effect System**: Modular effect registration and processing
- **UI Controls**: Dynamic control generation (sliders, dropdowns, toggles)
- **Effect Chaining**: Multiple effects can be applied
- **Global Intensity**: Master control for all effects
- **Category Filtering**: Organize effects by type
- **Theme Support**: Dark/light mode switching
- **Keyboard Shortcuts**: Quick actions

### Implemented Effects ✅
- **Color Effects**:
  - Hue Shift (with degree control)
  - Invert (simple toggle)
  - Posterize (adjustable levels)
  - Threshold (adjustable threshold)
- **Glitch Effects**:
  - Pixel Sort (brightness/hue sorting, columns/rows)

### Planned Features 🚧
- **Missing Effects** from newstudio and WIP Glitcher 2
- **Audio Reactivity**: Effects respond to microphone input
- **Batch Export**: Generate multiple variations
- **Recording**: Export animations as video
- **Advanced Presets**: Save and share effect combinations

## New Effect Structure (v2.1)

Effects now use a simplified structure:

```javascript
export const myEffect = {
  name: 'myEffect',
  displayName: 'My Effect',
  category: 'color',
  
  // Parameter definitions with UI metadata
  params: {
    intensity: {
      value: 50,        // Default value
      min: 0,           // Minimum value
      max: 100,         // Maximum value
      step: 1,          // Step size
      displayName: 'Intensity',
      tooltip: 'Effect strength'
    },
    mode: {
      value: 'normal',
      options: ['normal', 'extreme', 'subtle'],
      displayName: 'Mode'
    }
  },
  
  // Processing function (modifies ImageData in-place)
  process(imageData, params, globalIntensity) {
    const { data } = imageData;
    // Effect implementation
    // Modify data array directly
  }
};
```

## Development Notes

### Testing
Open `test.html` in a browser to test the current implementation. This provides a minimal interface for development.

### Adding New Effects
1. Create a new file in the appropriate effects category
2. Export an effect object following the structure above
3. Add it to the category's `index.js` exports
4. The UI controls will be generated automatically

### Known Issues
- Most effects are not yet implemented (placeholders exist)
- Preset system needs updating for new effect structure
- Some UI elements from original design are not connected

## Contributing

This project is currently under active development. Phase 1 (infrastructure) is complete, and Phase 2 (effect implementation) is in progress.

## License

MIT License
