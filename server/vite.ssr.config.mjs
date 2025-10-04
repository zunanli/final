import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

// Build SSR views: transpile JSX in server/views to CJS under build/server/views
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@client': path.resolve(process.cwd(), 'client'),
      "@": path.resolve(process.cwd(), "./client/src"),
    },
  },
  ssr: {
    // 防止 antd-mobile 等组件库在 ssr 构建时被 external
    noExternal: [/@client/],
  },
  build: {
    ssr: true,
    outDir: path.resolve(process.cwd(), 'build/server/views'),
    emptyOutDir: false,
    rollupOptions: {
      input: {
        'pages/index/main': path.resolve(process.cwd(), 'server/views/pages/index/main.jsx'),
      },
      output: {
        entryFileNames: (chunk) => (chunk.name ? `${chunk.name}.js` : 'entry.js'),
        format: 'cjs',
      },
    },
  },
});


