import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const core = (path: string) => fileURLToPath(new URL(`../../packages/core/src/${path}`, import.meta.url));

export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/glyph-avatar/' : '/',
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^glyph-avatar\/react$/, replacement: core('react/index.ts') },
      { find: /^glyph-avatar$/, replacement: core('index.ts') },
    ],
  },
}));
