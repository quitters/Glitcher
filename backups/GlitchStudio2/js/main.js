/**
 * GlitchStudio2 Main Application
 * Initializes the application and loads all effects
 */

import { GlitchStudioApp } from './core/app.js';

// Initialize the application when the document is loaded
document.addEventListener('DOMContentLoaded', async () => {
  // Create the app instance
  const app = new GlitchStudioApp();
  
  // Initialize the app (this will register effects internally)
  await app.init();
  
  // Make app available globally for debugging
  window.glitchStudioApp = app;
  
  console.log('GlitchStudio2 is ready!');
});
