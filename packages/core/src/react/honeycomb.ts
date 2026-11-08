export interface HoneycombOptions {
  render: (q: number, r: number) => string;
  onFocus: (q: number, r: number) => void;
  onSettle?: (q: number, r: number) => void;
  field?: { spacing: number; rx: number; ry: number };
  wheel?: boolean;
}

export interface Honeycomb {
  reset: () => void;
  refresh: () => void;
  paintFocus: (svg: string) => void;
  restoreFocus: () => void;
  destroy: () => void;
}

type Vec = { x: number; y: number };
type Cell = { q: number; r: number };
type Mode = 'idle' | 'drag' | 'spring' | 'wheel';

const RX = 4;
const RY = 2.08;
const ROW = 0.866;
const REACH = 1.1;

const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

const sizeAt = (t: number) => 1 - 0.444 * Math.min(t, REACH) ** 1.6;
const pullAt = (t: number) => 1 - 0.11 * t ** 1.5;
const roomAt = (u: number, S: number) => 0.075 * S * Math.tanh(u / (0.3 * S)) * Math.max(0, 1 - u / (4.5 * S));

function fadeAt(t: number) {
  if (t <= 0.82) {
    return 1;
  }
  if (t <= 1) {
    return 1 - ((t - 0.82) / 0.18) * 0.65;
  }
  return Math.max(0, 0.35 * (1 - (t - 1) / (REACH - 1)));
}
const toPx = (q: number, r: number, S: number): Vec => ({ x: S * (q + r / 2), y: S * r * ROW });

function toCell(x: number, y: number, S: number): Cell {
  const r = y / (S * ROW);
  const q = x / S - r / 2;
  const s = -q - r;
  let rq = Math.round(q);
  let rr = Math.round(r);
  const rs = Math.round(s);
  const dq = Math.abs(rq - q);
  const dr = Math.abs(rr - r);
  const ds = Math.abs(rs - s);
  if (dq > dr && dq > ds) {
    rq = -rr - rs;
    return { q: rq, r: rr };
  }
  if (dr > ds) {
    rr = -rq - rs;
  }
  return { q: rq, r: rr };
}

function looksLikeTrackpad(e: WheelEvent) {
  if (e.ctrlKey || e.deltaMode !== 0) {
    return false;
  }
  return e.deltaX !== 0 || Math.abs(e.deltaY) < 40 || !Number.isInteger(e.deltaY);
}

