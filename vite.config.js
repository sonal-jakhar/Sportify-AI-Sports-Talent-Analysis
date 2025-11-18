import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // 💥 ADD THIS LINE
  base: '/', 
  // 💥 ADD THIS LINE
  server: {
    port: 3000
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  },
  envPrefix: 'VITE_',
  clearScreen: false,
  logLevel: 'info'
})