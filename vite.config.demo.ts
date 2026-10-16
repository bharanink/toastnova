import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';

export default defineConfig({
  base: './',
  root: resolve(__dirname, 'demo'),
  plugins: [react()],
  resolve: {
    alias: [
      {
        find: 'toastnova/styles.css',
        replacement: resolve(__dirname, 'src/styles.css')
      },
      {
        find: /^toastnova$/,
        replacement: resolve(__dirname, 'src/index.ts')
      }
    ]
  },
  server: {
    port: 5173,
    open: false
  },
  build: {
    outDir: resolve(__dirname, 'dist-docs'),
    emptyOutDir: true
  }
});
