import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import path from 'path';

export default defineConfig({
  plugins: [react()],
  resolve: {
    extensions: ['.tsx', '.ts', '.mts', '.jsx', '.mjs', '.js', '.json'],
    alias: {
      '@wzhmi/core': path.resolve(__dirname, '../../packages/core/src/index.ts'),
      '@wzhmi/widgets': path.resolve(__dirname, '../../packages/widgets/src/index.ts'),
    },
  },
  server: {
    port: 5173,
    fs: {
      // 뷰어 소스 등 모노레포 전체 접근 허용
      allow: ['../..'],
    },
  },
  build: {
    rollupOptions: {
      input: {
        editor: path.resolve(__dirname, 'index.html'),
        viewer: path.resolve(__dirname, 'viewer.html'),
      },
    },
  },
});
