/// <reference types="vitest" />
import { fileURLToPath, URL } from 'node:url'
import { defineConfig, type UserConfig } from 'vite'
import type { InlineConfig } from 'vitest/node'
import react from '@vitejs/plugin-react'

interface VitestConfig extends UserConfig {
  test?: InlineConfig
}

// En desarrollo el backend corre en localhost:8080; el proxy evita CORS y permite probar
// contra un backend local sin tocar VITE_API_URL. En producción VITE_API_URL apunta a
// api.repuestop.cl y el proxy no interviene.
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5189,
    proxy: {
      '/api/v1': {
        target: process.env.VITE_API_PROXY_TARGET ?? 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setupTests.ts'],
    css: false,
  },
} as VitestConfig)
