import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    build: {
      rollupOptions: {
        input: {
          main: path.resolve(__dirname, 'index.html'),
          'service-worker': path.resolve(__dirname, 'src/extension/service-worker.ts'),
          'content-script': path.resolve(__dirname, 'src/extension/content-script.ts'),
        },
        output: {
          entryFileNames: (chunk) => {
            if (chunk.name === 'service-worker') return 'service-worker.js';
            if (chunk.name === 'content-script') return 'content-script.js';
            return 'assets/[name]-[hash].js';
          },
        },
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
