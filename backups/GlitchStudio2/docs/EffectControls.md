# GlitchStudio2 Effect Controls Documentation

This document outlines the UI/UX control types for all effects in GlitchStudio2, including both currently implemented effects and those planned for future implementation. The goal is to ensure a consistent, intuitive, and functional user experience across all effect controls.

## Control Types

GlitchStudio2 uses the following control types:

1. **Toggle Switch**: For binary on/off effects or features
2. **Slider**: For continuous numerical values with visual feedback
3. **Range Slider**: For selecting a range between two values
4. **Dropdown/Select**: For choosing from a predefined list of options
5. **Color Picker**: For selecting colors
6. **Text Input**: For entering specific values or text strings
7. **Radio Buttons**: For mutually exclusive options
8. **Direction Pad**: For selecting direction or angle

## Currently Implemented Effects

### Artistic Effects

#### Halftone
- **Dot Size** (Slider: 1-20 pixels)
- **Pattern** (Dropdown: Circle, Square, Line)
- **Angle** (Slider: 0-360 degrees)
- **Spacing** (Slider: 1-50 pixels)

#### Swirl
- **Intensity** (Slider: 0.0-1.0)
- **Center X** (Slider: 0-100%)
- **Center Y** (Slider: 0-100%)
- **Radius** (Slider: 0-100%)

### Color Effects

#### Invert
- **Enable** (Toggle Switch)
- **Channel** (Dropdown: All, Red, Green, Blue)
- **Preserve Luminosity** (Toggle Switch)

#### Hue-shift
- **Shift Amount** (Slider: 0-360 degrees)
- **Affect Saturation** (Toggle Switch)
- **Saturation Amount** (Slider: 0-200%, only visible if Affect Saturation is on)

### Distortion Effects

#### Mirror
- **Direction** (Dropdown: Horizontal, Vertical, Both)
- **Position** (Slider: 0-100%)
- **Flip** (Toggle Switch)

#### Pixelate
- **Pixel Size** (Slider: 1-100 pixels)
- **Shape** (Dropdown: Square, Circle, Diamond)
- **Preserve Edges** (Toggle Switch)

### Filter Effects

#### Edge Detection
- **Threshold** (Slider: 0-255)
- **Mode** (Dropdown: Standard, Sobel, Prewitt)
- **Invert** (Toggle Switch)
- **Color Edges** (Toggle Switch)
- **Edge Color** (Color Picker, only visible if Color Edges is on)

#### Blur
- **Radius** (Slider: 0-50 pixels)
- **Type** (Dropdown: Gaussian, Box, Motion)
- **Direction** (Direction Pad, only visible if Type is Motion)

### Glitch Effects

#### Direction Shift
- **Shift Amount** (Slider: 0-100 pixels)
- **Direction** (Dropdown: Horizontal, Vertical, Random)
- **Randomize** (Toggle Switch)
- **Seed** (Text Input, only visible if Randomize is off)

#### Slice
- **Count** (Slider: 1-50 slices)
- **Displacement** (Slider: 0-100 pixels)
- **Direction** (Dropdown: Horizontal, Vertical)
- **Random Offset** (Toggle Switch)

#### Spiral
- **Intensity** (Slider: 0-100)
- **Center X** (Slider: 0-100%)
- **Center Y** (Slider: 0-100%)
- **Reverse** (Toggle Switch)

#### Pixel Sort
- **Threshold** (Slider: 0-255)
- **Direction** (Dropdown: Horizontal, Vertical)
- **Sort Mode** (Dropdown: Brightness, Hue, Saturation)
- **Reverse Sort** (Toggle Switch)

### Experimental Effects

#### RGB Split
- **Distance** (Slider: 0-100 pixels)
- **Angle** (Slider: 0-360 degrees)
- **Channel Mix** (Dropdown: RGB, RBG, GRB, GBR, BRG, BGR)

#### Datamosh
- **Intensity** (Slider: 0-100)
- **Block Size** (Slider: 1-50 pixels)
- **Direction** (Dropdown: Horizontal, Vertical, Both)
- **Randomize** (Toggle Switch)

## Effects to be Implemented

### Artistic Effects

#### Emboss
- **Strength** (Slider: 0-10)
- **Direction** (Direction Pad)
- **Depth** (Slider: 1-10)
- **Preserve Colors** (Toggle Switch)

### Distortion Effects

#### Liquify
- **Intensity** (Slider: 0-100)
- **Brush Size** (Slider: 1-100 pixels)
- **Mode** (Dropdown: Push, Twirl, Expand, Contract)
- **Interactive Canvas** (Special: Click and drag interface)

#### Motion Blur
- **Distance** (Slider: 0-100 pixels)
- **Angle** (Slider: 0-360 degrees or Direction Pad)
- **Falloff** (Slider: 0-100%)

### Color Effects

#### Threshold
- **Threshold Value** (Slider: 0-255)
- **Soft Threshold** (Toggle Switch)
- **Soft Range** (Slider: 0-100, only visible if Soft Threshold is on)

#### Posterize
- **Levels** (Slider: 2-16)
- **Dither** (Toggle Switch)
- **Dither Amount** (Slider: 0-100%, only visible if Dither is on)

### Filter Effects

#### Noise
- **Amount** (Slider: 0-100%)
- **Type** (Dropdown: Gaussian, Salt & Pepper, Uniform)
- **Monochrome** (Toggle Switch)
- **Seed** (Text Input for reproducible noise)

### Experimental Effects

#### Vignette
- **Amount** (Slider: 0-100%)
- **Softness** (Slider: 0-100%)
- **Shape** (Dropdown: Circle, Square)
- **Center X** (Slider: 0-100%)
- **Center Y** (Slider: 0-100%)
- **Color** (Color Picker)

## UI/UX Guidelines

### Control Visibility
- Controls should only be visible when they are applicable
- Dependent controls should be hidden or disabled when their parent control is off
- Advanced controls should be collapsible to avoid overwhelming users

### Control Grouping
- Related controls should be grouped together
- Groups should have clear headings
- Similar effects should maintain consistent control layouts

### Tooltips and Help
- Every control should have a tooltip explaining its function
- Complex effects should have a help icon with additional information
- Examples of different settings should be provided where possible

### Presets
- Each effect should have default presets
- Users should be able to save their own presets
- Presets should be easily accessible from the effect panel

### Keyboard Shortcuts
- Common actions should have keyboard shortcuts
- Modifier keys (Shift, Alt, Ctrl) can be used to fine-tune control adjustments
- Shortcut hints should be visible in tooltips

### Accessibility
- Controls should be keyboard navigable
- Color choices should consider color blindness
- Text should have sufficient contrast

### Performance Feedback
- Effects that are computationally intensive should provide visual feedback
- Progress indicators for time-consuming operations
- Performance warnings for combinations that might slow down the application

## Implementation Notes

1. Use consistent styling for all control types
2. Ensure controls update in real-time when possible
3. Provide appropriate min/max values and step sizes for sliders
4. Include units where applicable (px, %, degrees)
5. Save user preferences for control settings
6. Consider mobile/touch interfaces for future versions
