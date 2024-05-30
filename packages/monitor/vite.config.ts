import { defineConfig } from 'vite';

export default defineConfig({
  build: {
    lib: {
      entry: './src/index.ts',
      formats: ['es', 'cjs', 'iife', 'umd'],
      name: 'Monitor',
      fileName: 'index',
    },
  },
});
