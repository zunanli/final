import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import tailwindcss from 'tailwindcss' // 导入 tailwindcss

// Build only a browser bundle (no HTML). Output to ../build/client
export default defineConfig({
  plugins: [react(),tailwindcss()],
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
  resolve: {
    alias: {
      // 确保这里的路径正确，指向你存放组件和工具函数的源码目录
      "@": path.resolve(process.cwd(), "./client/src"), 
    },
  },
});


