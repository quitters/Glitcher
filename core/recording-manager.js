/**
 * @class RecordingManager
 * @description Manages video recording, snapshots, and batch exports for the Glitcher application.
 */
import { UI_ELEMENTS } from '../config/constants.js';

export class RecordingManager {
  constructor(glitcherApp) {
    this.glitcherApp = glitcherApp;
    this.canvas = document.getElementById(UI_ELEMENTS.CANVAS_ID);
    this.mediaRecorder = null;
    this.recordedChunks = [];

    this.initDOMElements();
    this.setupEventListeners();

    console.log('🎥 RecordingManager initialized');
  }

  initDOMElements() {
    this.recordBtn = document.getElementById('record-btn');
    console.log('Record Button Element:', this.recordBtn);
    this.snapshotBtn = document.getElementById('snapshot-btn');
    console.log('Snapshot Button Element:', this.snapshotBtn);
    this.batchExportBtn = document.getElementById('batch-export-btn');
    console.log('Batch Export Button Element:', this.batchExportBtn);
    if (this.batchExportBtn) {
      this.batchExportBtnOriginalText = this.batchExportBtn.innerHTML;
    }
    this.durationSlider = document.getElementById('record-range');
    console.log('Duration Slider Element:', this.durationSlider);
    this.durationValue = document.getElementById('record-value');
    this.reverseCheckbox = document.getElementById('reverse-checkbox');
  }

  setupEventListeners() {
    if (this.durationSlider) {
      this.durationSlider.addEventListener('input', () => {
        if (this.durationValue) {
          this.durationValue.textContent = `${this.durationSlider.value}s`;
        }
      });
      console.log('Duration slider event listener attached.');
    } else {
      console.error('Duration slider not found.');
    }

    if (this.recordBtn) {
      this.recordBtn.addEventListener('click', () => this.startRecording());
      console.log('Record button event listener attached.');
    } else {
      console.error('Record button not found.');
    }

    if (this.snapshotBtn) {
      this.snapshotBtn.addEventListener('click', () => this.downloadSnapshot());
      console.log('Snapshot button event listener attached.');
    } else {
      console.error('Snapshot button not found.');
    }

    if (this.batchExportBtn) {
      this.batchExportBtn.addEventListener('click', () => this.batchExport());
      console.log('Batch export button event listener attached.');
    } else {
      console.error('Batch export button not found.');
    }
  }

  startRecording() {
    if (!this.canvas) {
      console.error('RecordingManager: Canvas element not found for startRecording.');
      alert('Error: Canvas not available for recording.');
      return;
    }
    if (!this.glitcherApp.canvasManager.glitchImageData) {
      alert('Please load an image first.');
      return;
    }

    const duration = parseInt(this.durationSlider.value, 10);
    const doReverse = this.reverseCheckbox.checked;
    this.recordedChunks = [];

    let options = { mimeType: 'video/mp4; codecs=avc1.42E01E', videoBitsPerSecond: 15000000 };
    if (!MediaRecorder.isTypeSupported(options.mimeType)) {
      options = { mimeType: 'video/webm; codecs=vp9', videoBitsPerSecond: 10000000 };
    }

    const stream = this.canvas.captureStream(30);
    this.mediaRecorder = new MediaRecorder(stream, options);

    this.mediaRecorder.ondataavailable = (e) => {
      if (e.data && e.data.size > 0) this.recordedChunks.push(e.data);
    };

    this.mediaRecorder.onstop = () => {
      console.log('[RecordingManager] onstop: doReverse =', doReverse);
      console.log('[RecordingManager] onstop: recordedChunks before reverse:', JSON.stringify(this.recordedChunks.map(c => ({ size: c.size, type: c.type }))));
      if (doReverse) {
        this.recordedChunks.reverse();
        console.log('[RecordingManager] onstop: recordedChunks after reverse:', JSON.stringify(this.recordedChunks.map(c => ({ size: c.size, type: c.type }))));
      }
      const blob = new Blob(this.recordedChunks, { type: options.mimeType });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = options.mimeType.includes('mp4') ? 'glitch_recording.mp4' : 'glitch_recording.webm';
      link.click();
      URL.revokeObjectURL(url);
      this.recordBtn.innerHTML = '🎥 Record';
      this.recordBtn.disabled = false;
    };

    this.recordBtn.innerHTML = '🔴 Recording...';
    this.recordBtn.disabled = true;
    this.mediaRecorder.start();
    setTimeout(() => {
      if (this.mediaRecorder && this.mediaRecorder.state === 'recording') this.mediaRecorder.stop();
    }, duration * 1000);
  }

