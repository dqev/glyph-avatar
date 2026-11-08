import { n2, type Rng } from './random';
import type { ResolvedPalette } from './color';

export const BACKGROUNDS = ['solid', 'split', 'quarter', 'ring', 'halo', 'stripes', 'horizon', 'polka'] as const;

export type Background = (typeof BACKGROUNDS)[number];

const circle = (cx: number, cy: number, rad: number, fill: string) => `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(rad)}" fill="${fill}"/>`;

export function drawBackground(r: Rng, kind: Background, palette: ResolvedPalette, shapeEl: (fill: string) => string, clipId: string): string {
  const { bg, bg2 } = palette;
  const clipped = (body: string) => `<g clip-path="url(#${clipId})">${body}</g>`;
  const turn = Math.floor(r() * 8) * 45;
  const quarterTurn = Math.floor(r() * 4) * 90;
  const base = shapeEl(bg);
  if (kind === 'split') {
    return base + clipped(`<rect x="50" y="-30" width="80" height="160" fill="${bg2}" transform="rotate(${turn} 50 50)"/>`);
  }
  if (kind === 'quarter') {
    return base + clipped(`<rect x="50" y="50" width="70" height="70" fill="${bg2}" transform="rotate(${quarterTurn} 50 50)"/>`);
  }
  if (kind === 'ring') {
    return shapeEl(bg2) + `<g transform="translate(50 50) scale(0.84) translate(-50 -50)">${base}</g>`;
  }
  if (kind === 'halo') {
    return base + `<circle cx="50" cy="50" r="34" fill="${bg2}"/>`;
  }
  if (kind === 'stripes') {
    let bands = '';
    for (let i = -4; i <= 4; i++) {
      bands += `<rect x="${50 + i * 16 - 4}" y="-40" width="8" height="180"/>`;
    }
    return base + clipped(`<g fill="${bg2}" transform="rotate(${turn % 180 === 0 ? 45 : 135} 50 50)">${bands}</g>`);
  }
  if (kind === 'horizon') {
    return base + clipped(`<rect x="-20" y="66" width="140" height="60" fill="${bg2}" transform="rotate(${quarterTurn} 50 50)"/>`);
  }
  if (kind === 'polka') {
    let dots = '';
    for (let y = 0; y < 6; y++) {
      for (let x = 0; x < 6; x++) {
        dots += circle(8 + x * 17 + (y % 2) * 8.5, 8 + y * 17, 2.6, bg2);
      }
    }
    return base + clipped(dots);
  }
  return base;
}
