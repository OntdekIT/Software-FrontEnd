import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir: '../Software-Backend/ClimateChecker/',
  esbuild: {
    jsxInject: `import React from 'react'`
  },
  worker: {
    // maplibre-gl v6 spawns its worker as an ES module (new Worker(url,
    // {type:'module'})) and that worker statically imports a shared chunk.
    // Bundling workers in ES format lets Rollup emit the worker AND its
    // maplibre-gl-shared chunk as hashed assets, so nothing 404s in prod.
    format: 'es'
  }
})