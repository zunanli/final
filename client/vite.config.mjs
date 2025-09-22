import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Build only a browser bundle (no HTML). Output to ../build/client
export default defineConfig({
  plugins: [react()],
  root: path.resolve(process.cwd(), 'client'),
  build: {
    outDir: path.resolve(process.cwd(), 'build/client'),
    emptyOutDir: false,
    manifest: true,
    rollupOptions: {
      input: {
        'clientsrc/pages/index/main.jsx': path.resolve(process.cwd(), 'client/src/pages/index/main.jsx'),
      },
      output: {
        entryFileNames: (chunk) => {
          if (chunk.name) return `${chunk.name}.js`;
          return 'assets/[name].js';
        },
        chunkFileNames: 'assets/[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});


