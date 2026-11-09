import { defineConfig, type Options } from 'tsup';
import type { Plugin } from 'esbuild';

const shared: Options = {
  format: ['esm', 'cjs'],
  dts: true,
  minify: false,
  target: 'es2020',
};

const coreAsSibling: Plugin = {
  name: 'core-as-sibling',
  setup(build) {
    const file = build.initialOptions.format === 'cjs' ? './index.cjs' : './index.js';
    build.onResolve({ filter: /^\.\.\/index$/ }, () => ({ path: file, external: true }));
  },
};

export default defineConfig([
  { ...shared, entry: { index: 'src/index.ts' }, treeshake: true },
  {
    ...shared,
    entry: { react: 'src/react/index.ts' },
    external: ['react', 'react/jsx-runtime'],
    esbuildPlugins: [coreAsSibling],
    banner: { js: "'use client';" },
  },
]);
