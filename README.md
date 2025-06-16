# Professional Glitch Art Studio

A sophisticated web-based image manipulation tool that combines destructive glitch effects with non-destructive filter processing and an advanced selection system. Built with vanilla JavaScript in a modular architecture for easy extension and maintenance.

## 🎨 Core Features

### **Modular Architecture**
- **Effects System**: Separate destructive and non-destructive effect pipelines
- **Selection System**: Advanced region detection with manual and automatic modes
- **Canvas Management**: Centralized image processing and rendering
- **UI System**: Modular interface components with clean separation of concerns

### **Effect Pipeline**
The application processes effects in this order:
1. **Selection** → Define regions for targeted effects
2. **Destructive Effects** → Pixel manipulation (Direction, Spiral, Slice, Pixel Sort, Color)
3. **Non-Destructive Filters** → Image filters applied as final pass
4. **Display** → Real-time canvas rendering

---

## 🛠️ Technical Implementation

### **Project Structure**
```
GlitcherApp_refactored/
├── index.html                    # Main interface
├── main.js                       # Application entry point & coordination
├── config/
│   └── constants.js              # Effect defaults and configuration
├── core/
│   ├── canvas-manager.js         # Canvas operations and image handling
│   └── recording-manager.js      # Video recording management
├── selection/
│   ├── selection-manager.js      # Selection state and operations
│   └── selection-engine.js       # Intelligent selection algorithms
├── ui/
│   ├── selection-ui.js           # Selection interface controls
│   └── canvas-interaction.js     # Mouse/touch event handling
├── effects/
│   ├── destructive/              # Pixel manipulation effects
│   │   ├── direction-effects.js  # Directional pixel shifting
│   │   ├── spiral-effects.js     # Swirl and spiral distortions
│   │   ├── slice-effects.js      # Color channel slicing
│   │   ├── pixel-sort-effects.js # Pixel sorting algorithms
│   │   └── color-effects.js      # Color manipulation
│   └── non-destructive/          # Filter effects
│       ├── filter-effects.js     # Filter pipeline manager
│       ├── pop-art-filter.js     # Pop art style filters
│       └── vintage-film-filter.js # Film emulation filters
└── utils/
    ├── color-utils.js            # Color space conversions
    ├── image-utils.js            # Image processing utilities
    └── math-utils.js             # Mathematical operations
```

### **Key Classes and Responsibilities**

#### **GlitcherApp (main.js)**
- Application lifecycle management
- Effect coordination and animation loop
- State management for all effect parameters
- Integration between selection system and effects

#### **CanvasManager (core/canvas-manager.js)**
- Image loading and canvas initialization
- Original/working image data management
- Canvas rendering and reset operations
- Coordinate transformations

#### **RecordingManager (core/recording-manager.js)**
- Manages video recording functionality using the browser's `MediaRecorder` API.
- Captures the main canvas stream for video output.
- Implements frame-based recording, allowing users to specify the exact number of frames to capture.
- Provides options for selecting the output video's Frames Per Second (FPS), including 15, 24, 30, and 60 FPS.
- Generates downloadable video files (typically `.webm`) with filenames indicating frame count and FPS.

#### **SelectionManager (selection/selection-manager.js)**
- Selection mask management (Uint8Array)
- Manual selection tools (brush, wand, lasso, rectangle)
- Selection operations (clear, invert, history)
- Integration with effect system

#### **SelectionEngine (selection/selection-engine.js)**
- Intelligent selection algorithms
- Color range detection with flood-fill
- Brightness zone analysis
- Edge detection using Sobel operators
- Organic shape generation

#### **SelectionUI (ui/selection-ui.js)**
- Selection interface controls
- Method-specific parameter management
- Tool button states and interactions
- UI visibility logic

---

## 🎯 Selection System

### **Selection Modes**

#### **Automatic Mode (Default)**
Algorithmic selection generation with configurable parameters:

1. **Random (Classic)** - Traditional random rectangular regions
   - **Intensity**: Small/Medium/Large/Extra Large
   - Used for classic glitch art effects

