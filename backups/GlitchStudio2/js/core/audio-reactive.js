/**
 * Audio Reactive Module
 * Captures microphone input and provides audio data for effects
 */

export class AudioReactive {
  constructor() {
    this.audioContext = null;
    this.analyser = null;
    this.microphone = null;
    this.dataArray = null;
    this.isActive = false;
    this.sensitivity = 1.0;
    
    // Audio data
    this.audioLevel = 0;
    this.frequencyData = null;
    this.waveformData = null;
    
    // Callbacks
    this.onLevelUpdate = null;
    this.onError = null;
  }
  
  /**
   * Initialize audio capture
   */
  async init() {
    if (this.isActive) return;
    
    try {
      // Create audio context
      this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
      
      // Get microphone access
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });
      
      // Create audio nodes
      this.microphone = this.audioContext.createMediaStreamSource(stream);
      this.analyser = this.audioContext.createAnalyser();
      
      // Configure analyser
      this.analyser.fftSize = 256;
      this.analyser.smoothingTimeConstant = 0.3;
      
      // Connect nodes
      this.microphone.connect(this.analyser);
      
      // Create data arrays
      const bufferLength = this.analyser.frequencyBinCount;
      this.frequencyData = new Uint8Array(bufferLength);
      this.waveformData = new Uint8Array(bufferLength);
      
      this.isActive = true;
      
      // Start analysis loop
      this._startAnalysis();
      
      return true;
    } catch (error) {
      console.error('Audio initialization failed:', error);
      if (this.onError) {
        this.onError(error);
      }
      return false;
    }
  }
  
  /**
   * Stop audio capture
   */
  stop() {
    if (!this.isActive) return;
    
    // Disconnect nodes
    if (this.microphone) {
      this.microphone.disconnect();
      this.microphone = null;
    }
    
    // Close audio context
    if (this.audioContext) {
      this.audioContext.close();
      this.audioContext = null;
    }
    
    this.analyser = null;
    this.frequencyData = null;
    this.waveformData = null;
    this.isActive = false;
    this.audioLevel = 0;
  }
  
  /**
   * Set audio sensitivity
   * @param {number} value - Sensitivity multiplier (0.1 to 3.0)
   */
  setSensitivity(value) {
    this.sensitivity = Math.max(0.1, Math.min(3.0, value));
  }
  
  /**
   * Get current audio level (0-1)
   */
  getAudioLevel() {
    return Math.min(1, this.audioLevel * this.sensitivity);
  }
  
  /**
   * Get frequency data for specific range
   * @param {string} range - 'bass', 'mid', 'treble', or 'all'
   */
  getFrequencyData(range = 'all') {
    if (!this.frequencyData) return 0;
    
    const dataLength = this.frequencyData.length;
    
    switch (range) {
      case 'bass':
        return this._getAverageFrequency(0, Math.floor(dataLength * 0.15));
      case 'mid':
        return this._getAverageFrequency(
          Math.floor(dataLength * 0.15),
          Math.floor(dataLength * 0.5)
        );
      case 'treble':
        return this._getAverageFrequency(
          Math.floor(dataLength * 0.5),
          dataLength
        );
      case 'all':
      default:
        return this._getAverageFrequency(0, dataLength);
    }
  }
  
  /**
   * Get beat detection (simplified)
   */
  getBeatIntensity() {
    const bass = this.getFrequencyData('bass');
    const threshold = 0.8;
    
    // Simple beat detection based on bass frequency
    if (bass > threshold) {
      return (bass - threshold) / (1 - threshold);
    }
    return 0;
  }
  
  /**
   * Start audio analysis loop
   * @private
   */
  _startAnalysis() {
    if (!this.isActive) return;
    
    const analyze = () => {
      if (!this.isActive || !this.analyser) return;
      
      // Get frequency data
      this.analyser.getByteFrequencyData(this.frequencyData);
      this.analyser.getByteTimeDomainData(this.waveformData);
      
      // Calculate overall audio level
      let sum = 0;
      for (let i = 0; i < this.frequencyData.length; i++) {
        sum += this.frequencyData[i];
      }
      this.audioLevel = sum / (this.frequencyData.length * 255);
      
      // Trigger callback
      if (this.onLevelUpdate) {
        this.onLevelUpdate(this.getAudioLevel());
      }
      
      // Continue loop
      requestAnimationFrame(analyze);
    };
    
    analyze();
  }
  
  /**
   * Get average frequency for a range
   * @private
   */
  _getAverageFrequency(startIndex, endIndex) {
    if (!this.frequencyData) return 0;
    
    let sum = 0;
    const count = endIndex - startIndex;
    
    for (let i = startIndex; i < endIndex; i++) {
      sum += this.frequencyData[i];
    }
    
    return sum / (count * 255);
  }
  
  /**
   * Get reactive parameter value
   * @param {number} baseValue - Base parameter value
   * @param {Object} options - Reactive options
   */
  getReactiveValue(baseValue, options = {}) {
    const {
      multiplier = 1,
      frequency = 'all',
      mode = 'multiply',
      min = null,
      max = null
    } = options;
    
    let audioValue = 0;
    
    // Get audio value based on mode
    if (mode === 'beat') {
      audioValue = this.getBeatIntensity();
    } else {
      audioValue = this.getFrequencyData(frequency);
    }
    
    // Apply multiplier
    audioValue *= multiplier;
    
    // Calculate final value
    let finalValue;
    switch (mode) {
      case 'multiply':
        finalValue = baseValue * (1 + audioValue);
        break;
      case 'add':
        finalValue = baseValue + audioValue;
        break;
      case 'replace':
        finalValue = audioValue;
        break;
      default:
        finalValue = baseValue;
    }
    
    // Apply constraints
    if (min !== null) finalValue = Math.max(min, finalValue);
    if (max !== null) finalValue = Math.min(max, finalValue);
    
    return finalValue;
  }
}

// Singleton instance
let audioReactiveInstance = null;

/**
 * Get or create audio reactive instance
 */
export function getAudioReactive() {
  if (!audioReactiveInstance) {
    audioReactiveInstance = new AudioReactive();
  }
  return audioReactiveInstance;
}
