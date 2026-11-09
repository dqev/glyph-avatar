import { mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { GLYPH_NAMES, createAvatar, type AvatarOptions } from '../packages/core/src/index';

const out = join(import.meta.dirname, '../.github');
mkdirSync(out, { recursive: true });

const NAMES = ['maya', 'omar', 'lena', 'kofi', 'priya', 'jonas', 'ada', 'sam', 'noor', 'theo', 'ines', 'ravi', 'mia', 'leo', 'zara', 'finn', 'aiko', 'nils', 'sofia', 'tariq'];
const seedAt = (i: number) => `${NAMES[i % NAMES.length]}-${i}`;

const place = (svg: string, x: number, y: number, size: number, opacity = 1) =>
  `<g transform="translate(${x.toFixed(1)} ${y.toFixed(1)})" opacity="${opacity.toFixed(2)}">${svg.replace(/width="\d+" height="\d+"/, `width="${size.toFixed(1)}" height="${size.toFixed(1)}"`)}</g>`;

function banner() {
  const W = 1040;
  const H = 520;
  const S = 112;
  const base = S * 0.93;
  const rx = 4;
  const ry = 2.08;
  const parts: string[] = [];
  let i = 0;
  for (let r = -3; r <= 3; r++) {
    for (let q = -8; q <= 8; q++) {
      const dx = S * (q + r / 2);
      const dy = S * r * 0.866;
      const t = Math.hypot(dx / (rx * S), dy / (ry * S));
      if (t > 1.02) {
        continue;
      }
      const len = Math.hypot(dx, dy);
      const room = len < 1 ? 0 : (0.075 * S * Math.tanh((t * rx * S) / (0.3 * S)) * Math.max(0, 1 - (t * rx * S) / (4.5 * S))) / len;
      const k = 1 - 0.11 * t ** 1.5 + room;
      const size = base * (1 - 0.444 * t ** 1.6);
      const fade = t <= 0.82 ? 1 : 1 - ((t - 0.82) / 0.18) * 0.65;
      const x = W / 2 + dx * k - size / 2;
      const y = H / 2 + dy * k - size / 2;
      parts.push(place(createAvatar(seedAt(i++), { size: 100 }), x, y, size, Math.max(fade, 0.3)));
      if (q === 0 && r === 0) {
        const ring = size / 2 + 10;
        parts.push(`<circle cx="${W / 2}" cy="${H / 2}" r="${ring}" fill="none" stroke="#f2f0f7" stroke-width="4.5"/>`);
      }
    }
  }
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}"><rect width="${W}" height="${H}" rx="28" fill="#17161c"/>${parts.join('')}</svg>`;
}

function shapes() {
  const size = 64;
  const gap = 20;
  const cols = 8;
  const rows = Math.ceil(GLYPH_NAMES.length / cols);
  const W = cols * size + (cols - 1) * gap;
  const H = rows * size + (rows - 1) * gap;
  const parts = GLYPH_NAMES.map((glyph, i) => place(createAvatar(`${glyph}-shape`, { glyph, size: 100 }), (i % cols) * (size + gap), Math.floor(i / cols) * (size + gap), size));
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${parts.join('')}</svg>`;
}

const LABEL = 'font-family="ui-monospace, SFMono-Regular, Menlo, monospace" font-size="12" fill="#8b8a96" text-anchor="middle"';
const escape = (text: string) => text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

function strip(items: { value: string; options?: AvatarOptions; label: string }[], size: number, cell: number) {
  const W = items.length * cell;
  const H = size + 32;
  const parts = items.map((item, i) => {
    const x = i * cell + (cell - size) / 2;
    const avatar = place(createAvatar(item.value, { ...item.options, size: 100 }), x, 0, size);
    return `${avatar}<text x="${i * cell + cell / 2}" y="${size + 24}" ${LABEL}>${escape(item.label)}</text>`;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${parts.join('')}</svg>`;
}

function usage() {
  const ids = ['maya@notemap.com', 'omar@acme.io', 'lena', 'user_8231', 'kofi@team.so', 'priya'];
  return strip(ids.map((id) => ({ value: id, label: id })), 56, 120);
}

function options() {
  const value = 'maya@notemap.com';
  return strip(
    [
      { value, label: 'default' },
      { value, options: { shape: 'square' }, label: "shape: 'square'" },
      { value, options: { colors: 'curated' }, label: "colors: 'curated'" },
      { value, options: { glyph: 'flower' }, label: "glyph: 'flower'" },
      { value, options: { background: 'ring' }, label: "background: 'ring'" },
    ],
    56,
    150,
  );
}

function sizes() {
  const value = 'maya@notemap.com';
  const list = [64, 40, 32, 24];
  const gap = 24;
  const W = list.reduce((sum, size) => sum + size, 0) + gap * (list.length - 1);
  const H = 64 + 32;
  let x = 0;
  const parts = list.map((size) => {
    const part = `${place(createAvatar(value, { size: 100 }), x, 64 - size, size)}<text x="${x + size / 2}" y="${64 + 24}" ${LABEL}>${size}</text>`;
    x += size + gap;
    return part;
  });
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" width="${W}" height="${H}">${parts.join('')}</svg>`;
}

writeFileSync(join(out, 'usage.svg'), usage());
writeFileSync(join(out, 'options.svg'), options());
writeFileSync(join(out, 'sizes.svg'), sizes());
writeFileSync(join(out, 'banner.svg'), banner());
writeFileSync(join(out, 'shapes.svg'), shapes());
console.log('Wrote .github');