2. **Color Range** - Intelligent color-based selection
   - **Target Hue**: 0-360° color wheel selection
   - **Color Tolerance**: Sensitivity for similar colors
   - **Min Region Size**: Minimum pixels for valid regions
   - Uses flood-fill algorithm for connected regions

3. **Brightness Zones** - Luminance-based selection
   - **Shadows**: Dark areas (< 30% brightness)
   - **Midtones**: Medium areas (30-70% brightness)  
   - **Highlights**: Bright areas (> 70% brightness)

4. **Edge Detection** - Structural feature detection
   - **Edge Sensitivity**: Sobel operator threshold
   - Detects high-contrast boundaries and textures

5. **Organic Shapes** - Blob-like region generation
   - **Shape Randomness**: Variation in blob shapes
   - **Shape Count**: Number of organic regions
   - Creates natural, flowing selection areas

6. **Content Aware** - Multi-algorithm combination
   - Combines edge detection with color variance
   - Automatically balances different detection methods

7. **Combined Methods** - User-configurable algorithm mixing
   - **Use Color Range**: Toggle color-based detection
   - **Use Brightness**: Toggle luminance-based detection
   - **Use Edges**: Toggle edge-based detection
   - Weighted combination of selected algorithms

#### **Manual Mode**
Interactive selection tools for precise control:

1. **Rectangle Select** - Click and drag rectangular selections
2. **Brush Tool** - Paint selections with adjustable brush size (10-100px)
3. **Magic Wand** - Click to select similar colors with tolerance
4. **Lasso Tool** - Freeform polygon selection

**Manual Mode Features:**
- Real-time selection preview overlay
- Selection accumulation (additive)
- Clear all selections
- Invert selection
- Brush cursor visualization

### **Selection Integration**
- **Selection Mask**: Uint8Array representing selected pixels (255 = selected, 0 = unselected)
- **Effect Clumps**: Selections converted to rectangular regions for effect application
- **Lifetime Management**: Each selection has configurable duration (1-300 frames)
- **History System**: Last 10 selections stored for replay/undo

---

## 🎬 Recording Features

The application now supports video recording with the following features:

- **Frame-Based Recording**: Instead of recording for a set duration, users can specify the exact number of frames to capture (e.g., 30 to 600 frames).
- **Selectable Output FPS**: Users can choose the desired frames per second for the output video, with options for 15, 24, 30 (default), and 60 FPS.
- **Canvas Stream Capture**: Utilizes the browser's `MediaRecorder` API to capture the main canvas content.
- **UI Integration**: New controls in the panel allow easy configuration of frame count and target FPS.
- **Filename Convention**: Downloaded videos include frame count and FPS in their filenames (e.g., `glitch_art_150frames_30fps.webm`).

**Note**: While functional, there can be inconsistencies with output video frame rates, which may result in perceived lag in the exported video. This is often dependent on browser performance and system capabilities. Further optimization may be required for perfectly smooth exports across all environments.

---

## ⚡ Destructive Effects

Effects that permanently modify pixel data in the working image:

### **Direction Effects (direction-effects.js)**
Pixel shifting in cardinal directions:
- **Directions**: Down, Up, Right, Left, Random, Jitter
- **Speed**: 1-5 pixel shift amount
- **Selection Aware**: Only affects selected regions when mask provided

### **Spiral Effects (spiral-effects.js)**
Swirl and rotation distortions:
- **Types**: Spiral, Inside-Out, Outside-In, Random, Clockwise, Counter-Clockwise
- **Strength**: 0.01-0.15 distortion amount
- **Direction Control**: Global spiral direction toggle
- **Selection Aware**: Respects selection boundaries

### **Slice Effects (slice-effects.js)**
Color channel manipulation:
- **Modes**: Horizontal, Vertical, Both directions
- **Color Offset**: 0-50 pixel channel displacement
- **RGB Separation**: Creates chromatic aberration effects

### **Pixel Sort Effects (pixel-sort-effects.js)**
Algorithmic pixel reordering:
- **Column Brightness**: Sort columns by luminance
- **Row Brightness**: Sort rows by luminance  
- **Column/Row Hue**: Sort by color hue values
- **Random Lines**: Random line-based sorting
- **Diagonal Sort**: Diagonal line sorting
- **Circular Sort**: Radial sorting patterns
- **Wave Sort**: Sine wave-based sorting

