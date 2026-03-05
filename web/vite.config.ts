import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig(({ mode }) => {
  // Look for .env in the parent directory (one level up)
  const envDir = path.resolve(__dirname, '..')
  const env = loadEnv(mode, envDir, '')

  return {
    plugins: [react()],
    // Set the env directory for the entire project
    envDir: envDir,
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
        '@assets': path.resolve(__dirname, './src/assets'),
        '@components': path.resolve(__dirname, './src/components'),
        '@styles': path.resolve(__dirname, './src/styles'),
      },
    },
    server: {
      port: Number(env.VITE_DEV_PORT),
    },
  }
})