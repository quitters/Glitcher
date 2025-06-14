/**
 * Canvas Manager
 * Handles canvas operations, image loading, and rendering
 */

class CanvasManager {
  constructor(canvasId) {
    this.canvas = document.getElementById(canvasId);
    this.ctx = this.canvas.getContext('2d');
    this.originalImage = null;
    this.placeholder = document.getElementById('canvas-placeholder');
    
    // Canvas dimensions
    this.width = 0;
    this.height = 0;
    
    // Zoom level
    this.zoomLevel = 1;
  }
  
  /**
   * Load an image from a File object
   * @param {File} file - Image file
   * @returns {Promise} Promise that resolves when the image is loaded
   */
  loadImage(file) {
    return new Promise((resolve, reject) => {
      if (!file || !file.type.startsWith('image/')) {
        reject(new Error('Invalid file type. Please select an image.'));
        return;
      }
      
      const reader = new FileReader();
      const img = new Image();
      
      // Cleanup function to remove event listeners
      const cleanup = () => {
        reader.onload = null;
        reader.onerror = null;
        img.onload = null;
        img.onerror = null;
        img.src = ''; // Cancel any in-progress load
      };
      
      reader.onload = (event) => {
        img.onload = () => {
          try {
            // Set canvas dimensions
            this.width = img.width;
            this.height = img.height;
            this.canvas.width = img.width;
            this.canvas.height = img.height;
            
            // Draw image on canvas
            this.ctx.drawImage(img, 0, 0);
            
            // Store original image data
            this.originalImage = this.ctx.getImageData(0, 0, img.width, img.height);
            
            // Show canvas, hide placeholder with a smooth transition
            this.canvas.style.display = 'block';
            
            // Add a small delay before adding the loaded class to trigger the transition
            setTimeout(() => {
              this.canvas.classList.add('loaded');
            }, 50);
            
            if (this.placeholder) {
              // Fade out the placeholder
              this.placeholder.style.opacity = '0';
              
              // Hide it completely after the transition
              setTimeout(() => {
                this.placeholder.style.display = 'none';
                // Reset opacity for next time
                this.placeholder.style.opacity = '1';
              }, 500);
            }
            
            resolve({
              width: img.width,
              height: img.height
            });
          } catch (error) {
            reject(error);
          } finally {
            cleanup();
          }
        };
        
        img.onerror = (error) => {
          cleanup();
          reject(new Error('Failed to load image.'));
        };
        
        img.src = event.target.result;
      };
      
      reader.onerror = () => {
        cleanup();
        reject(new Error('Failed to read file.'));
      };
      
      reader.readAsDataURL(file);
    });
  }
  
  /**
   * Load an image from a URL
   * @param {string} url - Image URL
   * @returns {Promise} Promise that resolves when the image is loaded
   */
  loadImageFromUrl(url) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      
      // Cleanup function to remove event listeners
      const cleanup = () => {
        img.onload = null;
        img.onerror = null;
        img.src = ''; // Cancel any in-progress load
      };
      
      img.onload = () => {
        try {
          // Set canvas dimensions
          this.width = img.width;
          this.height = img.height;
          this.canvas.width = img.width;
          this.canvas.height = img.height;
          
          // Draw image on canvas
          this.ctx.drawImage(img, 0, 0);
          
          // Store original image data
          this.originalImage = this.ctx.getImageData(0, 0, img.width, img.height);
          
          // Show canvas, hide placeholder with a smooth transition
          this.canvas.style.display = 'block';
          
          // Add a small delay before adding the loaded class to trigger the transition
          setTimeout(() => {
            this.canvas.classList.add('loaded');
          }, 50);
          
          if (this.placeholder) {
            // Fade out the placeholder
            this.placeholder.style.opacity = '0';
            
            // Hide it completely after the transition
            setTimeout(() => {
              this.placeholder.style.display = 'none';
              // Reset opacity for next time
              this.placeholder.style.opacity = '1';
            }, 500);
          }
          
          resolve({
            width: img.width,
            height: img.height
          });
        } catch (error) {
          reject(error);
        } finally {
          cleanup();
        }
      };
      
