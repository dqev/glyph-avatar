import { describe, expect, it } from 'vitest';
import { buildAvatar } from '../src';

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
