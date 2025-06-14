/**
 * Distortion Effects
 * Export all distortion effects
 */

// For now, export empty array until we update these effects
export const distortionEffects = [];

// Register function for backwards compatibility
export function registerEffects(registry) {
  distortionEffects.forEach(effect => {
    registry.register(effect);
  });
}
