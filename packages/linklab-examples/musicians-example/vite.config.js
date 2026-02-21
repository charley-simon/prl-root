// vite.config.js
import { defineConfig } from 'vite'

export default defineConfig({
  root: 'public',
  server: {
    port: 5173,
    open: true
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true
  }
})
