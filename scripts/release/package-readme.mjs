import { readFileSync, writeFileSync } from 'node:fs';

const RAW = 'https://raw.githubusercontent.com/nilbuild/glyph-avatar/main/';

const source = readFileSync(new URL('../../README.md', import.meta.url), 'utf8');
const readme = source.replace(/src="\.github\//g, `src="${RAW}.github/`);

writeFileSync(new URL('../../packages/core/README.md', import.meta.url), readme);
