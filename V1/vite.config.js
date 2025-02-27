import { defineConfig } from 'vite';

export default defineConfig({
  base: './', // Ensures correct paths for static deployment
  build: {
    outDir: 'dist', // Output folder
  }
});
