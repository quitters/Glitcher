# Glitcher Project

This project is a web-based application for applying glitch art effects to images and videos.

## Features

*   Image loading and manipulation
*   Various glitch effects (Directional, Spiral, Slice, Pixel Sort, Color)
*   Canvas-based rendering
*   Video recording of canvas animations
*   Snapshot capture of the current canvas state
*   Batch export of multiple glitched image variations as a ZIP file

## Known Issues / Current Limitations

*   **Reverse Video Functionality**: The "Reverse" option for video recording attempts to reverse the order of recorded video segments. However, due to the nature of video encoding and how the MediaRecorder API produces data (often as a single segment for shorter recordings), this feature does not reliably produce a visually reversed video in the current build. The output video will typically play forward.

## Setup and Usage

(To be added: Instructions on how to set up and run the project locally.)
