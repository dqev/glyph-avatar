import { useEffect, useRef, useState, type ReactNode } from 'react';
import { createField, type FieldShape } from './hero-field';

const QUERY = '(max-width: 760px)';
const WIDE: FieldShape = { spacing: 78, anchor: 'right' };
const NARROW: FieldShape = { spacing: 58, anchor: 'top' };

function useNarrow() {
  const [narrow, setNarrow] = useState(() => window.matchMedia(QUERY).matches);
  useEffect(() => {
    const query = window.matchMedia(QUERY);
    const update = () => setNarrow(query.matches);
    query.addEventListener('change', update);
    return () => query.removeEventListener('change', update);
  }, []);
  return narrow;
}

export function Hero(props: { children: ReactNode }) {
  const { children } = props;
  const fieldRef = useRef<HTMLDivElement>(null);
  const narrow = useNarrow();

  useEffect(() => {
    const el = fieldRef.current;
    if (!el) {
      return;
    }
    return createField(el, narrow ? NARROW : WIDE);
  }, [narrow]);

  return (
    <header className="hero" data-testid="intro">
      <div ref={fieldRef} className="hero-field" aria-hidden="true" />
      <div className="intro">{children}</div>
    </header>
  );
}
