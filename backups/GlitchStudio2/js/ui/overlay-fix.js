/**
 * Overlay Fix Utility
 * Provides functions to fix stuck overlays
 */

/**
 * Remove any stuck overlays from the page
 * This is a utility function to help with any overlays that might get stuck
 */
export function removeStuckOverlays() {
  // Remove welcome tutorial if it exists
  const welcomeTutorial = document.querySelector('.welcome-tutorial');
  if (welcomeTutorial) {
    try {
      document.body.removeChild(welcomeTutorial);
      console.log('Removed stuck welcome tutorial');
    } catch (err) {
      console.error('Error removing welcome tutorial:', err);
    }
  }

  // Remove any dialog overlays
  const dialogOverlays = document.querySelectorAll('.dialog-overlay');
  if (dialogOverlays.length > 0) {
    dialogOverlays.forEach(overlay => {
      try {
        document.body.removeChild(overlay);
        console.log('Removed stuck dialog overlay');
      } catch (err) {
        console.error('Error removing dialog overlay:', err);
      }
    });
  }

  // Remove processing overlay active class
  const processingOverlay = document.getElementById('processing-overlay');
  if (processingOverlay && processingOverlay.classList.contains('active')) {
    processingOverlay.classList.remove('active');
    console.log('Deactivated stuck processing overlay');
  }
}

/**
 * Add a fix button to the UI to remove stuck overlays
 * This adds a small button in the corner that can be clicked to remove stuck overlays
 */
export function addOverlayFixButton() {
  // Create the fix button
  const fixButton = document.createElement('button');
  fixButton.id = 'overlay-fix-button';
  fixButton.className = 'overlay-fix-button';
  fixButton.title = 'Fix stuck overlays';
  fixButton.textContent = '🔄';
  
  // Add click event
  fixButton.addEventListener('click', () => {
    removeStuckOverlays();
  });
  
  // Add to document
  document.body.appendChild(fixButton);
}