export function createHoneycomb(el: HTMLElement, options: HoneycombOptions): Honeycomb {
  const { render, onFocus, onSettle, field, wheel = true } = options;
  const rx = field?.rx ?? RX;
  const ry = field?.ry ?? RY;
  const rowReach = Math.ceil((ry * REACH) / ROW) + 1;
  const colReach = Math.ceil(rx * REACH + ry / 2) + 2;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nodes = new Map<string, HTMLDivElement>();
  let cam: Vec = { x: 0, y: 0 };
  let vel: Vec = { x: 0, y: 0 };
  let wheelVel: Vec = { x: 0, y: 0 };
  let target: Vec = { x: 0, y: 0 };
  let focus: Cell = { q: 0, r: 0 };
  let mode: Mode = 'idle';
  let painted: string | null = null;
  let drag: { x: number; y: number; t: number; moved: number; cell: Cell | null } | null = null;
  let raf = 0;
  let last = 0;
  let settleTimer = 0;
  let shuffleTimer = 0;
  let squeeze = 0;
  let squeezeTo = 0;
  let lastPageScroll = 0;

  const spacing = () => field?.spacing ?? clamp(el.clientWidth / 8.4, 40, 72);

  function paint(node: HTMLDivElement, svg: string) {
    node.innerHTML = svg;
  }

  function layout() {
    const W = el.clientWidth;
    const S = spacing();
    const H = field ? el.clientHeight : Math.round(S * 4.4);
    if (!field && el.style.height !== `${H}px`) {
      el.style.height = `${H}px`;
    }
    const base = S * 0.93;
    const room = 1 - squeeze;
    const seen = new Set<string>();
    const rC = Math.round(cam.y / (S * ROW));
    for (let r = rC - rowReach; r <= rC + rowReach; r++) {
      const qC = Math.round(cam.x / S - r / 2);
      for (let q = qC - colReach; q <= qC + colReach; q++) {
        const p = toPx(q, r, S);
        const dx = p.x - cam.x;
        const dy = p.y - cam.y;
        const t = Math.hypot(dx / (rx * S), dy / (ry * S));
        if (t > REACH) {
          continue;
        }
        const key = `${q}.${r}`;
        seen.add(key);
        let node = nodes.get(key);
        if (!node) {
          node = document.createElement('div');
          node.className = 'ga-cell';
          node.dataset.q = String(q);
          node.dataset.r = String(r);
          node.style.setProperty('--ga-delay', `${Math.round(t * 320)}ms`);
          paint(node, render(q, r));
          el.append(node);
          nodes.set(key, node);
        }
        const len = Math.hypot(dx, dy);
        const push = len < 1e-3 ? 0 : (roomAt(t * rx * S, S) * room) / len;
        const k = pullAt(t) + push;
        const x = W / 2 + dx * k - base / 2;
        const y = H / 2 + dy * k - base / 2;
        node.style.width = `${base}px`;
        node.style.height = `${base}px`;
        node.style.translate = `${x.toFixed(1)}px ${y.toFixed(1)}px`;
        node.style.transform = `scale(${sizeAt(t).toFixed(3)})`;
        node.style.opacity = fadeAt(t).toFixed(3);
        node.style.zIndex = String(100 - Math.round(t * 50));
        node.classList.toggle('is-focus', q === focus.q && r === focus.r);
      }
    }
    for (const [key, node] of nodes) {
      if (!seen.has(key)) {
        node.remove();
        nodes.delete(key);
      }
    }
    el.classList.toggle('is-moving', mode !== 'idle');
  }

  function restoreFocus() {
    if (!painted) {
      return;
    }
    const node = nodes.get(painted);
    if (node) {
      paint(node, render(Number(node.dataset.q), Number(node.dataset.r)));
    }
    painted = null;
  }

  function setFocus(cell: Cell) {
    if (cell.q === focus.q && cell.r === focus.r) {
      return;
    }
    restoreFocus();
    focus = cell;
    onFocus(cell.q, cell.r);
  }

  function updateFocus() {
    setFocus(toCell(cam.x, cam.y, spacing()));
  }

  function request() {
    if (raf) {
      return;
    }
    last = last || performance.now();
    raf = requestAnimationFrame(tick);
  }

  function snapTo(cell: Cell, velocity: Vec = { x: 0, y: 0 }) {
    target = toPx(cell.q, cell.r, spacing());
    setFocus(cell);
    vel = { ...velocity };
    mode = 'spring';
    if (reduceMotion) {
      cam = { ...target };
      vel = { x: 0, y: 0 };
      mode = 'idle';
    }
    request();
  }

  function tick(now: number) {
    raf = 0;
    const dt = Math.min(2.5, (now - (last || now)) / 16.67);
    last = now;
    if (mode === 'spring') {
      const w = 0.19;
      const steps = Math.max(1, Math.ceil(dt * 2));
      const h = dt / steps;
      for (let i = 0; i < steps; i++) {
        vel.x += (w * w * (target.x - cam.x) - 2 * w * vel.x) * h;
        vel.y += (w * w * (target.y - cam.y) - 2 * w * vel.y) * h;
        cam.x += vel.x * h;
        cam.y += vel.y * h;
      }
      const far = Math.hypot(target.x - cam.x, target.y - cam.y);
      if (far < 0.25 && Math.hypot(vel.x, vel.y) < 0.05) {
        cam = { ...target };
        vel = { x: 0, y: 0 };
        mode = 'idle';
        onSettle?.(focus.q, focus.r);
      }
    }
    const easing = squeezeTo - squeeze;
    squeeze = Math.abs(easing) < 0.002 ? squeezeTo : squeeze + easing * (1 - Math.pow(0.78, dt));
    if (mode !== 'spring') {
      updateFocus();
    }
    layout();
    if (mode === 'spring' || squeeze !== squeezeTo) {
      request();
    }
  }

  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) {
      return;
    }
    try {
      el.setPointerCapture(e.pointerId);
    } catch {
      el.releasePointerCapture?.(e.pointerId);
    }
    mode = 'drag';
    window.clearTimeout(settleTimer);
    vel = { x: 0, y: 0 };
    const cellEl = (e.target as HTMLElement).closest<HTMLElement>('.ga-cell');
    drag = {
      x: e.clientX,
      y: e.clientY,
      t: performance.now(),
      moved: 0,
      cell: cellEl ? { q: Number(cellEl.dataset.q), r: Number(cellEl.dataset.r) } : null,
    };
    el.classList.add('is-dragging');
    layout();
  }

  function onPointerMove(e: PointerEvent) {
    if (mode !== 'drag' || !drag) {
      return;
    }
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    const now = performance.now();
    const frames = Math.max(1, now - drag.t) / 16.67;
    cam.x -= dx;
    cam.y -= dy;
    vel.x = 0.7 * (-dx / frames) + 0.3 * vel.x;
    vel.y = 0.7 * (-dy / frames) + 0.3 * vel.y;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    if (drag.moved > 6) {
      squeezeTowards(1);
    }
    drag.x = e.clientX;
    drag.y = e.clientY;
    drag.t = now;
    updateFocus();
    layout();
  }

  function onPointerUp() {
    if (mode !== 'drag' || !drag) {
      return;
    }
    el.classList.remove('is-dragging');
    squeezeTowards(0);
    const { moved, cell, t } = drag;
    drag = null;
    last = 0;
    if (moved < 6 && cell) {
      snapTo(cell);
      return;
    }
    const still = performance.now() - t > 80;
    const v = still ? { x: 0, y: 0 } : { x: clamp(vel.x, -45, 45), y: clamp(vel.y, -45, 45) };
    snapTo(toCell(cam.x + v.x * 9, cam.y + v.y * 9, spacing()), v);
  }

  function onKeyDown(e: KeyboardEvent) {
    const { q, r } = focus;
    const odd = Math.abs(r) % 2 === 1;
    const moves: Record<string, Cell> = {
      ArrowLeft: { q: q - 1, r },
      ArrowRight: { q: q + 1, r },
      ArrowUp: odd ? { q: q + 1, r: r - 1 } : { q, r: r - 1 },
      ArrowDown: odd ? { q, r: r + 1 } : { q: q - 1, r: r + 1 },
    };
    const next = moves[e.key];
    if (!next) {
      return;
    }
    e.preventDefault();
    last = 0;
    snapTo(next);
  }

  function onWheel(e: WheelEvent) {
    if (!looksLikeTrackpad(e)) {
      return;
    }
    const pageIsScrolling = performance.now() - lastPageScroll < 350;
    if (pageIsScrolling && Math.abs(e.deltaY) > Math.abs(e.deltaX)) {
      return;
    }
    e.preventDefault();
    mode = 'wheel';
    squeezeTowards(1);
    cam.x += e.deltaX;
    cam.y += e.deltaY;
    wheelVel = { x: 0.6 * e.deltaX + 0.4 * wheelVel.x, y: 0.6 * e.deltaY + 0.4 * wheelVel.y };
    updateFocus();
    layout();
    const v = { x: clamp(wheelVel.x, -30, 30), y: clamp(wheelVel.y, -30, 30) };
    window.clearTimeout(settleTimer);
    settleTimer = window.setTimeout(() => {
      last = 0;
      squeezeTowards(0);
      snapTo(toCell(cam.x + v.x * 6, cam.y + v.y * 6, spacing()), v);
    }, 90);
  }

  function squeezeTowards(value: number) {
    el.classList.toggle('is-free', value === 1);
    if (reduceMotion || squeezeTo === value) {
      return;
    }
    squeezeTo = value;
    request();
  }

  function onScroll() {
    lastPageScroll = performance.now();
  }

  function clear() {
    for (const node of nodes.values()) {
      node.remove();
    }
    nodes.clear();
    painted = null;
  }

  el.addEventListener('pointerdown', onPointerDown);
  el.addEventListener('pointermove', onPointerMove);
  el.addEventListener('pointerup', onPointerUp);
  el.addEventListener('pointercancel', onPointerUp);
  el.addEventListener('keydown', onKeyDown);
  if (wheel) {
    el.addEventListener('wheel', onWheel, { passive: false });
  }
  window.addEventListener('scroll', onScroll, { passive: true });
  const resize = new ResizeObserver(() => {
    cam = toPx(focus.q, focus.r, spacing());
    layout();
  });
  resize.observe(el);
  layout();

  return {
    reset() {
      cam = { x: 0, y: 0 };
      vel = { x: 0, y: 0 };
      focus = { q: 0, r: 0 };
      mode = 'idle';
      clear();
      if (!reduceMotion) {
        el.classList.remove('is-shuffling');
        void el.offsetWidth;
        el.classList.add('is-shuffling');
        window.clearTimeout(shuffleTimer);
        shuffleTimer = window.setTimeout(() => el.classList.remove('is-shuffling'), 900);
      }
      layout();
      onFocus(0, 0);
    },
    refresh() {
      clear();
      layout();
    },
    paintFocus(svg) {
      const key = `${focus.q}.${focus.r}`;
      const node = nodes.get(key);
      if (!node) {
        return;
      }
      paint(node, svg);
      painted = key;
    },
    restoreFocus,
    destroy() {
      cancelAnimationFrame(raf);
      window.clearTimeout(settleTimer);
      window.clearTimeout(shuffleTimer);
      resize.disconnect();
      el.removeEventListener('pointerdown', onPointerDown);
      el.removeEventListener('pointermove', onPointerMove);
      el.removeEventListener('pointerup', onPointerUp);
      el.removeEventListener('pointercancel', onPointerUp);
      el.removeEventListener('keydown', onKeyDown);
      el.removeEventListener('wheel', onWheel);
      window.removeEventListener('scroll', onScroll);
      clear();
    },
  };
}
