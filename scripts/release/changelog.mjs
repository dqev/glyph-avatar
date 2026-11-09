import { readFileSync, writeFileSync } from 'node:fs';

const [command, version] = process.argv.slice(2);
const file = new URL('../../CHANGELOG.md', import.meta.url);
const content = readFileSync(file, 'utf8');

function section(heading) {
  const start = content.indexOf(`\n${heading}\n`);
  if (start === -1) {
    return null;
  }
  const after = start + heading.length + 1;
  const next = content.indexOf('\n## ', after);
  return { after, body: content.slice(after, next === -1 ? undefined : next) };
}

if (!version) {
  console.error('Usage: changelog.mjs <release|notes> <version>');
  process.exit(1);
}

if (command === 'notes') {
  process.stdout.write(section(`## ${version}`)?.body.trim() ?? '');
  process.exit(0);
}

const unreleased = section('## Unreleased');
if (!unreleased) {
  console.error('No "## Unreleased" heading in CHANGELOG.md.');
  process.exit(1);
}
if (unreleased.body.trim() === '') {
  console.error('The Unreleased section is empty, so there is nothing to release.');
  process.exit(1);
}

writeFileSync(file, `${content.slice(0, unreleased.after)}\n\n## ${version}${content.slice(unreleased.after)}`);
console.log(`changelog: moved Unreleased entries under ${version}`);
