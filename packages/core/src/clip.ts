import { n2 } from './random';

type Point = { x: number; y: number };
type Edge =
  | { kind: 'line'; from: Point; to: Point }
  | { kind: 'arc'; c: Point; r: number; from: number; to: number };

export type Outline = { square: boolean; radius: number };

export interface HalfPlane {
  nx: number;
  ny: number;
  d: number;
}

const TAU = Math.PI * 2;
const EPS = 1e-9;
const C = 50;

const at = (c: Point, r: number, a: number): Point => ({ x: c.x + r * Math.cos(a), y: c.y + r * Math.sin(a) });
const start = (e: Edge) => (e.kind === 'line' ? e.from : at(e.c, e.r, e.from));
const end = (e: Edge) => (e.kind === 'line' ? e.to : at(e.c, e.r, e.to));
const close = (a: Point, b: Point) => Math.abs(a.x - b.x) < 1e-6 && Math.abs(a.y - b.y) < 1e-6;

function outline(shape: Outline): Edge[] {
  if (!shape.square) {
    return [{ kind: 'arc', c: { x: C, y: C }, r: C, from: -Math.PI, to: Math.PI }];
  }
  const k = Math.min(Math.max(shape.radius, 0), C);
  const far = 100 - k;
  const edges: Edge[] = [
    { kind: 'line', from: { x: k, y: 0 }, to: { x: far, y: 0 } },
    { kind: 'arc', c: { x: far, y: k }, r: k, from: -Math.PI / 2, to: 0 },
    { kind: 'line', from: { x: 100, y: k }, to: { x: 100, y: far } },
    { kind: 'arc', c: { x: far, y: far }, r: k, from: 0, to: Math.PI / 2 },
    { kind: 'line', from: { x: far, y: 100 }, to: { x: k, y: 100 } },
    { kind: 'arc', c: { x: k, y: far }, r: k, from: Math.PI / 2, to: Math.PI },
    { kind: 'line', from: { x: 0, y: far }, to: { x: 0, y: k } },
    { kind: 'arc', c: { x: k, y: k }, r: k, from: Math.PI, to: (3 * Math.PI) / 2 },
  ];
  return edges.filter((e) => (e.kind === 'arc' ? e.r > EPS : !close(e.from, e.to)));
}

function cut(edge: Edge, h: HalfPlane): Edge[] {
  const side = (p: Point) => h.nx * p.x + h.ny * p.y - h.d;
  if (edge.kind === 'line') {
    const a = side(edge.from);
    const b = side(edge.to);
    if (a <= EPS && b <= EPS) {
      return [edge];
    }
    if (a > -EPS && b > -EPS) {
      return [];
    }
    const t = a / (a - b);
    const hit = { x: edge.from.x + t * (edge.to.x - edge.from.x), y: edge.from.y + t * (edge.to.y - edge.from.y) };
    return [a < 0 ? { kind: 'line', from: edge.from, to: hit } : { kind: 'line', from: hit, to: edge.to }];
  }
  const { c, r, from, to } = edge;
  const k = (h.d - h.nx * c.x - h.ny * c.y) / r;
  const cuts: number[] = [];
  if (Math.abs(k) < 1) {
    const phi = Math.atan2(h.ny, h.nx);
    const spread = Math.acos(k);
    for (const base of [phi - spread, phi + spread]) {
      let a = base;
      while (a < from) {
        a += TAU;
      }
      while (a > to) {
        a -= TAU;
      }
      if (a > from + EPS && a < to - EPS) {
        cuts.push(a);
      }
    }
  }
  const stops = [from, ...cuts.sort((x, y) => x - y), to];
  const kept: Edge[] = [];
  for (let i = 0; i < stops.length - 1; i++) {
    if (side(at(c, r, (stops[i] + stops[i + 1]) / 2)) <= 0) {
      kept.push({ kind: 'arc', c, r, from: stops[i], to: stops[i + 1] });
    }
  }
  return kept;
}

function clip(edges: Edge[], h: HalfPlane): Edge[] {
  const kept = edges.flatMap((e) => cut(e, h));
  if (kept.length === 0) {
    return [];
  }
  const joined: Edge[] = [];
  for (let i = 0; i < kept.length; i++) {
    const edge = kept[i];
    joined.push(edge);
    const next = kept[(i + 1) % kept.length];
    if (!close(end(edge), start(next))) {
      joined.push({ kind: 'line', from: end(edge), to: start(next) });
    }
  }
  return joined;
}

const pt = (p: Point) => `${n2(p.x)} ${n2(p.y)}`;

function toPath(edges: Edge[]): string {
  if (edges.length === 0) {
    return '';
  }
  let d = `M${pt(start(edges[0]))}`;
  for (const e of edges) {
    if (e.kind === 'line') {
      d += `L${pt(e.to)}`;
      continue;
    }
    const span = e.to - e.from;
    if (span > Math.PI * 1.999) {
      const mid = (e.from + e.to) / 2;
      d += `A${n2(e.r)} ${n2(e.r)} 0 0 1 ${pt(at(e.c, e.r, mid))}`;
    }
    d += `A${n2(e.r)} ${n2(e.r)} 0 ${span > Math.PI && span <= Math.PI * 1.999 ? 1 : 0} 1 ${pt(end(e))}`;
  }
  return `${d}Z`;
}

export function turned(nx: number, ny: number, offset: number, degrees: number): HalfPlane {
  const a = (degrees * Math.PI) / 180;
  const rx = nx * Math.cos(a) - ny * Math.sin(a);
  const ry = nx * Math.sin(a) + ny * Math.cos(a);
  return { nx: rx, ny: ry, d: offset + rx * C + ry * C };
}

export function region(shape: Outline, planes: HalfPlane[]): string {
  let edges = outline(shape);
  for (const plane of planes) {
    edges = clip(edges, plane);
  }
  return toPath(edges);
}

export function inside(shape: Outline, x: number, y: number, r: number): boolean {
  if (!shape.square) {
    return Math.hypot(x - C, y - C) + r <= C;
  }
  const half = C - r;
  const k = Math.max(Math.min(Math.max(shape.radius, 0), C) - r, 0);
  const dx = Math.max(Math.abs(x - C) - (half - k), 0);
  const dy = Math.max(Math.abs(y - C) - (half - k), 0);
  return Math.hypot(dx, dy) <= k;
}
