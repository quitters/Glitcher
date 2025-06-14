# Glitcher - Professional Glitch Art Studio

A powerful, browser-based glitch art tool that transforms ordinary images into stunning digital art through advanced selection methods, interactive tools, and real-time effects processing.

## 🌟 Features Overview

### Advanced Selection Methods
- **Random Selection** - Classic random rectangular areas
- **Color Range** - Target specific colors with hue tolerance
- **Brightness Zones** - Select shadows, midtones, or highlights
- **Edge Detection** - Find high-contrast areas using Sobel operators
- **Organic Shapes** - Generate blob-like natural selections
- **Content Aware** - Combines multiple algorithms for intelligent selection
- **Combined Methods** - Mix multiple selection strategies

### Interactive Selection Tools
- **Select Tool (🔲)** - Click and drag rectangular selections
- **Brush Tool (🖌️)** - Paint selections with adjustable brush size
- **Magic Wand Tool (✨)** - Select similar colors with one click
- **Lasso Tool (🔗)** - Draw freeform selections
- **Selection Management** - Clear, invert, and preview selections

### Glitch Effects
- **Direction Shift** - Move pixels in various directions (down, up, left, right, random, jitter)
- **Spiral Effects** - Create swirl patterns (clockwise, counter-clockwise, inside-out, outside-in)
- **Slice Glitch** - Horizontal and vertical displacement with color shifts
- **Pixel Sorting** - Sort by brightness, hue, or custom algorithms (diagonal, circular)
- **Color Effects** - Chromatic aberration, hue shift, saturation boost, vintage, color inversion
- **Datamoshing** - Random bytes, bit shifting, compression artifacts, scanlines

### Audio Reactive Features
- **Microphone Integration** - Effects respond to audio input
- **Real-time Responsiveness** - Adjust effect intensity based on audio levels
- **Configurable Sensitivity** - Fine-tune audio response

## 🚀 Getting Started

### Quick Start
1. Open `glitcherIndex.html` in a modern web browser
2. Upload an image by clicking the upload area or dragging and dropping
3. Choose your selection method and adjust parameters
4. Select glitch effects and watch your art come alive
5. Export your creation as an image or video

### System Requirements
- Modern web browser (Chrome, Firefox, Safari, Edge)
- WebGL support for optimal performance
- Microphone access (optional, for audio reactive features)

## 🎛️ Interface Guide

### Control Panel Sections

#### Image Source
- **File Upload** - Drag and drop or click to browse
- **Supported Formats** - JPG, PNG, GIF

#### Selection Method
- **Manual Mode Toggle** - Switch between automatic and interactive selection
- **Method Selector** - Choose from 7 different selection algorithms
- **Method-Specific Controls** - Adjust parameters for each selection type
- **Selection Sensitivity** - Global sensitivity multiplier (0.5x - 2.0x)

#### Interactive Tools (Manual Mode)
- **Tool Buttons** - Select, Brush, Wand, Lasso
- **Brush Size** - Adjustable from 10-100 pixels
- **Clear/Invert** - Selection management controls

#### Effect Controls
- **Movement Direction** - Control pixel displacement
- **Spiral Effects** - Swirl and rotation effects
- **Slice Glitch** - Displacement and color shifting
- **Pixel Sort** - Various sorting algorithms
- **Color Effects** - Color manipulation tools
- **Datamosh** - Digital corruption effects

#### Audio Reactive
- **Microphone Toggle** - Enable audio responsiveness
- **Sensitivity Control** - Adjust audio reaction strength

#### Effect Duration
- **Min/Max Lifetime** - Control how long effects persist
- **Dynamic Timing** - Effects appear and disappear over time

#### Controls
- **Play/Pause** - Start/stop the animation
- **Reset** - Restore original image
- **Randomize** - Generate random settings

#### Presets
- **Built-in Presets** - Vintage TV, Digital Chaos, Rainbow Sort, Cyberpunk, Film Burn
- **Save/Load** - Create and share custom presets
- **Import/Export** - JSON-based preset files

#### Recording
- **Video Recording** - Export MP4/WebM videos (1-20 seconds)
- **Reverse Option** - Create reverse playback videos
- **Snapshot** - Save current frame as PNG
- **Batch Export** - Generate 10 random variations

## 🔧 Technical Details

### Performance Optimizations
- **Intelligent Caching** - Reduces redundant calculations
- **Frame Rate Limiting** - Maintains 60 FPS target
- **Memory Management** - Efficient image data handling
- **Progressive Enhancement** - Graceful degradation on slower devices

### Image Processing
- **Optimal Resizing** - Automatically resizes images to 1-2MP for performance
- **Aspect Ratio Preservation** - Maintains original proportions
- **Color Space Handling** - RGB and HSL color manipulations

