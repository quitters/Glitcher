/**
 * Experimental Effects
 * Export all experimental effects
 */

import { datamoshEffect } from './datamosh.js';

// Export all effects
export const experimentalEffects = [
  datamoshEffect
];

// Register function for backwards compatibility
export function registerEffects(registry) {
  experimentalEffects.forEach(effect => {
    registry.register(effect);
  });
}
