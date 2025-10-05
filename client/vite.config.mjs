import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// import tailwindcss from 'tailwindcss'; // <-- You can now remove this line

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  root: path.resolve(process.cwd(), 'client'),

  plugins: [react()],

  // 根据模式配置不同的构建选项
  define: {
    // 确保开发模式下 React 以开发版本运行
    'process.env.NODE_ENV': JSON.stringify(mode === 'development' ? 'development' : 'production'),
  },

  build: {
    outDir: path.resolve(process.cwd(), 'build/client'),
    manifest: true,
    // 开发模式下不压缩，保持 React 开发版本
    minify: mode === 'development' ? false : 'esbuild',
    rollupOptions: {
      input: {
        main: path.resolve(process.cwd(), 'client/src/pages/index/main.jsx'),
      },
    },
  },
  
  resolve: {
    alias: {
      "@": path.resolve(process.cwd(), "./client/src"),
    },
  },
}));