### **Color Effects (color-effects.js)**
Color space manipulation:
- **Chromatic Aberration**: RGB channel separation
- **Hue Shift**: Color wheel rotation
- **Saturation Boost**: Color intensity enhancement
- **Color Invert**: RGB value inversion
- **Vintage**: Retro color grading
- **Color Noise**: Random color artifacts
- **Intensity Control**: 0-100% effect strength

---

## 🎨 Non-Destructive Filters

Applied as final pass, preserving original destructive effects:

### **Pop Art Filter (pop-art-filter.js)**
- **Warhol Style**: High contrast with limited colors
- **Lichtenstein Style**: Comic book aesthetic with Ben-Day dots
- **Neon Pop**: Vibrant electric colors
- **Psychedelic**: Extreme color shifts and high saturation

### **Vintage Film Filter (vintage-film-filter.js)**
- **Polaroid**: Instant camera aesthetic
- **Kodachrome**: Classic slide film colors
- **Faded Photo**: Aged photograph look
- **Sepia**: Monochromatic brown tones
- **Film Grain**: 0-100% grain intensity

### **Additional Filters**
- **Emboss**: 3D raised surface effect
- **Edge Detection**: Outline extraction
- **Motion Blur**: Directional blur (Horizontal/Vertical/Diagonal)
- **Vignette**: Edge darkening
- **Halftone**: Dot pattern printing simulation (Circle/Square patterns)

### **Filter Pipeline**
- **Intensity Control**: 0-100% filter strength
- **Method-Specific Parameters**: Each filter has unique controls
- **Real-time Preview**: Live filter application
- **Non-Destructive**: Can be changed/removed without affecting base effects

---

## 🎮 User Interface

### **Control Panel Organization**
1. **Image Upload**: Drag & drop or click to browse
2. **Intensity**: Effect magnitude (for Random selection only)
3. **Selection Method**: Algorithm and mode selection
4. **Effect Duration**: Min/max lifetime controls
5. **Filter Effects**: Non-destructive filter pipeline
6. **Destructive Effects**: Individual effect controls
7. **Playback Controls**: Play/pause/reset
8. **Recording Controls**: Frame count and FPS selection for video export
9. **Development Status**: Feature implementation tracking

### **Selection Interface**
- **Manual Mode Toggle**: Switch between automatic and manual selection
- **Method Dropdown**: Selection algorithm choice
- **Method-Specific Controls**: Parameters that appear based on selected method
- **Interactive Tools**: Manual selection tool buttons
- **Preview Toggle**: Show/hide selection overlay
- **Sensitivity Slider**: Fine-tune automatic algorithms

### **Real-time Feedback**
- **Selection Preview**: Translucent cyan overlay showing selected regions
- **Tool Cursors**: Visual feedback for active tools
- **Parameter Values**: Live display of all slider values
- **Status Indicators**: Animation state and system status

---

## 🔧 Development Architecture

### **Modular Design Principles**
- **Separation of Concerns**: Each module has a single responsibility
- **Loose Coupling**: Modules communicate through well-defined interfaces
- **Easy Extension**: New effects and selection methods can be added easily
- **Testable Components**: Each module can be tested independently

### **Effect Integration Pattern**
All destructive effects follow this pattern:
```javascript
EffectModule.applyEffect(imageData, clump, params, selectionMask);
```
- **imageData**: Working canvas ImageData object
- **clump**: Region definition {x, y, w, h, framesRemaining}
- **params**: Effect-specific parameters
- **selectionMask**: Optional Uint8Array for selection-aware effects

### **Selection System Architecture**
- **SelectionManager**: High-level selection operations and state
- **SelectionEngine**: Algorithm implementations
- **SelectionUI**: Interface controls and user interaction
- **CanvasInteraction**: Mouse/touch event handling

### **State Management**
- **App State**: Main application coordinates all module states
- **Effect State**: Each effect maintains its own parameters
- **Selection State**: Selection mask and history managed separately
- **UI State**: Interface visibility and tool states

