import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    environmentOptions: {
      jsdom: {
        url: 'http://localhost/',
      },
    },
    exclude: ['**/node_modules/**', '**/dist/**', '**/*.spec.ts'],
  },
  resolve: {
    alias: {
      'astro:transitions/client': 'vitest', // Bypasses Vite's import analysis for virtual Astro modules
    },
  },
});
