import { readFileSync, writeFileSync } from 'node:fs';

const version = process.argv[2];
if (!version) {
  console.error('Usage: set-version.mjs <version>');
  process.exit(1);
}

const file = new URL('../../packages/core/package.json', import.meta.url);
const pkg = JSON.parse(readFileSync(file, 'utf8'));
pkg.version = version;
writeFileSync(file, `${JSON.stringify(pkg, null, 2)}\n`);
console.log(`${pkg.name}: ${version}`);
