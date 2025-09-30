import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';
// import tailwindcss from 'tailwindcss'; // <-- You can now remove this line

// https://vitejs.dev/config/
export default defineConfig({
  root: path.resolve(process.cwd(), 'client'),

  // Remove tailwindcss from here
  plugins: [react()], // 

  build: {
    // ... build configuration remains the same
    outDir: path.resolve(process.cwd(), 'build/client'),
    manifest: true,
    rollupOptions: {
      input: {
        main: path.resolve(process.cwd(), 'client/src/pages/index/main.jsx'),
      },
    },
  },
  
  resolve: {
    // ... resolve configuration remains the same
    alias: {
      "@": path.resolve(process.cwd(), "./client/src"),
    },
  },
});

