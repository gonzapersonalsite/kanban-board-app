import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vitest/config'
import { agentFilesPlugin } from './tooling/agent-files/vitePlugin.ts'

export default defineConfig({
  plugins: [react(), agentFilesPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
    chunkSizeWarningLimit: 500,
    rolldownOptions: {
      output: {
        codeSplitting: {
          groups: [
            // React and the router change only on upgrades, so this chunk stays cached across deploys.
            {
              name: 'react-vendor',
              test: /[\\/]node_modules[\\/](react|react-dom|scheduler|react-router|react-router-dom)[\\/]/,
              priority: 20,
            },
          ],
        },
      },
    },
  },
  test: {
    // Both projects below inherit these.
    // A test that checks nothing fails instead of passing in silence.
    expect: { requireAssertions: true },
    // A committed .only would skip the rest of the suite in silence; skip and todo are the lint's.
    allowOnly: false,
    projects: [
      {
        extends: true,
        test: {
          name: 'app',
          include: ['src/**/*.test.{ts,tsx}'],
          environment: 'jsdom',
          setupFiles: ['./src/test/setup/vitestSetup.ts'],
          // CSS Modules keep their class names in tests, so a test can check a state by its class.
          css: {
            modules: {
              classNameStrategy: 'non-scoped',
            },
          },
        },
      },
      {
        // The tests of the configuration at the root and of the build tooling run in Node, without a DOM.
        extends: true,
        test: {
          name: 'tooling',
          include: ['*.test.ts', 'tooling/**/*.test.ts'],
          environment: 'node',
        },
      },
    ],
    coverage: {
      provider: 'v8',
      include: ['src/**/*.{ts,tsx}'],
      exclude: ['src/**/*.test.{ts,tsx}', 'src/test/**', 'src/app/main.tsx', 'src/**/index.ts'],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
  },
})
