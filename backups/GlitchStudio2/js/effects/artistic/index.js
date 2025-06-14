/**
 * Artistic Effects
 * Export all artistic effects
 */

import { embossEffect } from './emboss.js';

// Export all effects
export const artisticEffects = [
  embossEffect
];

// Register function for backwards compatibility
export function registerEffects(registry) {
  artisticEffects.forEach(effect => {
    registry.register(effect);
  });
}
