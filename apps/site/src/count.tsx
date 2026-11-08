import { useEffect, useRef, useState } from 'react';
import { BACKGROUNDS, GLYPH_NAMES, type AvatarOptions } from 'glyph-avatar';
import { Avatar } from '@glyph-avatar/react';

const SEED = 'maya@studio.dev';

type Sample = Pick<AvatarOptions, 'glyph' | 'background' | 'colorSeed'> & { seed?: string };

const COLORS = ['b2', 'f6', 'd4', 'a1', 'h8', 'k11', 'c3', 'l12', 'e5', 'i9', 'g7', 'j10'];
const colorAt = (i: number) => COLORS[i % COLORS.length];

const TERMS: { value: number; label: string; prefix?: string; samples: Sample[] }[] = [
  { value: 32, label: 'shapes', samples: GLYPH_NAMES.slice(0, 5).map((glyph, i) => ({ glyph, background: 'solid', colorSeed: colorAt(i) })) },
  { value: 8, label: 'backgrounds', samples: BACKGROUNDS.slice(1, 6).map((background, i) => ({ glyph: 'flower', background, colorSeed: colorAt(i + 3) })) },
  { value: 297, label: 'color sets', samples: [6, 7, 8, 9, 10].map((i) => ({ glyph: 'flower', background: 'solid', colorSeed: colorAt(i) })) },
  { value: 50, prefix: '~', label: 'ways to draw each', samples: ['v1', 'v2', 'v3', 'v4', 'v5'].map((seed, i) => ({ glyph: 'flower', background: 'solid', colorSeed: colorAt(i + 9), seed })) },
];

function useCountUp(to: number, run: boolean) {
  const [value, setValue] = useState(to);

  useEffect(() => {
    if (!run || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      setValue(to);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / 1400);
      setValue(Math.round(to * (1 - (1 - p) ** 3)));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [to, run]);

  return value;
}

function Num(props: { value: number; run: boolean }) {
  const { value, run } = props;
  return <>{useCountUp(value, run).toLocaleString('en-US')}</>;
}

export function Count() {
  const ref = useRef<HTMLDivElement>(null);
  const [run, setRun] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) {
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry.isIntersecting) {
        return;
      }
      setRun(true);
      observer.disconnect();
    }, { threshold: 0.4 });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div className="count" ref={ref}>
      <div className="sum">
        {TERMS.map((term, i) => (
          <div className="term-wrap" key={term.label}>
            {i > 0 && <span className="op">×</span>}
            <div className="term">
              <div className="stack">
                {term.samples.map((sample, j) => {
                  const { seed = SEED, ...options } = sample;
                  return <Avatar key={j} value={seed} size={36} {...options} />;
                })}
              </div>
              <b>{term.prefix}<Num value={term.value} run={run} /></b>
              <span>{term.label}</span>
            </div>
          </div>
        ))}
      </div>
      <div className="total">
        <span className="op">=</span>
        <b>3.8 million</b>
        <span>different avatars</span>
      </div>
    </div>
  );
}
