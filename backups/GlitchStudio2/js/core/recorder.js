/**
 * Recording Module
 * Records canvas animations as video
 */

import { createToast } from '../ui/notifications.js';

export class Recorder {
  constructor(canvas) {
    this.canvas = canvas;
    this.mediaRecorder = null;
    this.recordedChunks = [];
    this.isRecording = false;
    this.stream = null;
    
    // Recording options
    this.mimeType = this._getSupportedMimeType();
    this.videoBitsPerSecond = 10_000_000; // 10 Mbps
  }
  
  /**
   * Start recording
   * @param {Object} options - Recording options
   */
  async startRecording(options = {}) {
    const {
      duration = 10, // seconds
      fps = 30,
      onStop = null
    } = options;
    
    if (this.isRecording) {
      createToast('Already recording', 'warning');
      return false;
    }
    
    if (!this.canvas) {
      createToast('No canvas to record', 'error');
      return false;
    }
    
    try {
      // Get canvas stream
      this.stream = this.canvas.captureStream(fps);
      
      // Create media recorder
      const recorderOptions = {
        mimeType: this.mimeType,
        videoBitsPerSecond: this.videoBitsPerSecond
      };
      
      this.mediaRecorder = new MediaRecorder(this.stream, recorderOptions);
      this.recordedChunks = [];
      
      // Set up event handlers
      this.mediaRecorder.ondataavailable = (event) => {
        if (event.data && event.data.size > 0) {
          this.recordedChunks.push(event.data);
        }
      };
      
      this.mediaRecorder.onstop = () => {
        this._processRecording();
        if (onStop) onStop();
      };
      
      this.mediaRecorder.onerror = (error) => {
        console.error('Recording error:', error);
        createToast('Recording failed', 'error');
        this.stopRecording();
      };
      
      // Start recording
      this.mediaRecorder.start();
      this.isRecording = true;
      
      createToast(`Recording started (${duration}s)`, 'info');
      
      // Auto-stop after duration
      if (duration > 0) {
        this._recordingTimeout = setTimeout(() => {
          this.stopRecording();
        }, duration * 1000);
      }
      
      return true;
      
    } catch (error) {
      console.error('Failed to start recording:', error);
      createToast('Failed to start recording', 'error');
      return false;
    }
  }
  
  /**
   * Stop recording
   */
  stopRecording() {
    if (!this.isRecording || !this.mediaRecorder) {
      return;
    }
    
    // Clear timeout if exists
    if (this._recordingTimeout) {
      clearTimeout(this._recordingTimeout);
      this._recordingTimeout = null;
    }
    
    // Stop recording
    if (this.mediaRecorder.state !== 'inactive') {
      this.mediaRecorder.stop();
    }
    
    // Stop all tracks
    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }
    
    this.isRecording = false;
  }
  
  /**
   * Pause recording
   */
  pauseRecording() {
    if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state === 'recording') {
      this.mediaRecorder.pause();
      createToast('Recording paused');
    }
  }
  
  /**
   * Resume recording
   */
  resumeRecording() {
    if (this.isRecording && this.mediaRecorder && this.mediaRecorder.state === 'paused') {
      this.mediaRecorder.resume();
      createToast('Recording resumed');
    }
  }
  
  /**
   * Get recording state
   */
  getState() {
    if (!this.mediaRecorder) return 'inactive';
    return this.mediaRecorder.state;
  }
  
  /**
   * Process and download recorded video
   * @private
   */
  _processRecording() {
    if (this.recordedChunks.length === 0) {
      createToast('No data recorded', 'warning');
      return;
    }
    
    // Create blob from chunks
    const blob = new Blob(this.recordedChunks, { 
      type: this.mimeType 
    });
    
    // Generate filename
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const extension = this.mimeType.includes('webm') ? 'webm' : 'mp4';
    const filename = `glitch_recording_${timestamp}.${extension}`;
    
    // Create download link
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    
    // Trigger download
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    // Clean up
    setTimeout(() => {
      URL.revokeObjectURL(url);
    }, 100);
    
    createToast('Recording saved successfully!');
    
    // Clear chunks
    this.recordedChunks = [];
  }
  
  /**
   * Get supported mime type
   * @private
   */
  _getSupportedMimeType() {
    const types = [
      'video/webm;codecs=vp9,opus',
      'video/webm;codecs=vp8,opus',
      'video/webm',
      'video/mp4'
    ];
    
    for (const type of types) {
      if (MediaRecorder.isTypeSupported(type)) {
        return type;
      }
    }
    
    return 'video/webm'; // Fallback
  }
  
  /**
   * Create time-lapse recording
   * @param {Object} options - Time-lapse options
   */
  async createTimeLapse(options = {}) {
    const {
      frames = 100,
      frameDelay = 100, // ms between frames
      playbackFps = 30,
      onProgress = null
    } = options;
    
    if (this.isRecording) {
      createToast('Already recording', 'warning');
      return;
    }
    
    // Calculate recording FPS to achieve time-lapse effect
    const recordingFps = 1000 / frameDelay;
    
    // Start recording with calculated FPS
    const started = await this.startRecording({
      fps: recordingFps,
      duration: 0 // No auto-stop
    });
    
    if (!started) return;
    
    // Create progress tracking
    let capturedFrames = 0;
    const captureInterval = setInterval(() => {
      capturedFrames++;
      
      if (onProgress) {
        onProgress(capturedFrames, frames);
      }
      
      if (capturedFrames >= frames) {
        clearInterval(captureInterval);
        this.stopRecording();
      }
    }, frameDelay);
    
    // Store interval for cleanup
    this._timelapsInterval = captureInterval;
  }
  
  /**
   * Cancel time-lapse recording
   */
  cancelTimeLapse() {
    if (this._timelapsInterval) {
      clearInterval(this._timelapsInterval);
      this._timelapsInterval = null;
    }
    this.stopRecording();
  }
}

// Singleton instance
let recorderInstance = null;

/**
 * Get or create recorder instance
 * @param {HTMLCanvasElement} canvas - Canvas element to record
 */
export function getRecorder(canvas) {
  if (!recorderInstance && canvas) {
    recorderInstance = new Recorder(canvas);
  }
  return recorderInstance;
}
