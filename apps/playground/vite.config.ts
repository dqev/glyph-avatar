import { fileURLToPath } from 'node:url';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const core = (path: string) => fileURLToPath(new URL(`../../packages/core/src/${path}`, import.meta.url));

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      { find: /^@glyph-avatar\/react$/, replacement: fileURLToPath(new URL('../../packages/react/src/index.ts', import.meta.url)) },
      { find: /^glyph-avatar$/, replacement: core('index.ts') },
    ],
  },
});
