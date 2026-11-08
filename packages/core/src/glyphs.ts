import { TAU, n2, pick, type Rng } from './random';
import type { Palette } from './color';

export type GlyphFn = (r: Rng, palette: Palette) => string;

type Point = readonly number[];

const lookup = <T>(table: Record<number, T>, key: number): T => table[key];

const circle = (cx: number, cy: number, rad: number, fill: string) => `<circle cx="${n2(cx)}" cy="${n2(cy)}" r="${n2(rad)}" fill="${fill}"/>`;
const poly = (pts: readonly Point[], fill: string) => `<polygon points="${pts.map((p) => p.map(n2).join(',')).join(' ')}" fill="${fill}"/>`;
const rotate = (deg: number, body: string) => {
  if (!deg) {
    return body;
  }
  return `<g transform="rotate(${deg} 50 50)">${body}</g>`;
};

export const GLYPHS = {
  dots(r, { fg }) {
    const n = pick(r, [2, 3, 3, 4, 4]);
    const span = lookup({ 2: 20, 3: 28, 4: 30 }, n);
    const rad = lookup({ 2: 7.5, 3: 5, 4: 3.6 }, n);
    const modes = lookup({ 2: ['full', 'diag'], 3: ['full', 'plus', 'x', 'ring', 'linked'], 4: ['full', 'ring', 'x', 'diag', 'center'] }, n);
    const mode = pick(r, modes);
    const turn = r() < 0.3 ? 45 : 0;
    const step = span / (n - 1);
    const start = 50 - span / 2;
    let out = '';
    if (mode === 'linked') {
      let d = '';
      for (let i = 0; i < n; i++) {
        const p = start + i * step;
        d += `M${start} ${p}H${start + span}M${p} ${start}V${start + span}`;
      }
      out += `<path d="${d}" stroke="${fg}" stroke-width="1.6" fill="none"/>`;
    }
    const skip = (i: number, j: number) => {
      const edge = i === 0 || j === 0 || i === n - 1 || j === n - 1;
      const corner = (i === 0 || i === n - 1) && (j === 0 || j === n - 1);
      if (mode === 'plus') {
        return i !== 1 && j !== 1;
      }
      if (mode === 'x') {
        return (i + j) % 2 === 1;
      }
      if (mode === 'ring') {
        return n === 3 ? i === 1 && j === 1 : !edge;
      }
      if (mode === 'diag') {
        return n === 2 ? i !== j : i !== j && i + j !== n - 1;
      }
      if (mode === 'center') {
        return edge && !corner;
      }
      return false;
    };
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (skip(i, j)) {
          continue;
        }
        out += circle(start + i * step, start + j * step, mode === 'linked' ? 3.6 : rad, fg);
      }
    }
    return rotate(turn, out);
  },

  flower(r, { fg, bg }) {
    const petals = pick(r, [4, 4, 5, 6, 8]);
    const [dist, rad] = lookup({ 4: [11, 12], 5: [12, 10], 6: [13, 9], 8: [15, 7] }, petals);
    const offset = r() < 0.5 ? 0 : Math.PI / petals;
    const center = pick(r, ['fill', 'hole', 'none']);
    let out = '';
    for (let k = 0; k < petals; k++) {
      const a = (k / petals) * TAU + offset - Math.PI / 2;
      out += circle(50 + Math.cos(a) * dist, 50 + Math.sin(a) * dist, rad, fg);
    }
    if (center === 'fill') {
      out += circle(50, 50, dist, fg);
    }
    if (center === 'hole') {
      out += circle(50, 50, rad * 0.5, bg);
    }
    return out;
  },

  burst(r, { fg }) {
    const rays = pick(r, [5, 6, 8, 10, 12]);
    const tips = r() < 0.6;
    const center = pick(r, ['dot', 'ring', 'none']);
    const outer = tips ? 17 : 22;
    let d = '';
    let out = '';
    for (let k = 0; k < rays; k++) {
      const a = (k / rays) * TAU - Math.PI / 2;
      const cos = Math.cos(a);
      const sin = Math.sin(a);
      d += `M${n2(50 + cos * 8)} ${n2(50 + sin * 8)}L${n2(50 + cos * outer)} ${n2(50 + sin * outer)}`;
      if (tips) {
        out += circle(50 + cos * 22, 50 + sin * 22, 3.4, fg);
      }
    }
    if (center === 'dot') {
      out += circle(50, 50, 4.5, fg);
    }
    if (center === 'ring') {
      out += `<circle cx="50" cy="50" r="4.5" fill="none" stroke="${fg}" stroke-width="2.5"/>`;
    }
    return `<path d="${d}" stroke="${fg}" stroke-width="3" stroke-linecap="round"/>${out}`;
  },

  stairs(r, { fg }) {
    const steps = pick(r, [2, 3, 4]);
    const turn = Math.floor(r() * 4) * 90;
    const [x0, y0, x1, y1] = [29, 29, 71, 71];
    const w = (x1 - x0) / steps;
    const h = (y1 - y0) / steps;
    const pts = [[x0, y1], [x1, y1], [x1, y0]];
    for (let i = 1; i < steps; i++) {
      pts.push([x1 - i * w, y0 + (i - 1) * h], [x1 - i * w, y0 + i * h]);
    }
    pts.push([x0, y0 + (steps - 1) * h]);
    const back = r() < 0.5 ? `<rect x="29" y="29" width="42" height="42" fill="${fg}" opacity="0.35"/>` : '';
    return rotate(turn, back + poly(pts, fg));
  },

  hourglass(r, { fg }) {
    const w = pick(r, [3, 6]);
    const bars = r() < 0.6;
    const pts = bars
      ? [[30, 28], [70, 28], [70, 34], [50 + w, 50], [70, 66], [70, 72], [30, 72], [30, 66], [50 - w, 50], [30, 34]]
      : [[30, 28], [70, 28], [50 + w, 50], [70, 72], [30, 72], [50 - w, 50]];
    return rotate(pick(r, [0, 45, 90, 135]), poly(pts, fg));
  },

  plus(r, { fg, bg }) {
    const arm = pick(r, [14, 18, 22]);
    const rx = pick(r, [0, 3]);
    const a = 50 - arm / 2;
    let out = `<rect x="${a}" y="28" width="${arm}" height="44" rx="${rx}" fill="${fg}"/><rect x="28" y="${a}" width="44" height="${arm}" rx="${rx}" fill="${fg}"/>`;
    const turn = r() < 0.25 ? 45 : 0;
    if (arm === 22 && r() < 0.6) {
      for (const dx of [-5.5, 5.5]) {
        for (const dy of [-5.5, 5.5]) {
          out += circle(50 + dx, 50 + dy, 2.2, bg);
        }
      }
    }
    return rotate(turn, out);
  },

  leaves(r, { fg, bg }) {
    const count = pick(r, [2, 3, 4, 4, 6]);
    const leaf = `<path d="M50 50C40 42 40 28 50 22C60 28 60 42 50 50Z" fill="${fg}"/>`;
    const offset = r() < 0.5 ? 0 : 180 / count;
    let out = '';
    for (let k = 0; k < count; k++) {
      out += rotate((360 / count) * k + offset, leaf);
    }
    if (r() < 0.4) {
      out += circle(50, 50, 3.5, bg);
    }
    return out;
  },

  rings(r, { fg }) {
    const count = pick(r, [2, 3, 4]);
    const gap = count === 4 ? 5.5 : 7;
    const width = count === 4 ? 2.8 : 3.5;
    const nested = r() < 0.35;
    let out = '';
    for (let k = 0; k < count; k++) {
      const rad = 22 - k * gap;
      const cy = nested ? 50 + (22 - rad) : 50;
      out += `<circle cx="50" cy="${cy}" r="${rad}" fill="none" stroke="${fg}" stroke-width="${width}"/>`;
    }
    if (r() < 0.5) {
      const last = 22 - count * gap;
      out += circle(50, nested ? 50 + (22 - last) : 50, Math.max(2.5, Math.min(6, last - 2)), fg);
    }
    return out;
  },

  checker(r, { fg }) {
    const n = pick(r, [2, 3, 4, 5]);
    const parity = r() < 0.5 ? 0 : 1;
    const size = 40 / n;
    let out = '';
    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if ((i + j) % 2 !== parity) {
          continue;
        }
        out += `<rect x="${n2(30 + i * size)}" y="${n2(30 + j * size)}" width="${n2(size)}" height="${n2(size)}" fill="${fg}"/>`;
      }
    }
    return rotate(r() < 0.4 ? 45 : 0, out);
  },

  sparkle(r, { fg }) {
    const star = (cx: number, cy: number, R: number) => {
      const k = R * 0.14;
      const p = (x: number, y: number) => `${n2(x)} ${n2(y)}`;
      return `<path d="M${p(cx, cy - R)}Q${p(cx + k, cy - k)} ${p(cx + R, cy)}Q${p(cx + k, cy + k)} ${p(cx, cy + R)}Q${p(cx - k, cy + k)} ${p(cx - R, cy)}Q${p(cx - k, cy - k)} ${p(cx, cy - R)}Z" fill="${fg}"/>`;
    };
    const eight = r() < 0.4;
    const layout = pick(r, [
      [[50, 50, 24]],
      [[46, 54, 18], [65, 34, 8]],
      [[44, 56, 15], [64, 42, 9], [42, 31, 6]],
    ]);
    const out = layout.map(([x, y, R], i) => {
      if (eight && i === 0) {
        return `<g transform="rotate(45 ${x} ${y})">${star(x, y, R * 0.55)}</g>${star(x, y, R)}`;
      }
      return star(x, y, R);
    }).join('');
    return rotate(pick(r, [0, 90]), out);
  },

  arch(r, { fg, bg }) {
    const radii = pick(r, [[26, 13], [26, 18, 10]]);
    let out = '';
    radii.forEach((rad, k) => {
      out += `<path d="M${50 - rad} 63A${rad} ${rad} 0 0 1 ${50 + rad} 63Z" fill="${k % 2 ? bg : fg}"/>`;
    });
    return rotate(Math.floor(r() * 4) * 90, out);
  },

  pinwheel(r, { fg }) {
    const tri = pick(r, [
      [[28, 28], [50, 28], [50, 50]],
      [[28, 28], [50, 28], [28, 50]],
      [[50, 50], [50, 26], [33.7, 33.7]],
    ]);
    let out = '';
    for (let k = 0; k < 4; k++) {
      out += rotate(k * 90, poly(tri, fg));
    }
    if (r() < 0.4) {
      out += circle(50, 50, 4, fg);
    }
    return rotate(r() < 0.5 ? 0 : 45, out);
  },

  waves(r, { fg }) {
    const ys = pick(r, [[43, 57], [38, 50, 62], [33.5, 44.5, 55.5, 66.5]]);
    const amp = ys.length === 4 ? 3.5 : 4;
    const smooth = r() < 0.5;
    const seg = 44 / 6;
    let d = '';
    for (const y of ys) {
      if (smooth) {
        d += `M28 ${y}Q${n2(28 + seg / 2)} ${y - amp * 1.6} ${n2(28 + seg)} ${y}`;
        for (let s = 2; s <= 6; s++) {
          d += `T${n2(28 + s * seg)} ${y}`;
        }
        continue;
      }
      d += `M28 ${y + amp}`;
      for (let s = 1; s <= 6; s++) {
        d += `L${n2(28 + s * seg)} ${y + (s % 2 ? -amp : amp)}`;
      }
    }
    return rotate(pick(r, [0, 45, 90, 135]), `<path d="${d}" fill="none" stroke="${fg}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`);
  },

  halves(r, { fg }) {
    const gap = pick(r, [3, 5]);
    const out = `<path d="M${50 - gap} 28A22 22 0 0 0 ${50 - gap} 72Z" fill="${fg}"/><path d="M${50 + gap} 28A22 22 0 0 1 ${50 + gap} 72Z" fill="${fg}"/>`;
    return rotate(pick(r, [0, 45, 90, 135]), out);
  },

  diamond(r, { fg, bg }) {
    const rx = pick(r, [2, 8]);
    let out = `<rect x="34" y="34" width="32" height="32" rx="${rx}" fill="${fg}"/>`;
    const inner = pick(r, ['none', 'hole', 'dot', 'nest']);
    if (inner === 'hole') {
      out += `<rect x="43" y="43" width="14" height="14" rx="${rx / 2}" fill="${bg}"/>`;
    }
    if (inner === 'dot') {
      out += circle(50, 50, 5, bg);
    }
    if (inner === 'nest') {
      out += `<rect x="40" y="40" width="20" height="20" rx="${rx / 2}" fill="${bg}"/><rect x="45" y="45" width="10" height="10" rx="${rx / 4}" fill="${fg}"/>`;
    }
    return rotate(r() < 0.7 ? 45 : 0, out);
  },

  moon(r, { fg }) {
    const turn = Math.floor(r() * 8) * 45 - 22;
    const d = pick(r, [10, 14]);
    const R = 21;
    const rr = 18;
    const a = (R * R - rr * rr + d * d) / (2 * d);
    const h = Math.sqrt(R * R - a * a);
    const top = `${n2(50 + a)} ${n2(50 - h)}`;
    const bottom = `${n2(50 + a)} ${n2(50 + h)}`;
    let out = `<path d="M${top}A${R} ${R} 0 1 0 ${bottom}A${rr} ${rr} 0 ${a - d > 0 ? 1 : 0} 1 ${top}Z" fill="${fg}"/>`;
    if (r() < 0.4) {
      out += circle(50 + d + 3, 43, 3, fg);
    }
    return rotate(turn, out);
  },

  eye(r, { fg, bg }) {
    const open = pick(r, [10, 14]);
    let out = `<path d="M26 50Q50 ${50 - open * 2} 74 50Q50 ${50 + open * 2} 26 50Z" fill="${fg}"/>`;
    out += circle(50, 50, open * 0.75, bg);
    if (r() < 0.5) {
      out += circle(50, 50, open * 0.35, fg);
    }
    return rotate(r() < 0.5 ? 0 : 90, out);
  },

  triangle(r, { fg, bg }) {
    const mode = pick(r, ['solid', 'hole', 'split']);
    const tri = (cx: number, cy: number, s: number, dir = 1) => {
      const h = s * 0.866;
      return [[cx, cy - (dir * 2 * h) / 3], [cx + s / 2, cy + (dir * h) / 3], [cx - s / 2, cy + (dir * h) / 3]];
    };
    let out = poly(tri(50, 53, 46), fg);
    if (mode === 'hole') {
      out += poly(tri(50, 53, 18), bg);
    }
    if (mode === 'split') {
      out += poly(tri(50, 53, 23, -1), bg);
    }
    return rotate(Math.floor(r() * 4) * 90, out);
  },

  bars(r, { fg }) {
    const n = pick(r, [3, 4, 5]);
    const w = lookup({ 3: 9, 4: 7, 5: 5.6 }, n);
    const gap = (44 - n * w) / (n - 1);
    const anchor = pick(r, ['center', 'bottom']);
    let out = '';
    for (let i = 0; i < n; i++) {
      const h = pick(r, [14, 20, 26, 32, 38, 44]);
      const y = anchor === 'center' ? 50 - h / 2 : 72 - h;
      out += `<rect x="${n2(28 + i * (w + gap))}" y="${y}" width="${w}" height="${h}" rx="${w / 2}" fill="${fg}"/>`;
    }
    return rotate(r() < 0.5 ? 0 : 90, out);
  },

  pixels(r, { fg }) {
    const n = pick(r, [3, 4, 5]);
    const round = r() < 0.35;
    const s = 44 / n;
    const half = Math.ceil(n / 2);
    const on = [];
    for (let y = 0; y < n; y++) {
      for (let x = 0; x < half; x++) {
        if (r() < 0.6) {
          on.push([x, y], [n - 1 - x, y]);
        }
      }
    }
    if (on.length < n * n * 0.45) {
      const mid = Math.floor(n / 2);
      for (let i = 0; i < n; i++) {
        on.push([mid, i], [i, mid]);
      }
    }
    return on.map(([x, y]) => {
      if (round) {
        return circle(28 + x * s + s / 2, 28 + y * s + s / 2, s * 0.4, fg);
      }
      return `<rect x="${n2(28 + x * s)}" y="${n2(28 + y * s)}" width="${n2(s + 0.4)}" height="${n2(s + 0.4)}" fill="${fg}"/>`;
    }).join('');
  },

  chain(r, { fg }) {
    const count = pick(r, [2, 3, 4]);
    const turn = pick(r, [0, 45, 90, 135]);
    const d = lookup({ 2: 7, 3: 7.5, 4: 9 }, count);
    const rad = lookup({ 2: 13, 3: 12, 4: 11 }, count);
    let out = '';
    for (let k = 0; k < count; k++) {
      const a = (k / count) * TAU;
      out += `<circle cx="${n2(50 + Math.cos(a) * d)}" cy="${n2(50 + Math.sin(a) * d)}" r="${rad}" fill="none" stroke="${fg}" stroke-width="${count === 4 ? 3.5 : 4}"/>`;
    }
    return rotate(turn, out);
  },

  gear(r, { fg, bg }) {
    const teeth = pick(r, [6, 8, 10, 12]);
    let out = circle(50, 50, 16, fg);
    for (let k = 0; k < teeth; k++) {
      out += `<rect x="46.5" y="27" width="7" height="10" rx="1.5" fill="${fg}" transform="rotate(${n2((360 / teeth) * k)} 50 50)"/>`;
    }
    const hole = pick(r, [0, 5, 8]);
    if (hole) {
      out += circle(50, 50, hole, bg);
    }
    return out;
  },

  orbit(r, { fg }) {
    const angle = Math.floor(r() * 8) * 45;
    const core = pick(r, [7, 9]);
    const twin = r() < 0.4;
    let out = `<circle cx="50" cy="50" r="19" fill="none" stroke="${fg}" stroke-width="3"/>` + circle(50, 50, core, fg);
    const moonAt = (deg: number) => {
      const a = (deg * Math.PI) / 180;
      return circle(50 + Math.cos(a) * 19, 50 + Math.sin(a) * 19, 4.5, fg);
    };
    out += moonAt(angle);
    if (twin) {
      out += moonAt(angle + 180);
    }
    return out;
  },

  truchet(r, { fg }) {
    const s = 22;
    let out = '';
    for (let qy = 0; qy < 2; qy++) {
      for (let qx = 0; qx < 2; qx++) {
        const ix = r() < 0.5 ? 0 : 1;
        const iy = r() < 0.5 ? 0 : 1;
        const cx = 28 + qx * s + ix * s;
        const cy = 28 + qy * s + iy * s;
        const dx = ix ? -1 : 1;
        const dy = iy ? -1 : 1;
        out += `<path d="M${cx} ${cy}L${cx + dx * s} ${cy}A${s} ${s} 0 0 ${dx * dy > 0 ? 1 : 0} ${cx} ${cy + dy * s}Z" fill="${fg}"/>`;
      }
    }
    return out;
  },

  chevrons(r, { fg }) {
    const ys = pick(r, [[43, 57], [38, 50, 62]]);
    const d = ys.map((y) => `M30 ${y + 6}L50 ${y - 6}L70 ${y + 6}`).join('');
    return rotate(Math.floor(r() * 4) * 90, `<path d="${d}" fill="none" stroke="${fg}" stroke-width="5" stroke-linecap="round" stroke-linejoin="round"/>`);
  },

  drop(r, { fg, bg }) {
    let out = `<path d="M50 24C56 32 69 43 69 54A19 19 0 0 1 31 54C31 43 44 32 50 24Z" fill="${fg}"/>`;
    const inner = pick(r, ['none', 'dot', 'ring']);
    if (inner === 'dot') {
      out += circle(50, 55, 6, bg);
    }
    if (inner === 'ring') {
      out += circle(50, 55, 9, bg) + circle(50, 55, 4, fg);
    }
    return rotate(Math.floor(r() * 8) * 45, out);
  },

  spiral(r, { fg }) {
    const turns = pick(r, [2, 2.75]);
    const dir = r() < 0.5 ? 1 : -1;
    const max = turns * TAU;
    let d = '';
    for (let t = 0; t <= max; t += 0.2) {
      const rad = 1 + (21 * t) / max;
      d += `${d ? 'L' : 'M'}${n2(50 + Math.cos(t * dir) * rad)} ${n2(50 + Math.sin(t * dir) * rad)}`;
    }
    return rotate(Math.floor(r() * 4) * 90, `<path d="${d}" fill="none" stroke="${fg}" stroke-width="3.5" stroke-linecap="round" stroke-linejoin="round"/>`);
  },

  stripes(r, { fg }) {
    const count = pick(r, [3, 4, 5]);
    const R = 23;
    const spacing = (2 * R) / (count + 1);
    let d = '';
    for (let i = 0; i < count; i++) {
      const o = -R + spacing * (i + 1);
      const len = Math.sqrt(R * R - o * o);
      d += `M${n2(50 - len)} ${n2(50 + o)}H${n2(50 + len)}`;
    }
    return rotate(pick(r, [0, 45, 90, 135]), `<path d="${d}" stroke="${fg}" stroke-width="4.5" stroke-linecap="round"/>`);
  },

  cube(r, { fg }) {
    const T = [50, 28], UR = [69.05, 39], LR = [69.05, 61], B = [50, 72], LL = [30.95, 61], UL = [30.95, 39], C = [50, 50];
    const outline = r() < 0.2;
    const shades = pick(r, [[1, 0.5, 0.75], [1, 0.75, 0.5], [0.5, 1, 0.75], [0.75, 0.5, 1], [1, 0.45, 0], [1, 0, 0.45], [0, 1, 0.5]]);
    let out = '';
    if (outline) {
      const p = (pt: readonly number[]) => pt.map(n2).join(' ');
      out = `<path d="M${p(T)}L${p(UR)}L${p(LR)}L${p(B)}L${p(LL)}L${p(UL)}ZM${p(UL)}L${p(C)}L${p(UR)}M${p(C)}L${p(B)}" fill="none" stroke="${fg}" stroke-width="3.5" stroke-linejoin="round"/>`;
    }
    if (!outline) {
      [[T, UR, C, UL], [C, UR, LR, B], [UL, C, B, LL]].forEach((face, i) => {
        if (!shades[i]) {
          return;
        }
        out += poly(face, fg).replace('/>', shades[i] < 1 ? ` opacity="${shades[i]}"/>` : '/>');
      });
    }
    return rotate(r() < 0.5 ? 0 : 180, out);
  },

  peaks(r, { fg }) {
    const two = r() < 0.6;
    const sun = r() < 0.5;
    let out = two
      ? poly([[50, 66], [61, 46], [72, 66]], fg).replace('/>', ' opacity="0.6"/>') + poly([[28, 66], [46, 34], [64, 66]], fg)
      : poly([[28, 66], [50, 32], [72, 66]], fg);
    if (sun) {
      out += circle(two ? 64 : 66, 34, 5, fg);
    }
    if (r() < 0.5) {
      return `<g transform="matrix(-1 0 0 1 100 0)">${out}</g>`;
    }
    return out;
  },

  hex(r, { fg, bg }) {
    const turn = r() < 0.5 ? 0 : 30;
    const hexPts = (R: number) => Array.from({ length: 6 }, (_, k) => {
      const a = (k / 6) * TAU - Math.PI / 2;
      return [50 + Math.cos(a) * R, 50 + Math.sin(a) * R];
    });
    const hexagon = (R: number, fill: string) => poly(hexPts(R), fill);
    const inner = pick(r, ['none', 'hole', 'dot', 'nested', 'outline']);
    if (inner === 'outline') {
      return rotate(turn, `<polygon points="${hexPts(21).map((p) => p.map(n2).join(',')).join(' ')}" fill="none" stroke="${fg}" stroke-width="4" stroke-linejoin="round"/>${hexagon(8, fg)}`);
    }
    let out = hexagon(23, fg);
    if (inner === 'hole') {
      out += hexagon(11, bg);
    }
    if (inner === 'dot') {
      out += circle(50, 50, 7, bg);
    }
    if (inner === 'nested') {
      out += hexagon(15, bg) + hexagon(8, fg);
    }
    return rotate(turn, out);
  },

  bubbles(r, { fg }) {
    const layout = pick(r, [
      [[44, 46, 15], [63, 60, 8], [61, 37, 5]],
      [[50, 42, 13], [37, 63, 7], [63, 63, 7]],
      [[40, 58, 12], [60, 44, 9], [52, 30, 4]],
    ]);
    return rotate(Math.floor(r() * 4) * 90, layout.map(([x, y, rad]) => circle(x, y, rad, fg)).join(''));
  },
} satisfies Record<string, GlyphFn>;

export type GlyphName = keyof typeof GLYPHS;

export const GLYPH_NAMES = Object.keys(GLYPHS) as GlyphName[];
