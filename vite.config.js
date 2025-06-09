import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: './', // Use relative paths for Vercel
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'glitcherIndex.html')
      }
    }
  },
  server: {
    open: '/glitcherIndex.html'
  }
});
