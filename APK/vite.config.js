import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: {
    outDir: 'dist',
    assetsInlineLimit: 0,
    target: 'es2020',
    sourcemap: false
  },
  server: {
    port: 5173,
    host: true
  }
});
