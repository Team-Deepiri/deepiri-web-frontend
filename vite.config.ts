import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import inspector from 'vite-plugin-react-inspector';

export default defineConfig({
  plugins: [
    inspector(), // Add inspector BEFORE react plugin for click-to-open in editor
    react({
      fastRefresh: true,
      include: "**/*.{jsx,tsx,js,ts}",
    })
  ],
  
  server: {
    host: '0.0.0.0',
    port: 5173,
    strictPort: true,
    open: false,
    
    watch: {
      usePolling: true,
      interval: 50,
      binaryInterval: 100,
    },
    
    hmr: {
      port: 5173,
      overlay: true,
    },
    
    proxy: {
      '/api': {
        target: 'http://localhost:5100',
        changeOrigin: true,
        secure: false,
      }
    }
  },
  
  build: {
    outDir: 'dist',
    emptyOutDir: true,
    sourcemap: true,
  },
  
  optimizeDeps: {
    include: ['react', 'react-dom', 'framer-motion'],
    esbuildOptions: {
      loader: {
        '.js': 'jsx'
      }
    }
  },
  
  css: {
    devSourcemap: true
  }
});

