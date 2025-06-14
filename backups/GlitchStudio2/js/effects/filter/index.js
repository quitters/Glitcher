/**
 * Filter Effects
 * Export all filter effects
 */

import { edgeDetectionEffect } from './edge-detection.js';
import { motionBlurEffect } from './motion-blur.js';

// Export all effects
export const filterEffects = [
  edgeDetectionEffect,
  motionBlurEffect
];

// Register function for backwards compatibility
export function registerEffects(registry) {
  filterEffects.forEach(effect => {
    registry.register(effect);
  });
}
