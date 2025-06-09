import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // This ensures assets are loaded correctly from the root
  build: {
    outDir: 'dist',
    assetsDir: '.',
    rollupOptions: {
      input: 'glitcherIndex.html',
    },
  },
  server: {
    open: true,
  },
});