  downloadSnapshot() {
    if (!this.canvas) {
      console.error('RecordingManager: Canvas element not found for downloadSnapshot.');
      alert('Error: Canvas not available for snapshot.');
      return;
    }
    if (!this.glitcherApp.canvasManager.glitchImageData) {
      alert('Please load an image first.');
      return;
    }
    const dataURL = this.canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.href = dataURL;
    link.download = 'glitch_snapshot.png';
    link.click();
    this.snapshotBtn.innerHTML = '📸 Saved!';
    setTimeout(() => { this.snapshotBtn.innerHTML = '📷 Snapshot'; }, 1500);
  }

  async batchExport() {
    if (!this.canvas) {
      console.error('RecordingManager: Canvas element not found for batchExport.');
      alert('Error: Canvas not available for batch export.');
      return;
    }
    if (!this.glitcherApp.canvasManager.originalImageData) {
      alert('Please load an image first.');
      return;
    }

    if (typeof JSZip === 'undefined') {
      try {
        await this._loadJSZip();
      } catch (error) {
        alert('Failed to load JSZip. Please check your internet connection.');
        return;
      }
    }

    const numVariations = 10;
    const zip = new JSZip();
    const imgFolder = zip.folder('glitch_variations');
    this.batchExportBtn.innerHTML = `⏳ Generating (0/${numVariations})`;
    this.batchExportBtn.disabled = true;

    const originalImageData = this.glitcherApp.canvasManager.originalImageData;
    if (!originalImageData) {
      console.error('RecordingManager: Original image data not found in CanvasManager for batchExport.');
      alert('Error: Original image data not available for batch export.');
      if (this.batchExportBtn) {
        this.batchExportBtn.innerHTML = this.batchExportBtnOriginalText || '📦 Batch Export';
        this.batchExportBtn.disabled = false;
      }
      return;
    }
    const tempCanvas = document.createElement('canvas');
    tempCanvas.width = originalImageData.width;
    tempCanvas.height = originalImageData.height;
    const tempCtx = tempCanvas.getContext('2d');

    for (let i = 0; i < numVariations; i++) {
      const randomParams = this._randomizeSettings();
      console.log(`[RecordingManager] Batch Export - Variation ${i+1} params:`, JSON.stringify(randomParams));
      let effectedImageData;
      try {
        effectedImageData = this._applyEffects(originalImageData, randomParams);
      } catch (e) {
        console.error(`[RecordingManager] Batch Export - Error applying effects for variation ${i+1}:`, e);
        alert(`Error during batch export on variation ${i+1}. Check console for details.`);
        // Optionally, skip this variation or stop the export
        this.batchExportBtn.innerHTML = this.batchExportBtnOriginalText || '📦 Batch Export';
        this.batchExportBtn.disabled = false;
        return; // Stop batch export on first error for now
      }
      if (!effectedImageData) {
        console.error(`[RecordingManager] Batch Export - _applyEffects returned null/undefined for variation ${i+1}`);
        alert(`Error: Effect application failed for variation ${i+1}. Check console.`);
        this.batchExportBtn.innerHTML = this.batchExportBtnOriginalText || '📦 Batch Export';
        this.batchExportBtn.disabled = false;
        return; // Stop batch export
      }
      tempCtx.putImageData(effectedImageData, 0, 0);
      const dataURL = tempCanvas.toDataURL('image/png').split(',')[1];
      imgFolder.file(`variation_${i + 1}.png`, dataURL, { base64: true });
      this.batchExportBtn.innerHTML = `⏳ Generating (${i + 1}/${numVariations})`;
      await new Promise(resolve => setTimeout(resolve, 10));
    }

    const content = await zip.generateAsync({ type: 'blob' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(content);
    link.download = 'glitch_variations.zip';
    link.click();
    URL.revokeObjectURL(link.href);

    if (this.batchExportBtn) {
      this.batchExportBtn.innerHTML = this.batchExportBtnOriginalText || '📦 Batch Export';
    }
    this.batchExportBtn.disabled = false;
  }

  _applyEffects(imageData, params) {
    console.log('[RecordingManager] _applyEffects called with params:', JSON.stringify(params));
    const tempImageData = new ImageData(new Uint8ClampedArray(imageData.data), imageData.width, imageData.height);
    const { direction, speed, spiral, swirlStrength, slice, colorOffset, pixelSort, colorEffect, colorIntensity } = params;

    if (direction !== 'off') {
      console.log('[RecordingManager] _applyEffects: Applying direction', direction, 'Speed:', speed);
      const clump = { x: 0, y: 0, w: tempImageData.width, h: tempImageData.height, clumpDirection: direction };
      this.glitcherApp.DirectionEffects.applyDirectionShift(tempImageData, clump, speed, direction);
    }
    if (spiral !== 'off') {
      console.log('[RecordingManager] _applyEffects: Applying spiral', spiral, 'Strength:', swirlStrength);
      const rect = { x: 0, y: 0, w: tempImageData.width, h: tempImageData.height };
      this.glitcherApp.SpiralEffects.applySwirlEffect(tempImageData, rect, swirlStrength, spiral);
    }
    if (slice !== 'off') {
      console.log('[RecordingManager] _applyEffects: Applying slice', slice, 'Offset:', colorOffset);
      this.glitcherApp.SliceEffects.applySliceGlitch(tempImageData, slice, colorOffset);
    }
    if (pixelSort !== 'off') {
      console.log('[RecordingManager] _applyEffects: Applying pixelSort', pixelSort);
      this.glitcherApp.PixelSortEffects.applyPixelSort(tempImageData, pixelSort);
    }
    if (colorEffect !== 'off') {
      console.log('[RecordingManager] _applyEffects: Applying colorEffect', colorEffect, 'Intensity:', colorIntensity);
      // Note: applyColorEffect can be destructive or non-destructive.
      // It returns the pixel data that should be used.
      const returnedData = this.glitcherApp.ColorEffects.applyColorEffect(tempImageData, colorEffect, colorIntensity);
      if (returnedData && returnedData.data) {
        tempImageData.data.set(returnedData.data);
      } else if (returnedData) { // It might return the original Uint8ClampedArray
        tempImageData.data.set(returnedData);
      } else {
        console.warn('[RecordingManager] _applyEffects: colorEffects.applyColorEffect did not return valid data for effect:', colorEffect);
      }
    }
    return tempImageData;
  }

  _randomizeSettings() {
    const directions = ['off', 'left', 'right', 'up', 'down', 'jitter', 'random'];
    const spirals = ['off', 'insideOut', 'outsideIn', 'random'];
    const slices = ['off', 'horizontal', 'vertical', 'both'];
    const pixelSorts = ['off', 'row', 'column', 'randomLines', 'columnHue', 'columnBrightness'];
    const colorEffects = ['off', 'invert', 'hueShift', 'saturation', 'contrast', 'brightness', 'colorSeparation', 'vintage', 'posterize', 'threshold'];

    return {
      direction: directions[this._randomInt(0, directions.length - 1)],
      speed: this._randomInt(1, 10),
      spiral: spirals[this._randomInt(0, spirals.length - 1)],
      swirlStrength: this._randomFloat(0.01, 0.2),
      slice: slices[this._randomInt(0, slices.length - 1)],
      colorOffset: this._randomInt(1, 100),
      pixelSort: pixelSorts[this._randomInt(0, pixelSorts.length - 1)],
      colorEffect: colorEffects[this._randomInt(0, colorEffects.length - 1)],
      colorIntensity: this._randomInt(10, 100),
    };
  }

  _loadJSZip() {
    return new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jszip/3.10.1/jszip.min.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  _randomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
  _randomFloat(min, max, d = 2) { return parseFloat((Math.random() * (max - min) + min).toFixed(d)); }
}
