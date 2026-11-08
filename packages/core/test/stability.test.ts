import { createHash } from 'node:crypto';
import { describe, expect, it } from 'vitest';
import { BACKGROUNDS, GLYPH_NAMES, buildAvatar, type AvatarOptions } from '../src';
import fixture from './v1-fixture.json';

const CASES: Record<string, AvatarOptions> = {
  default: {},
  curated: { colors: 'curated' },
  square: { shape: 'square', size: 48 },
  title: { title: 'Maya <Chen>' },
};

describe('v1 output never changes', () => {
  for (const [name, opts] of Object.entries(CASES)) {
    it(`matches the frozen digest for ${name}`, () => {
      const h = createHash('sha256');
      for (let i = 0; i < fixture.seeds; i++) {
        h.update(buildAvatar(`seed-${i}`, opts).svg);
      }
      expect(h.digest('hex')).toBe(fixture.digests[name as keyof typeof fixture.digests]);
    });
  }

  it('matches a frozen sample for every glyph family', () => {
    for (const glyph of GLYPH_NAMES) {
      expect(buildAvatar(`sample-${glyph}`, { glyph }).svg).toBe(fixture.samples[glyph]);
    }
  });

  it('keeps glyph and backdrop order', () => {
    expect(GLYPH_NAMES).toEqual(fixture.glyphs);
    expect([...BACKGROUNDS]).toEqual(fixture.backgrounds);
  });
});
