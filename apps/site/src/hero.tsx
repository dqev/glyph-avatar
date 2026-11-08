import { useEffect, useRef, useState, type ReactNode } from 'react';
import { Avatar } from '@glyph-avatars/react';

const NAMES = ['maya', 'omar', 'lena', 'kofi', 'priya', 'jonas', 'ada', 'sam', 'noor', 'theo', 'ines', 'ravi', 'mia', 'leo', 'zara', 'finn', 'aiko', 'nils', 'sofia', 'tariq', 'eva', 'hugo', 'yara', 'kai', 'lina', 'mateo', 'ruth', 'ivan', 'nia', 'otto', 'pia', 'dev'];
const DOMAINS = ['studio.dev', 'acme.io', 'gmail.com', 'team.so'];
const idAt = (i: number) => (i % 5 === 4 ? `user_${(8231 + i * 7919) % 99991}` : `${NAMES[i % NAMES.length]}@${DOMAINS[(i * 7) % DOMAINS.length]}`);

interface Dot {
  x: number;
  y: number;
  size: number;
  fade: number;
}

interface Box {
  left: number;
  top: number;
  right: number;
  bottom: number;
}

function clear(x: number, y: number, r: number, box: Box, pad = 20) {
  const cx = Math.max(box.left, Math.min(x, box.right));
  const cy = Math.max(box.top, Math.min(y, box.bottom));
  return Math.hypot(x - cx, y - cy) >= r + pad;
}

function corners(w: number, h: number, box: Box, k: number) {
  const S = 74 * k;
  const dots: Dot[] = [];
  const places = [
    { reach: Math.min(380, w * 0.42), at: (x: number, y: number) => ({ x: w - x, y }) },
    { reach: Math.min(300, w * 0.34), at: (x: number, y: number) => ({ x, y: h - y }) },
  ];
  for (const place of places) {
    for (let r = 0; r < 8; r++) {
      for (let q = 0; q < 8; q++) {
        const x = q * S + (r % 2) * (S / 2) + 36 * k;
        const y = r * S * 0.866 + 36 * k;
        const d = Math.hypot(x, y) / place.reach;
        const at = place.at(x, y);
        const size = Math.round((64 - d * 34) * k);
        if (d >= 1 || !clear(at.x, at.y, size / 2, box)) {
          continue;
        }
        dots.push({ ...at, size, fade: 1 - d * 0.75 });
      }
    }
  }
  return dots;
}

export function Hero(props: { children: ReactNode }) {
  const { children } = props;
  const ref = useRef<HTMLElement>(null);
  const introRef = useRef<HTMLDivElement>(null);
  const [dots, setDots] = useState<Dot[]>([]);

  useEffect(() => {
    const el = ref.current;
    const intro = introRef.current;
    if (!el || !intro) {
      return;
    }
    const update = () => {
      const outer = el.getBoundingClientRect();
      const inner = intro.getBoundingClientRect();
      const box = { left: inner.left - outer.left, top: inner.top - outer.top, right: inner.right - outer.left, bottom: inner.bottom - outer.top };
      const k = Math.min(1, Math.max(0.6, el.clientWidth / 1040));
      setDots(corners(el.clientWidth, el.clientHeight, box, k));
    };
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    observer.observe(intro);
    return () => observer.disconnect();
  }, []);

  return (
    <header className="hero" ref={ref} data-testid="intro">
      <div className="hero-art" aria-hidden="true">
        {dots.map((dot, i) => (
          <span key={i} style={{ left: dot.x, top: dot.y, opacity: dot.fade }}>
            <Avatar value={idAt(i + 100)} size={dot.size} />
          </span>
        ))}
      </div>
      <div className="intro" ref={introRef}>{children}</div>
    </header>
  );
}
