import { defineConfig } from 'vitest/config'
import path from 'path'

export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    setupFiles: ['src/lib/__tests__/setup.ts'],
    exclude: ['node_modules', 'tests/e2e/**'],
    coverage: {
      provider: 'v8',
      include: ['src/lib/**', 'src/app/api/**'],
      exclude: [
        'src/lib/__tests__/**',
        'src/lib/schemas/__tests__/**',
        'src/app/api/__tests__/**',
        'src/lib/prisma.ts',
        'src/lib/supabase.ts',
        'src/lib/supabase-server.ts',
        'src/lib/dev-magic-link.ts',
      ],
    },
  },
  resolve: {
    alias: { '@': path.resolve(__dirname, 'src') },
  },
})
