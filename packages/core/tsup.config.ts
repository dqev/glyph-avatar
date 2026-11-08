import { defineConfig } from 'tsup';

export default defineConfig([
  {
    entry: ['src/index.ts'],
    format: ['esm', 'cjs'],
    dts: true,
    clean: true,
    treeshake: true,
    minify: false,
    target: 'es2020',
  },
  {
    entry: { react: 'src/react/index.ts' },
    format: ['esm', 'cjs'],
    dts: true,
    minify: false,
    target: 'es2020',
    external: ['react', 'react/jsx-runtime', 'glyph-avatars'],
    banner: { js: "'use client';" },
  },
]);
