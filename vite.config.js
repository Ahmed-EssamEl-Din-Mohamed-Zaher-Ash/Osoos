import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  base: './',
  plugins: [react()],
  build: {
    sourcemap: true,
    target: 'es2022'
  },
  server: {
    host: '127.0.0.1'
  },
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.js'],
    include: ['./tests/unit/**/*.test.{js,jsx}'],
    restoreMocks: true
  }
});
