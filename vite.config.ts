import { defineConfig } from 'vite';
import deno from '@deno/vite-plugin';
import vue from '@vitejs/plugin-vue';

// https://vite.dev/config/
export default defineConfig({
  plugins: [deno(), vue()],
  server: {
    host: '0.0.0.0', // Listen on all interfaces to allow external access (e.g., Playwright MCP)
    proxy: {
      '/api': {
        target: 'http://localhost:6960',
        changeOrigin: true,
      },
    },
  },
});
