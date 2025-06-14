/**
 * Glitch Effects
 * Export all glitch effects
 */

import { pixelSortEffect } from './pixel-sort.js';
import { directionShiftEffect } from './direction-shift.js';
import { sliceEffect } from './slice.js';
import { spiralEffect } from './spiral.js';

// Export all effects
export const glitchEffects = [
  pixelSortEffect,
  directionShiftEffect,
  sliceEffect,
  spiralEffect
];

// Register function for backwards compatibility
export function registerEffects(registry) {
  glitchEffects.forEach(effect => {
    registry.register(effect);
  });
}
