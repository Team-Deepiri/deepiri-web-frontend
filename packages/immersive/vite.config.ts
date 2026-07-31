import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'node:path';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    host: '0.0.0.0',
  },
  resolve: {
    alias: {
      '@deepiri/shared': path.resolve(__dirname, '../shared'),
    },
  },
});
