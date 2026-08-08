import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true,
    proxy: {
      '/avito-api': {
        target: 'https://api.avito.ru',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/avito-api/, ''),
        secure: false
      }
    }
  }
});
