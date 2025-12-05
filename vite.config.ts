import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    }
  },
  server: {
    port: 5173,
    proxy: {
      '/game': {
        target: 'http://localhost:8080',
        ws: true,
        secure: false,
        changeOrigin: true
      },
      '/api': {
        target: 'http://localhost:8080',
        secure: false,
        changeOrigin: true
      }
    }
  }
})
