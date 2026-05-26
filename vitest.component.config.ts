import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test-utils/setup-rtl.ts'],
    include: ['src/**/__tests__/**/*.test.tsx'],
    exclude: ['node_modules', 'tests/e2e/**'],
  },
  resolve: { alias: { '@': path.resolve(__dirname, 'src') } },
})
