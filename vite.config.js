import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  envDir: '../Software-Backend/ClimateChecker/',
  esbuild: {
    jsxInject: `import React from 'react'`
  },
  optimizeDeps: {
    // maplibre-gl v6 ships a web worker that Vite's dep pre-bundler
    // mishandles ("maplibre-gl-worker.mjs ... does not exist"); excluding
    // it from optimization lets the worker resolve at runtime.
    exclude: ['maplibre-gl']
  }
})