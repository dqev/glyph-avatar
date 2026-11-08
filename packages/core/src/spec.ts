import { BACKGROUNDS, type Background } from './backdrops';
import type { ColorMode } from './color';

export const SPEC_VERSION = 1;
const PREFIX = `v${SPEC_VERSION}:`;

export interface AvatarSpec {
  seed: string;
  colorSeed?: string;
  background?: Background;
  colors?: ColorMode;
}

export function stringifySpec(spec: AvatarSpec): string {
  const parts = [
    encodeURIComponent(spec.seed),
    spec.colorSeed ? encodeURIComponent(spec.colorSeed) : '',
    spec.background ?? '',
    spec.colors === 'curated' ? 'c' : '',
  ];
  while (parts.length > 1 && parts[parts.length - 1] === '') {
    parts.pop();
  }
  return PREFIX + parts.join(':');
}

export function parseSpec(value: string): AvatarSpec | null {
  if (!value.startsWith(PREFIX)) {
    return null;
  }
  const [seed, colorSeed, background, colors] = value.slice(PREFIX.length).split(':');
  if (!seed) {
    return null;
  }
  const spec: AvatarSpec = { seed: decodeURIComponent(seed) };
  if (colorSeed) {
    spec.colorSeed = decodeURIComponent(colorSeed);
  }
  if (background && BACKGROUNDS.includes(background as Background)) {
    spec.background = background as Background;
  }
  if (colors === 'c') {
    spec.colors = 'curated';
  }
  return spec;
}

export function toSpec(value: string): AvatarSpec {
  return parseSpec(value) ?? { seed: value };
}
