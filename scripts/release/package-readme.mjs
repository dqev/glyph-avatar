import { readFileSync, writeFileSync } from 'node:fs';

const source = readFileSync(new URL('../../README.md', import.meta.url), 'utf8');
const readme = source
  .split('\n')
  .filter((line) => !line.startsWith('<img '))
  .join('\n')
  .replace(/\n{3,}/g, '\n\n');

writeFileSync(new URL('../../packages/core/README.md', import.meta.url), readme);
