import { describe, expect, it } from 'vitest';
import { buildAvatar, createAvatar, parseSpec, stringifySpec, toSpec } from '../src';

describe('specs', () => {
  it('round-trips every field, including awkward seeds', () => {
    const spec = { seed: 'maya.chen@example.com', colorSeed: 'a:b/c', background: 'split' as const, colors: 'curated' as const };
    expect(parseSpec(stringifySpec(spec))).toEqual(spec);
  });

  it('keeps plain seeds short', () => {
    expect(stringifySpec({ seed: 'abc' })).toBe('v1:abc');
    expect(stringifySpec({ seed: 'abc', background: 'ring' })).toBe('v1:abc::ring');
  });

  it('treats anything without the prefix as a seed', () => {
    expect(toSpec('user_123')).toEqual({ seed: 'user_123' });
    expect(parseSpec('user_123')).toBeNull();
  });

  it('renders a plain seed and its spec string identically', () => {
    expect(createAvatar('v1:user_123')).toBe(createAvatar('user_123'));
  });

  it('changes only colors when colorSeed is set', () => {
    const base = buildAvatar('maya');
    const recolored = buildAvatar({ seed: 'maya', colorSeed: 'other' });
    expect(recolored.glyph).toBe(base.glyph);
    expect(recolored.background).toBe(base.background);
    expect(recolored.palette.bg).not.toBe(base.palette.bg);
  });

  it('changes only the backdrop when background is set', () => {
    const base = buildAvatar('maya');
    const other = base.background === 'polka' ? 'ring' : 'polka';
    const changed = buildAvatar({ seed: 'maya', background: other });
    expect(changed.glyph).toBe(base.glyph);
    expect(changed.palette).toEqual(base.palette);
    expect(changed.background).toBe(other);
  });

  it('keeps a stored generated spec generated, whatever the app passes', () => {
    expect(createAvatar('v1:maya', { colors: 'curated' })).toBe(createAvatar('maya', { colors: 'generated' }));
  });

  it('lets app-level options apply to plain seeds', () => {
    expect(createAvatar('maya', { colors: 'curated' })).not.toBe(createAvatar('maya'));
  });

  it('lets a stored spec win over app-level color options', () => {
    const stored = stringifySpec({ seed: 'maya', colors: 'curated' });
    expect(createAvatar(stored, { colors: 'generated' })).toBe(createAvatar('maya', { colors: 'curated' }));
  });

  it('renders identically regardless of seed case', () => {
    const avatar = createAvatar('USER');
    expect(createAvatar('user')).toBe(avatar);
    expect(createAvatar('User')).toBe(avatar);
    expect(createAvatar('uSeR')).toBe(avatar);
  });
});