      img.onerror = (error) => {
        cleanup();
        console.error('Image load error:', {
          url: url,
          error: error.message || 'Unknown error'
        });
        reject(new Error(`Failed to load image from URL: ${error.message || 'Unknown error'}`));
      };
      
      // Set crossOrigin to 'anonymous' to handle CORS properly
      img.crossOrigin = 'anonymous';
      
      // Set the source last, after all handlers are in place
      img.src = url;
    });
  }
  
  /**
   * Load an image from an Image element
   * @param {HTMLImageElement} imgElement - Image element to load
   * @returns {Promise} Promise that resolves when the image is loaded
   */
  loadImageFromElement(imgElement) {
    return new Promise((resolve, reject) => {
      try {
        // Set canvas dimensions
        this.width = imgElement.width;
        this.height = imgElement.height;
        this.canvas.width = imgElement.width;
        this.canvas.height = imgElement.height;
        
        // Draw image on canvas
        this.ctx.drawImage(imgElement, 0, 0);
        
        // Store original image data
        this.originalImage = this.ctx.getImageData(0, 0, imgElement.width, imgElement.height);
        
        // Show canvas, hide placeholder with a smooth transition
        this.canvas.style.display = 'block';
        setTimeout(() => { this.canvas.classList.add('loaded'); }, 50);
        
        if (this.placeholder) {
          this.placeholder.style.opacity = '0';
          setTimeout(() => {
            this.placeholder.style.display = 'none';
            this.placeholder.style.opacity = '1';
          }, 500);
        }
        
        resolve({ width: imgElement.width, height: imgElement.height });
      } catch (error) {
        reject(error);
      }
    });
  }
  
  /**
   * Reset the canvas to the original image
   */
  resetToOriginal() {
    if (!this.originalImage) return;
    
    this.ctx.putImageData(this.originalImage, 0, 0);
  }
  
  /**
   * Reset canvas and show placeholder
   */
  resetCanvas() {
    // Clear canvas
    if (this.canvas && this.ctx) {
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }
    
    // Reset original image
    this.originalImage = null;
    
    // Hide canvas and show placeholder
    this.canvas.classList.remove('loaded');
    
    // Delay hiding canvas to allow for transition
    setTimeout(() => {
      this.canvas.style.display = 'none';
      if (this.placeholder) {
        this.placeholder.style.opacity = '1';
        this.placeholder.style.display = 'flex';
      }
    }, 500);
  }
  
  /**
   * Get current image data from canvas
   * @returns {ImageData} Current image data
   */
  getImageData() {
    if (!this.canvas || !this.ctx) return null;
    return this.ctx.getImageData(0, 0, this.canvas.width, this.canvas.height);
  }
  
  /**
   * Put image data on canvas
   * @param {ImageData} imageData - Image data to render
   */
  putImageData(imageData) {
    if (!imageData || !this.ctx) return;
    this.ctx.putImageData(imageData, 0, 0);
  }
  
  // Removed duplicate hasImage method - keeping the one with JSDoc
  
  /**
   * Get canvas as data URL
   * @param {string} format - Image format (default: 'image/png')
   * @param {number} quality - Image quality for JPEG (0-1)
   * @returns {string} Data URL
   */
  getDataURL(format = 'image/png', quality = 0.92) {
    return this.canvas.toDataURL(format, quality);
  }
  
  /**
   * Set zoom level
   * @param {number} level - Zoom level
   */
  setZoom(level) {
    this.zoomLevel = Math.max(0.1, Math.min(5, level));
    this.canvas.style.transform = `scale(${this.zoomLevel})`;
  }
  
  /**
   * Get current dimensions
   * @returns {Object} Width and height
   */
  getDimensions() {
    return {
      width: this.width,
      height: this.height
    };
  }
  
  /**
   * Check if an image is loaded in the canvas
   * @returns {boolean} True if an image is loaded, false otherwise
   */
  hasImage() {
    return this.originalImage !== null;
  }
}

export { CanvasManager };