### Selection Engine Architecture
```javascript
class SelectionEngine {
  - Advanced flood-fill algorithms
  - Sobel edge detection
  - Color similarity analysis
  - Organic shape generation
  - Performance caching system
}
```

### Real-time Processing
- **60 FPS Animation** - Smooth real-time effects
- **Dynamic Effect Application** - Effects respond to user input
- **Live Preview** - See changes instantly

## 🎨 Usage Examples

### Creating Vintage TV Effects
1. Select "Vintage TV" preset
2. Use brightness-based selection targeting highlights
3. Apply horizontal slice glitch with scanlines
4. Add vintage color effects

### Digital Chaos Art
1. Choose "Digital Chaos" preset
2. Use edge detection for selection
3. Apply random direction shifts
4. Add chromatic aberration and random byte corruption

### Manual Selection Workflow
1. Enable Manual Selection Mode
2. Use Brush Tool to paint areas of interest
3. Apply pixel sorting effects
4. Fine-tune with color effects

### Audio Reactive Performance
1. Enable microphone access
2. Set high audio sensitivity
3. Use random or organic selections
4. Effects will pulse and react to sound

## 📁 File Structure

```
Glitcher/New/
├── glitcherIndex.html    # Main HTML file
├── glitcher.js           # Core JavaScript implementation
├── backup/               # Backup files
│   └── glitcher.js
└── README.md            # This documentation
```

## 🔬 Advanced Features

### Selection Method Details

#### Color Range Selection
- **Target Hue** - 0-360° color wheel position
- **Tolerance** - How strict the color matching is
- **Region Size** - Minimum area to be considered a selection

#### Edge Detection
- **Threshold** - Sensitivity to contrast changes
- **Algorithm** - Sobel operator implementation
- **Region Merging** - Combines nearby edge areas

#### Organic Shapes
- **Randomness** - How irregular the shapes are
- **Count** - Number of organic regions to generate
- **Size Variation** - Dynamic sizing based on image content

### Effect Combinations
- **Layered Processing** - Multiple effects can be active simultaneously
- **Order Independence** - Effects are applied in optimal sequence
- **Real-time Adjustment** - Change parameters while effects are running

### Performance Monitoring
- **Frame Rate Display** - Shows current FPS
- **Memory Usage** - Tracks image data memory consumption
- **Quality Scaling** - Automatically adjusts for performance

## 🎯 Tips & Best Practices

### For Best Results
1. **Start Simple** - Try one effect at a time before combining
2. **Use Presets** - Built-in presets are great starting points
3. **Preview Selections** - Enable selection preview to see target areas
4. **Save Favorites** - Export presets you like for future use

### Performance Tips
1. **Image Size** - Larger images require more processing power
2. **Effect Intensity** - Lower intensities perform better
3. **Selection Complexity** - Simple selections are faster
4. **Browser Choice** - Chrome typically offers best performance

### Creative Techniques
1. **Manual + Auto** - Switch between modes for precise control
2. **Audio Sync** - Sync effects to music for dynamic art
3. **Batch Processing** - Generate multiple variations for comparison
4. **Preset Mixing** - Load presets and modify for unique looks

## 🐛 Troubleshooting

### Common Issues

**Image won't load**
- Check file format (JPG, PNG, GIF supported)
- Ensure file isn't corrupted
- Try a smaller file size

**Effects not appearing**
- Verify an image is loaded
- Check that effects aren't set to "off"
- Ensure selections are being generated

**Poor performance**
- Reduce image size
- Lower effect intensities
- Disable audio reactive features
- Close other browser tabs

**Audio reactive not working**
- Grant microphone permissions
- Check browser security settings
- Ensure microphone is connected

### Browser Compatibility
- **Chrome/Chromium** - Full feature support
- **Firefox** - Full feature support
- **Safari** - Full feature support
- **Edge** - Full feature support
- **Mobile Browsers** - Touch events supported

## 🔮 Future Enhancements

### Planned Features
- **GPU Acceleration** - WebGL-based effect processing
- **AI Selection** - Machine learning-based region detection
- **3D Effects** - Depth-based glitch effects
- **Social Sharing** - Direct export to social platforms
- **Collaborative Editing** - Real-time multi-user sessions

### Experimental Features
- **VR/AR Support** - Immersive glitch art creation
- **Procedural Generation** - Algorithm-generated base images
- **Time-based Effects** - Effects that evolve over longer periods
- **Advanced Physics** - Particle-based effect systems

## 📝 License

This project is open source. Feel free to use, modify, and distribute according to your needs.

## 🤝 Contributing

Contributions are welcome! Whether it's bug fixes, new features, or documentation improvements, your input helps make Glitcher better for everyone.

## 📧 Support

For questions, bug reports, or feature requests, please create an issue in the project repository.

---

**Glitcher** - Transform the ordinary into extraordinary digital art. 🎨✨
