import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

// Production build tuning to shrink first-paint / hydration cost.
// Heavy 3rd-party libs (three, d3, charting, leaflet, firebase) are split into
// their own cacheable chunks instead of one ~1.7MB monolithic bundle.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: '0.0.0.0'
  }
  ,
  build: {
    target: 'es2020',
    minify: 'esbuild',
    sourcemap: false,
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined
          if (id.includes('three') || id.includes('@react-three')) return 'three'
          if (id.includes('recharts')) return 'charts'
          if (id.includes('chart.js') || id.includes('react-chartjs')) return 'charts'
          if (id.includes('d3-') || id.includes('d3 ')) return 'd3'
          if (id.includes('d3')) return 'd3'
          if (id.includes('firebase')) return 'firebase'
          if (id.includes('leaflet')) return 'leaflet'
          if (id.includes('framer-motion')) return 'framer-motion'
          if (id.includes('bootstrap')) return 'bootstrap'
          if (id.includes('react-router') || id.includes('react-query')) return 'router'
          if (id.includes('react-dom') || id.includes('/react/') || id.includes('react.')) return 'react-core'
          if (id.includes('axios') || id.includes('socket.io-client') || id.includes('zustand') || id.includes('react-hook-form')) return 'utilities'
          return 'vendor'
        }
      }
    }
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/tests/setupTests.ts']
  }
})
