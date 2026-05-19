import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  server: { port: 5174 },
  resolve: {
    alias: {
      '@': '/src',
      '@wzHmi/viewer': path.resolve(__dirname, '../viewer/src')
    }
  }
})