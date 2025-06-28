import { defineConfig } from 'vite'
import deno from '@deno/vite-plugin'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [deno(), vue()],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:6960',
        changeOrigin: true
      }
    }
  }
})
