import { hash, pick, rng } from './random';
import { resolvePalette, type ColorMode, type Palette, type ResolvedPalette } from './color';
import { BACKGROUNDS, drawBackground, type Background } from './backdrops';
import { GLYPHS, GLYPH_NAMES, type GlyphName } from './glyphs';
import { parseSpec, type AvatarSpec } from './spec';

export interface AvatarOptions {
  size?: number;
  glyph?: GlyphName;
  glyphs?: readonly GlyphName[];
  colors?: ColorMode;
  colorSeed?: string;
  palette?: number | Palette;
  background?: Background;
  backgrounds?: readonly Background[];
  shape?: 'circle' | 'square';
  radius?: number;
  title?: string;
}

export interface Avatar {
  svg: string;
  glyph: GlyphName;
  palette: ResolvedPalette;
  background: Background;
}

export type AvatarInput = string | AvatarSpec;

const escapeXml = (s: string) => s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c] as string);

const isBackground = (value: unknown): value is Background => BACKGROUNDS.includes(value as Background);
const isGlyph = (value: unknown): value is GlyphName => typeof value === 'string' && value in GLYPHS;

function subset<T>(list: readonly T[] | undefined, valid: (value: unknown) => boolean, all: readonly T[]): readonly T[] {
  const kept = list?.filter(valid) ?? [];
  return kept.length > 0 ? kept : all;
}

function fromSeed(seed: string, opts: AvatarOptions): Avatar {
  const r = rng(hash(seed));
  let palette = resolvePalette(opts.palette, opts.colors, r);
  if (opts.colorSeed && opts.palette === undefined) {
    palette = resolvePalette(undefined, opts.colors, rng(hash(opts.colorSeed)));
  }
  const pickedBackground = pick(r, subset(opts.backgrounds, isBackground, BACKGROUNDS));
  const background = isBackground(opts.background) ? opts.background : pickedBackground;
  const glyph = isGlyph(opts.glyph) ? opts.glyph : pick(r, subset(opts.glyphs, isGlyph, GLYPH_NAMES));
  const body = GLYPHS[glyph](r, palette);
  const size = opts.size ?? 64;
  const square = opts.shape === 'square';
  const radius = opts.radius ?? 24;
  const shapeEl = (fill: string) => (square
    ? `<rect width="100" height="100" rx="${radius}" fill="${fill}"/>`
    : `<circle cx="50" cy="50" r="50" fill="${fill}"/>`);
  const backdrop = drawBackground(r, background, palette, shapeEl, { square, radius });
  const a11y = opts.title ? ` role="img"><title>${escapeXml(opts.title)}</title>` : ' aria-hidden="true">';
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="${size}" height="${size}"${a11y}${backdrop}${body}</svg>`;
  return { svg, glyph, palette, background };
}

export function buildAvatar(input: AvatarInput, opts: AvatarOptions = {}): Avatar {
  const parsed = typeof input === 'string' ? parseSpec(input) : null;
  const spec = parsed ?? (typeof input === 'string' ? { seed: input } : input);
  const merged: AvatarOptions = { ...opts };
  if (parsed) {
    merged.colors = 'generated';
  }
  if (spec.colorSeed !== undefined) {
    merged.colorSeed = spec.colorSeed;
  }
  if (spec.background !== undefined) {
    merged.background = spec.background;
  }
  if (spec.colors !== undefined) {
    merged.colors = spec.colors;
  }
  return fromSeed(spec.seed, merged);
}

export function createAvatar(input: AvatarInput, opts?: AvatarOptions): string {
  return buildAvatar(input, opts).svg;
}

export function avatarDataUri(input: AvatarInput, opts?: AvatarOptions): string {
  return `data:image/svg+xml;utf8,${encodeURIComponent(createAvatar(input, opts))}`;
}
