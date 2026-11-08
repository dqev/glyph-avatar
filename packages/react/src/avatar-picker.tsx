import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { BACKGROUNDS, buildAvatar, stringifySpec, toSpec, type AvatarSpec, type ColorMode } from 'glyph-avatar';
import { createHoneycomb, type Honeycomb } from './honeycomb';
import { usePickerStyles } from './styles';

export interface AvatarPickerProps {
  defaultValue?: string;
  colors?: ColorMode;
  title?: string;
  description?: string;
  saveLabel?: string;
  onChange?: (value: string) => void;
  onSave?: (value: string) => void;
  onCancel?: () => void;
  className?: string;
}

const randomSeed = () => Math.random().toString(36).slice(2, 9);

function hueOf(hex: string) {
  const n = parseInt(hex.slice(1), 16);
  const r = (n >> 16) & 255;
  const g = (n >> 8) & 255;
  const b = n & 255;
  return (Math.atan2(Math.sqrt(3) * (g - b), 2 * r - g - b) * 180) / Math.PI;
}

function farApart(a: string, b: string) {
  const d = Math.abs(hueOf(a) - hueOf(b)) % 360;
  return Math.min(d, 360 - d) >= 70;
}

function pickSeed(accept: (seed: string) => boolean) {
  let seed = randomSeed();
  for (let i = 0; i < 24 && !accept(seed); i++) {
    seed = randomSeed();
  }
  return seed;
}

const shuffleIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M16 3h5v5M4 20 21 3M21 16v5h-5M15 15l6 6M4 4l5 5" /></svg>
);
const shapeIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden="true"><path d="M8 1.8 13.4 4.9v6.2L8 14.2 2.6 11.1V4.9Z" /></svg>
);
const colorsIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="8" cy="8" r="6" /><path d="M8 2a6 6 0 0 0 0 12Z" fill="currentColor" /></svg>
);
const backdropIcon = (
  <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden="true"><circle cx="8" cy="8" r="6" /><circle cx="8" cy="8" r="2.5" fill="currentColor" /></svg>
);

export function AvatarPicker(props: AvatarPickerProps) {
  const {
    defaultValue,
    colors = 'generated',
    title = 'Choose an avatar',
    description = 'Drag to look around, then pick one you like.',
    saveLabel = 'Save',
    onChange,
    onSave,
    onCancel,
    className,
  } = props;

  usePickerStyles();

  const hiveRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Honeycomb | null>(null);
  const saltRef = useRef(randomSeed());
  const initialRef = useRef<AvatarSpec | null>(defaultValue ? toSpec(defaultValue) : null);

  const specAt = (q: number, r: number): AvatarSpec => {
    if (q === 0 && r === 0 && initialRef.current) {
      return initialRef.current;
    }
    return { seed: `${saltRef.current}-${q}.${r}`, colors };
  };

  const [origin, setOrigin] = useState<AvatarSpec>(() => specAt(0, 0));
  const [spec, setSpec] = useState<AvatarSpec>(origin);

  useEffect(() => {
    const el = hiveRef.current;
    if (!el) {
      return;
    }
    const engine = createHoneycomb(el, {
      render: (q, r) => buildAvatar(specAt(q, r)).svg,
      onFocus: (q, r) => {
        const next = specAt(q, r);
        setOrigin(next);
        setSpec(next);
      },
    });
    engineRef.current = engine;
    engine.reset();
    return () => {
      engine.destroy();
      engineRef.current = null;
    };
  }, [colors]);

  useEffect(() => {
    const engine = engineRef.current;
    if (!engine) {
      return;
    }
    if (spec === origin) {
      engine.restoreFocus();
      return;
    }
    engine.paintFocus(buildAvatar(spec).svg);
  }, [spec, origin]);

  useEffect(() => {
    onChange?.(stringifySpec(spec));
  }, [spec]);

  const current = buildAvatar(spec);

  const changeShape = () => {
    const base = { ...spec, colorSeed: spec.colorSeed ?? spec.seed, background: current.background };
    const seed = pickSeed((next) => buildAvatar({ ...base, seed: next }).glyph !== current.glyph);
    setSpec({ ...base, seed });
  };

  const changeColors = () => {
    const colorSeed = pickSeed((next) => farApart(buildAvatar({ ...spec, colorSeed: next }).palette.bg, current.palette.bg));
    setSpec({ ...spec, colorSeed });
  };

  const changeBackdrop = () => {
    const others = BACKGROUNDS.filter((b) => b !== current.background);
    setSpec((s) => ({ ...s, background: others[Math.floor(Math.random() * others.length)] }));
  };

  const shuffle = () => {
    saltRef.current = randomSeed();
    initialRef.current = null;
    engineRef.current?.reset();
  };

  const tint = { '--ga-tint': current.palette.bg } as CSSProperties;

  return (
    <div className={className ? `ga-picker ${className}` : 'ga-picker'} style={tint}>
      {(title || description) && (
        <div className="ga-head">
          {title && <h3>{title}</h3>}
          {description && <p>{description}</p>}
        </div>
      )}

      <div
        ref={hiveRef}
        className="ga-hive"
        tabIndex={0}
        role="group"
        aria-label="Avatars. Drag, swipe, or use the arrow keys to move between them."
      />

      <div className="ga-foot">
        <button type="button" className="ga-ghost" aria-label="Shuffle" onClick={shuffle}>{shuffleIcon}<span className="ga-label">Shuffle</span></button>
        <span className="ga-sep" />
        <button type="button" className="ga-icon" title="New shape" aria-label="New shape" onClick={changeShape}>{shapeIcon}</button>
        <button type="button" className="ga-icon" title="New colors" aria-label="New colors" onClick={changeColors}>{colorsIcon}</button>
        <button type="button" className="ga-icon" title="New backdrop" aria-label="New backdrop" onClick={changeBackdrop}>{backdropIcon}</button>
        {spec !== origin && (
          <button type="button" className="ga-btn ga-reset" onClick={() => setSpec(origin)}>Reset</button>
        )}
        <span className="ga-grow" />
        {onCancel && (
          <button type="button" className="ga-btn" onClick={onCancel}>Cancel</button>
        )}
        <button type="button" className="ga-btn ga-primary" onClick={() => onSave?.(stringifySpec(spec))}>{saveLabel}</button>
      </div>
    </div>
  );
}
