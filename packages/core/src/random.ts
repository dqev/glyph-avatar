export type Rng = () => number;

export const TAU = Math.PI * 2;

export const n2 = (v: number) => Math.round(v * 100) / 100;

export const pick = <T>(r: Rng, list: readonly T[]): T => list[Math.floor(r() * list.length)];

export function hash(str: string): number {
  let h = 2166136261;
  const s = str.toLowerCase();
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

export function rng(seed: number): Rng {
  let a = seed;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
