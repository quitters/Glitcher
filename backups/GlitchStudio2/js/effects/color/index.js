/**
 * Color Effects
 * Export all color effects
 */

import { hueShiftEffect } from './hue-shift.js';
import { invertEffect } from './invert.js';
import { posterizeEffect } from './posterize.js';
import { thresholdEffect } from './threshold.js';
import { chromaticAberrationEffect } from './chromatic-aberration.js';
import { saturationEffect } from './saturation.js';
import { vintageEffect } from './vintage.js';

// Export all effects
export const colorEffects = [
  hueShiftEffect,
  invertEffect,
  posterizeEffect,
  thresholdEffect,
  chromaticAberrationEffect,
  saturationEffect,
  vintageEffect
];

// Register function for backwards compatibility
export function registerEffects(registry) {
  colorEffects.forEach(effect => {
    registry.register(effect);
  });
}