### **Performance Optimizations**
- **Frame Rate Limiting**: 60 FPS animation loop
- **Selective Updates**: Only process effects on active clumps
- **Efficient Algorithms**: Optimized pixel processing and selection detection
- **Memory Management**: Proper cleanup of temporary objects

---

## 🚀 Usage Examples

### **Basic Workflow**
1. Upload an image
2. Choose selection method (or use manual tools)
3. Configure destructive effects
4. Add filter effects as desired
5. Adjust effect duration and intensity
6. Play/pause to control animation
7. Record video with frame count and FPS selection

### **Advanced Techniques**
- **Layered Effects**: Combine multiple destructive effects
- **Targeted Effects**: Use selection system for precise effect placement
- **Style Combinations**: Mix destructive glitches with filter aesthetics
- **Custom Workflows**: Create unique effect combinations

### **Creative Applications**
- **Digital Art**: Create unique visual aesthetics
- **Photo Manipulation**: Artistic image processing
- **Visual Effects**: Generate textures and backgrounds
- **Experimental Art**: Explore algorithmic creativity

---

## 🛠️ Extension Guidelines

### **Adding New Destructive Effects**
1. Create new file in `effects/destructive/`
2. Implement effect function following standard pattern
3. Add selection mask support for targeted effects
4. Register effect in main application
5. Add UI controls in HTML

### **Adding New Selection Algorithms**
1. Add method to `SelectionEngine.generateSelections()`
2. Implement algorithm with configurable parameters
3. Add UI controls for method-specific parameters
4. Update `SelectionUI.handleSelectionMethodChange()`

### **Adding New Filter Effects**
1. Implement filter in appropriate module
2. Add to `FilterEffects.apply()` switch statement
3. Create filter-specific UI controls
4. Add to filter dropdown options

### **Debugging Tools**
- **Console Debug**: `window.getGlitcherDebugInfo()` - System state information
- **Selection Debug**: `window.glitcherApp.selectionManager.getDebugInfo()` - Selection system state
- **Browser DevTools**: Standard debugging and performance profiling

---

## 🎯 Future Enhancement Opportunities

### **Effect System**
- **Custom Shaders**: WebGL-based effects for GPU acceleration
- **3D Effects**: Depth-based manipulations
- **Temporal Effects**: Multi-frame processing
- **Audio-Reactive**: Effects driven by audio input

### **Selection System**
- **AI-Powered Selection**: Machine learning-based object detection
- **Gradient Selections**: Soft-edge selection boundaries  
- **Selection Presets**: Saved selection patterns
- **Advanced Tools**: Magnetic lasso, quick selection

### **User Experience**
- **Preset System**: Save/load effect combinations
- **Batch Processing**: Process multiple images
- **Advanced Export Options**: Enhanced video recording (e.g., different codecs, resolutions, improved performance/stability), high-resolution image output
- **Undo/Redo**: Full action history

### **Performance**
- **WebGL Acceleration**: GPU-based image processing
- **Web Workers**: Background processing for heavy operations
- **Streaming**: Large image processing in chunks
- **Progressive Loading**: Lazy loading of effect modules

---

## 📚 Technical Reference

### **Key Dependencies**
- **Vanilla JavaScript**: No external frameworks required
- **Canvas API**: Core image manipulation
- **ES6 Modules**: Modern module system
- **CSS3**: Advanced styling and animations

### **Browser Compatibility**
- **Modern Browsers**: Chrome, Firefox, Safari, Edge (ES6+ support required)
- **Mobile Support**: Touch events for mobile interaction
- **Canvas Support**: HTML5 Canvas API required

### **Performance Characteristics**
- **Memory Usage**: Proportional to image size and active selections
- **CPU Usage**: Optimized algorithms with frame rate limiting
- **Real-time Processing**: 60 FPS animation loop with selective updates

---

This comprehensive tool provides a professional foundation for glitch art creation with extensive customization options and a solid architecture for future enhancements. The modular design ensures maintainability while the advanced selection system enables precise creative control.