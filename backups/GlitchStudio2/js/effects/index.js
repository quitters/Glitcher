/**
 * Effects Index
 * Export all effect categories
 */

import { artisticEffects } from './artistic/index.js';
import { colorEffects } from './color/index.js';
import { distortionEffects } from './distortion/index.js';
import { filterEffects } from './filter/index.js';
import { glitchEffects } from './glitch/index.js';
import { experimentalEffects } from './experimental/index.js';

// Export all effects as a flat array
export const allEffects = [
  ...artisticEffects,
  ...colorEffects,
  ...distortionEffects,
  ...filterEffects,
  ...glitchEffects,
  ...experimentalEffects
];

// Export by category for convenience
export {
  artisticEffects,
  colorEffects,
  distortionEffects,
  filterEffects,
  glitchEffects,
  experimentalEffects
};

// Register all effects with a registry
export function registerAllEffects(registry) {
  allEffects.forEach(effect => {
    registry.register(effect);
  });
}
