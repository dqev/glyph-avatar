import { pick, type Rng } from './random';

export interface Palette {
  name: string;
  bg: string;
  fg: string;
  bg2?: string;
}

export type ResolvedPalette = Palette & { bg2: string };

export type ColorMode = 'generated' | 'curated';

export const PALETTES: readonly Palette[] = [
  { name: 'rose', bg: '#E8608A', fg: '#FFE3C2' },
  { name: 'marigold', bg: '#F6CD5E', fg: '#D9416F' },
  { name: 'mint', bg: '#8EDBC4', fg: '#1D6448' },
  { name: 'cobalt', bg: '#3D7FE6', fg: '#C7E3FF' },
  { name: 'lilac', bg: '#C9B6F4', fg: '#E0477E' },
  { name: 'meadow', bg: '#2E9D52', fg: '#F9E07A' },
  { name: 'sky', bg: '#9CC9F5', fg: '#24418F' },
  { name: 'butter', bg: '#FBE38E', fg: '#3A62D6' },
  { name: 'forest', bg: '#1F6B4A', fg: '#9BE3C9' },
  { name: 'plum', bg: '#6E3A8E', fg: '#F0D9FF' },
  { name: 'peach', bg: '#FFC4A3', fg: '#C23B5B' },
  { name: 'tangerine', bg: '#F28A4B', fg: '#FFF0D6' },
  { name: 'teal', bg: '#2BA3A0', fg: '#FFF3C4' },
  { name: 'slate', bg: '#56637F', fg: '#FFD3B0' },
];

export const HUE_STEPS = 36;
export const TONES = ['bright', 'soft', 'deep'] as const;
export const SCHEMES = ['tonal', 'complement', 'triad'] as const;

const SCHEME_SHIFT: Record<(typeof SCHEMES)[number], number> = { tonal: 0, complement: 180, triad: 120 };
const TONE_L: Record<(typeof TONES)[number], number> = { bright: 0.7, soft: 0.87, deep: 0.48 };
const TONE_C: Record<(typeof TONES)[number], number> = { bright: 0.16, soft: 0.085, deep: 0.12 };

function oklch(L: number, C: number, H: number): string {
  const toLinear = (c: number) => {
    const a = c * Math.cos((H * Math.PI) / 180);
    const b = c * Math.sin((H * Math.PI) / 180);
    const l = (L + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m = (L - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s = (L - 0.0894841775 * a - 1.291485548 * b) ** 3;
    return [
      4.0767416621 * l - 3.3077115913 * m + 0.2309699292 * s,
      -1.2684380046 * l + 2.6097574011 * m - 0.3413193965 * s,
      -0.0041960863 * l - 0.7034186147 * m + 1.707614701 * s,
    ];
  };
  let c = C;
  let rgb = toLinear(c);
  while (c > 0 && rgb.some((v) => v < -0.0001 || v > 1.0001)) {
    c -= 0.004;
    rgb = toLinear(Math.max(c, 0));
  }
  return `#${rgb.map((v) => {
    const x = Math.min(1, Math.max(0, v));
    const srgb = x <= 0.0031308 ? 12.92 * x : 1.055 * x ** (1 / 2.4) - 0.055;
    return Math.round(srgb * 255).toString(16).padStart(2, '0');
  }).join('')}`;
}

function mixHex(a: string, b: string, t: number): string {
  const pa = (a.match(/\w\w/g) ?? []).map((h) => parseInt(h, 16));
  const pb = (b.match(/\w\w/g) ?? []).map((h) => parseInt(h, 16));
  return `#${pa.map((v, i) => Math.round(v + (pb[i] - v) * t).toString(16).padStart(2, '0')).join('')}`;
}

function generatePalette(r: Rng): Palette {
  const hue = Math.floor(r() * HUE_STEPS) * (360 / HUE_STEPS);
  const yellowish = hue >= 50 && hue <= 130;
  const pickedTone = pick(r, TONES);
  const tone = yellowish && pickedTone === 'deep' ? 'bright' : pickedTone;
  const scheme = pick(r, SCHEMES);
  const fgHue = (hue + SCHEME_SHIFT[scheme]) % 360;
  const bgL = tone === 'bright' && yellowish ? 0.86 : TONE_L[tone];
  const bgC = TONE_C[tone];
  const lightFg = bgL < 0.8;
  const fg = lightFg ? oklch(0.96, 0.05, fgHue) : oklch(0.4, 0.15, fgHue);
  const bg = oklch(bgL, bgC, hue);
  const bg2 = oklch(bgL + (lightFg ? -0.06 : 0.045), bgC, hue);
  return { name: `${Math.round(hue)}° ${tone} ${scheme}`, bg, fg, bg2 };
}

export function resolvePalette(option: number | Palette | undefined, colors: ColorMode | undefined, r: Rng): ResolvedPalette {
  const generated = generatePalette(r);
  const curated = pick(r, PALETTES);
  let palette: Palette = colors === 'curated' ? curated : generated;
  if (typeof option === 'number') {
    const len = PALETTES.length;
    palette = PALETTES[((option % len) + len) % len];
  }
  if (option && typeof option === 'object' && option.bg && option.fg) {
    palette = option;
  }
  return { ...palette, bg2: palette.bg2 ?? mixHex(palette.bg, palette.fg, 0.14) };
}
