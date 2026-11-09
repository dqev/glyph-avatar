import { n2, type Rng } from './random';
import type { ResolvedPalette } from './color';
import { inside, region, turned, type Outline } from './clip';

export const BACKGROUNDS = ['solid', 'split', 'quarter', 'ring', 'halo', 'stripes', 'horizon', 'polka'] as const;

export type Background = (typeof BACKGROUNDS)[number];

const circle = (cx: number, cy: number, rad: number, fill: string) => `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(rad)}" fill="${fill}"/>`;
const path = (d: string, fill: string) => (d ? `<path d="${d}" fill="${fill}"/>` : '');

export function drawBackground(r: Rng, kind: Background, palette: ResolvedPalette, shapeEl: (fill: string) => string, shape: Outline): string {
  const { bg, bg2 } = palette;
  const turn = Math.floor(r() * 8) * 45;
  const quarterTurn = Math.floor(r() * 4) * 90;
  const base = shapeEl(bg);
  if (kind === 'split') {
    return base + path(region(shape, [turned(-1, 0, 0, turn)]), bg2);
  }
  if (kind === 'quarter') {
    return base + path(region(shape, [turned(-1, 0, 0, quarterTurn), turned(0, -1, 0, quarterTurn)]), bg2);
  }
  if (kind === 'ring') {
    return shapeEl(bg2) + `<g transform="translate(50 50) scale(0.84) translate(-50 -50)">${base}</g>`;
  }
  if (kind === 'halo') {
    return base + `<circle cx="50" cy="50" r="34" fill="${bg2}"/>`;
  }
  if (kind === 'stripes') {
    const angle = turn % 180 === 0 ? 45 : 135;
    const bands: string[] = [];
    for (let i = -4; i <= 4; i++) {
      const mid = i * 16;
      bands.push(region(shape, [turned(-1, 0, -(mid - 4), angle), turned(1, 0, mid + 4, angle)]));
    }
    return base + path(bands.join(''), bg2);
  }
  if (kind === 'horizon') {
    return base + path(region(shape, [turned(0, -1, -16, quarterTurn)]), bg2);
  }
  if (kind === 'polka') {
    let dots = '';
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        const cx = 8 + x * 17 + (y % 2) * 8.5;
        const cy = 8 + y * 17;
        if (inside(shape, cx, cy, 2.6)) {
          dots += circle(cx, cy, 2.6, bg2);
        }
      }
    }
    return base + dots;
  }
  return base;
}
