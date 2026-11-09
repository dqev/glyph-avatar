import { describe, expect, it } from 'vitest';
import { BACKGROUNDS, buildAvatar } from '../src';

describe('glyphs and backgrounds subsets', () => {
  it('only draws from the allowed lists', () => {
    for (let i = 0; i < 300; i++) {
      const avatar = buildAvatar(`seed-${i}`, { glyphs: ['flower', 'moon'], backgrounds: ['solid', 'ring'] });
      expect(['flower', 'moon']).toContain(avatar.glyph);
      expect(['solid', 'ring']).toContain(avatar.background);
    }
  });

  it('falls back to every option for empty or unknown lists', () => {
    const plain = buildAvatar('maya').svg;
    expect(buildAvatar('maya', { glyphs: [], backgrounds: [] }).svg).toBe(plain);
    expect(buildAvatar('maya', { glyphs: ['nope' as 'flower'] }).svg).toBe(plain);
  });
});

describe('no shared ids', () => {
  it('draws every background without ids, so one hidden avatar cannot break the others', () => {
    for (const background of BACKGROUNDS) {
      for (const opts of [{}, { shape: 'square' as const }, { shape: 'square' as const, radius: 0 }, { shape: 'square' as const, radius: 50 }]) {
        for (let i = 0; i < 20; i++) {
          const { svg } = buildAvatar(`ids-${i}`, { ...opts, background });
          expect(svg).not.toMatch(/\sid="|url\(#/);
        }
      }
    }
  });
});
