import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  base: '/', // Changed from './' to '/' for Vercel
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'glitcherIndex.html')
      },
      output: {
        entryFileNames: 'assets/[name].[hash].js',
        chunkFileNames: 'assets/[name].[hash].js',
        assetFileNames: 'assets/[name].[hash][extname]'
      }
    },
  },
  server: {
    open: '/glitcherIndex.html',
  },
  publicDir: 'public',
  plugins: [
    // This plugin handles the HTML file
    {
      name: 'html-transform',
      transformIndexHtml: {
        enforce: 'pre',
        transform(html) {
          return html.replace(/(src|href)="([^"]*)"/g, (match, p1, p2) => {
            // Ensure all asset paths are correctly referenced
            if (p2.startsWith('http') || p2.startsWith('//') || p2.startsWith('data:')) {
              return match;
            }
            return `${p1}="${p2}"`;
          });
        }
      }
    }
  ]
});
