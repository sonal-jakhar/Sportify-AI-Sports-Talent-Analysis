import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  // Ensure environment variables are properly loaded
  envPrefix: 'VITE_',
  // Clear cache for environment variables
  clearScreen: false,
  // Log level to help debug env issues
  logLevel: 'info'
})
