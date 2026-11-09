import { createAvatar } from 'glyph-avatar';

export interface FieldShape {
  spacing: number;
  anchor: 'right' | 'top';
}

type Vec = { x: number; y: number };

const ROW = 0.866;

function looksLikeTrackpad(e: WheelEvent) {
  if (e.ctrlKey || e.deltaMode !== 0) {
    return false;
  }
  return e.deltaX !== 0 || Math.abs(e.deltaY) < 40 || !Number.isInteger(e.deltaY);
}

export function createField(el: HTMLElement, shape: FieldShape) {
  const S = shape.spacing;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const nodes = new Map<string, HTMLDivElement>();
  const rolls = new Map<string, number>();
  let cam: Vec = { x: 0, y: 0 };
  let vel: Vec = { x: 0, y: 0 };
  let drag: { x: number; y: number; t: number; moved: number; key: string | null } | null = null;
  let raf = 0;
  let last = 0;
  let lastPageScroll = 0;
  let born = true;

  const svgFor = (key: string) => createAvatar(`hero:${key}:${rolls.get(key) ?? 0}`);

  function layout() {
    const W = el.clientWidth;
    const H = el.clientHeight;
    const right = shape.anchor === 'right';
    const ax = right ? W : W / 2;
    const ay = right ? H / 2 : 0;
    const reach = right ? W * 0.98 : Math.max(W * 0.62, 220);
    const squash = right ? 1 : 1.8;
    const rowH = S * ROW;
    const seen = new Set<string>();
    const r0 = Math.floor((cam.y - S) / rowH);
    const r1 = Math.ceil((cam.y + H + S) / rowH);
    for (let r = r0; r <= r1; r++) {
      const shift = ((r % 2) + 2) % 2 ? S / 2 : 0;
      const q0 = Math.floor((cam.x - S - shift) / S);
      const q1 = Math.ceil((cam.x + W + S - shift) / S);
      for (let q = q0; q <= q1; q++) {
        const x = q * S + shift - cam.x;
        const y = r * rowH - cam.y;
        const d = Math.hypot(x - ax, (y - ay) * squash) / reach;
        if (d >= 1) {
          continue;
        }
        const key = `${q}.${r}`;
        seen.add(key);
        let node = nodes.get(key);
        if (!node) {
          node = document.createElement('div');
          node.className = born ? 'hf-cell is-born' : 'hf-cell';
          node.dataset.key = key;
          node.style.animationDelay = `${Math.round(d * 320)}ms`;
          node.innerHTML = svgFor(key);
          el.append(node);
          nodes.set(key, node);
        }
        const size = S * (0.9 - 0.56 * d);
        node.style.width = `${size}px`;
        node.style.height = `${size}px`;
        node.style.translate = `${(x - size / 2).toFixed(1)}px ${(y - size / 2).toFixed(1)}px`;
        node.style.opacity = (1 - d * d * 0.9).toFixed(3);
      }
    }
    for (const [key, node] of nodes) {
      if (!seen.has(key)) {
        node.remove();
        nodes.delete(key);
      }
    }
    born = false;
    el.classList.toggle('is-moving', !!drag || Math.hypot(vel.x, vel.y) > 0.05);
  }

  function request() {
    if (raf) {
      return;
    }
    raf = requestAnimationFrame(tick);
  }

  function tick(now: number) {
    raf = 0;
    const dt = Math.min(2.5, (now - (last || now)) / 16.67);
    last = now;
    if (drag) {
      return;
    }
    cam.x += vel.x * dt;
    cam.y += vel.y * dt;
    const keep = Math.pow(0.94, dt);
    vel = { x: vel.x * keep, y: vel.y * keep };
    if (Math.hypot(vel.x, vel.y) < 0.05) {
      vel = { x: 0, y: 0 };
    }
    layout();
    if (vel.x || vel.y) {
      request();
    }
  }

  function roll(key: string) {
    const node = nodes.get(key);
    if (!node) {
      return;
    }
    rolls.set(key, (rolls.get(key) ?? 0) + 1);
    node.innerHTML = svgFor(key);
    if (reduceMotion) {
      return;
    }
    node.classList.remove('is-rolled');
    void node.offsetWidth;
    node.classList.add('is-rolled');
  }

  function onPointerDown(e: PointerEvent) {
    if (e.button !== 0) {
      return;
    }
    const cell = (e.target as HTMLElement).closest<HTMLElement>('.hf-cell');
    drag = { x: e.clientX, y: e.clientY, t: performance.now(), moved: 0, key: cell?.dataset.key ?? null };
    vel = { x: 0, y: 0 };
    el.setPointerCapture(e.pointerId);
  }

  function onPointerMove(e: PointerEvent) {
    if (!drag) {
      return;
    }
    const dx = e.clientX - drag.x;
    const dy = e.clientY - drag.y;
    const now = performance.now();
    const frames = Math.max(1, now - drag.t) / 16.67;
    drag.moved += Math.abs(dx) + Math.abs(dy);
    if (drag.moved < 6) {
      return;
    }
    el.classList.add('is-dragging');
    cam.x -= dx;
    cam.y -= dy;
    vel = { x: 0.7 * (-dx / frames) + 0.3 * vel.x, y: 0.7 * (-dy / frames) + 0.3 * vel.y };
    drag.x = e.clientX;
    drag.y = e.clientY;
    drag.t = now;
    layout();
  }

  function onPointerUp() {
    if (!drag) {
      return;
    }
    const { moved, key, t } = drag;
    drag = null;
    el.classList.remove('is-dragging');
    if (moved < 6) {
      vel = { x: 0, y: 0 };
      if (key) {
        roll(key);
      }
      layout();
      return;
    }
    if (performance.now() - t > 80 || reduceMotion) {
      vel = { x: 0, y: 0 };
    }
    last = 0;
    layout();
    request();
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
    vel = { x: 0, y: 0 };
    cam.x += e.deltaX;
    cam.y += e.deltaY;
    layout();
  }

  function onScroll() {
    lastPageScroll = performance.now();
  }

  el.addEventListener('pointerdown', onPointerDown);
  el.addEventListener('pointermove', onPointerMove);
  el.addEventListener('pointerup', onPointerUp);
  el.addEventListener('pointercancel', onPointerUp);
  el.addEventListener('wheel', onWheel, { passive: false });
  window.addEventListener('scroll', onScroll, { passive: true });
  const resize = new ResizeObserver(() => layout());
  resize.observe(el);
  layout();

  return () => {
    cancelAnimationFrame(raf);
    resize.disconnect();
    el.removeEventListener('pointerdown', onPointerDown);
    el.removeEventListener('pointermove', onPointerMove);
    el.removeEventListener('pointerup', onPointerUp);
    el.removeEventListener('pointercancel', onPointerUp);
    el.removeEventListener('wheel', onWheel);
    window.removeEventListener('scroll', onScroll);
    for (const node of nodes.values()) {
      node.remove();
    }
    nodes.clear();
  };
}
