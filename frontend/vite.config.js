import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import styledJsx from 'styled-jsx/babel';

export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [styledJsx],
      },
    }),
  ],
  server: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, options) => {
          proxy.on('error', (err, req, res) => {
            console.error('✖ Vite proxy error:', err);
          });
        },
      },
    },
  },
});
