import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path' // This comes from Node.js

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // These must match what you put in tsconfig
      '@': path.resolve(__dirname, './src'),
      '@assets': path.resolve(__dirname, './src/assets'),
      '@components': path.resolve(__dirname, './src/components'),
      '@styles': path.resolve(__dirname, './src/styles'),
    },
  },
})