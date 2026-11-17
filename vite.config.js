import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  envDir: '../Software-Backend/ClimateChecker/',
  esbuild: {
    jsxInject: `import React from 'react'`
  },
  build: {
    rollupOptions: {
      output: {
        // Vaste vendorbrokken: ze veranderen zelden, dus de browser houdt ze in
        // de cache over deploys heen. maplibre staat los van de app-code.
        // recharts krijgt bewust geen eigen vendorbrok: gedeelde d3-pakketten
        // zouden dan in de startbundel belanden. Het zit nu in de lazy
        // grafiekbrokken en laadt alleen als een grafiek getoond wordt.
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('/maplibre-gl/') || id.includes('/react-map-gl/')) return 'vendor-maplibre'
          if (id.includes('/react-dom/') || id.includes('/react/') || id.includes('/react-router') || id.includes('/scheduler/')) return 'vendor-react'
          return undefined
        }
      }
    }
  },
  worker: {
    // maplibre-gl v6 spawns its worker as an ES module (new Worker(url,
    // {type:'module'})) and that worker statically imports a shared chunk.
    // Bundling workers in ES format lets Rollup emit the worker AND its
    // maplibre-gl-shared chunk as hashed assets, so nothing 404s in prod.
    format: 'es'
  }
})